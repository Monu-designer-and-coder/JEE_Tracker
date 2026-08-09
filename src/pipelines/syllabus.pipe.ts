import { PipelineStage } from 'mongoose';

export const getSyllabusDetailsPipeline: PipelineStage[] = [
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
		$group: {
			_id: '$subject',
			name: {
				$first: '$subjectDetails.name',
			},
			totalChapters: {
				$sum: 1,
			},
			completedChapters: {
				$sum: {
					$cond: [{ $eq: ['$done', true] }, 1, 0],
				},
			},
			completedTheory: {
				$sum: {
					$cond: [{ $eq: ['$theory', true] }, 1, 0],
				},
			},
			completedMainsPYQs: {
				$sum: {
					$cond: [{ $eq: ['$PYQ_Mains', true] }, 1, 0],
				},
			},
			completedAdvancedPYQs: {
				$sum: {
					$cond: [{ $eq: ['$PYQ_Advanced', true] }, 1, 0],
				},
			},
			chapterList: {
				$push: {
					_id: '$_id',
					seqNumber: '$seqNumber',
					name: '$name',
					done: '$done',
					theory: '$theory',
					shortNotes: '$shortNotes',
					mindMap: '$mindMap',
					DPP1: '$DPP1',
					DPP2: '$DPP2',
					Module: '$Module',
					PYQ_Mains: '$PYQ_Mains',
					PYQ_Advanced: '$PYQ_Advanced',
					Book: '$Book',
					totalTopics: '$totalTopics',
					subject: '$subjectDetails',
					topicsList: '$topicsList',
					currentChapterStatus: '$currentChapterStatus',
				},
			},
		},
	},
	{
		$project: {
			_id: 1,
			name: 1,
			totalChapters: 1,
			completedMainsPYQs: 1,
			completedAdvancedPYQs: 1,
			completedChapters: 1,
			completedTheory: 1,
			chapterList: 1,
		},
	},
];
