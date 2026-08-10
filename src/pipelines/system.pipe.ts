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
		{ $sort: { assignDate: -1 } },
	];
}
