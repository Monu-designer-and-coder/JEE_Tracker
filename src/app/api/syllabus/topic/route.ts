import { NextResponse } from 'next/server';
import dbConn from '@/lib/dbConn';
import {
	TopicBackendValidationSchema,
	TopicValidationPUTSchemaBackend,
} from '@/schema/topic.schema';
import TopicModel from '@/model/topics.model';
import ChapterModel from '@/model/chapters.model';
import {
	getOrganizedTopicListPipeline,
	getTopicListOfChapter,
} from '@/pipelines/topic.pipe';
import {
	iTopicListByChapter,
	iTopicResponse,
	iTopicsListArrangedSubjectWise,
} from '@/types/res/topics.res.types';
import { ApiResponse } from '@/config/backend/ApiResponse.config';
import { iApiResponse } from '@/types/backend/apiResponse.types';
import { ZodSafeParseResult } from 'zod';
import {
	tTopicBackendValidationSchema,
	tTopicValidationPUTSchemaBackend,
} from '@/types/schema/topics.schema.types';

/**
 * ! Create a new topic
 * @route POST /api/topics
 * @desc Validates request body with Zod, inserts new topic into DB
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
	const validationResult: ZodSafeParseResult<tTopicBackendValidationSchema> =
		TopicBackendValidationSchema.safeParse(payload);
	if (!validationResult.success) {
		// ! If validation fails, return detailed error response
		return NextResponse.json<iApiResponse>(
			ApiResponse(false, validationResult.error.message, validationResult),
			{ status: 400 },
		);
	}
	try {
		await dbConn();

		const requestBody = await request.json();

		// * Direct creation for brevity
		const newTopic = await TopicModel.create(requestBody);

		return NextResponse.json<iApiResponse<iTopicResponse>>(
			ApiResponse(true, 'created topic successfully', {
				_id: newTopic._id,
				name: newTopic.name,
				seqNumber: newTopic.seqNumber,
				theory: newTopic.theory,
				inClassQuestions: newTopic.inClassQuestions,
				inTextQuestions: newTopic.inTextQuestions,
				done: newTopic.done,
			}),
			{ status: 201 },
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
 * ! Retrieve topic(s)
 * @route GET /api/topics
 * @query id?: string
 * @desc Fetches all topics, or a specific topic by ID
 */
export async function GET(request: Request) {
	await dbConn();

	const { searchParams } = new URL(request.url);
	const paramsReqID: string = searchParams.get('id') || '';
	const type: string = searchParams.get('type') || '';

	// * CASE 1: Get all topics
	if (!paramsReqID) {
		const topicsList: iTopicsListArrangedSubjectWise[] =
			await ChapterModel.aggregate(getOrganizedTopicListPipeline);
		return NextResponse.json(
			ApiResponse(true, 'fetched and arranged topics', topicsList),
		);
	}

	if (type === 'byChapter') {
		const topicsListByChapter: iTopicListByChapter[] =
			await ChapterModel.aggregate(getTopicListOfChapter(paramsReqID));

		if (topicsListByChapter.length !== 1) {
			return NextResponse.json(ApiResponse(false, 'Chapter not found'), {
				status: 404,
			});
		}

		return NextResponse.json<iApiResponse<iTopicListByChapter>>(
			ApiResponse(
				true,
				'here is all the topic of the chapter,',
				topicsListByChapter[0],
			),
		);
	}

	// * CASE 2: Get topic by ID
	const topicById = await TopicModel.findById(paramsReqID);
	if (!topicById) {
		return NextResponse.json(ApiResponse(false, 'Topic not found'), {
			status: 404,
		});
	}
	const topicDetailsResponse: iTopicResponse = {
		_id: topicById._id,
		name: topicById.name,
		seqNumber: topicById.seqNumber,
		theory: topicById.theory,
		inClassQuestions: topicById.inClassQuestions,
		inTextQuestions: topicById.inTextQuestions,
		done: topicById.done,
	};

	return NextResponse.json<iApiResponse<iTopicResponse>>(
		ApiResponse(
			true,
			'here is all the topic of the chapter,',
			topicDetailsResponse,
		),
	);
}

/**
 * ! Update a topic
 * @route PUT /api/topics
 * @desc Updates a topic by ID with provided data
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
	const validationResult: ZodSafeParseResult<tTopicValidationPUTSchemaBackend> =
		TopicValidationPUTSchemaBackend.safeParse(payload);
	if (!validationResult.success) {
		// ! If validation fails, return detailed error response
		return NextResponse.json<iApiResponse>(
			ApiResponse(false, validationResult.error.message, validationResult),
			{ status: 400 },
		);
	}

	try {
		// * Establish (or reuse the cached) DB connection before touching any model
		await dbConn();

		// * Destructured with descriptive names instead of generic `_id` / `data`
		const { _id: topicId, data: fieldsToUpdate } = validationResult.data;

		// * `findOneAndUpdate` (instead of `updateOne`) does the lookup, update, and
		// * existence-check in a single round-trip, AND gives back the real document.
		const updatedTopic = await TopicModel.findOneAndUpdate(
			{ _id: topicId },
			{ $set: fieldsToUpdate },
			{
				new: true, // * Resolve with the document AFTER the update is applied
				runValidators: true, // * Re-run schema-level field validators on the changed paths
				lean: true, // * Skip Mongoose document hydration — we only need a plain object to serialize
			},
		);

		// ! BUGFIX: the previous version checked `!updatedTopic` against the result
		// ! of `updateOne()`, which always resolves to a write-result object such as
		// ! `{ acknowledged, matchedCount, modifiedCount }` — an object literal is
		// ! always truthy, so "Topic not found" could never actually fire, even for
		// ! a completely bogus `_id`. `findOneAndUpdate` resolves to `null` when no
		// ! document matches, so this check now behaves as originally intended.
		if (!updatedTopic) {
			return NextResponse.json<iApiResponse>(
				ApiResponse(false, 'Topic not found'),
				{
					status: 404,
				},
			);
		}

		return NextResponse.json<iApiResponse<iTopicResponse>>(
			ApiResponse(true, 'Topic updated successfully', {
				_id: updatedTopic._id,
				name: updatedTopic.name,
				seqNumber: updatedTopic.seqNumber,
				theory: updatedTopic.theory,
				inClassQuestions: updatedTopic.inClassQuestions,
				inTextQuestions: updatedTopic.inTextQuestions,
				done: updatedTopic.done,
			}),
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
					'A topic with this sequence number already exists for this subject.',
					error,
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
				'An unexpected error occurred while updating the topic.',
				error,
			),
			{ status: 500 },
		);
	}
}
