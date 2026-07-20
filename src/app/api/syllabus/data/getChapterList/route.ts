import dbConn from "@/lib/dbConn";
import ChapterModel from "@/model/chapters.model";
import { Types } from "mongoose";
import { NextResponse } from "next/server";


export async function GET(request: Request) {

  const { searchParams } = new URL(request.url);
  const subjectId: string = searchParams.get('id') || '';
  if (!subjectId) return NextResponse.json({ error: "Please provide a Id" }, { status: 400 })

  await dbConn();


  // * CASE 1: Get all topics
  const chaptersList = await ChapterModel.aggregate([
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
  ]);

  if (chaptersList.length === 0) { return NextResponse.json({ error: `Please provide a valid Id ${chaptersList.length}` }, { status: 400 }) }

  return NextResponse.json(chaptersList);

}



