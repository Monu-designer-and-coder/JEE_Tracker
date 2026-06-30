import mongoose, { Schema, Document } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


export enum taskStatus {
  Pending = 'pending', //? first stage
  Finished = 'finished', //? second stage
}

/**
 * ! Tasks Model Interface
 * Represents a specific topic within a chapter.
 */
export interface TaskModelInterface extends Document {
  task: string;
  status: taskStatus;
  seqNumber: number;
  done: boolean;
  assignDate: Date;
  completionDate: Date;
  totalTimeTaken: number;
}



const TaskSchema = new Schema<TaskModelInterface>(
  {
    // * Chapter display name
    task: {
      type: String,
      required: true,
      trim: true,
    },
    seqNumber: {
      type: Number,
      default: 0,
      min: [0, 'Sequence number cannot be negative'],
    },
    // * Top-level completion flag — gated behind the resource checklist
    done: { type: Boolean, default: false },
    status: {
      type: String,
      enum: Object.values(taskStatus),
      default: taskStatus.Pending
    },

    assignDate: {
      type: Date,
      required: [true, 'assign Date is required'],
      index: true, // * High performance optimization for date range matching
    },
    completionDate: {
      type: Date,
      required: [true, 'completion Date is required'],
      index: true, // * High performance optimization for date range matching
    },
    // * Time Studied for the subject
    totalTimeTaken: {
      type: Number,
      default: 0,
      min: [0, 'Studied Time cannot be negative'],
    },


  },
  { timestamps: true },
);



// * Attach pagination plugin for aggregated queries
TaskSchema.plugin(mongooseAggregatePaginate);

// * Safeguard singleton implementation for Next.js hot-reloads
const TaskModel =
  (mongoose.models.Task as mongoose.Model<TaskModelInterface>) ||
  mongoose.model<TaskModelInterface>('Task', TaskSchema);

export default TaskModel;