import { ApiResponse } from '@/config/backend/ApiResponse.config';
import dbConn from '@/lib/dbConn';
import StudyTaskModel from '@/model/study-task.model';
import { TodaysStudyTaskListPipeline } from '@/pipelines/system.pipe';
import { iApiResponse } from '@/types/backend/apiResponse.types';
import { iStudyTaskListItem } from '@/types/res/system.res.types';
import { AggregatePaginateResult } from 'mongoose';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	await dbConn();
	try {
		const { searchParams } = new URL(request.url);
		const docType = searchParams.get('type'); //? "completedTask", "sessions"
		const page = Number(searchParams.get('page')) || 1;
		const limit = Number(searchParams.get('limit')) || 20;

		// * Built as an aggregate pipeline (not `.exec()`'d yet) so it can be
		// * handed straight to aggregatePaginate() below.

		const absoluteStartTimeToday = new Date();
		absoluteStartTimeToday.setHours(0, 0, 0, 0);

		const absoluteEndTimeToday = new Date(absoluteStartTimeToday);
		absoluteEndTimeToday.setHours(23, 59, 59, 999);

		const aggregateQuery = StudyTaskModel.aggregate(
			docType === 'sessions'
				? TodaysStudyTaskListPipeline('sessions', {
						absoluteEndTimeToday,
						absoluteStartTimeToday,
					})
				: TodaysStudyTaskListPipeline('completedTasks', {
						absoluteEndTimeToday,
						absoluteStartTimeToday,
					}),
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
