import { PipelineStage, Types } from 'mongoose';

export const getOrganizedTopicListPipeline: PipelineStage[] = [
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
	{ $sort: { subject: 1, seqNumber: 1 } },
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
				{ $sort: { chapter: 1, seqNumber: 1 } },
			],
		},
	},
	{
		$group: {
			_id: '$subject',
			name: { $first: '$subjectDetails.name' },
			chapterList: {
				$push: {
					_id: '$_id',
					seqNumber: '$seqNumber',
					name: '$name',
					// done: "$done",
					// theory: "$theory",
					// shortNotes: "$shortNotes",
					// mindMap: "$mindMap",
					// DPP1: "$DPP1",
					// DPP2: "$DPP2",
					// Module: "$Module",
					// PYQ_Mains: "$PYQ_Mains",
					// PYQ_Advanced: "$PYQ_Advanced",
					// Book: "$Book",
					// subjectDetails: "$subjectDetails",
					topicsList: '$topicsList',
				},
			},
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

export function getTopicListOfChapter(chapterId: string): PipelineStage[] {
	return [
		{
			$match: {
				_id: new Types.ObjectId(chapterId),
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
					{ $sort: { chapter: 1, seqNumber: 1 } },
				],
			},
		},
		{
			$project: {
				_id: 1,
				name: 1,
				seqNumber: 1,
				topicsList: 1,
			},
		},
	];
}
