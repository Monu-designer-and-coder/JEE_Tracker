import { ApiResponse } from "@/config/backend/ApiResponse.config";
import dbConn from "@/lib/dbConn";
import ChapterModel from "@/model/chapters.model";
import { getChapterListPipeline } from "@/pipelines/getChapterList.pipe";
import { iApiResponse } from "@/types/backend/apiResponse.types";
import { iChapterList } from "@/types/res/chapterList.types";
import { NextResponse } from "next/server";


export async function GET(request: Request) {

  const { searchParams } = new URL(request.url);
  const subjectId: string = searchParams.get('id') || '';

  if (!subjectId) return NextResponse.json(ApiResponse<iApiResponse>(false, "Please provide some ID."), { status: 400 })

  await dbConn();


  // * CASE 1: Get all topics
  const chaptersList: iChapterList[] = await ChapterModel.aggregate(getChapterListPipeline(subjectId));

  if (chaptersList.length === 0) { return NextResponse.json<iApiResponse>(ApiResponse(false, "Please Provide a valid chapter-id"), { status: 400 }) }

  return NextResponse.json<iApiResponse<iChapterList[]>>(ApiResponse(true, "Fetched the chapters List for the subject successfully", chaptersList));
}



