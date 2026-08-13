import { Types } from 'mongoose';
import { PipelineStage } from 'mongoose';

export const dailyRecordPipeline: PipelineStage[] = [
	{
		$lookup: {
			from: 'subjects',
			localField: 'subject',
			foreignField: '_id',
			as: 'subjectInfo',
			pipeline: [{ $project: { _id: 1, name: 1 } }],
		},
	},
	{ $addFields: { subject: { $first: '$subjectInfo' } } },
	{
		$group: {
			_id: '$date',
			details: {
				$push: {
					_id: '$_id',
					subject: '$subject',
					questionsDone: '$questionsDone',
					timeStudied: '$timeStudied',
					date: '$date',
				},
			},
		},
	},
	{ $sort: { _id: -1 } }, // * Performance Optimization: chronological clustering
];

export const subjectWiseRecordPipeline: PipelineStage[] = [
	{
		$lookup: {
			from: 'subjects',
			localField: 'subject',
			foreignField: '_id',
			as: 'subjectInfo',
			pipeline: [{ $project: { _id: 1, name: 1 } }],
		},
	},
	{ $addFields: { subject: { $first: '$subjectInfo' } } },
	{
		$group: {
			_id: '$subject',
			details: {
				$push: {
					_id: '$_id',
					subject: '$subject',
					questionsDone: '$questionsDone',
					timeStudied: '$timeStudied',
					date: '$date',
				},
			},
		},
	},
	{
		$project: {
			subject: '$_id',
			details: 1,
			_id: 0,
		},
	},
];



export function todaysRecordPipeline(
	absoluteStartTimeToday: Date,
	absoluteEndTimeToday: Date,
): PipelineStage[] {
	return [
		{
			$match: {
				date: {
					$gte: absoluteStartTimeToday,
					$lte: absoluteEndTimeToday,
				},
			},
		},
		{
			$lookup: {
				from: 'subjects',
				localField: 'subject',
				foreignField: '_id',
				as: 'subject',
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
					$first: '$subject',
				},
			},
		},
		{
			$project: {
				_id: 1,
				date: 1,
				questionsDone: 1,
				subject: 1,
				timeStudied: 1,
			},
		},
	];
}

export function todaysRecordBySubjectPipeline(
	subjectId: Types.ObjectId,
	absoluteStartTimeToday: Date,
	absoluteEndTimeToday: Date,
): PipelineStage[] {
	return [
		{
			$match: {
				date: {
					$gte: absoluteStartTimeToday,
					$lte: absoluteEndTimeToday,
				},
				subject: subjectId,
			},
		},
		{
			$lookup: {
				from: 'subjects',
				localField: 'subject',
				foreignField: '_id',
				as: 'subject',
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
					$first: '$subject',
				},
			},
		},
		{
			$project: {
				_id: 1,
				date: 1,
				questionsDone: 1,
				subject: 1,
				timeStudied: 1,
			},
		},
	];
}

//! ----------------------
export const peakDaysPipeline: PipelineStage[] = [
	{
		$facet: {
			// 1. Peak overall Time Studied Day
			peakTimeStudiedDay: [
				{
					$group: {
						_id: '$date',
						totalQuestions: { $sum: '$questionsDone' },
						totalTime: { $sum: '$timeStudied' },
					},
				},
				{ $sort: { totalTime: -1 } },
				{ $limit: 1 },
				{
					$project: {
						date: '$_id',
						_id: 0,
						totalTime: 1,
						totalQuestions: 1,
					},
				},
			],

			// 2. Peak overall Questions Done Day
			peakQuestionsDoneDay: [
				{
					$group: {
						_id: '$date',
						totalQuestions: { $sum: '$questionsDone' },
						totalTime: { $sum: '$timeStudied' },
					},
				},
				{ $sort: { totalQuestions: -1 } },
				{ $limit: 1 },
				{
					$project: {
						date: '$_id',
						_id: 0,
						totalTime: 1,
						totalQuestions: 1,
					},
				},
			],

			// 3. Best overall productive day (Average of Time & Questions)
			bestOverallDay: [
				{
					$group: {
						_id: '$date',
						totalQuestions: { $sum: '$questionsDone' },
						totalTime: { $sum: '$timeStudied' },
					},
				},
				{
					$addFields: {
						// Calculates (Questions + Time) / 2
						averageScore: {
							$divide: [
								{
									$add: [
										{ $multiply: ['$totalQuestions', 1000000] },
										'$totalTime',
									],
								},
								200000,
							],
						},
					},
				},
				{ $sort: { averageScore: -1 } },
				{ $limit: 1 },
				{
					$project: {
						date: '$_id',
						_id: 0,
						totalTime: 1,
						totalQuestions: 1,
						averageScore: 1,
					},
				},
			],

			// 4. Subject-wise peak days based on the average score
			subjectWisePeaks: [
				{
					$group: {
						_id: { subject: '$subject', date: '$date' },
						dailyQuestions: { $sum: '$questionsDone' },
						dailyTime: { $sum: '$timeStudied' },
					},
				},
				{
					$addFields: {
						averageScore: {
							$divide: [
								{
									$add: [
										{ $multiply: ['$dailyQuestions', 1000000] },
										'$dailyTime',
									],
								},
								200000,
							],
						},
					},
				},
				{ $sort: { averageScore: -1 } },
				{
					$group: {
						_id: '$_id.subject',
						bestDate: { $first: '$_id.date' },
						peakQuestions: { $first: '$dailyQuestions' },
						peakTime: { $first: '$dailyTime' },
						peakAverageScore: { $first: '$averageScore' },
					},
				},
				{
					$lookup: {
						from: 'subjects',
						localField: '_id',
						foreignField: '_id',
						as: 'subjectInfo',
					},
				},
				{
					$unwind: {
						path: '$subjectInfo',
						preserveNullAndEmptyArrays: true,
					},
				},
				{
					$project: {
						_id: 1,
						subjectName: '$subjectInfo.name',
						bestDate: 1,
						peakQuestions: 1,
						peakTime: 1,
						peakAverageScore: 1,
					},
				},
			],
		},
	},
];

export const detailedPeakDaysPipeline: PipelineStage[] = [
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
	{
		$facet: {
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
				{ $sort: { date: -1 } },
			],
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
						score: {
							$divide: [
								{
									$add: [
										{ $multiply: ['$questionsDone', 1000000] },
										'$timeStudied',
									],
								},
								200000,
							],
						},
					},
				},
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
												$divide: [
													{
														$add: [
															{
																$multiply: ['$$d.totalQuestionsDone', 1000000],
															},
															'$$d.totalTimeStudied',
														],
													},
													200000,
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
