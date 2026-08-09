import { PipelineStage, Types } from "mongoose";

export function getChapterListPipeline(subjectId: string): PipelineStage[] {
  return ([
    {
      $match: {
        subject: new Types.ObjectId(subjectId)
      }
    },
    {
      $lookup: {
        from: "subjects",
        localField: "subject",
        foreignField: "_id",
        as: "subjectDetails",
        pipeline: [
          {
            $project: {
              _id: 1,
              name: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        subject: {
          $first: "$subjectDetails"
        }
      }
    },
    {
      $sort: {
        subject: 1,
        seqNumber: 1
      }
    },
    {
      $project: {
        _id: 1,
        name: 1,
        seqNumber: 1,
        subject: 1,
        currentChapterStatus: 1,
      }
    }
  ])
} 