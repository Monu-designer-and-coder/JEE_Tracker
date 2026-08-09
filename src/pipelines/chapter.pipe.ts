import { PipelineStage, Types } from 'mongoose';

export const allChapterListPipeline: PipelineStage[] = [
	{
		$lookup: {
			from: 'subjects',
			localField: 'subject',
			foreignField: '_id',
			pipeline: [{ $project: { _id: 1, name: 1 } }],
			as: 'subjectDetails',
		},
	},
	{ $addFields: { subjectDetails: { $first: '$subjectDetails' } } },
	{ $sort: { subject: 1, seqNumber: 1 } },
	{
		$project: {
			_id: 1,
			seqNumber: 1,
			name: 1,
			subject: '$subjectDetails',
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
		},
	},
];
export const subjectWiseChaptersListPipeline: PipelineStage[] = [
	{
		$lookup: {
			from: 'chapters',
			localField: '_id',
			foreignField: 'subject',
			as: 'chapterList',
			pipeline: [
				{
					$project: {
						_id: 1,
						seqNumber: 1,
						subject: '$subjectDetails',
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
					},
				},
			],
		},
	},
	{
		$project: {
			_id: 1,
			name: 1,
			chapterList: 1,
		},
	},
];
export function detailedChapterResponsePipeline(
	chapterId: string,
): PipelineStage[] {
	return [
		{
			$match: {
				_id: new Types.ObjectId(chapterId),
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
				currentChapterStatus: 1,
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
}
