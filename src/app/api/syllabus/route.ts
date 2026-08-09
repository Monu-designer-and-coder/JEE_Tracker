import { ApiResponse } from '@/config/backend/ApiResponse.config';
import dbConn from '@/lib/dbConn';
import ChapterModel from '@/model/chapters.model';
import { getSyllabusDetailsPipeline } from '@/pipelines/syllabus.pipe';
import { iApiResponse } from '@/types/backend/apiResponse.types';
import { iDetailedChapterResponse } from '@/types/res/chapter.res.types';
import {
	iExtendedSyllabusDetails,
	iSyllabusDetails,
} from '@/types/res/syllabus.res.types';
import { NextResponse } from 'next/server';

/**
 * ! Retrieve topic(s)
 * @route GET /api/topics
 * @query id?: string
 * @desc Fetches all topics, or a specific topic by ID
 */
export async function GET() {
	await dbConn();

	// * CASE 1: Get all topics
	const topicsList: iSyllabusDetails[] = await ChapterModel.aggregate(
		getSyllabusDetailsPipeline,
	);

	const ReturnData: iExtendedSyllabusDetails[] = topicsList.map(
		(item: iSyllabusDetails) => {
			const percentChaptersCompleted =
				(item.completedChapters * 100) / item.totalChapters;
			const percentTheoryCompleted =
				(item.completedTheory * 100) / item.totalChapters;
			const percentPYQsSolved =
				((item.completedAdvancedPYQs + item.completedMainsPYQs) * 50) /
				item.totalChapters;

			item.chapterList = item.chapterList.map((chapter) => {
				const totalTopicsCompleted = chapter.topicsList.filter(
					(topic) => topic.done,
				).length;
				const totalTopicsCompletedPercentage =
					(totalTopicsCompleted * 100) / chapter.totalTopics;
				const totalTopicsTheoryCompleted = chapter.topicsList.filter(
					(topic) => topic.theory,
				).length;
				const totalTopicsTheoryCompletedPercentage =
					(totalTopicsTheoryCompleted * 100) / chapter.totalTopics;
				const modifiedChapterList: iDetailedChapterResponse = {
					...chapter,
					totalTopicsCompleted,
					totalTopicsCompletedPercentage,
					totalTopicsTheoryCompleted,
					totalTopicsTheoryCompletedPercentage,
				};
				return modifiedChapterList;
			});

			const finalItem: iExtendedSyllabusDetails = {
				...item,
				percentChaptersCompleted,
				percentTheoryCompleted,
				percentPYQsSolved,
			};

			return finalItem;
		},
	);

	return NextResponse.json<iApiResponse<iExtendedSyllabusDetails[]>>(
		ApiResponse(true, 'fetched Detailed Syllabus Data', ReturnData),
	);
}
