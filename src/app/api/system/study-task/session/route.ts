import dbConn from '@/lib/dbConn';
import StudyTaskModel from '@/model/study-task.model';
import ChapterModel from '@/model/chapters.model';
import TopicModel from '@/model/topics.model';
import { sessionActionSchema } from '@/schema/studyTask.schema';
import { NextResponse } from 'next/server';
import { iApiResponse } from '@/types/backend/apiResponse.types';
import { ApiResponse } from '@/config/backend/ApiResponse.config';
import { ZodSafeParseResult } from 'zod';
import { tSessionActionSchema } from '@/types/schema/system.schema.types';

// *=====================================================================
// * PUT /api/study-task/session
// * One endpoint, three actions — matches the frontend's two controls:
// *   "start" / "end"  -> the working-session timer
// *   "done"           -> the Done button
// *=====================================================================
export async function PUT(request: Request) {
	const payload = await request.json();

	if (!payload) {
		// ! Bad Request: Missing body
		return NextResponse.json<iApiResponse>(
			ApiResponse(false, 'Missing Payload Data'),
			{ status: 400 },
		);
	}

	// * Validate request body using Zod
	const validationResult: ZodSafeParseResult<tSessionActionSchema> =
		sessionActionSchema.safeParse(payload);
	if (!validationResult.success) {
		// ! If validation fails, return detailed error response
		return NextResponse.json<iApiResponse>(
			ApiResponse(false, validationResult.error.message, validationResult),
			{ status: 400 },
		);
	}
	try {
		await dbConn();

		const { studyTaskId, action } = validationResult.data;

		const studyTask = await StudyTaskModel.findById(studyTaskId);
		if (!studyTask) {
			return NextResponse.json<iApiResponse>(
				ApiResponse(false, 'study-task not found'),
				{
					status: 404,
				},
			);
		}
		// ! Once a task is done, its timer/completion state is frozen.
		if (studyTask.done) {
			return NextResponse.json<iApiResponse>(
				ApiResponse(false, 'This study-task is already marked done'),
				{ status: 409 },
			);
		}

		// *-----------------------------------------------------------------
		// * action: "start" — begin a fresh working session.
		// * Nothing is pushed to `workingSessions` yet — only once it ends.
		// *-----------------------------------------------------------------
		if (action === 'start') {
			if (studyTask.activeSessionStartedAt) {
				return NextResponse.json<iApiResponse>(
					ApiResponse(false, 'A session is already running for this task'),
					{ status: 409 },
				);
			}
			studyTask.activeSessionStartedAt = new Date();
			await studyTask.save();
			return NextResponse.json<iApiResponse>(
				ApiResponse(true, 'started the study task session'),
				{ status: 200 },
			);
		}

		// *-----------------------------------------------------------------
		// * action: "end" — close the running session and push ONE complete
		// * entry {start, end, totalTime} to the array. totalTime is always
		// * computed server-side, in milliseconds. // !
		// *-----------------------------------------------------------------
		if (action === 'end') {
			if (!studyTask.activeSessionStartedAt) {
				return NextResponse.json<iApiResponse>(
					ApiResponse(false, 'No active session to end'),
					{ status: 409 },
				);
			}
			const start = studyTask.activeSessionStartedAt;
			const end = new Date();
			studyTask.workingSessions.push({
				start,
				end,
				totalTime: end.getTime() - start.getTime(),
			});
			studyTask.activeSessionStartedAt = null;
			await studyTask.save();
			return NextResponse.json<iApiResponse>(
				ApiResponse(true, 'ended current study session'),
				{ status: 200 },
			);
		}

		// *-----------------------------------------------------------------
		// * action: "done" — frontend Done button.
		// * 1) stamps done:true + completionDate on the study-task
		// * 2) propagates completion to the chapter/topic collection by
		// *    flipping the relevant tag field to true. // ! (use-case 3)
		// *-----------------------------------------------------------------
		if (action === 'done') {
			// ! Auto-close a dangling active session first so no time is silently lost.
			if (studyTask.activeSessionStartedAt) {
				const start = studyTask.activeSessionStartedAt;
				const end = new Date();
				studyTask.workingSessions.push({
					start,
					end,
					totalTime: end.getTime() - start.getTime(),
				});
				studyTask.activeSessionStartedAt = null;
			}

			studyTask.done = true;
			studyTask.completionDate = new Date();
			await studyTask.save();

			const { enum: refType, _id: refId, tag } = studyTask.studyTask;
			if (refType === 'chapter') {
				await ChapterModel.findByIdAndUpdate(refId, { [tag]: true });
			} else {
				if (tag === 'inTextQuestions' || tag === 'inClassQuestions') {
					await TopicModel.findByIdAndUpdate(refId, {
						[tag]: true,
					});
					await TopicModel.findByIdAndUpdate(refId, {
						done: true,
					});
					return NextResponse.json<iApiResponse>(
						ApiResponse(true, 'completed the study task.'),
						{ status: 200 },
					);
				}
				await TopicModel.findByIdAndUpdate(refId, { [tag]: true });
			}

			return NextResponse.json<iApiResponse>(
				ApiResponse(true, 'completed the study task.'),
				{ status: 200 },
			);
		}

		return NextResponse.json<iApiResponse>(
			ApiResponse(false, 'Unknown action'),
			{
				status: 400,
			},
		);
	} catch (error) {
		console.log(error);
		return NextResponse.json<iApiResponse>(
			ApiResponse(false, (error as Error).message, error),
			{ status: 500 },
		);
	}
}
