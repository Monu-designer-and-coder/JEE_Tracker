/* eslint-disable @typescript-eslint/no-explicit-any */
import dbConn from "@/lib/dbConn";
import SubjectStreakModel from "@/model/questionStreak.model";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    await dbConn();

    const { searchParams } = new URL(request.url);
    const queryParamType = searchParams.get('type');

    // * Universal extraction logic supporting functional pagination fallbacks
    const paginationPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const paginationLimit = Math.max(1, parseInt(searchParams.get('limit') || '50', 10));
    const queryOffset = (paginationPage - 1) * paginationLimit;

    if (!queryParamType) {
      const analyticalCount = await SubjectStreakModel.countDocuments({});
      const itemsList = await SubjectStreakModel.find({})
        .skip(queryOffset)
        .limit(paginationLimit)
        .lean();

      return NextResponse.json({
        data: itemsList,
        pagination: {
          page: paginationPage,
          limit: paginationLimit,
          totalItems: analyticalCount,
          hasMore: queryOffset + itemsList.length < analyticalCount
        }
      });
    }


    //! Gemini
    if (queryParamType === 'peak') {
      const rawAggregatedPayload = await SubjectStreakModel.aggregate([
        {
          $facet: {
            // 1. Peak overall Time Studied Day
            peakTimeStudiedDay: [
              {
                $group: {
                  _id: "$date",
                  totalQuestions: { $sum: "$questionsDone" },
                  totalTime: { $sum: "$timeStudied" }
                }
              },
              { $sort: { totalTime: -1 } },
              { $limit: 1 },
              { $project: { date: "$_id", _id: 0, totalTime: 1, totalQuestions: 1 } }
            ],

            // 2. Peak overall Questions Done Day
            peakQuestionsDoneDay: [
              {
                $group: {
                  _id: "$date",
                  totalQuestions: { $sum: "$questionsDone" },
                  totalTime: { $sum: "$timeStudied" }
                }
              },
              { $sort: { totalQuestions: -1 } },
              { $limit: 1 },
              { $project: { date: "$_id", _id: 0, totalTime: 1, totalQuestions: 1 } }
            ],

            // 3. Best overall productive day (Average of Time & Questions)
            bestOverallDay: [
              {
                $group: {
                  _id: "$date",
                  totalQuestions: { $sum: "$questionsDone" },
                  totalTime: { $sum: "$timeStudied" }
                }
              },
              {
                $addFields: {
                  // Calculates (Questions + Time) / 2
                  averageScore: { $divide: [{ $add: ["$totalQuestions", "$totalTime"] }, 200000] }
                }
              },
              { $sort: { averageScore: -1 } },
              { $limit: 1 },
              { $project: { date: "$_id", _id: 0, totalTime: 1, totalQuestions: 1, averageScore: 1 } }
            ],

            // 4. Subject-wise peak days based on the average score
            subjectWisePeaks: [
              {
                // Step A: Group by both subject and date to get daily totals per subject
                $group: {
                  _id: { subject: "$subject", date: "$date" },
                  dailyQuestions: { $sum: "$questionsDone" },
                  dailyTime: { $sum: "$timeStudied" }
                }
              },
              {
                // Step B: Calculate the productive average for that specific subject's day
                $addFields: {
                  averageScore: { $divide: [{ $add: ["$dailyQuestions", "$dailyTime"] }, 200000] }
                }
              },
              // Step C: Sort descending so the "best" days bubble to the top
              { $sort: { averageScore: -1 } },
              {
                // Step D: Group by Subject ID only. $first grabs the top result from our sorted list
                $group: {
                  _id: "$_id.subject",
                  bestDate: { $first: "$_id.date" },
                  peakQuestions: { $first: "$dailyQuestions" },
                  peakTime: { $first: "$dailyTime" },
                  peakAverageScore: { $first: "$averageScore" }
                }
              },
              // Step E: Now that we only have a few documents (one per subject), we do the $lookup
              {
                $lookup: {
                  from: "subjects", // Ensure this matches your actual MongoDB collection name
                  localField: "_id",
                  foreignField: "_id",
                  as: "subjectInfo"
                }
              },
              { $unwind: { path: "$subjectInfo", preserveNullAndEmptyArrays: true } },
              {
                $project: {
                  _id: 1,
                  subjectName: "$subjectInfo.name",
                  bestDate: 1,
                  peakQuestions: 1,
                  peakTime: 1,
                  peakAverageScore: 1
                }
              }
            ]
          }
        }
      ]);


      return NextResponse.json(
        rawAggregatedPayload[0]
      );
    }

    //? Claude
    if (queryParamType === 'detailedData') {
      const rawAggregatedPayload = await SubjectStreakModel.aggregate([
        // 1. Resolve the subject reference once, up front  
        {
          $lookup: {
            from: "subjects",
            localField: "subject",
            foreignField: "_id",
            as: "subjectInfo",
            pipeline: [{ $project: { _id: 1, name: 1 } }],
          },
        },
        {
          $addFields: {
            subject: { $first: "$subjectInfo" },
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
                  _id: "$date",
                  totalQuestionsDone: { $sum: "$questionsDone" },
                  totalTimeStudied: { $sum: "$timeStudied" },
                  details: {
                    $push: {
                      _id: "$_id",
                      subject: "$subject",
                      questionsDone: "$questionsDone",
                      timeStudied: "$timeStudied",
                    },
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  date: "$_id",
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
                  _id: { subject: "$subject", date: "$date" },
                  questionsDone: { $sum: "$questionsDone" },
                  timeStudied: { $sum: "$timeStudied" },
                },
              },
              {
                $addFields: {
                  score: { $avg: ["$questionsDone", "$timeStudied"] },
                },
              },
              // sort so the best day per subject lands first within its group
              { $sort: { "_id.subject._id": 1, score: -1 } },
              {
                $group: {
                  _id: "$_id.subject._id",
                  subjectName: { $first: "$_id.subject.name" },
                  peakDate: { $first: "$_id.date" },
                  peakQuestionsDone: { $first: "$questionsDone" },
                  peakTimeStudied: { $first: "$timeStudied" },
                  peakScore: { $first: "$score" },
                },
              },
              {
                $project: {
                  _id: 0,
                  subjectId: "$_id",
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
                  input: "$dailyBreakdown",
                  sortBy: { totalQuestionsDone: -1 },
                },
              },
            },
            peakTimeStudiedDay: {
              $first: {
                $sortArray: {
                  input: "$dailyBreakdown",
                  sortBy: { totalTimeStudied: -1 },
                },
              },
            },
            bestDay: {
              $first: {
                $sortArray: {
                  input: {
                    $map: {
                      input: "$dailyBreakdown",
                      as: "d",
                      in: {
                        $mergeObjects: [
                          "$$d",
                          {
                            score: {
                              $avg: ["$$d.totalQuestionsDone", "$$d.totalTimeStudied"],
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
      ]);


      return NextResponse.json({
        rawAggregatedPayload
      });
    }


    const singularTargetRecord = await SubjectStreakModel.findById(queryParamType).populate('subject').lean();
    if (!singularTargetRecord) {
      return NextResponse.json({ message: 'Requested reference element not located within DB context maps' }, { status: 404 });
    }

    return NextResponse.json({ data: [singularTargetRecord] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal pipeline processing fault' }, { status: 500 });
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
      from: "subjects",
      localField: "subject",
      foreignField: "_id",
      as: "subjectInfo",
      pipeline: [{ $project: { _id: 1, name: 1 } }],
    },
  },
  {
    $addFields: {
      subject: { $first: "$subjectInfo" },
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
            _id: "$date",
            totalQuestionsDone: { $sum: "$questionsDone" },
            totalTimeStudied: { $sum: "$timeStudied" },
            details: {
              $push: {
                _id: "$_id",
                subject: "$subject",
                questionsDone: "$questionsDone",
                timeStudied: "$timeStudied",
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            date: "$_id",
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
            _id: { subject: "$subject", date: "$date" },
            questionsDone: { $sum: "$questionsDone" },
            timeStudied: { $sum: "$timeStudied" },
          },
        },
        {
          $addFields: {
            score: { $avg: ["$questionsDone", "$timeStudied"] },
          },
        },
        // sort so the best day per subject lands first within its group
        { $sort: { "_id.subject._id": 1, score: -1 } },
        {
          $group: {
            _id: "$_id.subject._id",
            subjectName: { $first: "$_id.subject.name" },
            peakDate: { $first: "$_id.date" },
            peakQuestionsDone: { $first: "$questionsDone" },
            peakTimeStudied: { $first: "$timeStudied" },
            peakScore: { $first: "$score" },
          },
        },
        {
          $project: {
            _id: 0,
            subjectId: "$_id",
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
            input: "$dailyBreakdown",
            sortBy: { totalQuestionsDone: -1 },
          },
        },
      },
      peakTimeStudiedDay: {
        $first: {
          $sortArray: {
            input: "$dailyBreakdown",
            sortBy: { totalTimeStudied: -1 },
          },
        },
      },
      bestDay: {
        $first: {
          $sortArray: {
            input: {
              $map: {
                input: "$dailyBreakdown",
                as: "d",
                in: {
                  $mergeObjects: [
                    "$$d",
                    {
                      score: {
                        $avg: ["$$d.totalQuestionsDone", "$$d.totalTimeStudied"],
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