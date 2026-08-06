/* eslint-disable @typescript-eslint/no-explicit-any */
import dbConn from '@/lib/dbConn';
import ToDoModel from '@/model/to-do.model';
import {
  todoPostBackedSchema,
  todoSessionActionSchema,
} from '@/schema/to-do.schema';
import { todaysTasksList } from '@/types/res/todoResponse.types';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    await dbConn();
    const bodyPayload = await request.json();

    if (!bodyPayload) {
      return NextResponse.json(
        { error: 'Payload body context parameter array unidentifiable' },
        { status: 400 },
      );
    }

    if (bodyPayload.date) {
      bodyPayload.date = new Date(bodyPayload.date);
    }

    const validationResult = todoPostBackedSchema.safeParse(bodyPayload);
    if (!validationResult.success) {
      return NextResponse.json(
        { errors: validationResult.error.format() },
        { status: 400 },
      );
    }

    const createdStreakRecord = await ToDoModel.create(validationResult.data);
    return NextResponse.json(createdStreakRecord, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error processing records' },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    await dbConn();

    const { searchParams } = new URL(request.url);
    const queryParamType = searchParams.get('type');

    if (!queryParamType) {
      return NextResponse.json(
        {
          Error: 'need to have a searchParam',
        },
        { status: 400 },
      );
    }

    if (queryParamType === 'today') {
      const absoluteStartTimeToday = new Date();
      absoluteStartTimeToday.setHours(0, 0, 0, 0);

      const absoluteEndTimeToday = new Date(absoluteStartTimeToday);
      absoluteEndTimeToday.setHours(23, 59, 59, 999);

      // * Optimize database scans using inline matches utilizing indexed date targets
      const todayTrackedActivities: todaysTasksList[] =
        await ToDoModel.aggregate([
          {
            $match: {
              todoDate: {
                $gte: absoluteStartTimeToday,
                $lte: absoluteEndTimeToday,
              },
            },
          },
          {
            $project: {
              _id: 1,
              category: 1,
              todo: 1,
              worthPoints: 1,
              perceivedDifficulty: 1,
              done: 1,
              activeSessionStartedAt: 1,
              todoDate: 1,
              workingSessions: 1,
            },
          },
        ]);

      return NextResponse.json<todaysTasksList[]>([...todayTrackedActivities]);
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal pipeline processing fault' },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  await dbConn();
  try {
    const clientBodyData = await request.json();
    const validationResult = todoSessionActionSchema.safeParse(clientBodyData);
    if (!validationResult.success) {
      return NextResponse.json(
        { errors: validationResult.error.format() },
        { status: 400 },
      );
    }
    const { todoId, action } = validationResult.data;

    const todo = await ToDoModel.findById(todoId);
    if (!todo) {
      return NextResponse.json(
        { error: 'study-task not found' },
        { status: 404 },
      );
    }

    // *-----------------------------------------------------------------
    // * action: "start" — begin a fresh working session.
    // * Nothing is pushed to `workingSessions` yet — only once it ends.
    // *-----------------------------------------------------------------
    if (action === 'start') {
      if (todo.activeSessionStartedAt) {
        return NextResponse.json(
          { error: 'A session is already running for this task' },
          { status: 409 },
        );
      }
      todo.activeSessionStartedAt = new Date();
      await todo.save();
      return NextResponse.json(todo, { status: 200 });
    }

    // *-----------------------------------------------------------------
    // * action: "end" — close the running session and push ONE complete
    // * entry {start, end, totalTime} to the array. totalTime is always
    // * computed server-side, in milliseconds. // !
    // *-----------------------------------------------------------------
    if (action === 'end') {
      if (!todo.activeSessionStartedAt) {
        return NextResponse.json(
          { error: 'No active session to end' },
          { status: 409 },
        );
      }
      const start = todo.activeSessionStartedAt;
      const end = new Date();
      todo.workingSessions.push({
        start,
        end,
        totalTime: end.getTime() - start.getTime(),
      });
      todo.activeSessionStartedAt = null;
      await todo.save();
      return NextResponse.json(todo, { status: 200 });
    }

    // *-----------------------------------------------------------------
    // * action: "done" — frontend Done button.
    // * 1) stamps done:true + completionDate on the study-task
    // * 2) propagates completion to the chapter/topic collection by
    // *    flipping the relevant tag field to true. // ! (use-case 3)
    // *-----------------------------------------------------------------
    if (action === 'done') {
      // ! Auto-close a dangling active session first so no time is silently lost.
      if (todo.activeSessionStartedAt) {
        const start = todo.activeSessionStartedAt;
        const end = new Date();
        todo.workingSessions.push({
          start,
          end,
          totalTime: end.getTime() - start.getTime(),
        });
        todo.activeSessionStartedAt = null;
      }

      todo.done = true;
      await todo.save();

      return NextResponse.json(todo, { status: 200 });
    }
    if (action === 'undone') {

      todo.done = false;
      await todo.save();

      return NextResponse.json(todo, { status: 200 });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { msg: 'error', error: (error as Error).message },
      { status: 500 },
    );
  }
}
