/* eslint-disable @typescript-eslint/no-explicit-any */
import dbConn from '@/lib/dbConn';
import ChapterModel from '@/model/chapters.model';
import { CHAPTER_COMPLETION_SEQUENCE } from '@/config/constants';
import { chapterStatusUpdateSchema } from '@/schema/studyTask.schema';
import { NextResponse } from 'next/server';
import { eCurrentChapterStatus } from '@/types/model/chapter.model.types';
import { ApiResponse } from '@/config/backend/ApiResponse.config';
import { iApiResponse } from '@/types/backend/apiResponse.types';
import { ZodSafeParseResult } from 'zod';
import { tChapterStatusUpdateSchema } from '@/types/schema/system.schema.types';

// * The 9-tag sequence, split into the 3 "inProgress" rounds it represents.
const ROUND_1_TAGS = CHAPTER_COMPLETION_SEQUENCE.slice(0, 4); // theory, shortNotes, PYQ_Mains, PYQ_Advanced
const ROUND_2_TAGS = CHAPTER_COMPLETION_SEQUENCE.slice(4, 7); // DPP1, mindMap, Module
const ROUND_3_TAGS = CHAPTER_COMPLETION_SEQUENCE.slice(7, 9); // DPP2, Book

// ? Returns how many of the 3 rounds are fully complete on this chapter (0-3).
// ? Round completion is cumulative: round 2 can't be "done" unless round 1 is too.
function getCompletedRound(chapter: Record<string, any>): 0 | 1 | 2 | 3 {
	const round1Done = ROUND_1_TAGS.every((tag) => chapter[tag] === true);
	const round2Done = ROUND_2_TAGS.every((tag) => chapter[tag] === true);
	const round3Done = ROUND_3_TAGS.every((tag) => chapter[tag] === true);
	if (round1Done && round2Done && round3Done) return 3;
	if (round1Done && round2Done) return 2;
	if (round1Done) return 1;
	return 0;
}

// *=====================================================================
// * PUT /api/study-task/chapter-status
// * Every eCurrentChapterStatus transition lives behind one `type` switch,
// * mirroring the style of the existing /api/system route.
// *=====================================================================
export async function PUT(request: Request) {
	const payload = await request.json();

	if (!payload) {
		// ! Bad Request: Missing body
		return NextResponse.json<iApiResponse>(
			ApiResponse(false, 'Missing Payload Data'),
			{ status: 400 },
		);
	}

	// * Validate request body using Zod
	const validationResult: ZodSafeParseResult<tChapterStatusUpdateSchema> =
		chapterStatusUpdateSchema.safeParse(payload);
	if (!validationResult.success) {
		// ! If validation fails, return detailed error response
		return NextResponse.json<iApiResponse>(
			ApiResponse(false, validationResult.error.message, validationResult),
			{ status: 400 },
		);
	}

	try {
		await dbConn();
		const { chapterId, type } = validationResult.data;

		const chapter = await ChapterModel.findById(chapterId);
		if (!chapter) {
			return NextResponse.json<iApiResponse>(
				ApiResponse(false, 'chapter not found'),
				{ status: 404 },
			);
		}

		// *-------------------------------------------------------------
		// * pending -> upNext
		// *-------------------------------------------------------------
		if (type === 'markAsUpcoming') {
			if (chapter.currentChapterStatus !== eCurrentChapterStatus.Pending) {
				return NextResponse.json<iApiResponse>(
					ApiResponse(false, 'Chapter must be "pending" to be marked upcoming'),
					{ status: 409 },
				);
			}
			chapter.currentChapterStatus = eCurrentChapterStatus.UpNext;
			await chapter.save();
			return NextResponse.json<iApiResponse>(
				ApiResponse(true, 'marked chapter as upcoming', chapter),
				{ status: 200 },
			);
		}

		// *-------------------------------------------------------------
		// * upNext -> inProgress   OR   unFinished -> inProgress
		// * (both land in the same place, so one action covers both)
		// *-------------------------------------------------------------
		if (type === 'markAsInProgress') {
			const validFromStates: string[] = [
				eCurrentChapterStatus.UpNext,
				eCurrentChapterStatus.UnFinished,
			];
			if (!validFromStates.includes(chapter.currentChapterStatus)) {
				return NextResponse.json<iApiResponse>(
					ApiResponse(
						false,
						'Chapter must be "upNext" or "unFinished" to start progress',
					),
					{ status: 409 },
				);
			}
			chapter.currentChapterStatus = eCurrentChapterStatus.InProgress;
			await chapter.save();
			return NextResponse.json<iApiResponse>(
				ApiResponse(true, 'marked chapter in Progress', chapter),
				{ status: 200 },
			);
		}

		// *-------------------------------------------------------------
		// * inProgress -> unFinished (rounds 1 & 2)
		// * inProgress -> done       (round 3 / final — skips unFinished)
		// * ! Blocked entirely until round 1 (the first 4 tags) is complete.
		// *-------------------------------------------------------------
		if (type === 'markAsUnfinished') {
			if (chapter.currentChapterStatus !== eCurrentChapterStatus.InProgress) {
				return NextResponse.json<iApiResponse>(
					ApiResponse(
						false,
						'Chapter must be "inProgress" for this transition',
					),
					{ status: 409 },
				);
			}

			const round = getCompletedRound(chapter.toObject());
			if (round === 0) {
				return NextResponse.json<iApiResponse>(
					ApiResponse(
						false,
						`Minimum requirement not met — complete ${ROUND_1_TAGS.join(', ')} first`,
					),
					{ status: 400 },
				);
			}

			if (round === 3) {
				// * Final round complete — the spec says "done, not unFinished".
				chapter.currentChapterStatus = eCurrentChapterStatus.Done;
			} else {
				chapter.currentChapterStatus = eCurrentChapterStatus.UnFinished;
				// ! First time this fires (round 1), also flip the chapter's own
				// ! `done` flag — its own pre-validate hook re-checks the min-4
				// ! requirement, so this is always safe to set at round >= 1.
				chapter.done = true;
			}

			await chapter.save();
			return NextResponse.json<iApiResponse>(
				ApiResponse(true, 'marked chapter as unfinished', chapter),
				{ status: 200 },
			);
		}

		// *-------------------------------------------------------------
		// * unFinished -> done (manual/explicit override — under normal
		// * flow this happens automatically via "markAsUnfinished" on the
		// * final round; this stays as an explicit fallback).
		// *-------------------------------------------------------------
		if (type === 'markAsDone') {
			if (chapter.currentChapterStatus !== eCurrentChapterStatus.UnFinished) {
				return NextResponse.json<iApiResponse>(
					ApiResponse(false, 'Chapter must be "unFinished" to be marked done'),
					{ status: 409 },
				);
			}
			const round = getCompletedRound(chapter.toObject());
			if (round < 3) {
				return NextResponse.json<iApiResponse>(
					ApiResponse(
						false,
						`All resources (${CHAPTER_COMPLETION_SEQUENCE.join(', ')}) must be complete first`,
					),
					{ status: 400 },
				);
			}
			chapter.currentChapterStatus = eCurrentChapterStatus.Done;
			await chapter.save();
			return NextResponse.json<iApiResponse>(
				ApiResponse(true, 'marked chapter as completed', chapter),
				{ status: 200 },
			);
		}

		return NextResponse.json<iApiResponse>(ApiResponse(false, 'Unknown type'), {
			status: 400,
		});
	} catch (error) {
		return NextResponse.json<iApiResponse>(
			ApiResponse(false, (error as Error).message, error),
			{ status: 500 },
		);
	}
}
