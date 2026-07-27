import mongoose, { Schema, Document, Types } from "mongoose";
// * This plugin augments the "mongoose" module's own type declarations with
// * `AggregatePaginateModel<D>` / `AggregatePaginateResult<T>` — that's why
// * those types are referenced below as `mongoose.AggregatePaginateModel`
// * rather than being imported by name from this package.
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import ChapterModel from "@/model/chapters.model";
import TopicModel from "@/model/topics.model";

// *=====================================================================
// * ENUMS
// *=====================================================================

// * What kind of entity a study-task points at.
export enum studyTaskOptions {
  Chapter = 'chapter',
  Topic = 'topic',
}

// * Tags a "chapter" type study-task is allowed to use — must match the
// * boolean field names that actually exist on ChapterModel.
export enum studyTaskOptionsChapterTags {
  Theory = 'theory',
  ShortNotes = 'shortNotes',
  PYQ_Mains = 'PYQ_Mains',
  PYQ_Advanced = 'PYQ_Advanced',
  DPP1 = 'DPP1',
  mindMap = 'mindMap',
  Module = 'Module',
  DPP2 = 'DPP2',
  Book = 'Book',
}

// * Tags a "topic" type study-task is allowed to use — must match the
// * boolean field names that actually exist on TopicModel.
export enum studyTaskOptionsTopicTags {
  Theory = 'theory',
  InTextQuestions = 'inTextQuestions',
  InClassQuestions = 'inClassQuestions',
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

// * The polymorphic pointer a study-task tracks progress against.
// * `enum` decides whether `_id` is looked up in Chapters or Topics, and
// * which tag-set `tag` is validated against (use-case 1).
export interface StudyTaskRefInterface {
  enum: studyTaskOptions;
  _id: Types.ObjectId;
  tag: studyTaskOptionsChapterTags | studyTaskOptionsTopicTags;
}

export interface StudyTasksModelInterface extends Document {
  subject: Types.ObjectId;
  assignDate: Date;
  completionDate?: Date;                 // * only set once the "done" button is pressed
  done: boolean;
  activeSessionStartedAt?: Date | null;   // * timestamp of a currently-running session, if any
  workingSessions: WorkingSessionInterface[];
  studyTask: StudyTaskRefInterface;
}

// *=====================================================================
// * SUB-SCHEMAS
// *=====================================================================

// * `_id:false` — these are pure value-objects, they don't need their own id.
const WorkingSessionSchema = new Schema<WorkingSessionInterface>(
  {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    totalTime: { type: Number, required: true, min: [0, 'totalTime cannot be negative'] },
  },
  { _id: false },
);

const StudyTaskRefSchema = new Schema<StudyTaskRefInterface>(
  {
    enum: { type: String, enum: Object.values(studyTaskOptions), required: true },
    _id: { type: Schema.Types.ObjectId, required: true },
    tag: { type: String, required: true },
  },
  { _id: false },
);

// *=====================================================================
// * MAIN SCHEMA
// *=====================================================================

const StudyTasksSchema = new Schema<StudyTasksModelInterface>(
  {
    subject: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    assignDate: { type: Date, default: Date.now },
    completionDate: { type: Date },
    done: { type: Boolean, default: false },
    activeSessionStartedAt: { type: Date, default: null },
    workingSessions: { type: [WorkingSessionSchema], default: [] },
    studyTask: { type: StudyTaskRefSchema, required: true },
  },
  { timestamps: true },
);

// * Helpful for dashboards / history pages that paginate through tasks.
StudyTasksSchema.index({ subject: 1, done: 1, assignDate: -1 });

// *=====================================================================
// * VALIDATION — use-case 1
// * "when studyTask has topic as enum, the _id should be of the topic and
// *  tags should only be accepted from topicTags — same goes for chapter."
// *=====================================================================

// ? Confirms: (a) the tag belongs to the tag-set matching `enum`, and
// ? (b) a document with that `_id` actually exists in the right collection.
async function assertValidStudyTaskRef(ref: StudyTaskRefInterface): Promise<void> {
  if (ref.enum === studyTaskOptions.Chapter) {
    if (!Object.values(studyTaskOptionsChapterTags).includes(ref.tag as studyTaskOptionsChapterTags)) {
      throw new Error(
        `Invalid tag "${ref.tag}" for a chapter-type study-task. Allowed: ${Object.values(studyTaskOptionsChapterTags).join(', ')}`,
      );
    }
    const chapterExists = await ChapterModel.exists({ _id: ref._id });
    if (!chapterExists) throw new Error(`No chapter found for id "${ref._id}"`);
    return;
  }

  if (ref.enum === studyTaskOptions.Topic) {
    if (!Object.values(studyTaskOptionsTopicTags).includes(ref.tag as studyTaskOptionsTopicTags)) {
      throw new Error(
        `Invalid tag "${ref.tag}" for a topic-type study-task. Allowed: ${Object.values(studyTaskOptionsTopicTags).join(', ')}`,
      );
    }
    const topicExists = await TopicModel.exists({ _id: ref._id });
    if (!topicExists) throw new Error(`No topic found for id "${ref._id}"`);
    return;
  }

  // ! Should be unreachable — zod already restricts `enum` — but a schema-level
  // ! guard is cheap insurance against direct DB writes that skip the API layer.
  throw new Error(`Invalid studyTask.enum value "${ref.enum}"`);
}

StudyTasksSchema.pre('validate', async function () {
  await assertValidStudyTaskRef(this.studyTask);
});

// * The studyTask reference is the identity of this document — once created,
// * it should never be repointed at a different chapter/topic/tag. Any
// * update attempting to touch it is rejected outright.
StudyTasksSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function () {
  const rawUpdate = this.getUpdate();
  // * Pipeline-style updates (an array of aggregation stages) are never used
  // * by this API layer — bail out so the `in` checks below stay meaningful.
  if (!rawUpdate || Array.isArray(rawUpdate)) return;

  const touchesRef = 'studyTask' in rawUpdate || Boolean(rawUpdate.$set && 'studyTask' in rawUpdate.$set);
  if (touchesRef) {
    throw new Error('studyTask reference (enum/_id/tag) is immutable after creation.');
  }
});

// *=====================================================================
// * MODEL EXPORT
// *=====================================================================

// * mongooseAggregatePaginate lets the "list" API page through study-tasks
// * cheaply via aggregatePaginate() instead of loading everything at once.
StudyTasksSchema.plugin(mongooseAggregatePaginate);

const StudyTaskModel =
  (mongoose.models.StudyTask as mongoose.AggregatePaginateModel<StudyTasksModelInterface>) ||
  mongoose.model<StudyTasksModelInterface, mongoose.AggregatePaginateModel<StudyTasksModelInterface>>(
    'StudyTask',
    StudyTasksSchema,
  );

export default StudyTaskModel;