import mongoose, { Schema, Document, Types } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

/**
 * ! QuestionStreak Model Interface
 */
export interface QuestionStreakModelInterface extends Document {
    date: Date;
    questionsDone: number;
    subject: Types.ObjectId
}

const QuestionStreakSchema = new Schema<QuestionStreakModelInterface>(
    {
        // * QuestionStreak display name
        date: {
            type: Date,
            required: true,
        },
        questionsDone: {
            type: Number,
            default: 0,
        },
        subject: {
            type: Schema.Types.ObjectId,
            ref: 'Subject',
            required: true,
        },

    },
    { timestamps: true },
);

// * Attach pagination plugin for aggregated queries
QuestionStreakSchema.plugin(mongooseAggregatePaginate);

const QuestionStreakModel =
    (mongoose.models.QuestionStreak as mongoose.Model<QuestionStreakModelInterface>) ||
    mongoose.model<QuestionStreakModelInterface>('QuestionStreak', QuestionStreakSchema);

export default QuestionStreakModel;
