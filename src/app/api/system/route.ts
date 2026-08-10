import dbConn from '@/lib/dbConn';
import ChapterModel from '@/model/chapters.model';
import { systemPUTRequestSchema } from '@/schema/system.schema';
import { NextResponse } from 'next/server';
import { eCurrentChapterStatus } from '@/types/model/chapter.model.types';
import {
	inProgressChaptersDetailedListPipeline,
	getChapterListByChapterStatusPipeline,
} from '@/pipelines/system.pipe';
import { ApiResponse } from '@/config/backend/ApiResponse.config';
import { iApiResponse } from '@/types/backend/apiResponse.types';
import { iSubjectWiseChaptersListByChapterStatus } from '@/types/res/system.res.types';
import { iDetailedChapterResponse } from '@/types/res/chapter.res.types';
import { ZodSafeParseResult } from 'zod';
import { tSystemPUTRequestSchema } from '@/types/schema/system.schema.types';

export async function GET(request: Request) {
	await dbConn();
	try {
		const { searchParams } = new URL(request.url);
		const queryParamType = searchParams.get('type');

		if (queryParamType === 'getPendingList') {
			const ReturnData: iSubjectWiseChaptersListByChapterStatus[] =
				await ChapterModel.aggregate(
					getChapterListByChapterStatusPipeline(eCurrentChapterStatus.Pending),
				);

			return NextResponse.json<
				iApiResponse<iSubjectWiseChaptersListByChapterStatus[]>
			>(ApiResponse(true, 'fetched the chapterList', ReturnData));
		}
		if (queryParamType === 'getUnfinishedList') {
			const ReturnData: iSubjectWiseChaptersListByChapterStatus[] =
				await ChapterModel.aggregate(
					getChapterListByChapterStatusPipeline(
						eCurrentChapterStatus.UnFinished,
					),
				);

			return NextResponse.json<
				iApiResponse<iSubjectWiseChaptersListByChapterStatus[]>
			>(ApiResponse(true, 'fetched the chapterList', ReturnData));
		}
		if (queryParamType === 'getUpcomingList') {
			const ReturnData: iSubjectWiseChaptersListByChapterStatus[] =
				await ChapterModel.aggregate(
					getChapterListByChapterStatusPipeline(eCurrentChapterStatus.UpNext),
				);

			return NextResponse.json<
				iApiResponse<iSubjectWiseChaptersListByChapterStatus[]>
			>(ApiResponse(true, 'fetched the chapterList', ReturnData));
		}
		if (queryParamType === 'getCompletedList') { 
			const ReturnData: iSubjectWiseChaptersListByChapterStatus[] =
				await ChapterModel.aggregate(
					getChapterListByChapterStatusPipeline(eCurrentChapterStatus.Done),
				);

			return NextResponse.json<
				iApiResponse<iSubjectWiseChaptersListByChapterStatus[]>
			>(ApiResponse(true, 'fetched the chapterList', ReturnData));
		}

		const ReturnData: iDetailedChapterResponse[] = await ChapterModel.aggregate(
			inProgressChaptersDetailedListPipeline,
		);

		return NextResponse.json<iApiResponse<iDetailedChapterResponse[]>>(
			ApiResponse(true, 'fetched the chapterList', ReturnData),
		);
	} catch (error) {
		return NextResponse.json(ApiResponse(false, 'Some error occurred', error), {
			status: 500,
		});
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
	const validationResult: ZodSafeParseResult<tSystemPUTRequestSchema> =
		systemPUTRequestSchema.safeParse(payload);
	if (!validationResult.success) {
		// ! If validation fails, return detailed error response
		return NextResponse.json<iApiResponse>(
			ApiResponse(false, validationResult.error.message, validationResult),
			{ status: 400 },
		);
	}
	try {
		await dbConn();

		if (
			validationResult.data.type === 'addChapterToSystem' &&
			validationResult.data._id
		) {
			const updatedChapterRecord = await ChapterModel.findByIdAndUpdate(
				validationResult.data._id,
				{ currentChapterStatus: eCurrentChapterStatus.InProgress },
			).lean();

			if (!updatedChapterRecord) {
				return NextResponse.json<iApiResponse>(
					ApiResponse(
						false,
						'Target tracking database primary identity pointer not found',
					),
					{ status: 404 },
				);
			}

			return NextResponse.json<iApiResponse>(
				ApiResponse(true, 'added Chapter to the System', updatedChapterRecord),
				{ status: 200 },
			);
		}
		if (
			validationResult.data.type === 'markChapterAsUnfinished' &&
			validationResult.data._id
		) {
			const updatedChapterRecord = await ChapterModel.findByIdAndUpdate(
				validationResult.data._id,
				{ currentChapterStatus: eCurrentChapterStatus.UnFinished },
			).lean();

			if (!updatedChapterRecord) {
				return NextResponse.json<iApiResponse>(
					ApiResponse(
						false,
						'Target tracking database primary identity pointer not found',
					),
					{ status: 404 },
				);
			}

			return NextResponse.json<iApiResponse>(
				ApiResponse(true, 'marked Chapter as unfinished', updatedChapterRecord),
				{ status: 200 },
			);
		}
		if (
			validationResult.data.type === 'markChapterAsUpComing' &&
			validationResult.data._id
		) {
			const updatedChapterRecord = await ChapterModel.findByIdAndUpdate(
				validationResult.data._id,
				{ currentChapterStatus: eCurrentChapterStatus.UpNext },
			).lean();

			if (!updatedChapterRecord) {
				return NextResponse.json<iApiResponse>(
					ApiResponse(
						false,
						'Target tracking database primary identity pointer not found',
					),
					{ status: 404 },
				);
			}

			return NextResponse.json<iApiResponse>(
				ApiResponse(true, 'marked Chapter as upComing', updatedChapterRecord),
				{ status: 200 },
			);
		}
	} catch (error) {
		return NextResponse.json<iApiResponse>(
			ApiResponse(false, 'Some Error Occurred', error),
			{ status: 400 },
		);
	}
}
