import mongoose, { Schema, Document } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

/**
 * ! Subject Model Interface
 */
export interface SubjectModelInterface extends Document {
    name: string;
}

const SubjectSchema = new Schema<SubjectModelInterface>(
    {
        // * Subject display name
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
    },
    { timestamps: true },
);

// * Attach pagination plugin for aggregated queries
SubjectSchema.plugin(mongooseAggregatePaginate);

const SubjectModel =
    (mongoose.models.Subject as mongoose.Model<SubjectModelInterface>) ||
    mongoose.model<SubjectModelInterface>('Subject', SubjectSchema);

export default SubjectModel;

/*
  ! FUTURE IMPROVEMENTS:
  TODO: Add unique index on name + standard to avoid duplicate subjects.
  TODO: Consider adding a description field for richer subject info.
*/
