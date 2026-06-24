import dbConn from "@/lib/dbConn";
import ChapterModel, { currentChapterStatus } from "@/model/chapters.model";
import { systemPUTRequestSchema } from "@/schema/system.schema";
import { getPendingChapter, getPendingChapterSubjectWiseList } from "@/types/res/SystemResponse.types";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    await dbConn();
    try {

        const { searchParams } = new URL(request.url);
        const queryParamType = searchParams.get('type');

        if (queryParamType === "getPendingList") {
            const ReturnData: getPendingChapterSubjectWiseList[] = await ChapterModel.aggregate([
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
                    $sort: {
                        seqNumber: 1,
                        subject: 1,
                    }
                },
                {
                    $match: {
                        currentChapterStatus: currentChapterStatus.Pending
                    }
                },
                {
                    $group: {
                        _id: "$subject",
                        name: {
                            $first: "$subjectDetails.name"
                        },
                        chapterList: {
                            $push: {
                                _id: "$_id",
                                seqNumber: "$seqNumber",
                                name: "$name",
                            }
                        }
                    },
                },
                { $project: { _id: 1, name: 1, chapterList: 1 } }
            ])

            return NextResponse.json<getPendingChapterSubjectWiseList[]>(ReturnData);
        }

        if (queryParamType === "getUpcomingList") {
            const ReturnData: getPendingChapter[] = await ChapterModel.aggregate([
                {
                    $match: {
                        currentChapterStatus: currentChapterStatus.UpNext
                    }
                },
                {
                    $sort: {
                        name: 1,
                    }
                },
                {
                    $project: {
                        _id: 1,
                        name: 1
                    }
                }
            ])

            return NextResponse.json<getPendingChapter[]>(ReturnData);
        }

        const ReturnData: getPendingChapter[] = await ChapterModel.aggregate([
            {
                $match: {
                    currentChapterStatus: currentChapterStatus.InProgress
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
                    as: "topicsList"
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
                }
            }
        ])

        return NextResponse.json<getPendingChapter[]>(ReturnData);
    }

    catch (error) {
        console.log(error)
        return NextResponse.json({ msg: "error" });
    }
}

export async function PUT(request: Request) {
    await dbConn();

    try {
        const clientBodyData = await request.json();

        const validationResult = systemPUTRequestSchema.safeParse(clientBodyData);
        if (!validationResult.success) {
            return NextResponse.json(
                { errors: validationResult.error.format() },
                { status: 400 }
            );
        }
        if (validationResult.data.type === "addChapterToSystem" && validationResult.data._id) {
            const updatedChapterRecord = await ChapterModel.findByIdAndUpdate(
                validationResult.data._id,
                { currentChapterStatus: currentChapterStatus.InProgress },
            ).lean();

            if (!updatedChapterRecord) {
                return NextResponse.json({ error: 'Target tracking database primary identity pointer not found' }, { status: 404 });
            }

            return NextResponse.json(updatedChapterRecord, { status: 200 });
        }
        if (validationResult.data.type === "markChapterAsUnfinished" && validationResult.data._id) {
            const updatedChapterRecord = await ChapterModel.findByIdAndUpdate(
                validationResult.data._id,
                { currentChapterStatus: currentChapterStatus.UnFinished },
            ).lean();

            if (!updatedChapterRecord) {
                return NextResponse.json({ error: 'Target tracking database primary identity pointer not found' }, { status: 404 });
            }

            return NextResponse.json(updatedChapterRecord, { status: 200 });
        }
        if (validationResult.data.type === "markChapterAsUpComing" && validationResult.data._id) {
            const updatedChapterRecord = await ChapterModel.findByIdAndUpdate(
                validationResult.data._id,
                { currentChapterStatus: currentChapterStatus.UpNext },
            ).lean();

            if (!updatedChapterRecord) {
                return NextResponse.json({ error: 'Target tracking database primary identity pointer not found' }, { status: 404 });
            }

            return NextResponse.json(updatedChapterRecord, { status: 200 });
        }
    }
    catch (error) {
        console.log(error)
        return NextResponse.json({ msg: "error" });
    }
}