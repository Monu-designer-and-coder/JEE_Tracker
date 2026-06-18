/* eslint-disable @typescript-eslint/no-explicit-any */
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

// * SHARED CONSTANTS: Defined once and reused by both the document-level and
// * query-level validation hooks so the "done" business rule can never drift
// * out of sync between the two (this was the source of the 4 vs 5 mismatch
// * in the previous version's error messages).
const RESOURCE_FIELD_NAMES = [
    'theory',
    'shortNotes',
    'mindMap',
    'DPP1',
    'DPP2',
    'Module',
    'PYQ_Mains',
    'PYQ_Advanced',
    'Book',
] as const;

const MIN_REQUIRED_RESOURCES = 4;

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
        // * Chapter ordering sequence (unique per subject, enforced both at
        // * the application level below and at the database level via the
        // * unique compound index further down)
        seqNumber: {
            type: Number,
            default: 0,
            min: [0, 'Sequence number cannot be negative'],
        },
        // * Top-level completion flag — gated behind the resource checklist
        done: { type: Boolean, default: false },
        // * Resource / progress checklist flags
        theory: { type: Boolean, default: false },
        shortNotes: { type: Boolean, default: false },
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

// * COMPOUND INDEX: Speeds up finding/sorting chapters within a subject, AND
// * enforces seqNumber uniqueness per subject at the database level.
// ! `unique: true` here is a safety net for race conditions — two concurrent
// ! requests can both pass the application-level duplicate check in the
// ! pre('save') hook below before either has actually written to the DB.
// ! The unique index guarantees correctness even if that happens.
ChapterSchema.index({ subject: 1, seqNumber: 1 }, { unique: true });

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
ChapterSchema.pre('validate', function () {
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
    this: mongoose.Query<ChapterModelInterface | null, ChapterModelInterface>,
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
ChapterSchema.pre('findOneAndUpdate', runUpdateValidations);
ChapterSchema.pre('updateOne', runUpdateValidations);
ChapterSchema.pre('updateMany', runUpdateValidations);

// * UNIQUENESS HOOK: Friendly, descriptive error before the document even
// * hits the database. The unique index above is the actual guarantee; this
// * just makes failures readable instead of a raw MongoDB E11000 error.
ChapterSchema.pre('save', async function () {
    if (this.isModified('seqNumber') || this.isNew) {
        const Model = this.constructor as mongoose.Model<ChapterModelInterface>;
        const duplicate = await Model.findOne({
            subject: this.subject,
            seqNumber: this.seqNumber,
            _id: { $ne: this._id }, // * Exclude current document during updates
        })
            .select('_id')
            .lean();

        if (duplicate) {
            throw new Error(`Sequence number ${this.seqNumber} already exists for this subject.`);
        }
    }
});

// ! MODEL REGISTRATION GUARD: Prevents "Cannot overwrite model once compiled"
// ! errors under Next.js hot-reload / serverless re-invocation.
// ? Gotcha to remember: if you edit hooks in THIS file and only get a fast-refresh
// ? (not a full `next dev` restart), the already-registered model below keeps
// ? whatever hooks were attached on the FIRST load — your edits won't take
// ? effect until a full restart clears `mongoose.models`.
const ChapterModel =
    (mongoose.models.Chapter as mongoose.Model<ChapterModelInterface>) ||
    mongoose.model<ChapterModelInterface>('Chapter', ChapterSchema);

export default ChapterModel;

// ! IMPROVEMENTS IMPLEMENTED:
// * 1. Fixed the actual bug: update-pipeline (array-style) updates were silently
// *    skipping all "done" validation because `typeof [] === 'object'` passed
// *    the old object-spread logic without ever finding the real $set values.
// * 2. Unified the "done" business rule into a single `assertDoneRequirementsMet`
// *    helper, reused by both the document hook and the query hook — removes the
// *    4-vs-5 threshold mismatch that existed between the two error messages.
// * 3. Made the compound index `unique: true` so seqNumber collisions are caught
// *    by the database itself, closing the race-condition window the old
// *    application-only check left open.
// * 4. Added Better-Comments-style annotations throughout (!, *, ?, TODO) for
// *    faster visual scanning of critical logic vs informational notes.

// ! PERFORMANCE OPTIMIZATIONS MAINTAINED:
// * 1. Early-exit guard in the query hook still skips the extra DB lookup
// *    entirely when an update doesn't touch any validated field.
// * 2. The DB lookup now uses `.select(...)` + `.lean()` to fetch only the
// *    9 boolean fields needed as plain JS objects, instead of hydrating a
// *    full Mongoose document with every field and method attached.
// * 3. Compound index on { subject, seqNumber } still services both the
// *    duplicate check and any subject-scoped sorted queries.

// ! FUTURE IMPROVEMENTS:
// TODO: Loop over every matched _id for `updateMany` instead of validating
//       against only the first match returned by the filter.
// TODO: Add a virtual or populate method to compute total/completed child
//       Topics for a chapter directly from the model.
// TODO: Add a cascade-delete (or restrict) hook for child Topics when a
//       Chapter document is removed.