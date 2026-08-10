/* eslint-disable @typescript-eslint/no-explicit-any */
import dbConn from '@/lib/dbConn';
import StudyTaskModel from '@/model/study-task.model';
import ChapterModel from '@/model/chapters.model';
import TopicModel from '@/model/topics.model';
import { NextResponse } from 'next/server';
import { createStudyTaskSchema } from '@/schema/studyTask.schema';
import { eCurrentChapterStatus } from '@/types/model/chapter.model.types';
import { iApiResponse } from '@/types/backend/apiResponse.types';
import { ApiResponse } from '@/config/backend/ApiResponse.config';
import { ZodSafeParseResult } from 'zod';
import { tCreateStudyTaskSchema } from '@/types/schema/system.schema.types';
import {
	eStudyTaskOptionsChapterTags,
	eStudyTaskOptionsTopicTags,
} from '@/types/model/study-task.model.types';
import { studyTaskListPipeline } from '@/pipelines/system.pipe';
import { iStudyTaskListItem } from '@/types/res/system.res.types';
import { AggregatePaginateResult } from 'mongoose';

// *=====================================================================
// * POST /api/study-task
// * Turns one "listed task" suggestion (from /api/system/task/list) into
// * a tracked study-task: {refType, refId, tag} -> a StudyTask document.
// * `subject` is deliberately NOT taken from the client — it's derived
// * server-side from the chapter/topic so it can never drift out of sync.
// *=====================================================================
export async function POST(request: Request) {
	const payload = await request.json();

	if (!payload) {
		// ! Bad Request: Missing body
		return NextResponse.json<iApiResponse>(
			ApiResponse(false, 'Missing Payload Data'),
			{ status: 400 },
		);
	}

	// * Validate request body using Zod
	const validationResult: ZodSafeParseResult<tCreateStudyTaskSchema> =
		createStudyTaskSchema.safeParse(payload);
	if (!validationResult.success) {
		// ! If validation fails, return detailed error response
		return NextResponse.json<iApiResponse>(
			ApiResponse(false, validationResult.error.message, validationResult),
			{ status: 400 },
		);
	}

	try {
		const { refType, refId, tag } = validationResult.data;

		let subjectId;

		await dbConn();
		if (refType === 'chapter') {
			// * Pull only what's needed: the owning subject, current status, and the tag itself.
			const chapterDoc = await ChapterModel.findById(refId)
				.select(`subject currentChapterStatus ${tag}`)
				.lean<any>();
			if (!chapterDoc) {
				return NextResponse.json<iApiResponse>(
					ApiResponse(false, 'Chapter not found for the given refId'),
					{ status: 404 },
				);
			}
			// ! Study-tasks only make sense for chapters actively being worked on.
			if (
				chapterDoc.currentChapterStatus !== eCurrentChapterStatus.InProgress
			) {
				return NextResponse.json<iApiResponse>(
					ApiResponse(false, 'Chapter is not currently inProgress'),
					{ status: 409 },
				);
			}
			if (chapterDoc[tag] === true) {
				return NextResponse.json<iApiResponse>(
					ApiResponse(false, `"${tag}" is already complete on this chapter`),
					{ status: 409 },
				);
			}
			subjectId = chapterDoc.subject;
		} else {
			// * Topics don't carry their own status, only their parent chapter's subject.
			const topicDoc = await TopicModel.findById(refId)
				.select(`chapter ${tag}`)
				.populate({ path: 'chapter', select: 'subject' })
				.lean<any>();
			if (!topicDoc || !topicDoc.chapter) {
				return NextResponse.json<iApiResponse>(
					ApiResponse(false, 'Topic not found for the given refId'),
					{ status: 404 },
				);
			}
			if (topicDoc[tag] === true) {
				return NextResponse.json<iApiResponse>(
					ApiResponse(false, `"${tag}" is already complete on this topic`),
					{ status: 409 },
				);
			}
			subjectId = topicDoc.chapter.subject;
		}

		// * assignDate defaults via the schema; workingSessions/done default empty/false.
		// * `tag` is validated against the correct tag-set by the zod `.refine()`
		// * above, so narrowing it here from zod's inferred `string` down to the
		// * stricter enum union the model schema expects is safe.
		const newStudyTask = await StudyTaskModel.create({
			subject: subjectId,
			studyTask: {
				enum: refType,
				_id: refId,
				tag: tag as eStudyTaskOptionsChapterTags | eStudyTaskOptionsTopicTags,
			},
		});

		return NextResponse.json<iApiResponse>(
			ApiResponse(true, 'successfully created StudyTask', newStudyTask),
			{ status: 201 },
		);
	} catch (error) {
		return NextResponse.json<iApiResponse>(
			ApiResponse(false, (error as Error).message, error),
			{
				status: 500,
			},
		);
	}
}

// *=====================================================================
// * GET /api/study-task?status=pending|done&page=1&limit=20
// * Lists study-tasks enriched with subject + chapter/topic context and a
// * couple of derived stats (total time spent, whether a timer is live).
// *=====================================================================
export async function GET(request: Request) {
	await dbConn();
	try {
		const { searchParams } = new URL(request.url);
		const isDone = searchParams.get('status') === 'done'; // default false -> pending
		const page = Number(searchParams.get('page')) || 1;
		const limit = Number(searchParams.get('limit')) || 20;

		// * Built as an aggregate pipeline (not `.exec()`'d yet) so it can be
		// * handed straight to aggregatePaginate() below.
		const aggregateQuery = StudyTaskModel.aggregate(
			studyTaskListPipeline(isDone),
		);

		const paginatedResult: AggregatePaginateResult<iStudyTaskListItem> =
			await StudyTaskModel.aggregatePaginate<iStudyTaskListItem>(
				aggregateQuery,
				{ page, limit },
			);

		return NextResponse.json<
			iApiResponse<AggregatePaginateResult<iStudyTaskListItem>>
		>(
			ApiResponse<AggregatePaginateResult<iStudyTaskListItem>>(
				true,
				'fetched study-tasks',
				paginatedResult,
			),
		);
	} catch (error) {
		return NextResponse.json<iApiResponse>(
			ApiResponse(false, (error as Error).message, error),
			{
				status: 500,
			},
		);
	}
}
