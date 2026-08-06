/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConn from '@/lib/dbConn';
import SubjectStreakModel from '@/model/questionStreak.model';
import SubjectModel from '@/model/subject.model';
import { SubjectStreakUpdateSchema, SubjectStreakPostSchema } from '@/schema/subjectStreak.schema';

export async function POST(request: Request) {
    try {
        await dbConn();
        const bodyPayload = await request.json();

        if (!bodyPayload) {
            return NextResponse.json({ error: 'Payload body context parameter array unidentifiable' }, { status: 400 });
        }

        if (bodyPayload.date) {
            bodyPayload.date = new Date(bodyPayload.date);
        }

        const validationResult = SubjectStreakPostSchema.safeParse(bodyPayload);
        if (!validationResult.success) {
            return NextResponse.json(
                { errors: validationResult.error.format() },
                { status: 400 }
            );
        }

        const createdStreakRecord = await SubjectStreakModel.create(validationResult.data);
        return NextResponse.json(createdStreakRecord, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error processing records' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        await dbConn();

        const { searchParams } = new URL(request.url);
        const queryParamType = searchParams.get('type');

        // * Universal extraction logic supporting functional pagination fallbacks
        const paginationPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const paginationLimit = Math.max(1, parseInt(searchParams.get('limit') || '50', 10));
        const queryOffset = (paginationPage - 1) * paginationLimit;

        if (!queryParamType) {
            const analyticalCount = await SubjectStreakModel.countDocuments({});
            const itemsList = await SubjectStreakModel.find({})
                .skip(queryOffset)
                .limit(paginationLimit)
                .lean();

            return NextResponse.json({
                data: itemsList,
                pagination: {
                    page: paginationPage,
                    limit: paginationLimit,
                    totalItems: analyticalCount,
                    hasMore: queryOffset + itemsList.length < analyticalCount
                }
            });
        }

        if (queryParamType === 'byDate') {
            const rawAggregatedPayload = await SubjectStreakModel.aggregate([
                {
                    $lookup: {
                        from: 'subjects',
                        localField: 'subject',
                        foreignField: '_id',
                        as: 'subjectInfo',
                        pipeline: [{ $project: { _id: 1, name: 1 } }]
                    }
                },
                { $addFields: { subject: { $first: '$subjectInfo' } } },
                {
                    $group: {
                        _id: '$date',
                        details: {
                            $push: {
                                _id: '$_id',
                                subject: '$subject',
                                questionsDone: '$questionsDone',
                                timeStudied: '$timeStudied',
                                date: '$date'
                            }
                        }
                    }
                },
                { $sort: { _id: -1 } }, // * Performance Optimization: chronological clustering
                {
                    $facet: {
                        paginatedResults: [{ $skip: queryOffset }, { $limit: paginationLimit }],
                        totalCount: [{ $count: 'count' }]
                    }
                }
            ]);

            const dynamicResults = rawAggregatedPayload[0]?.paginatedResults || [];
            const absoluteCountTotal = rawAggregatedPayload[0]?.totalCount[0]?.count || 0;

            return NextResponse.json({
                data: dynamicResults,
                pagination: {
                    page: paginationPage,
                    limit: paginationLimit,
                    totalItems: absoluteCountTotal,
                    hasMore: queryOffset + dynamicResults.length < absoluteCountTotal
                }
            });
        }

        if (queryParamType === 'bySubject') {
            const rawAggregatedPayload = await SubjectStreakModel.aggregate([
                {
                    $lookup: {
                        from: 'subjects',
                        localField: 'subject',
                        foreignField: '_id',
                        as: 'subjectInfo',
                        pipeline: [{ $project: { _id: 1, name: 1 } }]
                    }
                },
                { $addFields: { subject: { $first: '$subjectInfo' } } },
                {
                    $group: {
                        _id: '$subject',
                        details: {
                            $push: {
                                _id: '$_id',
                                subject: '$subject',
                                questionsDone: '$questionsDone',
                                timeStudied: '$timeStudied',
                                date: '$date'
                            }
                        }
                    }
                },
                {
                    $facet: {
                        paginatedResults: [{ $skip: queryOffset }, { $limit: paginationLimit }],
                        totalCount: [{ $count: 'count' }]
                    }
                }
            ]);

            const dynamicResults = rawAggregatedPayload[0]?.paginatedResults || [];
            const absoluteCountTotal = rawAggregatedPayload[0]?.totalCount[0]?.count || 0;

            return NextResponse.json({
                data: dynamicResults,
                pagination: {
                    page: paginationPage,
                    limit: paginationLimit,
                    totalItems: absoluteCountTotal,
                    hasMore: queryOffset + dynamicResults.length < absoluteCountTotal
                }
            });
        }

        if (queryParamType === 'today') {
            const absoluteStartTimeToday = new Date();
            absoluteStartTimeToday.setHours(0, 0, 0, 0);

            const absoluteEndTimeToday = new Date(absoluteStartTimeToday);
            absoluteEndTimeToday.setHours(23, 59, 59, 999);

            const queryParamSubjectId = searchParams.get('subjectId');

            if (!queryParamSubjectId) {
                // * Optimize database scans using inline matches utilizing indexed date targets
                let todayTrackedActivities = await SubjectStreakModel.find({
                    date: { $gte: absoluteStartTimeToday, $lte: absoluteEndTimeToday }
                })
                    .populate({ path: 'subject', select: '_id name' })
                    .sort({ date: 1 })
                    .lean();

                // * Safe programmatic fallbacks if database initialization routine checks trigger false
                if (!todayTrackedActivities.length) {
                    const defaultSystemSubjects = await SubjectModel.find({}).select('_id').lean();

                    if (defaultSystemSubjects.length > 0) {
                        const commonDate = new Date();
                        const operationsPayload = defaultSystemSubjects.map((subjectItem) => ({
                            date: commonDate,
                            subject: subjectItem._id,
                            questionsDone: 0,
                            timeStudied: 0,
                        }));

                        await SubjectStreakModel.insertMany(operationsPayload);

                        todayTrackedActivities = await SubjectStreakModel.find({
                            date: { $gte: absoluteStartTimeToday, $lte: absoluteEndTimeToday }
                        })
                            .populate({ path: 'subject', select: '_id name' })
                            .sort({ date: 1 })
                            .lean();
                    }
                }

                // * Paginate programmatically or pass through the dataset array safely
                const targetSliceList = todayTrackedActivities.slice(queryOffset, queryOffset + paginationLimit);

                return NextResponse.json({
                    data: targetSliceList,
                    pagination: {
                        page: paginationPage,
                        limit: paginationLimit,
                        totalItems: todayTrackedActivities.length,
                        hasMore: queryOffset + targetSliceList.length < todayTrackedActivities.length
                    }
                });
            }

            const subjectFilteredEvents = await SubjectStreakModel.find({
                date: { $gte: absoluteStartTimeToday, $lte: absoluteEndTimeToday },
                subject: new mongoose.Types.ObjectId(queryParamSubjectId)
            })
                .populate({ path: 'subject', select: '_id name' })
                .sort({ date: 1 })
                .lean();

            if (!subjectFilteredEvents.length) {
                const structuralVerificationTarget = await SubjectModel.findById(queryParamSubjectId).lean();
                if (structuralVerificationTarget) {
                    const singleCreatedInstance = await SubjectStreakModel.create({
                        subject: queryParamSubjectId,
                        date: new Date(),
                        questionsDone: 0,
                        timeStudied: 0
                    });

                    const postCreationQuery = await SubjectStreakModel.findById(singleCreatedInstance._id)
                        .populate({ path: 'subject', select: '_id name' })
                        .lean();

                    return NextResponse.json({
                        data: postCreationQuery ? [postCreationQuery] : [],
                        pagination: { page: 1, limit: paginationLimit, totalItems: 1, hasMore: false }
                    });
                }
            }

            return NextResponse.json({
                data: subjectFilteredEvents,
                pagination: { page: 1, limit: paginationLimit, totalItems: subjectFilteredEvents.length, hasMore: false }
            });
        }

        const singularTargetRecord = await SubjectStreakModel.findById(queryParamType).populate('subject').lean();
        if (!singularTargetRecord) {
            return NextResponse.json({ message: 'Requested reference element not located within DB context maps' }, { status: 404 });
        }

        return NextResponse.json({ data: [singularTargetRecord] });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal pipeline processing fault' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await dbConn();
        const clientBodyData = await request.json();

        const validationResult = SubjectStreakUpdateSchema.safeParse(clientBodyData);
        if (!validationResult.success) {
            return NextResponse.json(
                { errors: validationResult.error.format() },
                { status: 400 }
            );
        }

        if (validationResult.data.type === "plusOneQuestion") {
            const updatedStreakRecord = await SubjectStreakModel.findByIdAndUpdate(
                validationResult.data._id,
                { $inc: { questionsDone: 1 } },
                { new: true, runValidators: true }
            ).lean();

            if (!updatedStreakRecord) {
                return NextResponse.json({ error: 'Target tracking database primary identity pointer not found' }, { status: 404 });
            }

            return NextResponse.json(updatedStreakRecord, { status: 200 });
        }
        else {
            if (!validationResult.data.timeStudied) {
                return NextResponse.json({ error: 'timeStudied field cannot be empty' }, { status: 400 });
            }
            const updatedStreakRecord = await SubjectStreakModel.findByIdAndUpdate(
                validationResult.data._id,
                { $inc: { timeStudied: validationResult.data.timeStudied } },
                { new: true, runValidators: true }
            ).lean();

            if (!updatedStreakRecord) {
                return NextResponse.json({ error: 'Target tracking database primary identity pointer not found' }, { status: 404 });
            }

            return NextResponse.json(updatedStreakRecord, { status: 200 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Execution exception intercept' }, { status: 500 });
    }
}

// ! IMPROVEMENTS IMPLEMENTED:
// * 1. Implemented data response structure modifications wrapping lists inside a standardized data array along with a pagination envelope.
// * 2. Rewrote broad .aggregate expressions inside 'today' endpoint processing to leverage native, high-performance .find().populate() patterns.
// * 3. Standardized all internal variable identifier layouts (e.g. getParamType -> queryParamType).
// * 4. Extracted multi-level array processing maps into high-speed structural batch processors utilizing .insertMany().
// * 5. Added systematic route containment blocks wrapping calculations within clean try/catch runtime wrappers.

// ! PERFORMANCE OPTIMIZATIONS MAINTAINED:
// * 1. Global implementation of high-throughput serialization query methods via strategic allocation of .lean().
// * 2. Swapped out aggregate lookups in structural check pipelines for lean, selective indexing fetches.

// ! FUTURE IMPROVEMENTS:
// TODO: Replace memory-allocated slicing structures (.slice()) inside base lookups with dynamic native pipeline controls like $facet or standard mongo options cursors.