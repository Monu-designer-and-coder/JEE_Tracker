import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * ! Chapter Model Interface
 * Represents a curriculum chapter linked to a subject.
 */
export interface ChapterModelInterface extends Document {
    name: string;
    subject: Types.ObjectId;
    seqNumber: number;
    done: boolean;
    theory: boolean;
    shortNotes: boolean;
    mindMap: boolean;
    DPP1: boolean;
    DPP2: boolean;
    Module: boolean;
    PYQ_Mains: boolean;
    PYQ_Advanced: boolean;
    Book: boolean;
}

const ChapterSchema = new Schema<ChapterModelInterface>(
    {
        // * Chapter display name
        name: {
            type: String,
            required: true,
            trim: true,
        },
        // * Reference to related subject
        subject: {
            type: Schema.Types.ObjectId,
            ref: 'Subject',
            required: true,
        },
        // * Chapter ordering sequence
        seqNumber: {
            type: Number,
            default: 0,
            min: [0, 'Sequence number cannot be negative'],
        },
        // * Completion & Resource Flags
        done: { type: Boolean, default: false },
        theory: { type: Boolean, default: false },
        shortNotes: { type: Boolean, default: false }, // * Added missing field from interface
        mindMap: { type: Boolean, default: false },
        DPP1: { type: Boolean, default: false },
        DPP2: { type: Boolean, default: false },
        Module: { type: Boolean, default: false },
        PYQ_Mains: { type: Boolean, default: false },
        PYQ_Advanced: { type: Boolean, default: false },
        Book: { type: Boolean, default: false },
    },
    { timestamps: true },
);

// * COMPOUND INDEX: Speeds up finding and sorting chapters belonging to a subject
ChapterSchema.index({ subject: 1, seqNumber: 1 });

// * CROSS-FIELD VALIDATION HOOK: Validates "done" prerequisites safely with strict types
ChapterSchema.pre('validate', function () {
    // 'this' is implicitly and perfectly typed as your document here by Mongoose
    if (this.done) {
        // Condition 1: 'theory' MUST be true
        if (!this.theory) {
            throw new Error('Cannot mark as done: "theory" must be true.');
        }

        // Condition 2: At least 5 items must be true
        const resources: boolean[] = [
            this.theory,
            this.shortNotes,
            this.mindMap,
            this.DPP1,
            this.DPP2,
            this.Module,
            this.PYQ_Mains,
            this.PYQ_Advanced,
            this.Book
        ];

        const completedCount = resources.filter((flag) => flag === true).length;

        if (completedCount < 5) {
            throw new Error(`Cannot mark as done: You have only completed ${completedCount}/5 required tasks.`);
        }
    }
});

// * VALIDATION HOOK: Ensures seqNumber is unique within the context of a single subject
ChapterSchema.pre('save', async function () {
    if (this.isModified('seqNumber') || this.isNew) {
        const Model = this.constructor as mongoose.Model<ChapterModelInterface>;
        const duplicate = await Model.findOne({
            subject: this.subject,
            seqNumber: this.seqNumber,
            _id: { $ne: this._id } // Exclude current document during updates
        });

        if (duplicate) {
            // Throwing an error in an async hook automatically halts the save
            throw new Error(`Sequence number ${this.seqNumber} already exists for this subject.`);
        }
    }
});

const ChapterModel =
    (mongoose.models.Chapter as mongoose.Model<ChapterModelInterface>) ||
    mongoose.model<ChapterModelInterface>('Chapter', ChapterSchema);

export default ChapterModel;


/*

 ! IMPROVEMENTS IMPLEMENTED:

 * 1. Unified boolean casing for TypeScript type consistency.

 * 2. Added clear JSDoc and inline Better Comments for maintainers.

 * 3. Used Types.ObjectId for subject ref type safety.

 * 4. Structured schema fields logically: identity, relationship, metadata.

 * 5. Added compound index on subject + seqNumber for faster scoped sorting.

 * 6. Implemented an asynchronous pre-save hook validating seqNumber uniqueness per subject.



  ! FUTURE IMPROVEMENTS:

  TODO: Add a virtual field or populate method to easily calculate and return total/completed child Topics.

  TODO: Cascade delete or restrict deletion hook to handle children Topics when a Chapter is removed.

*/

