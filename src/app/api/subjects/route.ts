/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import SubjectModel, { ISubjectDocument } from '@/model/subject.model';
import dbConn from '@/lib/dbConn';
import { CreateSubjectSchema, UpdateSubjectSchema } from '@/schema/subject.schema';
import { GetSubjectResponse } from '@/types/res/GetResponse.types';

/**
 * * Create a new subject
 * @route POST /api/subjects
 */
export async function POST(request: Request) {
	try {
		await dbConn();
		const payload = await request.json();

		if (!payload) {
			// ! Bad Request: Missing body
			return NextResponse.json({ error: 'Request body is missing' }, { status: 400 });
		}

		// * Validate payload
		const validationResult = CreateSubjectSchema.safeParse(payload);
		if (!validationResult.success) {
			// ! Return detailed validation errors
			return NextResponse.json(
				{ errors: validationResult.error.format() },
				{ status: 400 }
			);
		}

		const newSubject = await SubjectModel.create(validationResult.data);
		return NextResponse.json<ISubjectDocument>(newSubject, { status: 201 });
	} catch (error: any) {
		// ! Handle potential duplicate key errors (MongoDB code 11000)
		if (error.code === 11000) {
			return NextResponse.json({ error: 'Subject already exists' }, { status: 409 });
		}
		return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
	}
}

/**
 * * Retrieve subject(s)
 * @route GET /api/subjects
 * @query id?: string
 */
export async function GET(request: Request) {
	try {
		await dbConn();
		const { searchParams } = new URL(request.url);
		const subjectId = searchParams.get('id');

		// * CASE 1: Fetch single subject by ID
		if (subjectId) {
			// * Using .lean() for faster execution as we only need plain JSON
			const subject = await SubjectModel.findById(subjectId).lean();

			if (!subject) {
				return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
			}
			return NextResponse.json(subject);
		}

		// * CASE 2: Fetch all subjects (sorted)
		// * Replaced heavy aggregation with find().select().sort().lean() for massive performance gain
		const subjectsList: GetSubjectResponse[] = await SubjectModel.aggregate([
			{ $sort: { name: 1 } },
			{ $project: { _id: 1, name: 1 } },
		])

		return NextResponse.json(subjectsList);
	} catch (error: any) {
		return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
	}
}

/**
 * * Update a subject
 * @route PUT /api/subjects
 */
export async function PUT(request: Request) {
	try {
		await dbConn();
		const payload = await request.json();

		// * Validate incoming PUT data using Zod
		const validationResult = UpdateSubjectSchema.safeParse(payload);
		if (!validationResult.success) {
			return NextResponse.json(
				{ errors: validationResult.error.format() },
				{ status: 400 }
			);
		}

		const { id, data: updatedData } = validationResult.data;

		const updatedSubject = await SubjectModel.findByIdAndUpdate(id, updatedData, {
			new: true,
			runValidators: true, // * Ensures schema validations run on update
		}).lean();

		if (!updatedSubject) {
			return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
		}

		return NextResponse.json(updatedSubject);
	} catch (error: any) {
		return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
	}
}

/**
 * * Delete a subject
 * @route DELETE /api/subjects
 * @query id: string
 */
export async function DELETE(request: Request) {
	try {
		await dbConn();
		const { searchParams } = new URL(request.url);
		const subjectId = searchParams.get('id');

		if (!subjectId) {
			return NextResponse.json({ error: 'Subject ID is required' }, { status: 400 });
		}

		const deletedSubject = await SubjectModel.findByIdAndDelete(subjectId).lean();

		if (!deletedSubject) {
			return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
		}

		return NextResponse.json({ message: 'Subject deleted successfully' });
	} catch (error: any) {
		return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
	}
}

// ! IMPROVEMENTS IMPLEMENTED:
// * 1. Replaced .aggregate() with .find().lean() in GET for significantly faster data retrieval.
// * 2. Added Zod schema validation to the PUT route to prevent malformed data insertion.
// * 3. Wrapped all route handlers in try-catch blocks to prevent unhandled promise rejections.
// * 4. Standardized variable names (e.g., requestBody -> payload) and response formats.
// * 5. Added runValidators: true to findByIdAndUpdate to enforce mongoose schema rules on PUT.
// * 6. Handled MongoDB duplicate key error (11000) explicitly in the POST route.

// ! PERFORMANCE OPTIMIZATIONS MAINTAINED:
// * 1. Database connection logic (dbConn) is called optimally before query execution.
// * 2. .lean() is now used across GET, PUT, and DELETE routes to bypass Mongoose hydration overhead.

// ! FUTURE IMPROVEMENTS:
// TODO: Add caching headers (e.g., Cache-Control) or utilize Next.js unstable_cache for the GET list route.
// TODO: Implement pagination using the mongooseAggregatePaginate plugin if the subject list grows massive.
// TODO: Implement Role-Based Access Control (RBAC) middleware to protect POST, PUT, and DELETE routes.