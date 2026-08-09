import { ApiResponse } from '@/config/backend/ApiResponse.config';
import dbConn from '@/lib/dbConn';
import ChapterModel from '@/model/chapters.model';
import SubjectModel from '@/model/subject.model';
import {
	allChapterListPipeline,
	detailedChapterResponsePipeline,
	subjectWiseChaptersListPipeline,
} from '@/pipelines/chapter.pipe';
import {
	chapterValidationPUTSchemaBackend,
	chapterValidationSchemaBackend,
} from '@/schema/chapter.schema';
import { iApiResponse } from '@/types/backend/apiResponse.types';
import {
	iChapterResponse,
	iDetailedChapterResponse,
} from '@/types/res/chapter.res.types';
import { iSubjectWiseChapterListResponse } from '@/types/res/chapterList.types';
import {
	tChapterValidationPUTSchemaBackend,
	tChapterValidationSchemaBackend,
} from '@/types/schema/chapter.schema.types';
import { NextResponse } from 'next/server';
import { ZodSafeParseResult } from 'zod';

/**
 * ! Create a new chapter
 * @route POST /api/chapters
 * @desc Validates input using Zod, inserts new chapter into DB
 */

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
	const validationResult: ZodSafeParseResult<tChapterValidationSchemaBackend> =
		chapterValidationSchemaBackend.safeParse(payload);
	if (!validationResult.success) {
		// ! If validation fails, return detailed error response
		return NextResponse.json<iApiResponse>(
			ApiResponse(false, validationResult.error.message, validationResult),
			{ status: 400 },
		);
	}
	try {
		await dbConn();

		// * Insert chapter into MongoDB
		const newChapter = await ChapterModel.create(validationResult.data);
		return NextResponse.json<iApiResponse>(
			ApiResponse(true, 'successfully Created Document', newChapter),
			{
				status: 201,
			},
		);
	} catch (error) {
		const errorMessage =
			error instanceof Error ? error.message : 'An unexpected error occurred';
		return NextResponse.json<iApiResponse>(
			ApiResponse(false, errorMessage, error),
			{ status: 400 },
		);
	}
}

/**
 * ! Retrieve chapter(s)
 * @route GET /api/chapters
 * @query id?: string, type?: "all" | "subjectWise"
 * @desc Fetches chapters by ID, or aggregated chapter data
 */
export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const chapterId: string = searchParams.get('id') || '';
	const fetchType: string = searchParams.get('type') || '';

	// * CASE 1: Fetch all chapters with subject info
	if (!chapterId && fetchType === 'all') {
		await dbConn();
		const chaptersWithSubject: iChapterResponse[] =
			await ChapterModel.aggregate(allChapterListPipeline);
		return NextResponse.json<iApiResponse<iChapterResponse[]>>(
			ApiResponse<iChapterResponse[]>(
				true,
				'fetched all chapters',
				chaptersWithSubject,
			),
		);
	}

	// * CASE 2: Fetch chapters grouped by subject
	if (!chapterId && fetchType === 'subjectWise') {
		await dbConn();
		const subjectWiseChapters: iSubjectWiseChapterListResponse[] =
			await SubjectModel.aggregate(subjectWiseChaptersListPipeline);
		return NextResponse.json<iApiResponse<iSubjectWiseChapterListResponse[]>>(
			ApiResponse<iSubjectWiseChapterListResponse[]>(
				true,
				'fetched all chapters, subject-wise',
				subjectWiseChapters,
			),
		);
	}

	// * CASE 3: Fetch chapter by ID
	if (chapterId) {
		await dbConn();

		const selectChapterById: iDetailedChapterResponse[] =
			await ChapterModel.aggregate(detailedChapterResponsePipeline(chapterId));

		if (selectChapterById.length != 1) {
			return NextResponse.json(
				ApiResponse(false, 'Invalid request parameters', selectChapterById),
				{ status: 400 },
			);
		}
		return NextResponse.json<iApiResponse<iDetailedChapterResponse>>(
			ApiResponse(true, 'fetched Chapter Details', selectChapterById[0]),
		);
	}

	// ! Default: Bad request if neither type nor ID provided
	return NextResponse.json(ApiResponse(false, 'Invalid request parameters'), {
		status: 400,
	});
}

/**
 * ! Update an existing chapter
 * @route PUT /api/chapters
 * @desc Partially updates a chapter by `_id` with whatever fields are sent in `data`.
 * @body { _id: string, data: Partial<ChapterFields> }
 */
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
	const validationResult: ZodSafeParseResult<tChapterValidationPUTSchemaBackend> =
		chapterValidationPUTSchemaBackend.safeParse(payload);
	if (!validationResult.success) {
		// ! If validation fails, return detailed error response
		return NextResponse.json<iApiResponse>(
			ApiResponse(false, validationResult.error.message, validationResult),
			{ status: 406 },
		);
	}

	try {
		await dbConn();

		// * Destructured with descriptive names instead of generic `_id` / `data`
		const { _id: chapterId, data: fieldsToUpdate } = validationResult.data;

		// * `findOneAndUpdate` (instead of `updateOne`) does the lookup, update, and
		// * existence-check in a single round-trip, AND gives back the real document.
		const updatedChapter = await ChapterModel.findOneAndUpdate(
			{ _id: chapterId },
			{ $set: fieldsToUpdate },
			{
				new: true, // * Resolve with the document AFTER the update is applied
				runValidators: true, // * Re-run schema-level field validators on the changed paths
				lean: true, // * Skip Mongoose document hydration — we only need a plain object to serialize
			},
		);

		// ! BUGFIX: the previous version checked `!updatedChapter` against the result
		// ! of `updateOne()`, which always resolves to a write-result object such as
		// ! `{ acknowledged, matchedCount, modifiedCount }` — an object literal is
		// ! always truthy, so "Chapter not found" could never actually fire, even for
		// ! a completely bogus `_id`. `findOneAndUpdate` resolves to `null` when no
		// ! document matches, so this check now behaves as originally intended.
		if (!updatedChapter) {
			return NextResponse.json<iApiResponse>(
				ApiResponse(false, 'Chapter not found'),
				{
					status: 404,
				},
			);
		}

		return NextResponse.json<iApiResponse>(
			ApiResponse(true, 'Chapter updated successfully', updatedChapter),
			{ status: 200 },
		);
	} catch (error) {
		// ? Distinguish error shapes so the client gets an accurate status code
		// ? instead of everything collapsing into the same generic response.

		// * MongoDB duplicate-key conflict — e.g. the unique { subject, seqNumber }
		// * index rejecting a sequence number that already exists for that subject.
		if (
			error instanceof Error &&
			'code' in error &&
			(error as { code: number }).code === 11000
		) {
			return NextResponse.json<iApiResponse>(
				ApiResponse(
					false,
					'A chapter with this sequence number already exists for this subject.',
				),
				{ status: 409 },
			);
		}

		// * Validation / business-rule errors thrown by our Mongoose hooks
		// * (e.g. the "done" requires theory + 4 resources rule) or by schema validators
		if (error instanceof Error) {
			return NextResponse.json<iApiResponse>(
				ApiResponse(false, error.message, error),
				{
					status: 400,
				},
			);
		}

		// ! Fallback for genuinely unexpected, non-Error throwables — don't mask
		// ! infrastructure failures (DB down, etc.) as a client-side 400.
		return NextResponse.json<iApiResponse>(
			ApiResponse(
				false,
				'An unexpected error occurred while updating the chapter.',
			),
			{ status: 500 },
		);
	}
}
