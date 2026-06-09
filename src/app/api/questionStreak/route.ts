import dbConn from "@/lib/dbConn";
import QuestionStreakModel from "@/model/questionStreak.model";
import { questionStreakPlusOneSchema, questionStreakPostSchema } from "@/schema/questionStreak.schema";
import { NextResponse } from "next/server";
import { QuestionStreakModelInterface } from './../../../model/questionStreak.model';
import { getQuestionStreakByDateResponse, getQuestionStreakBySubjectResponse, getQuestionStreakTodayResponse } from "@/types/res/questionStreak.types";
import mongoose from "mongoose";
import SubjectModel from "@/model/subject.model";
import { getSubjectResponse } from "@/types/res/GetResponse.types";

export async function POST(request: Request) {
    await dbConn();
    const requestBody = await request.json();
    if (requestBody.date) { requestBody.date = new Date(requestBody.date) }
    if (!requestBody) return NextResponse.json({ err: "" }, { status: 400 })
    // * Validate payload
    const validationResult = questionStreakPostSchema.safeParse(requestBody);
    if (!validationResult.success) {
        // ! Return detailed validation errors
        return NextResponse.json(
            { errors: validationResult.error.format(), requestBody },
            { status: 400 },
        );
    }

    // * Direct creation for brevity
    try {
        const newQuestionStreak = await QuestionStreakModel.create(validationResult.data);
        return NextResponse.json<QuestionStreakModelInterface>(newQuestionStreak, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error }, { status: 400 });
    }
}
export async function GET(request: Request) {
    await dbConn();

    const { searchParams } = new URL(request.url);
    const getParamType = searchParams.get('type');
    if (!getParamType) {
        const questionStreakList = await QuestionStreakModel.find({})

        return NextResponse.json(questionStreakList);
    }
    if (getParamType === 'byDate') {
        const questionStreakSortByDate: getQuestionStreakByDateResponse[] = await QuestionStreakModel.aggregate([
            {
                $lookup: {
                    from: "subjects",
                    localField: "subject",
                    foreignField: "_id",
                    as: "subject",
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
                    subject: { $first: "$subject" }
                }
            },
            {
                $group: {
                    _id: "$date",
                    details: {
                        $push: {
                            _id: "$_id",
                            subject: "$subject",
                            questionsDone: "$questionsDone",
                            date: "$date",
                        }
                    }
                }
            },
            {
                $sort: {
                    "_id.name": 1
                }
            }
        ]);
        return NextResponse.json(questionStreakSortByDate);
    }
    if (getParamType === 'bySubject') {
        const questionStreakSortByDate: getQuestionStreakBySubjectResponse[] = await QuestionStreakModel.aggregate([
            {
                $lookup: {
                    from: "subjects",
                    localField: "subject",
                    foreignField: "_id",
                    as: "subject",
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
                    subject: { $first: "$subject" }
                }
            },
            {
                $group: {
                    _id: "$subject",
                    details: {
                        $push: {
                            _id: "$_id",
                            subject: "$subject",
                            questionsDone: "$questionsDone",
                            date: "$date",
                        }
                    }
                }
            }
        ]);
        return NextResponse.json(questionStreakSortByDate);
    }
    if (getParamType === 'today') {
        // 1. Get the current date and time
        const startOfToday = new Date();

        // 2. Set time to the absolute beginning of the day (00:00:00.000)
        startOfToday.setHours(0, 0, 0, 0);

        // 3. Create an upper boundary for the absolute end of the day (23:59:59.999)
        const endOfToday = new Date(startOfToday);
        endOfToday.setHours(23, 59, 59, 999);


        const getParamSubjectId = searchParams.get('subjectId');
        if (!getParamSubjectId) {
            // 4. Query events matching the range: startOfToday <= eventDate <= endOfToday
            const todayEvents: getQuestionStreakTodayResponse[] = await QuestionStreakModel.aggregate([
                {
                    // 1. Filter documents within the date range (Equivalent to .find)
                    $match: {
                        date: {
                            $gte: startOfToday,
                            $lte: endOfToday
                        }
                    }
                },
                {
                    $lookup: {
                        from: "subjects",
                        localField: "subject",
                        foreignField: "_id",
                        as: "subject",
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
                        subject: { $first: "$subject" }
                    }
                },
                {
                    // 2. Sort by eventDate in ascending order (Equivalent to .sort)
                    $sort: {
                        date: 1
                    }
                },
                {
                    $project: {
                        _id: 1,
                        date: 1,
                        subject: 1,
                        questionsDone: 1,
                    }
                }
            ]);
            if (!todayEvents.length) {
                const subjectsList: { _id: string }[] = await SubjectModel.aggregate([
                    { $project: { _id: 1 } },
                ]);

                subjectsList.map(async (subject) => {
                    await QuestionStreakModel.create({
                        date: new Date(),
                        subject: subject._id
                    });
                })

                const updatedTodayEvents: getQuestionStreakTodayResponse[] = await QuestionStreakModel.aggregate([
                    {
                        // 1. Filter documents within the date range (Equivalent to .find)
                        $match: {
                            date: {
                                $gte: startOfToday,
                                $lte: endOfToday
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "subjects",
                            localField: "subject",
                            foreignField: "_id",
                            as: "subject",
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
                            subject: { $first: "$subject" }
                        }
                    },
                    {
                        // 2. Sort by eventDate in ascending order (Equivalent to .sort)
                        $sort: {
                            date: 1
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            date: 1,
                            subject: 1,
                            questionsDone: 1,
                        }
                    }
                ]);

                return NextResponse.json(updatedTodayEvents, { status: 200 });
            }

            return NextResponse.json(todayEvents, { status: 200 });
        }

        const todaySubjectEvents: getQuestionStreakTodayResponse[] = await QuestionStreakModel.aggregate([
            {
                // 1. Filter documents within the date range (Equivalent to .find)
                $match: {
                    date: {
                        $gte: startOfToday,
                        $lte: endOfToday
                    },
                }
            },
            {
                // 1. Filter documents within the date range (Equivalent to .find)
                $match: {
                    subject: new mongoose.Types.ObjectId(getParamSubjectId),
                }
            },
            {
                $lookup: {
                    from: "subjects",
                    localField: "subject",
                    foreignField: "_id",
                    as: "subject",
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
                    subject: { $first: "$subject" }
                }
            },
            {
                // 2. Sort by eventDate in ascending order (Equivalent to .sort)
                $sort: {
                    date: 1
                }
            },
            {
                $project: {
                    _id: 1,
                    date: 1,
                    subject: 1,
                    questionsDone: 1,
                }
            }
        ]);

        try {

            const getSubjectBySubjectID = await SubjectModel.findById(getParamSubjectId)
            if (getSubjectBySubjectID && !todaySubjectEvents.length) {
                const validationResult = questionStreakPostSchema.safeParse({
                    subject: getParamSubjectId,
                    date: new Date()
                });
                if (validationResult.success) {
                    await QuestionStreakModel.create(validationResult.data);
                    const newTodaySubjectEvents: getQuestionStreakTodayResponse[] = await QuestionStreakModel.aggregate([
                        {
                            // 1. Filter documents within the date range (Equivalent to .find)
                            $match: {
                                date: {
                                    $gte: startOfToday,
                                    $lte: endOfToday
                                },
                            }
                        },
                        {
                            // 1. Filter documents within the date range (Equivalent to .find)
                            $match: {
                                subject: new mongoose.Types.ObjectId(getParamSubjectId),
                            }
                        },
                        {
                            $lookup: {
                                from: "subjects",
                                localField: "subject",
                                foreignField: "_id",
                                as: "subject",
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
                                subject: { $first: "$subject" }
                            }
                        },
                        {
                            // 2. Sort by eventDate in ascending order (Equivalent to .sort)
                            $sort: {
                                date: 1
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                date: 1,
                                subject: 1,
                                questionsDone: 1,
                            }
                        }

                    ])
                    return NextResponse.json(newTodaySubjectEvents, { status: 200 });
                }
                else {
                    return NextResponse.json(validationResult)
                }
            }
        } catch (err) {
            return NextResponse.json({ error: err }, { status: 400 })
        }


        return NextResponse.json(todaySubjectEvents, { status: 200 });
    }

    // * CASE 2: Fetch single subject by ID
    const subjectById = await QuestionStreakModel.findById(getParamType);
    if (!subjectById) {
        return NextResponse.json({ message: 'Subject not found' }, { status: 404 });
    }

    return NextResponse.json<QuestionStreakModelInterface>(subjectById);
}
export async function PUT(request: Request) {
    await dbConn();
    const requestBody = await request.json();
    const validationResult = questionStreakPlusOneSchema.safeParse(requestBody);
    if (!validationResult.success) {
        // ! Return detailed validation errors
        return NextResponse.json(
            { errors: validationResult.error.format() },
            { status: 400 },
        );
    }

    const updatedStreak = await QuestionStreakModel.findByIdAndUpdate(
        validationResult.data._id,
        { $inc: { questionsDone: 1 } },
        { new: true, runValidators: true }
    );

    if (!updatedStreak) {
        return NextResponse.json(
            { error: 'Streak record not found' },
            { status: 404 }
        );
    }

    return NextResponse.json(
        updatedStreak,
        { status: 200 }
    );


}