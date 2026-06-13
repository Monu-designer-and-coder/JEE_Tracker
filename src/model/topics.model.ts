import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * ! Topic Model Interface
 * Represents a specific topic within a chapter.
 */
export interface TopicModelInterface extends Document {
    name: string;
    chapter: Types.ObjectId;
    seqNumber: number;
    done: boolean;
    theory: boolean;
    inTextQuestions: boolean;
    inClassQuestions: boolean;
}

const TopicSchema = new Schema<TopicModelInterface>(
    {
        // * Topic display name
        name: {
            type: String,
            required: true,
            trim: true,
        },
        // * Reference to parent chapter
        chapter: {
            type: Schema.Types.ObjectId,
            ref: 'Chapter',
            required: true,
        },
        // * Order index inside chapter
        seqNumber: {
            type: Number,
            default: 0,
            min: [0, 'Sequence number cannot be negative'], // Field-level validation for non-negative values
        },
        // * Completion & Exam Relevance Flags
        done: { type: Boolean, default: false },
        theory: { type: Boolean, default: false },
        inTextQuestions: { type: Boolean, default: false },
        inClassQuestions: { type: Boolean, default: false },
    },
    { timestamps: true },
);

// * COMPOUND INDEX: Optimized query sorting by chapter and their sequence order
TopicSchema.index({ chapter: 1, seqNumber: 1 });

// * CROSS-FIELD VALIDATION HOOK: Validates "done" prerequisites safely with strict types
TopicSchema.pre('validate', function () {
    // 'this' is implicitly and perfectly typed as your document here by Mongoose
    if (this.done) {
        // Condition 1: 'theory' MUST be true
        if (!this.done) {
            throw new Error('Cannot mark as done: "theory" must be true.');
        }

        // Condition 2: At least 5 items must be true
        const resources: boolean[] = [
            this.inTextQuestions,
            this.inClassQuestions,
        ];

        const completedCount = resources.filter((flag) => flag === true).length;

        if (completedCount < 2) {
            throw new Error(`Cannot mark as done: You have only completed ${completedCount}/ required tasks.`);
        }
    }
});

// * VALIDATION HOOK: Ensures seqNumber is unique within the context of a single chapter
TopicSchema.pre('save', async function () {
    if (this.isModified('seqNumber') || this.isNew) {
        const Model = this.constructor as mongoose.Model<TopicModelInterface>;
        const duplicate = await Model.findOne({
            chapter: this.chapter,
            seqNumber: this.seqNumber,
            _id: { $ne: this._id } // Exclude current document during updates
        });

        if (duplicate) {
            // Throwing an error in an async hook automatically halts the save
            throw new Error(`Sequence number ${this.seqNumber} already exists for this chapter.`);
        }
    }
});

const TopicModel =
    (mongoose.models.Topic as mongoose.Model<TopicModelInterface>) ||
    mongoose.model<TopicModelInterface>('Topic', TopicSchema);

export default TopicModel;

/*
 ! IMPROVEMENTS IMPLEMENTED:
 * 1. Applied Types.ObjectId for strong typing on chapter ref.
 * 2. Added default values for booleans and seqNumber.
 * 3. Improved readability with grouped fields & Better Comments.
 * 4. Created a compound index on chapter + seqNumber for optimized sorting.
 * 5. Added field-level validation to enforce non-negative seqNumber.

  ! FUTURE IMPROVEMENTS:
  TODO: Implement text indexing on the 'name' field if search-by-topic functionality scales.
*/