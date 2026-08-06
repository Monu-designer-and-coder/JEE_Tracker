import mongoose, { Schema, Document } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

// *=====================================================================
// * ENUMS
// *=====================================================================

export enum ToDoCategories {
	JEE = 'JEE_IIT_Bombay',
	Fit = 'fitness',
	Intel = 'intelligent',
	Skill = 'skillful',
	Chores = 'chores',
}

// *=====================================================================
// * INTERFACES
// *=====================================================================

// * A single completed working-session (a "start timer -> stop timer" run).
// * Only ever pushed to the array once it has actually ended — see use-case 2.
export interface WorkingSessionInterface {
	start: Date;
	end: Date;
	totalTime: number; // ! milliseconds, always server-derived (end - start)
}

export interface ToDoModelInterface extends Document {
	category: ToDoCategories;
	todo: string;
	todoDate: Date;
	done: boolean;
	activeSessionStartedAt?: Date | null; // * timestamp of a currently-running session, if any
	workingSessions: WorkingSessionInterface[];
	perceivedDifficulty: number;
	actualDifficulty?: number;
	worthPoints: number;
	earnedPoints: number;
}

// *=====================================================================
// * SUB-SCHEMAS
// *=====================================================================

// * `_id:false` — these are pure value-objects, they don't need their own id.
const WorkingSessionSchema = new Schema<WorkingSessionInterface>(
	{
		start: { type: Date, required: true },
		end: { type: Date, required: true },
		totalTime: {
			type: Number,
			required: true,
			min: [0, 'totalTime cannot be negative'],
		},
	},
	{ _id: false },
);

// *=====================================================================
// * MAIN SCHEMA
// *=====================================================================

const ToDoSchema = new Schema<ToDoModelInterface>(
	{
		category: { type: String, required: true },
		todo: { type: String, required: true },
		todoDate: { type: Date, default: Date.now },
		worthPoints: { type: Number },
		earnedPoints: { type: Number },
		perceivedDifficulty: { type: Number },
		actualDifficulty: { type: Number },
		done: { type: Boolean, default: false },
		activeSessionStartedAt: { type: Date, default: null },
		workingSessions: { type: [WorkingSessionSchema], default: [] },
	},
	{ timestamps: true },
);

// * Helpful for dashboards / history pages that paginate through tasks.
ToDoSchema.index({ category: 1, done: 1, assignDate: -1 });

// *=====================================================================
// * MODEL EXPORT
// *=====================================================================

// * mongooseAggregatePaginate lets the "list" API page through study-tasks
// * cheaply via aggregatePaginate() instead of loading everything at once.
ToDoSchema.plugin(mongooseAggregatePaginate);

const ToDoModel =
	(mongoose.models
		.ToDo as mongoose.AggregatePaginateModel<ToDoModelInterface>) ||
	mongoose.model<
		ToDoModelInterface,
		mongoose.AggregatePaginateModel<ToDoModelInterface>
	>('ToDo', ToDoSchema);

export default ToDoModel;
