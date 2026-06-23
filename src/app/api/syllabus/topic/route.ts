
import { NextResponse } from 'next/server';
import dbConn from '@/lib/dbConn';
import { TopicBackendValidationSchema, TopicValidationPUTSchemaBackend } from '@/schema/topic.schema';
import TopicModel, { TopicModelInterface } from '@/model/topics.model';
import ChapterModel from '@/model/chapters.model';
import { getOrganizedChapterResponse, getOrganizedTopicResponse } from '@/types/res/topicsOrganized.types';
import { Types } from 'mongoose';

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
    const paramsReqID: string = searchParams.get('id') || "";
    const type: string = searchParams.get('type') || "";


    // * CASE 1: Get all topics
    if (!paramsReqID) {
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

    if (type === 'byChapter') {
        const topicsListByChapter: getOrganizedChapterResponse[] = await ChapterModel.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(paramsReqID)
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
                        { $sort: { chapter: 1, seqNumber: 1 } }
                    ]
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    seqNumber: 1,
                    topicsList: 1
                }
            }
        ])
        console.log({ type, paramsReqID })

        return NextResponse.json<getOrganizedChapterResponse>(topicsListByChapter[0]);
    }

    // * CASE 2: Get topic by ID
    const topicById = await TopicModel.findById(paramsReqID);
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
    try {
        // * Establish (or reuse the cached) DB connection before touching any model
        await dbConn();

        // ! `request.json()` throws on a malformed/empty body. Previously this call
        // ! sat OUTSIDE the try block, so a bad request body would have surfaced as
        // ! an uncaught 500 instead of a clean, expected 400 response.
        const requestBody = await request.json();

        // * Validate & coerce the incoming payload with Zod before any DB work
        const validationResult = TopicValidationPUTSchemaBackend.safeParse(requestBody);

        if (!validationResult.success) {
            // ! Return formatted validation errors
            return NextResponse.json(
                { errors: validationResult.error.format() },
                { status: 400 },
            );
        }

        // * Destructured with descriptive names instead of generic `_id` / `data`
        const { _id: topicId, data: fieldsToUpdate } = validationResult.data;

        // * `findOneAndUpdate` (instead of `updateOne`) does the lookup, update, and
        // * existence-check in a single round-trip, AND gives back the real document.
        const updatedTopic = await TopicModel.findOneAndUpdate(
            { _id: topicId },
            { $set: fieldsToUpdate },
            {
                new: true, // * Resolve with the document AFTER the update is applied
                runValidators: true, // * Re-run schema-level field validators on the changed paths
                lean: true, // * Skip Mongoose document hydration — we only need a plain object to serialize
            },
        );

        // ! BUGFIX: the previous version checked `!updatedTopic` against the result
        // ! of `updateOne()`, which always resolves to a write-result object such as
        // ! `{ acknowledged, matchedCount, modifiedCount }` — an object literal is
        // ! always truthy, so "Topic not found" could never actually fire, even for
        // ! a completely bogus `_id`. `findOneAndUpdate` resolves to `null` when no
        // ! document matches, so this check now behaves as originally intended.
        if (!updatedTopic) {
            return NextResponse.json({ message: 'Topic not found' }, { status: 404 });
        }

        return NextResponse.json(
            { message: 'Topic updated successfully', topic: updatedTopic },
            { status: 200 },
        );
    }
    catch (error) {
        // ? Distinguish error shapes so the client gets an accurate status code
        // ? instead of everything collapsing into the same generic response.

        // * MongoDB duplicate-key conflict — e.g. the unique { subject, seqNumber }
        // * index rejecting a sequence number that already exists for that subject.
        if (error instanceof Error && 'code' in error && (error as { code: number }).code === 11000) {
            return NextResponse.json(
                { message: 'A topic with this sequence number already exists for this subject.' },
                { status: 409 },
            );
        }

        // * Validation / business-rule errors thrown by our Mongoose hooks
        // * (e.g. the "done" requires theory + 4 resources rule) or by schema validators
        if (error instanceof Error) {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }

        // ! Fallback for genuinely unexpected, non-Error throwables — don't mask
        // ! infrastructure failures (DB down, etc.) as a client-side 400.
        return NextResponse.json({ message: 'An unexpected error occurred while updating the topic.' }, { status: 500 });
    }
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