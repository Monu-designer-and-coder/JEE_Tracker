import mongoose, { Schema, Document } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

/**
 * * Subject Model Interface
 */
export interface ISubjectDocument extends Document {
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const SubjectSchema = new Schema<ISubjectDocument>(
    {
        // * Subject display name
        name: {
            type: String,
            required: [true, 'Subject name is required'],
            trim: true,
            unique: true,
            lowercase: true,
        },
    },
    { timestamps: true }
);

// * Attach pagination plugin for aggregated queries
SubjectSchema.plugin(mongooseAggregatePaginate);

// * Use existing model or create a new one to prevent overwrite errors in Next.js
const SubjectModel =
    (mongoose.models.Subject as mongoose.Model<ISubjectDocument>) ||
    mongoose.model<ISubjectDocument>('Subject', SubjectSchema);

export default SubjectModel;

// ! IMPROVEMENTS IMPLEMENTED:
// * 1. Renamed interface to ISubjectDocument to follow standard TypeScript/Mongoose conventions.
// * 2. Added lowercase: true to the schema level to ensure DB-level data consistency.
// * 3. Added standard mongoose required error message.

// ! PERFORMANCE OPTIMIZATIONS MAINTAINED:
// * 1. unique: true automatically builds a MongoDB index for faster lookups on the 'name' field.

// ! FUTURE IMPROVEMENTS:
// TODO: Consider adding a 'description' or 'isActive' field for richer subject info and soft deletes.