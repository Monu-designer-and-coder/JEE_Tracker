/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import SubjectModel from '@/model/subject.model';
import dbConn from '@/lib/dbConn';
import { CreateSubjectSchema, UpdateSubjectSchema } from '@/schema/subject.schema';
import { GetSubjectResponse } from '@/types/res/GetResponse.types';
import { ApiResponse } from '@/config/backend/ApiResponse.config';
import { iApiResponse } from '@/types/backend/apiResponse.types';
import { ZodSafeParseResult } from 'zod';
import { subjectSubjectType } from '@/types/schema/subject.schema.types';
import { iSubjectResponse } from '@/types/res/subject.res.types';

/**
 * * Create a new subject
 * @route POST /api/subjects
 */
export async function POST(request: Request) {
	try {
		const payload = await request.json();

		if (!payload) {
			// ! Bad Request: Missing body
			return NextResponse.json<iApiResponse>(ApiResponse(false, "Missing Payload Data"), { status: 400 });
		}

		// * Validate payload
		const validationResult: ZodSafeParseResult<subjectSubjectType> = CreateSubjectSchema.safeParse(payload);
		if (!validationResult.success) {
			// ! Return detailed validation errors
			return NextResponse.json<iApiResponse>(
				ApiResponse(false, validationResult.error.message, validationResult),
				{ status: 400 }
			);
		}

		await dbConn();

		const newSubject = await SubjectModel.create(validationResult.data);
		return NextResponse.json<iApiResponse<iSubjectResponse>>(ApiResponse(true, `Successfully Created the document of ${validationResult.data.name}`, {
			_id: newSubject._id,
			name: newSubject.name,
		}), { status: 201 });
	} catch (error: any) {
		// ! Handle potential duplicate key errors (MongoDB code 11000)
		if (error.code === 11000) {
			return NextResponse.json<iApiResponse>(ApiResponse(false, "subject with the name already exist.", error), { status: 409 });
		}
		return NextResponse.json(ApiResponse<iApiResponse>(false, error.message || 'Internal Server Error', error), { status: 500 });
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