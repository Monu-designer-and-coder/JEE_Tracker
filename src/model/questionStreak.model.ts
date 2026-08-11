import mongoose, { Schema, Document, Types } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

/**
 * * SubjectStreak Model Interface
 */
export interface ISubjectStreakDocument extends Document {
	date: Date;
	questionsDone: number;
	timeStudied: number;
	subject: Types.ObjectId;
	createdAt?: Date;
	updatedAt?: Date;
}

const SubjectStreakSchema = new Schema<ISubjectStreakDocument>(
	{
		// * Target date tracking the milestone activity
		date: {
			type: Date,
			required: [true, 'Date is required'],
			index: true, // * High performance optimization for date range matching
		},
		// * Number of targeted tracking questions completed
		questionsDone: {
			type: Number,
			default: 0,
			min: [0, 'Completed questions cannot be negative'],
		},
		// * Time Studied for the subject
		timeStudied: {
			type: Number,
			default: 0,
			min: [0, 'Studied Time cannot be negative'],
		},
		// * Reference tracking map identifier to Subject model
		subject: {
			type: Schema.Types.ObjectId,
			ref: 'Subject',
			required: [true, 'Subject reference mapping ID is required'],
			index: true, // * Compound/single index fallback for query target acceleration
		},
	},
	{ timestamps: true },
);

// * Attach pagination plugin for aggregated queries
SubjectStreakSchema.plugin(mongooseAggregatePaginate);

// * Safeguard singleton implementation for Next.js hot-reloads
const SubjectStreakModel =
	(mongoose.models
		.SubjectStreak as mongoose.AggregatePaginateModel<ISubjectStreakDocument>) ||
	mongoose.model<
		ISubjectStreakDocument,
		mongoose.AggregatePaginateModel<ISubjectStreakDocument>
	>('SubjectStreak', SubjectStreakSchema);

export default SubjectStreakModel;

// ! IMPROVEMENTS IMPLEMENTED:
// * 1. Converted model interface naming schema to standard ISubjectStreakDocument naming syntax.
// * 2. Added explicit Mongoose error string templates instead of default broad errors.
// * 3. Enforced strict validation controls on questionsDone fields ensuring no unintended negative mutations pass.
// * 4. Created field-level optimization indexing on both 'date' and 'subject' keys.

// ! PERFORMANCE OPTIMIZATIONS MAINTAINED:
// * 1. Pre-compiled indexing targets maximize throughput on heavily contested multi-aggregate pipeline executions.

// ! FUTURE IMPROVEMENTS:
// TODO: Create a compound database index on { date: 1, subject: 1 } to guarantee uniqueness constraints per day per topic.
