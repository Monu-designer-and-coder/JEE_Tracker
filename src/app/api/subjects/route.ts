// src/app/api/subjects/route.ts

import { NextResponse } from 'next/server';
import SubjectModel, { SubjectModelInterface } from '@/model/subject.model';
import dbConn from '@/lib/dbConn';
import { subjectValidationSchema } from '@/schema/subject.schema';
import { getSubjectResponse } from '@/types/res/GetResponse.types';

/**
 * ! Create a new subject
 * @route POST /api/subjects
 * @desc Validates request body using Zod, inserts new subject into DB
 */
export async function POST(request: Request) {
	await dbConn();
	const requestBody = await request.json();
	if (!requestBody) return NextResponse.json({ err: "" }, { status: 400 })
	// * Validate payload
	const validationResult = subjectValidationSchema.safeParse(requestBody);
	if (!validationResult.success) {
		// ! Return detailed validation errors
		return NextResponse.json(
			{ errors: validationResult.error.format() },
			{ status: 400 },
		);
	}

	// * Direct creation for brevity
	try {
		const newSubject = await SubjectModel.create(validationResult.data);
		return NextResponse.json<SubjectModelInterface>(newSubject, { status: 201 });
	} catch (error) {
		return NextResponse.json({error}, { status: 400 });
	}
}
/**
 * ! Retrieve subject(s)
 * @route GET /api/subjects
 * @query id?: string
 * @desc Fetches all subjects sorted by standard, or a single subject by ID
 */
export async function GET(request: Request) {
	await dbConn();

	const { searchParams } = new URL(request.url);
	const subjectId = searchParams.get('id');

	// * CASE 1: Fetch all subjects (sorted)
	if (!subjectId) {
		const subjectsList: getSubjectResponse[] = await SubjectModel.aggregate([
			{ $sort: { name: 1 } },
			{ $project: { _id: 1, name: 1} },
		]);

		return NextResponse.json(subjectsList);
	}

	// * CASE 2: Fetch single subject by ID
	const subjectById = await SubjectModel.findById(subjectId);
	if (!subjectById) {
		return NextResponse.json({ message: 'Subject not found' }, { status: 404 });
	}

	return NextResponse.json<SubjectModelInterface>(subjectById);
}

/**
 * ! Update a subject
 * @route PUT /api/subjects
 * @desc Updates a subject by ID with provided data
 */
export async function PUT(request: Request) {
	await dbConn();

	const { id, data: updatedData } = await request.json();

	const updatedSubject = await SubjectModel.findByIdAndUpdate(id, updatedData, {
		new: true,
	});

	if (!updatedSubject) {
		return NextResponse.json({ message: 'Subject not found' }, { status: 404 });
	}

	return NextResponse.json<SubjectModelInterface>(updatedSubject);
}

/**
 * ! Delete a subject
 * @route DELETE /api/subjects
 * @query id: string
 * @desc Deletes a subject by ID
 */
export async function DELETE(request: Request) {
	await dbConn();

	const { searchParams } = new URL(request.url);
	const subjectId = searchParams.get('id');

	const deletedSubject = await SubjectModel.findByIdAndDelete(subjectId);

	if (!deletedSubject) {
		return NextResponse.json({ message: 'Subject not found' }, { status: 404 });
	}

	return NextResponse.json({ message: 'Subject deleted successfully' });
}

/*  
 ! FUTURE IMPROVEMENTS:
  TODO: Add caching for frequently fetched subject lists.
  TODO: Implement role‑based access control for CRUD operations.
  TODO: Add pagination support for large subject lists.
  TODO: Extract aggregation pipelines to a service layer for maintainability.
*/