import dbConn from "@/lib/dbConn";
import TaskModel, { TaskModelInterface, taskStatus } from "@/model/tasks.model";
import { NextResponse } from "next/server";
import z from "zod";




export async function PUT(request: Request) {
  await dbConn();
  try {
    const clientBodyData = await request.json();

    if (!clientBodyData) {
      // ! Bad Request: Missing body
      return NextResponse.json({ error: 'Request body is missing' }, { status: 400 });
    }

    const validationResult = z.object({
      taskId: z.string().optional(),
      type: z.enum(["markTaskAsFinished"])
    }).safeParse(clientBodyData);
    if (!validationResult.success) {
      console.log(validationResult.error)
      return NextResponse.json(
        { errors: validationResult.error.format() },
        { status: 400 }
      );
    }
    if (validationResult.data.type === "markTaskAsFinished" && !validationResult.data.taskId) {
      return NextResponse.json({ msg: "error: Provide Valid Id" }, { status: 400 });
    }

    const taskToUpdate = await TaskModel.findById(validationResult.data.taskId)
    if (!taskToUpdate) {
      return NextResponse.json({ msg: "error: Provide Valid Id" }, { status: 400 });
    }

    await TaskModel.findByIdAndUpdate(validationResult.data.taskId, {
      status: taskStatus.Finished,
      completionDate: new Date(),
      totalTimeTaken: Number(new Date()) - Number(new Date(taskToUpdate.assignDate))
    })

    return NextResponse.json({ msg: "Updated!" }, { status: 201 });
  }

  catch (error) {
    console.log(error)
    return NextResponse.json({ msg: "error", error }, { status: 500 });
  }
}
export async function POST(request: Request) {
  await dbConn();
  try {
    const clientBodyData = await request.json();

    if (!clientBodyData) {
      // ! Bad Request: Missing body
      return NextResponse.json({ error: 'Request body is missing' }, { status: 400 });
    }

    const validationResult = z.object({
      task: z.string(),
    }).safeParse(clientBodyData);
    if (!validationResult.success) {
      console.log(validationResult.error)
      return NextResponse.json(
        { errors: validationResult.error.format() },
        { status: 400 }
      );
    }


    const latestSeqNumber: {
      seqNumber: number;
    }[] = await TaskModel.aggregate([
      {
        $match: {
          status: taskStatus.Finished
        },
      },
      {
        $sort: {
          seqNumber: -1
        }
      },
      {
        $project: {
          seqNumber: 1
        }
      }
    ])

    const previousSeqNumber: number = latestSeqNumber[0].seqNumber || 0


    const newTask = await TaskModel.create({
      task: validationResult.data.task,
      seqNumber: previousSeqNumber + 1,
      assignDate: new Date(),
      completionDate: new Date(),
    });
    return NextResponse.json<TaskModelInterface>(newTask, { status: 201 });
  }

  catch (error) {
    console.log(error)
    return NextResponse.json({ msg: "error", error }, { status: 500 });
  }
}


export async function GET() {
  await dbConn();
  try {

    const currentTask: {
      _id: string;
      task: string;
      seqNumber: number;
      assignDate: Date;
    }[] = await TaskModel.aggregate([{ $match: { status: taskStatus.Pending } }, {
      $project: {
        _id: 1,
        task: 1,
        seqNumber: 1,
        assignDate: 1,
      }
    }])


    return NextResponse.json<{
      _id: string;
      task: string;
      seqNumber: number;
      assignDate: Date;
    }>(currentTask[0] || {
      _id: "loading",
      task: "loading",
      seqNumber: 0,
      assignDate: new Date(),
    });
  }

  catch (error) {
    console.log(error)
    return NextResponse.json({ msg: "error", error });
  }
}