import { CHAPTER_COMPLETION_SEQUENCE } from "@/config/constants";
import dbConn from "@/lib/dbConn";
import ChapterModel from "@/model/chapters.model";
import { eCurrentChapterStatus } from "@/types/model/chapter.model.types";
import { detailedListOfChaptersInSystem, inProgressChaptersCurrentTaskList, inProgressChaptersTaskList } from "@/types/res/SystemResponse.types";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConn();
  try {

    const inProgressChapterList: detailedListOfChaptersInSystem[] = await ChapterModel.aggregate([
      {
        $match: {
          eCurrentChapterStatus: eCurrentChapterStatus.InProgress
        }
      },
      {
        $sort: {
          name: 1
        }
      },
      {
        $lookup: {
          from: "topics",
          localField: "_id",
          foreignField: "chapter",
          as: "topicsList",
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                seqNumber: 1,
                done: 1,
                theory: 1,
                inTextQuestions: 1,
                inClassQuestions: 1
              }
            },
            {
              $sort: {
                chapter: 1,
                seqNumber: 1
              }
            }
          ]
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
          subjectDetails: {
            $first: "$subjectDetails"
          }
        }
      },
      {
        $addFields: {
          totalTopics: {
            $size: "$topicsList"
          },
          totalTopicsCompleted: {
            $size: {
              $filter: {
                input: "$topicsList",
                as: "topic",
                cond: { $eq: ["$$topic.done", true] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          topicsLeft: {
            $subtract: [
              "$totalTopics",
              "$totalTopicsCompleted"
            ]
          },
          topicsCompletedPercent: {
            $multiply: [
              {
                $divide: [
                  "$totalTopicsCompleted",
                  "$totalTopics"
                ]
              },
              100
            ]
          }
        }
      },
      {
        $addFields: {
          topicsLeftPercent: {
            $multiply: [
              {
                $divide: [
                  "$topicsLeft",
                  "$totalTopics"
                ]
              },
              100
            ]
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          seqNumber: 1,
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
          totalTopicsCompleted: 1,
          topicsList: 1,
          topicsLeft: 1,
          topicsCompletedPercent: 1,
          topicsLeftPercent: 1,
          eCurrentChapterStatus: 1,
          subjectDetails: 1
        }
      }
    ])

    const tagsToCompleteForInProgressChapter = CHAPTER_COMPLETION_SEQUENCE.slice(0, 4)
    const allListOfTasksChapterInProgress: inProgressChaptersTaskList[] = inProgressChapterList.map((chapter) => {

      const topicsToComplete = chapter.topicsList.filter(topic => (!topic.done)).map(topic => (topic.name))

      const tagsToComplete = tagsToCompleteForInProgressChapter.filter(tag => !chapter[tag]).map(tag => (`Complete ${chapter.name}'s ${tag}`))


      return { chapter: { _id: chapter._id, name: chapter.name }, topicsToComplete, tagsToComplete, subjectDetails: chapter.subjectDetails }
    })
    const allListOfCurrentTasksChapterInProgress: inProgressChaptersCurrentTaskList[] = inProgressChapterList.map((chapter) => {

      const topicsToComplete = chapter.topicsList.filter(topic => (!topic.done)).map(topic => (`Topic: ${topic.name}`))

      if (topicsToComplete.length) {
        return { chapter: { _id: chapter._id, name: chapter.name }, task: topicsToComplete[0], subjectDetails: chapter.subjectDetails }
      }
      const tagsToComplete = tagsToCompleteForInProgressChapter.filter(tag => !chapter[tag]).map(tag => (`Complete ${chapter.name}'s ${tag}`))


      return { chapter: { _id: chapter._id, name: chapter.name }, task: tagsToComplete[0], subjectDetails: chapter.subjectDetails }
    })


    return NextResponse.json<{ allListOfTasksChapterInProgress: inProgressChaptersTaskList[], allListOfCurrentTasksChapterInProgress: inProgressChaptersCurrentTaskList[] }>({ allListOfTasksChapterInProgress, allListOfCurrentTasksChapterInProgress });
  }

  catch (error) {
    console.log(error)
    return NextResponse.json({ msg: "error", error });
  }
}