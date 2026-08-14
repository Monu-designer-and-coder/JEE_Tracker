/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { AggregatePaginateResult, Types } from 'mongoose';
import dbConn from '@/lib/dbConn';
import SubjectStreakModel from '@/model/questionStreak.model';
import SubjectModel from '@/model/subject.model';
import {
	SubjectStreakUpdateSchema,
	SubjectStreakPostSchema,
} from '@/schema/subjectStreak.schema';
import {
	tSubjectStreakPostSchema,
	tSubjectStreakUpdateSchema,
} from '@/types/schema/subjectTracker.schema.types';
import { ZodSafeParseResult } from 'zod';
import { iApiResponse } from '@/types/backend/apiResponse.types';
import { ApiResponse } from '@/config/backend/ApiResponse.config';
import {
	dailyRecordPipeline,
	subjectWiseRecordPipeline,
	todaysRecordBySubjectPipeline,
	todaysRecordPipeline,
} from '@/pipelines/subjectStreak.pipe';
import {
	iDailyRecordDocument,
	iExtendedDetailedSubjectStreakDocumentResponse,
	iSubjectWiseRecordDocument,
} from '@/types/res/subjectStreak.res.types';

export async function POST(request: Request) {
	const payload = await request.json();

	if (!payload) {
		// ! Bad Request: Missing body
		return NextResponse.json<iApiResponse>(
			ApiResponse(false, 'Missing Payload Data'),
			{ status: 400 },
		);
	}

	if (payload.date) {
		payload.date = new Date(payload.date);
	}

	// * Validate request body using Zod
	const validationResult: ZodSafeParseResult<tSubjectStreakPostSchema> =
		SubjectStreakPostSchema.safeParse(payload);
	if (!validationResult.success) {
		// ! If validation fails, return detailed error response
		return NextResponse.json<iApiResponse>(
			ApiResponse(false, validationResult.error.message, validationResult),
			{ status: 400 },
		);
	}
	try {
		await dbConn();
		const createdStreakRecord = await SubjectStreakModel.create(
			validationResult.data,
		);
		return NextResponse.json<iApiResponse>(
			ApiResponse(
				false,
				'Created Subject Streak for the provided date.',
				createdStreakRecord,
			),
			{ status: 201 },
		);
	} catch (error: any) {
		return NextResponse.json<iApiResponse>(
			ApiResponse(false, error?.message || 'Some Error Occurred', error),
			{ status: 400 },
		);
	}
}

export async function GET(request: Request) {
	try {
		await dbConn();

		const { searchParams } = new URL(request.url);
		const queryParamType = searchParams.get('type');

		// * Universal extraction logic supporting functional pagination fallbacks
		const paginationPage = Math.max(
			1,
			parseInt(searchParams.get('page') || '1', 10),
		);
		const paginationLimit = Math.max(
			1,
			parseInt(searchParams.get('limit') || '8', 10),
		);

		if (queryParamType === 'byDate') {
			const rawAggregatedPayload =
				SubjectStreakModel.aggregate(dailyRecordPipeline);

			const paginatedResult: AggregatePaginateResult<iDailyRecordDocument> =
				await SubjectStreakModel.aggregatePaginate<iDailyRecordDocument>(
					rawAggregatedPayload,
					{ page: paginationPage, limit: paginationLimit },
				);

			return NextResponse.json<
				iApiResponse<AggregatePaginateResult<iDailyRecordDocument>>
			>(ApiResponse(true, 'fetched Daily Records!', paginatedResult));
		}

		if (queryParamType === 'bySubject') {
			const aggregatedResult: iSubjectWiseRecordDocument[] =
				await SubjectStreakModel.aggregate(subjectWiseRecordPipeline);

			return NextResponse.json<iApiResponse<iSubjectWiseRecordDocument[]>>(
				ApiResponse(true, 'fetched Daily Records!', aggregatedResult),
			);
		}

		if (queryParamType === 'today') {
			const absoluteStartTimeToday = new Date();
			absoluteStartTimeToday.setHours(0, 0, 0, 0);

			const absoluteEndTimeToday = new Date(absoluteStartTimeToday);
			absoluteEndTimeToday.setHours(23, 59, 59, 999);

			const queryParamSubjectId = searchParams.get('subjectId');

			// * Optimize database scans using inline matches utilizing indexed date targets
			if (!queryParamSubjectId) {
				let todayTrackedActivities: iExtendedDetailedSubjectStreakDocumentResponse[] =
					await SubjectStreakModel.aggregate(
						todaysRecordPipeline(absoluteStartTimeToday, absoluteEndTimeToday),
					);

				// * Safe programmatic fallbacks if database initialization routine checks trigger false
				if (!todayTrackedActivities.length) {
					const defaultSystemSubjects = await SubjectModel.find({})
						.select('_id')
						.lean();

					if (defaultSystemSubjects.length > 0) {
						const commonDate = new Date();
						const operationsPayload = defaultSystemSubjects.map(
							(subjectItem) => ({
								date: commonDate,
								subject: subjectItem._id,
								questionsDone: 0,
								timeStudied: 0,
							}),
						);

						await SubjectStreakModel.insertMany(operationsPayload);

						todayTrackedActivities = await SubjectStreakModel.aggregate(
							todaysRecordPipeline(
								absoluteStartTimeToday,
								absoluteEndTimeToday,
							),
						);
					}
				}

				return NextResponse.json<
					iApiResponse<iExtendedDetailedSubjectStreakDocumentResponse[]>
				>(ApiResponse(true, 'fetched todays record', todayTrackedActivities), {
					status: 200,
				});
			}

			const subjectFilteredEvents = await SubjectStreakModel.aggregate(
				todaysRecordBySubjectPipeline(
					new Types.ObjectId(
						queryParamSubjectId,
					),
					absoluteStartTimeToday,
					absoluteEndTimeToday,
				),
			);

			if (!subjectFilteredEvents.length) {
				const structuralVerificationTarget =
					await SubjectModel.findById(queryParamSubjectId).lean();
				if (structuralVerificationTarget) {
					const singleCreatedInstance = await SubjectStreakModel.create({
						subject: queryParamSubjectId,
						date: new Date(),
						questionsDone: 0,
						timeStudied: 0,
					});

					const postCreationQuery: iExtendedDetailedSubjectStreakDocumentResponse[] =
						await SubjectStreakModel.aggregate(
							todaysRecordBySubjectPipeline(
								new Types.ObjectId(
									singleCreatedInstance._id,
								),
								absoluteStartTimeToday,
								absoluteEndTimeToday,
							),
						);

					return NextResponse.json<
						iApiResponse<iExtendedDetailedSubjectStreakDocumentResponse[]>
					>(
						ApiResponse(
							true,
							"fetched the subject's todays record",
							postCreationQuery,
						),
						{ status: 200 },
					);
				}
			}

			return NextResponse.json<
				iApiResponse<iExtendedDetailedSubjectStreakDocumentResponse[]>
			>(
				ApiResponse(
					true,
					"fetched the subject's todays record",
					subjectFilteredEvents,
				),
				{ status: 200 },
			);
		}
		return NextResponse.json<iApiResponse>(ApiResponse(false, 'Unknown type'), {
			status: 400,
		});
	} catch (error: any) {
		return NextResponse.json<iApiResponse>(
			ApiResponse(false, error?.message || 'Some Error Occurred', error),
			{ status: 400 },
		);
	}
}

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
	const validationResult: ZodSafeParseResult<tSubjectStreakUpdateSchema> =
		SubjectStreakUpdateSchema.safeParse(payload);
	if (!validationResult.success) {
		// ! If validation fails, return detailed error response
		return NextResponse.json<iApiResponse>(
			ApiResponse(false, validationResult.error.message, validationResult),
			{ status: 400 },
		);
	}

	try {
		await dbConn();

		if (validationResult.data.type === 'plusOneQuestion') {
			const updatedStreakRecord = await SubjectStreakModel.findByIdAndUpdate(
				validationResult.data._id,
				{ $inc: { questionsDone: 1 } },
				{ new: true, runValidators: true },
			).lean();

			if (!updatedStreakRecord) {
				return NextResponse.json<iApiResponse>(
					ApiResponse(
						false,
						'Target tracking database primary identity pointer not found',
					),
					{ status: 404 },
				);
			}

			return NextResponse.json(
				ApiResponse(true, 'Added +1 Question to the subject Record.'),
				{ status: 200 },
			);
		} else {
			if (!validationResult.data.timeStudied) {
				return NextResponse.json(
					ApiResponse(false, 'timeStudied field cannot be empty'),
					{ status: 400 },
				);
			}
			const updatedStreakRecord = await SubjectStreakModel.findByIdAndUpdate(
				validationResult.data._id,
				{ $inc: { timeStudied: validationResult.data.timeStudied } },
				{ new: true, runValidators: true },
			).lean();

			if (!updatedStreakRecord) {
				return NextResponse.json<iApiResponse>(
					ApiResponse(
						false,
						'Target tracking database primary identity pointer not found',
					),
					{ status: 404 },
				);
			}
			return NextResponse.json(
				ApiResponse(true, 'Added the time studied to the subject Record.'),
				{ status: 200 },
			);
		}
	} catch (error: any) {
		return NextResponse.json<iApiResponse>(
			ApiResponse(false, error?.message || 'Some Error Occurred', error),
			{ status: 400 },
		);
	}
}
