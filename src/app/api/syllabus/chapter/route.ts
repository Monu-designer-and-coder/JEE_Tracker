import dbConn from '@/lib/dbConn';
import ChapterModel, { ChapterModelInterface } from '@/model/chapters.model';
import SubjectModel from '@/model/subject.model';
import {
    chapterValidationPUTSchemaBackend,
    chapterValidationSchemaBackend,
} from '@/schema/chapter.schema';
import {
    getChapterResponse,
    getSubjectWiseChapterResponse,
} from '@/types/res/chapterResponse.types';
import { syllabusDetailedDataChapter } from '@/types/res/syllabusDataResponse.types';
import { Types } from 'mongoose';
import { NextResponse } from 'next/server';

/**
 * ! Create a new chapter
 * @route POST /api/chapters
 * @desc Validates input using Zod, inserts new chapter into DB
 */

export async function POST(request: Request) {
    await dbConn();

    const requestBody = await request.json();

    // * Validate request body using Zod
    const validationResult =
        chapterValidationSchemaBackend.safeParse(requestBody);
    if (!validationResult.success) {
        // ! If validation fails, return detailed error response
        return NextResponse.json(validationResult.error.message, { status: 400 });
    }

    try {
        // * Insert chapter into MongoDB
        const newChapter = await ChapterModel.create(validationResult.data);
        return NextResponse.json<ChapterModelInterface>(newChapter, {
            status: 201,
        });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'An unexpected error occurred';
        return NextResponse.json(errorMessage, { status: 400 });
    }
}

/**
 * ! Retrieve chapter(s)
 * @route GET /api/chapters
 * @query id?: string, type?: "all" | "subjectWise"
 * @desc Fetches chapters by ID, or aggregated chapter data
 */
export async function GET(request: Request) {
    await dbConn();

    const { searchParams } = new URL(request.url);
    const chapterId: string = searchParams.get('id') || '';
    const fetchType: string = searchParams.get('type') || '';

    // * CASE 1: Fetch all chapters with subject info
    if (!chapterId && fetchType === 'all') {
        const chaptersWithSubject: getChapterResponse[] =
            await ChapterModel.aggregate([
                {
                    $lookup: {
                        from: 'subjects',
                        localField: 'subject',
                        foreignField: '_id',
                        pipeline: [{ $project: { _id: 1, name: 1 } }],
                        as: 'subjectDetails',
                    },
                },
                { $addFields: { subjectDetails: { $first: '$subjectDetails' } } },
                { $sort: { subject: 1, seqNumber: 1 } },
                {
                    $project: {
                        _id: 1,
                        seqNumber: 1,
                        name: 1,
                        subject: '$subjectDetails',
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
                    },
                },
            ]);
        return NextResponse.json(chaptersWithSubject);
    }

    // * CASE 2: Fetch chapters grouped by subject
    if (!chapterId && fetchType === 'subjectWise') {
        const subjectWiseChapters: getSubjectWiseChapterResponse[] =
            await SubjectModel.aggregate([
                {
                    $lookup: {
                        from: 'chapters',
                        localField: '_id',
                        foreignField: 'subject',
                        as: 'chapterList',
                        pipeline: [
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
                                },
                            },
                        ],
                    },
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        chapterList: 1,
                    },
                },
            ]);
        return NextResponse.json(subjectWiseChapters);
    }

    // * CASE 3: Fetch chapter by ID
    if (chapterId) {
        const topicsList: syllabusDetailedDataChapter[] = await ChapterModel.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(chapterId)
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
                    _id: "$_id",
                    seqNumber: "$seqNumber",
                    name: "$name",
                    done: "$done",
                    theory: "$theory",
                    shortNotes: "$shortNotes",
                    mindMap: "$mindMap",
                    DPP1: "$DPP1",
                    DPP2: "$DPP2",
                    Module: "$Module",
                    PYQ_Mains: "$PYQ_Mains",
                    PYQ_Advanced: "$PYQ_Advanced",
                    Book: "$Book",
                    totalTopics: "$totalTopics",
                    subject: "$subjectDetails",
                    topicsList: "$topicsList",
                    currentChapterStatus: "$currentChapterStatus"
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
        ]);

        if (topicsList.length != 1) {
            return NextResponse.json(
                {
                    message: 'Invalid request parameters',
                    data: topicsList
                },
                { status: 400 },
            );

        }
        return NextResponse.json(topicsList[0]);
    }

    // ! Default: Bad request if neither type nor ID provided
    return NextResponse.json(
        { message: 'Invalid request parameters' },
        { status: 400 },
    );
}

// ? Adjust the three import paths above to match your actual project structure —
// ? only the PUT handler body was provided, so these are inferred from the
// ? names used inside the original function.

/**
 * ! Update an existing chapter
 * @route PUT /api/chapters
 * @desc Partially updates a chapter by `_id` with whatever fields are sent in `data`.
 * @body { _id: string, data: Partial<ChapterFields> }
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
        const validationResult = chapterValidationPUTSchemaBackend.safeParse(requestBody);

        if (!validationResult.success) {
            // ! Detailed, field-level error response for the client to act on
            return NextResponse.json(
                { message: 'Validation failed', errors: validationResult.error.format() },
                { status: 400 },
            );
        }

        // * Destructured with descriptive names instead of generic `_id` / `data`
        const { _id: chapterId, data: fieldsToUpdate } = validationResult.data;

        // * `findOneAndUpdate` (instead of `updateOne`) does the lookup, update, and
        // * existence-check in a single round-trip, AND gives back the real document.
        const updatedChapter = await ChapterModel.findOneAndUpdate(
            { _id: chapterId },
            { $set: fieldsToUpdate },
            {
                new: true, // * Resolve with the document AFTER the update is applied
                runValidators: true, // * Re-run schema-level field validators on the changed paths
                lean: true, // * Skip Mongoose document hydration — we only need a plain object to serialize
            },
        );

        // ! BUGFIX: the previous version checked `!updatedChapter` against the result
        // ! of `updateOne()`, which always resolves to a write-result object such as
        // ! `{ acknowledged, matchedCount, modifiedCount }` — an object literal is
        // ! always truthy, so "Chapter not found" could never actually fire, even for
        // ! a completely bogus `_id`. `findOneAndUpdate` resolves to `null` when no
        // ! document matches, so this check now behaves as originally intended.
        if (!updatedChapter) {
            return NextResponse.json({ message: 'Chapter not found' }, { status: 404 });
        }

        return NextResponse.json(
            { message: 'Chapter updated successfully', chapter: updatedChapter },
            { status: 200 },
        );
    } catch (error) {
        // ? Distinguish error shapes so the client gets an accurate status code
        // ? instead of everything collapsing into the same generic response.

        // * MongoDB duplicate-key conflict — e.g. the unique { subject, seqNumber }
        // * index rejecting a sequence number that already exists for that subject.
        if (error instanceof Error && 'code' in error && (error as { code: number }).code === 11000) {
            return NextResponse.json(
                { message: 'A chapter with this sequence number already exists for this subject.' },
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
        return NextResponse.json({ message: 'An unexpected error occurred while updating the chapter.' }, { status: 500 });
    }
}

/**
 * ! Delete a chapter
 * @route DELETE /api/chapters
 * @query id: string
 * @desc Deletes chapter by ID
 */
export async function DELETE(request: Request) {
    await dbConn();

    const { searchParams } = new URL(request.url);
    const chapterId: string = searchParams.get('id') || '';

    const deletedChapter = await ChapterModel.findByIdAndDelete(chapterId);

    if (!deletedChapter) {
        return NextResponse.json({ message: 'Chapter not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Chapter deleted successfully' });
}

// ! IMPROVEMENTS IMPLEMENTED:
//  * 1. Renamed variables for better semantic clarity (e.g., body → requestBody, id → chapterId).
//  * 2. Applied consistent error handling and return formats.
//  * 3. Centralized dbConn call at start of each handler for predictability.
//  * 4. Added clear JSDoc + Better Comments annotations for maintainers.
//  * 5. Reduced redundant condition checks and improved branching.
//  * 6. Used .create() instead of new + save() for brevity in POST.

// ! PERFORMANCE OPTIMIZATIONS MAINTAINED:
//  * 1. Aggregation pipelines use $project early to minimize data payload.
//  * 2. $first used to flatten joined subjectDetails, reducing iteration overhead.
//  * 3. Index-friendly query patterns preserved (findById, findByIdAndUpdate).
//  * 4. MongoDB pipeline stages ordered for optimal execution.

// ! FUTURE IMPROVEMENTS:
//  TODO: Add authentication & role-based access control for all endpoints.
//  TODO: Implement server-side caching for 'all' and 'subjectWise' fetch types.
//  TODO: Add pagination to GET responses to handle large datasets efficiently.
//  TODO: Move aggregation pipelines to service layer for cleaner route handlers.
