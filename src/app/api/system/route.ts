import dbConn from "@/lib/dbConn";
import ChapterModel from "@/model/chapters.model";
import { systemPUTRequestSchema } from "@/schema/system.schema";
import { syllabusDetailedDataChapter } from "@/types/res/syllabusDataResponse.types";
import { getPendingChapter, getPendingChapterSubjectWiseList } from "@/types/res/SystemResponse.types";
import { NextResponse } from "next/server";
import { eCurrentChapterStatus } from '@/types/model/chapter.model.types';

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
                        eCurrentChapterStatus: eCurrentChapterStatus.Pending
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
        if (queryParamType === "getUnfinishedList") {
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
                        eCurrentChapterStatus: eCurrentChapterStatus.UnFinished
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
                        eCurrentChapterStatus: eCurrentChapterStatus.UpNext
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
        if (queryParamType === "getCompletedList") {
            const ReturnData: getPendingChapter[] = await ChapterModel.aggregate([
                {
                    $match: {
                        eCurrentChapterStatus: eCurrentChapterStatus.Done
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

        const ReturnData: syllabusDetailedDataChapter[] = await ChapterModel.aggregate([
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
                $addFields: {
                    totalTopics: {
                        $size: "$topicsList"
                    }
                }
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
                    eCurrentChapterStatus: 1
                }
            },
            {
                $addFields: {
                    totalTopicsCompleted: {
                        $size: {
                            $filter: {
                                input: "$topicsList",
                                as: "topic",
                                cond: { $eq: ["$$topic.done", true] }
                            }
                        }
                    },
                    totalTopicsTheoryCompleted: {
                        $size: {
                            $filter: {
                                input: "$topicsList",
                                as: "topic",
                                cond: { $eq: ["$$topic.theory", true] }
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    totalTopicsCompletedPercentage: {
                        $cond: [
                            { $eq: ["$totalTopics", 0] },
                            0,
                            {
                                $divide: [
                                    {
                                        $multiply: [
                                            "$totalTopicsCompleted",
                                            100
                                        ]
                                    },
                                    "$totalTopics"
                                ]
                            }
                        ]
                    },
                    totalTopicsTheoryCompletedPercentage: {
                        $cond: [
                            { $eq: ["$totalTopics", 0] },
                            0,
                            {
                                $divide: [
                                    {
                                        $multiply: [
                                            "$totalTopicsTheoryCompleted",
                                            100
                                        ]
                                    },
                                    "$totalTopics"
                                ]
                            }
                        ]
                    }
                }
            }
        ])

        return NextResponse.json<syllabusDetailedDataChapter[]>(ReturnData);
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
                { eCurrentChapterStatus: eCurrentChapterStatus.InProgress },
            ).lean();

            if (!updatedChapterRecord) {
                return NextResponse.json({ error: 'Target tracking database primary identity pointer not found' }, { status: 404 });
            }

            return NextResponse.json(updatedChapterRecord, { status: 200 });
        }
        if (validationResult.data.type === "markChapterAsUnfinished" && validationResult.data._id) {
            const updatedChapterRecord = await ChapterModel.findByIdAndUpdate(
                validationResult.data._id,
                { eCurrentChapterStatus: eCurrentChapterStatus.UnFinished },
            ).lean();

            if (!updatedChapterRecord) {
                return NextResponse.json({ error: 'Target tracking database primary identity pointer not found' }, { status: 404 });
            }

            return NextResponse.json(updatedChapterRecord, { status: 200 });
        }
        if (validationResult.data.type === "markChapterAsUpComing" && validationResult.data._id) {
            const updatedChapterRecord = await ChapterModel.findByIdAndUpdate(
                validationResult.data._id,
                { eCurrentChapterStatus: eCurrentChapterStatus.UpNext },
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