import dbConn from "@/lib/dbConn";
import StudyTaskModel from "@/model/study-task.model";
import ChapterModel from "@/model/chapters.model";
import TopicModel from "@/model/topics.model";
import { sessionActionSchema } from '@/schema/studyTask.schema';
import { NextResponse } from "next/server";

// *=====================================================================
// * PUT /api/study-task/session
// * One endpoint, three actions — matches the frontend's two controls:
// *   "start" / "end"  -> the working-session timer
// *   "done"           -> the Done button
// *=====================================================================
export async function PUT(request: Request) {
	await dbConn();
	try {
		const clientBodyData = await request.json();
		const validationResult = sessionActionSchema.safeParse(clientBodyData);
		if (!validationResult.success) {
			return NextResponse.json({ errors: validationResult.error.format() }, { status: 400 });
		}
		const { studyTaskId, action } = validationResult.data;

		const studyTask = await StudyTaskModel.findById(studyTaskId);
		if (!studyTask) {
			return NextResponse.json({ error: "study-task not found" }, { status: 404 });
		}
		// ! Once a task is done, its timer/completion state is frozen.
		if (studyTask.done) {
			return NextResponse.json({ error: "This study-task is already marked done" }, { status: 409 });
		}

		// *-----------------------------------------------------------------
		// * action: "start" — begin a fresh working session.
		// * Nothing is pushed to `workingSessions` yet — only once it ends.
		// *-----------------------------------------------------------------
		if (action === "start") {
			if (studyTask.activeSessionStartedAt) {
				return NextResponse.json({ error: "A session is already running for this task" }, { status: 409 });
			}
			studyTask.activeSessionStartedAt = new Date();
			await studyTask.save();
			return NextResponse.json(studyTask, { status: 200 });
		}

		// *-----------------------------------------------------------------
		// * action: "end" — close the running session and push ONE complete
		// * entry {start, end, totalTime} to the array. totalTime is always
		// * computed server-side, in milliseconds. // !
		// *-----------------------------------------------------------------
		if (action === "end") {
			if (!studyTask.activeSessionStartedAt) {
				return NextResponse.json({ error: "No active session to end" }, { status: 409 });
			}
			const start = studyTask.activeSessionStartedAt;
			const end = new Date();
			studyTask.workingSessions.push({ start, end, totalTime: end.getTime() - start.getTime() });
			studyTask.activeSessionStartedAt = null;
			await studyTask.save();
			return NextResponse.json(studyTask, { status: 200 });
		}

		// *-----------------------------------------------------------------
		// * action: "done" — frontend Done button.
		// * 1) stamps done:true + completionDate on the study-task
		// * 2) propagates completion to the chapter/topic collection by
		// *    flipping the relevant tag field to true. // ! (use-case 3)
		// *-----------------------------------------------------------------
		if (action === "done") {
			// ! Auto-close a dangling active session first so no time is silently lost.
			if (studyTask.activeSessionStartedAt) {
				const start = studyTask.activeSessionStartedAt;
				const end = new Date();
				studyTask.workingSessions.push({ start, end, totalTime: end.getTime() - start.getTime() });
				studyTask.activeSessionStartedAt = null;
			}

			studyTask.done = true;
			studyTask.completionDate = new Date();
			await studyTask.save();

			const { enum: refType, _id: refId, tag } = studyTask.studyTask;
			if (refType === "chapter") {
				await ChapterModel.findByIdAndUpdate(refId, { [tag]: true });
			} else {
				await TopicModel.findByIdAndUpdate(refId, { [tag]: true });
			}

			return NextResponse.json(studyTask, { status: 200 });
		}

		return NextResponse.json({ error: "Unknown action" }, { status: 400 });
	} catch (error) {
		console.log(error);
		return NextResponse.json({ msg: "error", error: (error as Error).message }, { status: 500 });
	}
}