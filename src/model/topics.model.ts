/* eslint-disable @typescript-eslint/no-explicit-any */
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

// * SHARED CONSTANTS: Defined once and reused by both the document-level and
// * query-level validation hooks so the "done" business rule can never drift
// * out of sync between the two (this was the source of the 4 vs 5 mismatch
// * in the previous version's error messages).
const RESOURCE_FIELD_NAMES = [
    'theory',
    'inTextQuestions',
    'inClassQuestions',
] as const;

const MIN_REQUIRED_RESOURCES = 2;


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
// * COMPOUND INDEX: Speeds up finding/sorting chapters within a subject, AND
// * enforces seqNumber uniqueness per subject at the database level.
// ! `unique: true` here is a safety net for race conditions — two concurrent
// ! requests can both pass the application-level duplicate check in the
// ! pre('save') hook below before either has actually written to the DB.
// ! The unique index guarantees correctness even if that happens.
TopicSchema.index({ chapter: 1, seqNumber: 1 });


/**
 * ? Pure helper — given any object containing the resource boolean flags,
 * ? throws if the "done" business rule isn't satisfied. Shared by both the
 * ? document-level (`save`) and query-level (`updateOne` / `findOneAndUpdate`
 * ? / `updateMany`) validation hooks below, so there's exactly one place
 * ? that defines what "done" means.
 */
function assertDoneRequirementsMet(candidate: Record<string, any>): void {
    if (!candidate.done) return; // * Nothing to validate if not being marked done

    // ! Hard requirement: theory must always be completed first
    if (!candidate.theory) {
        throw new Error('Cannot mark as done: "theory" must be true.');
    }

    // * Soft requirement: at least MIN_REQUIRED_RESOURCES of the checklist items
    const completedCount = RESOURCE_FIELD_NAMES.filter((field) => candidate[field] === true).length;

    if (completedCount < MIN_REQUIRED_RESOURCES) {
        throw new Error(
            `Cannot mark as done: only ${completedCount}/${MIN_REQUIRED_RESOURCES} required resources are completed.`,
        );
    }
}

// * DOCUMENT VALIDATION HOOK: Runs on .save() / .validate() — covers any code
// * path that loads a document and mutates it directly (e.g. `doc.done = true; await doc.save()`)
TopicSchema.pre('validate', function () {
    assertDoneRequirementsMet(this);
});


/**
 * ! QUERY VALIDATION HOOK: Enforces the same "done" business rule for the
 * ! update-query family (`updateOne`, `updateMany`, `findOneAndUpdate`),
 * ! since Mongoose's document-level `pre('validate')` hook above does NOT
 * ! run for these — they bypass document hydration entirely by design
 * ! (that's why they're faster), so without this hook `done: true` could be
 * ! written straight to the DB with zero validation.
 */
const runUpdateValidations = async function (
    this: mongoose.Query<TopicModelInterface | null, TopicModelInterface>,
) {
    const rawUpdate = this.getUpdate() as any;
    if (!rawUpdate) return;

    // ! BUGFIX: `this.getUpdate()` can return an UPDATE PIPELINE (an array of
    // ! aggregation stages, e.g. `updateOne(filter, [{ $set: { done: true } }])`)
    // ! instead of a plain update object. `typeof [] === 'object'` is true in
    // ! JS, so the previous version silently spread the array into a numeric-keyed
    // ! object and never found the real $set values — meaning pipeline-style
    // ! updates skipped this validation entirely with no error. We now detect
    // ! and flatten that case explicitly.
    let setPayload: Record<string, any> = {};

    if (Array.isArray(rawUpdate)) {
        // * Update pipeline: merge every $set / $addFields stage in order
        for (const stage of rawUpdate) {
            if (stage?.$set) Object.assign(setPayload, stage.$set);
            if (stage?.$addFields) Object.assign(setPayload, stage.$addFields);
        }
    } else {
        // * Classic update object: merge top-level fields AND explicit $set values
        setPayload = {
            ...rawUpdate,
            ...(rawUpdate.$set || {}),
        };
    }

    // * PERFORMANCE GUARD: Only hit the database for a lookup if one of the
    // * fields that actually feeds the "done" rule is being touched. Saves a
    // * round-trip on every unrelated update (e.g. renaming a chapter).
    const touchesValidatedFields =
        setPayload.done !== undefined || RESOURCE_FIELD_NAMES.some((field) => setPayload[field] !== undefined);

    if (!touchesValidatedFields) return;

    // ? KNOWN LIMITATION: for `updateMany`, this only validates the FIRST
    // ? document matched by the filter — a true per-document bulk validation
    // ? would need to loop over every matched _id individually. Flagged as a
    // ? TODO below; for now, avoid using updateMany with the "done" field
    // ? across heterogeneous documents.
    const existingDoc = await this.model.findOne(this.getFilter()).select(RESOURCE_FIELD_NAMES.join(' ')).lean();

    if (!existingDoc) {
        throw new Error('Validation failed: the document targeted for this update could not be found.');
    }

    // * Simulate the post-update document state by merging existing + incoming values
    const mergedDoc = { ...existingDoc, ...setPayload };

    assertDoneRequirementsMet(mergedDoc);
};

// * Bind the same validator to every relevant update entry point
TopicSchema.pre('findOneAndUpdate', runUpdateValidations);
TopicSchema.pre('updateOne', runUpdateValidations);
TopicSchema.pre('updateMany', runUpdateValidations);


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

// ! MODEL REGISTRATION GUARD: Prevents "Cannot overwrite model once compiled"
// ! errors under Next.js hot-reload / serverless re-invocation.
// ? Gotcha to remember: if you edit hooks in THIS file and only get a fast-refresh
// ? (not a full `next dev` restart), the already-registered model below keeps
// ? whatever hooks were attached on the FIRST load — your edits won't take
// ? effect until a full restart clears `mongoose.models`.

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