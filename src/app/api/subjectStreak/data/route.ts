/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiResponse } from '@/config/backend/ApiResponse.config';
import dbConn from '@/lib/dbConn';
import SubjectStreakModel from '@/model/questionStreak.model';
import {
	detailedPeakDaysPipeline,
	peakDaysPipeline,
} from '@/pipelines/subjectStreak.pipe';
import { iApiResponse } from '@/types/backend/apiResponse.types';
import {
	iDetailedPeakDetail,
	iPeakDetail,
} from '@/types/res/subjectStreak.res';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const queryParamType = searchParams.get('type');

		if (queryParamType === 'peak') {
			await dbConn();
			const aggregatedPayload: iPeakDetail[] =
				await SubjectStreakModel.aggregate(peakDaysPipeline);

			return NextResponse.json<iApiResponse<iPeakDetail>>(
				ApiResponse(
					true,
					'successfully fetched peak days!',
					aggregatedPayload[0],
				),
			);
		}

		if (queryParamType === 'detailedData') {
			await dbConn();
			const aggregatedPayload: iDetailedPeakDetail[] =
				await SubjectStreakModel.aggregate(detailedPeakDaysPipeline);

			return NextResponse.json<iApiResponse<iDetailedPeakDetail>>(
				ApiResponse(
					true,
					'successfully fetched peak days!',
					aggregatedPayload[0],
				),
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

/**
 * SubjectStreak analytics pipeline
 * --------------------------------
 * Replaces the old paginated pipeline. No $skip/$limit anywhere.
 *
 * Output shape (single document, since $facet always returns one doc):
 * {
 *   dailyBreakdown: [
 *     { date, totalQuestionsDone, totalTimeStudied, details: [ {_id, subject, questionsDone, timeStudied} ] },
 *     ...  // every day, sorted newest -> oldest
 *   ],
 *   subjectWisePeaks: [
 *     { subjectId, subjectName, peakDate, peakQuestionsDone, peakTimeStudied, peakScore },
 *     ...  // one entry per subject = that subject's single best day
 *   ],
 *   peakQuestionsDoneDay: { date, totalQuestionsDone, totalTimeStudied },
 *   peakTimeStudiedDay:   { date, totalQuestionsDone, totalTimeStudied },
 *   bestDay:              { date, totalQuestionsDone, totalTimeStudied, score }
 * }
 *
 * NOTE: $sortArray requires MongoDB 5.2+. If you're on an older server,
 * swap the post-facet $addFields block for three extra $facet branches
 * that each do their own $group + $sort + $limit:1 (less efficient but
 * works on any version) — happy to write that variant if needed.
 *
 * NOTE on "bestDay.score": it's a plain average of totalQuestionsDone and
 * totalTimeStudied. Those are different units (count vs minutes), so this
 * favors whichever metric runs numerically larger. If you want a fairer
 * comparison, normalize each metric against its own max across all days
 * before averaging — say the word and I'll add that variant too.
 */

const subjectStreakAnalyticsPipeline = [
	// 1. Resolve the subject reference once, up front
	{
		$lookup: {
			from: 'subjects',
			localField: 'subject',
			foreignField: '_id',
			as: 'subjectInfo',
			pipeline: [{ $project: { _id: 1, name: 1 } }],
		},
	},
	{
		$addFields: {
			subject: { $first: '$subjectInfo' },
		},
	},
	{ $project: { subjectInfo: 0 } },

	// 2. Branch into the two groupings we actually need
	{
		$facet: {
			// (a) Every day, totals across all subjects + raw per-record details
			dailyBreakdown: [
				{
					$group: {
						_id: '$date',
						totalQuestionsDone: { $sum: '$questionsDone' },
						totalTimeStudied: { $sum: '$timeStudied' },
						details: {
							$push: {
								_id: '$_id',
								subject: '$subject',
								questionsDone: '$questionsDone',
								timeStudied: '$timeStudied',
							},
						},
					},
				},
				{
					$project: {
						_id: 0,
						date: '$_id',
						totalQuestionsDone: 1,
						totalTimeStudied: 1,
						details: 1,
					},
				},
				{ $sort: { date: -1 } }, // * chronological clustering, newest first
			],

			// (b) Per-subject totals per day -> collapse to each subject's best day
			subjectWisePeaks: [
				{
					$group: {
						_id: { subject: '$subject', date: '$date' },
						questionsDone: { $sum: '$questionsDone' },
						timeStudied: { $sum: '$timeStudied' },
					},
				},
				{
					$addFields: {
						score: { $avg: ['$questionsDone', '$timeStudied'] },
					},
				},
				// sort so the best day per subject lands first within its group
				{ $sort: { '_id.subject._id': 1, score: -1 } },
				{
					$group: {
						_id: '$_id.subject._id',
						subjectName: { $first: '$_id.subject.name' },
						peakDate: { $first: '$_id.date' },
						peakQuestionsDone: { $first: '$questionsDone' },
						peakTimeStudied: { $first: '$timeStudied' },
						peakScore: { $first: '$score' },
					},
				},
				{
					$project: {
						_id: 0,
						subjectId: '$_id',
						subjectName: 1,
						peakDate: 1,
						peakQuestionsDone: 1,
						peakTimeStudied: 1,
						peakScore: 1,
					},
				},
			],
		},
	},

	// 3. Derive the three "peak day" call-outs from dailyBreakdown (single pass, no re-grouping)
	{
		$addFields: {
			peakQuestionsDoneDay: {
				$first: {
					$sortArray: {
						input: '$dailyBreakdown',
						sortBy: { totalQuestionsDone: -1 },
					},
				},
			},
			peakTimeStudiedDay: {
				$first: {
					$sortArray: {
						input: '$dailyBreakdown',
						sortBy: { totalTimeStudied: -1 },
					},
				},
			},
			bestDay: {
				$first: {
					$sortArray: {
						input: {
							$map: {
								input: '$dailyBreakdown',
								as: 'd',
								in: {
									$mergeObjects: [
										'$$d',
										{
											score: {
												$avg: [
													'$$d.totalQuestionsDone',
													'$$d.totalTimeStudied',
												],
											},
										},
									],
								},
							},
						},
						sortBy: { score: -1 },
					},
				},
			},
		},
	},
];

module.exports = subjectStreakAnalyticsPipeline;
