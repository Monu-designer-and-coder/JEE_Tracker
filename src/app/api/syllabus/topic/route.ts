
import { NextResponse } from 'next/server';
import dbConn from '@/lib/dbConn';
import { TopicValidationPUTSchema, TopicBackendValidationSchema } from '@/schema/topic.schema';
import TopicModel, { TopicModelInterface } from '@/model/topics.model';
import ChapterModel from '@/model/chapters.model';
import { getOrganizedTopicResponse } from '@/types/res/topicsOrganized.types';

/**
 * ! Create a new topic
 * @route POST /api/topics
 * @desc Validates request body with Zod, inserts new topic into DB
 */
export async function POST(request: Request) {
    await dbConn();

    const requestBody = await request.json();

    // * Validate using Zod
    const validationResult = TopicBackendValidationSchema.safeParse(requestBody);
    if (!validationResult.success) {
        // ! Return formatted validation errors
        return NextResponse.json(
            { errors: validationResult.error.format() },
            { status: 400 },
        );
    }

    // * Direct creation for brevity
    const newTopic = await TopicModel.create(requestBody);

    return NextResponse.json<TopicModelInterface>(newTopic, { status: 201 });
}



/**
 * ! Retrieve topic(s)
 * @route GET /api/topics
 * @query id?: string
 * @desc Fetches all topics, or a specific topic by ID
 */
export async function GET(request: Request) {
    await dbConn();

    const { searchParams } = new URL(request.url);
    const topicId: string = searchParams.get('id') || "";

    // * CASE 1: Get all topics
    if (!topicId) {
        const topicsList: getOrganizedTopicResponse[] = await ChapterModel.aggregate([
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
            { $sort: { subject: 1, seqNumber: 1 } },
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
                        { $sort: { chapter: 1, seqNumber: 1 } }
                    ]
                }
            },
            {
                $group: {
                    _id: "$subject",
                    name: { $first: "$subjectDetails.name" },
                    chapterList: {
                        $push: {
                            _id: "$_id",
                            seqNumber: "$seqNumber",
                            name: "$name",
                            // done: "$done",
                            // theory: "$theory",
                            // shortNotes: "$shortNotes",
                            // mindMap: "$mindMap",
                            // DPP1: "$DPP1",
                            // DPP2: "$DPP2",
                            // Module: "$Module",
                            // PYQ_Mains: "$PYQ_Mains",
                            // PYQ_Advanced: "$PYQ_Advanced",
                            // Book: "$Book",
                            // subjectDetails: "$subjectDetails",
                            topicsList: "$topicsList"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    chapterList: 1
                }
            }
        ])
        return NextResponse.json(topicsList);
    }

    // * CASE 2: Get topic by ID
    const topicById = await TopicModel.findById(topicId);
    if (!topicById) {
        return NextResponse.json({ message: 'Topic not found' }, { status: 404 });
    }

    return NextResponse.json<TopicModelInterface>(topicById);
}





/**
 * ! Update a topic
 * @route PUT /api/topics
 * @desc Updates a topic by ID with provided data
 */
export async function PUT(request: Request) {
    await dbConn();

    const requestBody = await request.json();

    // * Validate using Zod
    const validationResult = TopicValidationPUTSchema.safeParse(requestBody);
    if (!validationResult.success) {
        // ! Return formatted validation errors
        return NextResponse.json(
            { errors: validationResult.error.format() },
            { status: 400 },
        );
    }

    const updatedTopic = await TopicModel.findByIdAndUpdate(validationResult.data._id, validationResult.data.data, {
        new: true,
    });

    if (!updatedTopic) {
        return NextResponse.json({ message: 'Topic not found' }, { status: 404 });
    }

    return NextResponse.json<TopicModelInterface>(updatedTopic);
}

/**
 * ! Delete a topic
 * @route DELETE /api/topics
 * @query id: string
 * @desc Deletes a topic by ID
 */
export async function DELETE(request: Request) {
    await dbConn();

    const { searchParams } = new URL(request.url);
    const topicId = searchParams.get('id');

    const deletedTopic = await TopicModel.findByIdAndDelete(topicId);

    if (!deletedTopic) {
        return NextResponse.json({ message: 'Topic not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Topic deleted successfully' });
}

/*  
 ! IMPROVEMENTS IMPLEMENTED:
 * 1. Unified naming conventions (body → requestBody, id → topicId) for clarity.
 * 2. Consistent route handler structure to match chapters & subjects APIs.
 * 3. Applied Better Comments and JSDoc for quick context and maintainability.
 * 4. Used .create() for concise POST operation.
 * 5. Sorted topics by seqNumber in GET for predictable ordering.
 * 6. Standardized error messages & status codes.

 ! PERFORMANCE OPTIMIZATIONS MAINTAINED:
 * 1. Queries kept lean by not fetching unnecessary fields unless required.
 * 2. Sorting done at DB level ($sort or .sort()) for efficiency.
 * 3. Index-friendly lookups (findById, findByIdAndUpdate, findByIdAndDelete).
 * 4. No redundant DB operations.

 ! FUTURE IMPROVEMENTS:
 TODO: Add chapter population in GET to return related chapter details.
 TODO: Implement pagination for large topic lists.
 TODO: Enforce authentication & role-based access control.
 TODO: Move DB operations to a service layer for easier testing and scaling.
*/