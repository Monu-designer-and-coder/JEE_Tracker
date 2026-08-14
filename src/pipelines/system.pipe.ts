import { eCurrentChapterStatus } from '@/types/model/chapter.model.types';
import { PipelineStage } from 'mongoose';

export function getChapterListByChapterStatusPipeline(
	chapterCurrentStatus: eCurrentChapterStatus,
): PipelineStage[] {
	return [
		{
			$lookup: {
				from: 'subjects',
				localField: 'subject',
				foreignField: '_id',
				as: 'subjectDetails',
				pipeline: [
					{
						$project: {
							_id: 1,
							name: 1,
						},
					},
				],
			},
		},
		{
			$addFields: {
				subjectDetails: {
					$first: '$subjectDetails',
				},
			},
		},
		{
			$sort: {
				seqNumber: 1,
				subject: 1,
			},
		},
		{
			$match: {
				currentChapterStatus: chapterCurrentStatus,
			},
		},
		{
			$group: {
				_id: '$subject',
				name: {
					$first: '$subjectDetails.name',
				},
				chapterList: {
					$push: {
						_id: '$_id',
						seqNumber: '$seqNumber',
						name: '$name',
					},
				},
			},
		},
		{ $project: { _id: 1, name: 1, chapterList: 1 } },
	];
}

export const inProgressChaptersDetailedListPipeline: PipelineStage[] = [
	{
		$match: {
			currentChapterStatus: eCurrentChapterStatus.InProgress,
		},
	},
	{
		$sort: {
			name: 1,
		},
	},
	{
		$lookup: {
			from: 'subjects',
			localField: 'subject',
			foreignField: '_id',
			as: 'subjectDetails',
			pipeline: [
				{
					$project: {
						_id: 1,
						name: 1,
					},
				},
			],
		},
	},
	{
		$addFields: {
			subject: {
				$first: '$subjectDetails',
			},
		},
	},
	{
		$sort: {
			subject: 1,
			seqNumber: 1,
		},
	},
	{
		$lookup: {
			from: 'topics',
			localField: '_id',
			foreignField: 'chapter',
			as: 'topicsList',
			pipeline: [
				{
					$project: {
						_id: 1,
						name: 1,
						seqNumber: 1,
						done: 1,
						theory: 1,
						inTextQuestions: 1,
						inClassQuestions: 1,
					},
				},
				{
					$sort: {
						chapter: 1,
						seqNumber: 1,
					},
				},
			],
		},
	},
	{
		$addFields: {
			totalTopics: {
				$size: '$topicsList',
			},
		},
	},
	{
		$project: {
			_id: 1,
			seqNumber: 1,
			name: 1,
			done: 1,
			theory: 1,
			shortNotes: 1,
			mindMap: 1,
			DPP1: 1,
			DPP2: 1,
			Module: 1,
			PYQ_Mains: 1,
			PYQ_Advanced: 1,
			Book: 1,
			totalTopics: 1,
			subject: 1,
			topicsList: 1,
			eCurrentChapterStatus: 1,
		},
	},
	{
		$addFields: {
			totalTopicsCompleted: {
				$size: {
					$filter: {
						input: '$topicsList',
						as: 'topic',
						cond: { $eq: ['$$topic.done', true] },
					},
				},
			},
			totalTopicsTheoryCompleted: {
				$size: {
					$filter: {
						input: '$topicsList',
						as: 'topic',
						cond: { $eq: ['$$topic.theory', true] },
					},
				},
			},
		},
	},
	{
		$addFields: {
			totalTopicsCompletedPercentage: {
				$cond: [
					{ $eq: ['$totalTopics', 0] },
					0,
					{
						$divide: [
							{
								$multiply: ['$totalTopicsCompleted', 100],
							},
							'$totalTopics',
						],
					},
				],
			},
			totalTopicsTheoryCompletedPercentage: {
				$cond: [
					{ $eq: ['$totalTopics', 0] },
					0,
					{
						$divide: [
							{
								$multiply: ['$totalTopicsTheoryCompleted', 100],
							},
							'$totalTopics',
						],
					},
				],
			},
		},
	},
];

export function TodaysStudyTaskListPipeline(
	type: 'completedTasks' | 'sessions',
	today: { absoluteStartTimeToday: Date; absoluteEndTimeToday: Date },
): PipelineStage[] {
	if (type === 'sessions') {
		return [
			// 1. Initial Match: Only documents with at least one session and no currently active session
			{
				$match: {
					'workingSessions.0': { $exists: true },
					activeSessionStartedAt: null, // Replaces your complex `isSessionActive: false` check
				},
			},

			// 2. Flatten the sessions array
			{ $unwind: '$workingSessions' },

			// 3. Date Filter: Keep only the sessions within the targeted time range
			{
				$match: {
					'workingSessions.start': { $gte: today.absoluteStartTimeToday },
					'workingSessions.end': { $lte: today.absoluteEndTimeToday },
				},
			},

			// 4. Group: Rebuild the document and sum the time (only for the matched sessions)
			{
				$group: {
					_id: '$_id',
					assignDate: { $first: '$assignDate' },
					completionDate: { $first: '$completionDate' },
					done: { $first: '$done' },
					subject: { $first: '$subject' },
					studyTask: { $first: '$studyTask' },
					activeSessionStartedAt: { $first: '$activeSessionStartedAt' },
					workingSessions: { $push: '$workingSessions' },
					totalTimeSpent: { $sum: '$workingSessions.totalTime' }, // * ms
				},
			},

			// 5. Lookups: Done only once, and only on documents that made it through the filters
			{
				$lookup: {
					from: 'subjects',
					localField: 'subject',
					foreignField: '_id',
					as: 'subjectDetails',
					pipeline: [{ $project: { _id: 1, name: 1 } }],
				},
			},
			{
				$lookup: {
					from: 'chapters',
					localField: 'studyTask._id',
					foreignField: '_id',
					as: 'chapterDetails',
					pipeline: [{ $project: { _id: 1, name: 1, chapter: '$_id' } }],
				},
			},
			{
				$lookup: {
					from: 'topics',
					localField: 'studyTask._id',
					foreignField: '_id',
					as: 'topicDetails',
					pipeline: [{ $project: { _id: 1, name: 1, chapter: 1 } }],
				},
			},

			// 6. Resolve Fields: Flatten the lookup arrays and set booleans
			{
				$addFields: {
					subjectDetails: { $first: '$subjectDetails' },
					refDetails: {
						$cond: [
							{ $eq: ['$studyTask.enum', 'chapter'] },
							{ $first: '$chapterDetails' },
							{ $first: '$topicDetails' },
						],
					},
					isSessionActive: {
						$cond: [
							{ $ifNull: ['$activeSessionStartedAt', false] },
							true,
							false,
						],
					},
				},
			},

			// 7. Final Projection: Strictly matching your `iStudyTaskListItem` interface
			{
				$project: {
					_id: 1,
					assignDate: 1,
					completionDate: 1, // Will be included if it exists
					done: 1,
					subjectDetails: 1,
					studyTask: 1,
					refDetails: 1,
					totalTimeSpent: 1,
					isSessionActive: 1,
					workingSessions: {
						start: 1,
						end: 1,
						totalTime: 1,
					},
				},
			},

			// 8. Sort
			{ $sort: { assignDate: 1 } },
		];
	}
	return [
		{
			$match: {
				done: true,
				completionDate: {
					$gte: today.absoluteStartTimeToday,
					$lte: today.absoluteEndTimeToday,
				},
			},
		},
		{
			$lookup: {
				from: 'subjects',
				localField: 'subject',
				foreignField: '_id',
				as: 'subjectDetails',
				pipeline: [{ $project: { _id: 1, name: 1 } }],
			},
		},
		// ? Two parallel lookups — exactly one resolves, based on studyTask.enum
		{
			$lookup: {
				from: 'chapters',
				localField: 'studyTask._id',
				foreignField: '_id',
				as: 'chapterDetails',
				pipeline: [{ $project: { _id: 1, name: 1, chapter: '$_id' } }],
			},
		},
		{
			$lookup: {
				from: 'topics',
				localField: 'studyTask._id',
				foreignField: '_id',
				as: 'topicDetails',
				pipeline: [{ $project: { _id: 1, name: 1, chapter: 1 } }],
			},
		},
		{
			$addFields: {
				subjectDetails: { $first: '$subjectDetails' },
				refDetails: {
					$cond: [
						{ $eq: ['$studyTask.enum', 'chapter'] },
						{ $first: '$chapterDetails' },
						{ $first: '$topicDetails' },
					],
				},
				totalTimeSpent: { $sum: '$workingSessions.totalTime' }, // * ms
				isSessionActive: {
					$cond: [{ $ifNull: ['$activeSessionStartedAt', false] }, true, false],
				},
			},
		},
		{
			$project: {
				_id: 1,
				assignDate: 1,
				completionDate: 1,
				done: 1,
				subjectDetails: 1,
				studyTask: 1,
				refDetails: 1,
				totalTimeSpent: 1,
				isSessionActive: 1,
				workingSessions: 1,
			},
		},
		{ $sort: { assignDate: 1 } },
	];
}
export function studyTaskListPipeline(isDone: boolean): PipelineStage[] {
	return [
		{ $match: { done: isDone } },
		{
			$lookup: {
				from: 'subjects',
				localField: 'subject',
				foreignField: '_id',
				as: 'subjectDetails',
				pipeline: [{ $project: { _id: 1, name: 1 } }],
			},
		},
		// ? Two parallel lookups — exactly one resolves, based on studyTask.enum
		{
			$lookup: {
				from: 'chapters',
				localField: 'studyTask._id',
				foreignField: '_id',
				as: 'chapterDetails',
				pipeline: [{ $project: { _id: 1, name: 1, chapter: '$_id' } }],
			},
		},
		{
			$lookup: {
				from: 'topics',
				localField: 'studyTask._id',
				foreignField: '_id',
				as: 'topicDetails',
				pipeline: [{ $project: { _id: 1, name: 1, chapter: 1 } }],
			},
		},
		{
			$addFields: {
				subjectDetails: { $first: '$subjectDetails' },
				refDetails: {
					$cond: [
						{ $eq: ['$studyTask.enum', 'chapter'] },
						{ $first: '$chapterDetails' },
						{ $first: '$topicDetails' },
					],
				},
				totalTimeSpent: { $sum: '$workingSessions.totalTime' }, // * ms
				isSessionActive: {
					$cond: [{ $ifNull: ['$activeSessionStartedAt', false] }, true, false],
				},
			},
		},
		{
			$project: {
				_id: 1,
				assignDate: 1,
				completionDate: 1,
				done: 1,
				subjectDetails: 1,
				studyTask: 1,
				refDetails: 1,
				totalTimeSpent: 1,
				isSessionActive: 1,
				workingSessions: 1,
			},
		},
		{ $sort: { assignDate: 1 } },
	];
}
