/* eslint-disable @typescript-eslint/no-explicit-any */
import dbConn from "@/lib/dbConn";
import StudyTaskModel, { studyTaskOptionsChapterTags, studyTaskOptionsTopicTags } from "@/model/study-task.model";
import ChapterModel from "@/model/chapters.model";
import TopicModel from "@/model/topics.model";
import { NextResponse } from "next/server";
import { createStudyTaskSchema } from "@/schema/studyTask.schema";
import { studyTaskListItem } from "@/types/res/studyTaskResponse.types";
import { eCurrentChapterStatus } from '@/types/model/chapter.model.types';

// *=====================================================================
// * POST /api/study-task
// * Turns one "listed task" suggestion (from /api/system/task/list) into
// * a tracked study-task: {refType, refId, tag} -> a StudyTask document.
// * `subject` is deliberately NOT taken from the client — it's derived
// * server-side from the chapter/topic so it can never drift out of sync.
// *=====================================================================
export async function POST(request: Request) {
  await dbConn();
  try {
    const clientBodyData = await request.json();
    const validationResult = createStudyTaskSchema.safeParse(clientBodyData);
    if (!validationResult.success) {
      return NextResponse.json({ errors: validationResult.error.format() }, { status: 400 });
    }
    const { refType, refId, tag } = validationResult.data;

    let subjectId;

    if (refType === "chapter") {
      // * Pull only what's needed: the owning subject, current status, and the tag itself.
      const chapterDoc = await ChapterModel.findById(refId)
        .select(`subject eCurrentChapterStatus ${tag}`)
        .lean<any>();
      if (!chapterDoc) {
        return NextResponse.json({ error: "Chapter not found for the given refId" }, { status: 404 });
      }
      // ! Study-tasks only make sense for chapters actively being worked on.
      if (chapterDoc.eCurrentChapterStatus !== eCurrentChapterStatus.InProgress) {
        return NextResponse.json({ error: "Chapter is not currently inProgress" }, { status: 409 });
      }
      if (chapterDoc[tag] === true) {
        return NextResponse.json({ error: `"${tag}" is already complete on this chapter` }, { status: 409 });
      }
      subjectId = chapterDoc.subject;
    } else {
      // * Topics don't carry their own status, only their parent chapter's subject.
      const topicDoc = await TopicModel.findById(refId)
        .select(`chapter ${tag}`)
        .populate({ path: "chapter", select: "subject" })
        .lean<any>();
      if (!topicDoc || !topicDoc.chapter) {
        return NextResponse.json({ error: "Topic not found for the given refId" }, { status: 404 });
      }
      if (topicDoc[tag] === true) {
        return NextResponse.json({ error: `"${tag}" is already complete on this topic` }, { status: 409 });
      }
      subjectId = topicDoc.chapter.subject;
    }

    // * assignDate defaults via the schema; workingSessions/done default empty/false.
    // * `tag` is validated against the correct tag-set by the zod `.refine()`
    // * above, so narrowing it here from zod's inferred `string` down to the
    // * stricter enum union the model schema expects is safe.
    const newStudyTask = await StudyTaskModel.create({
      subject: subjectId,
      studyTask: {
        enum: refType,
        _id: refId,
        tag: tag as studyTaskOptionsChapterTags | studyTaskOptionsTopicTags,
      },
    });

    return NextResponse.json(newStudyTask, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ msg: "error", error: (error as Error).message }, { status: 500 });
  }
}

// *=====================================================================
// * GET /api/study-task?status=pending|done&page=1&limit=20
// * Lists study-tasks enriched with subject + chapter/topic context and a
// * couple of derived stats (total time spent, whether a timer is live).
// *=====================================================================
export async function GET(request: Request) {
  await dbConn();
  try {
    const { searchParams } = new URL(request.url);
    const isDone = searchParams.get("status") === "done"; // default false -> pending
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;

    // * Built as an aggregate pipeline (not `.exec()`'d yet) so it can be
    // * handed straight to aggregatePaginate() below.
    const aggregateQuery = StudyTaskModel.aggregate([
      { $match: { done: isDone } },
      {
        $lookup: {
          from: "subjects", localField: "subject", foreignField: "_id",
          as: "subjectDetails", pipeline: [{ $project: { _id: 1, name: 1 } }],
        },
      },
      // ? Two parallel lookups — exactly one resolves, based on studyTask.enum
      {
        $lookup: {
          from: "chapters", localField: "studyTask._id", foreignField: "_id",
          as: "chapterDetails", pipeline: [{ $project: { _id: 1, name: 1, chapter: "$_id" } }],
        },
      },
      {
        $lookup: {
          from: "topics", localField: "studyTask._id", foreignField: "_id",
          as: "topicDetails", pipeline: [{ $project: { _id: 1, name: 1, chapter: 1 } }],
        },
      },
      {
        $addFields: {
          subjectDetails: { $first: "$subjectDetails" },
          refDetails: {
            $cond: [
              { $eq: ["$studyTask.enum", "chapter"] },
              { $first: "$chapterDetails" },
              { $first: "$topicDetails" },
            ],
          },
          totalTimeSpent: { $sum: "$workingSessions.totalTime" }, // * ms
          isSessionActive: {
            $cond: [{ $ifNull: ["$activeSessionStartedAt", false] }, true, false],
          },
        },
      },
      {
        $project: {
          _id: 1, assignDate: 1, completionDate: 1, done: 1,
          subjectDetails: 1, studyTask: 1, refDetails: 1,
          totalTimeSpent: 1, isSessionActive: 1, workingSessions: 1,
        },
      },
      { $sort: { assignDate: -1 } },
    ]);

    const paginatedResult = await StudyTaskModel.aggregatePaginate<studyTaskListItem>(aggregateQuery, { page, limit });

    return NextResponse.json(paginatedResult);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ msg: "error", error: (error as Error).message }, { status: 500 });
  }
}