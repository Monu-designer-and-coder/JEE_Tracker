import { z } from "zod";


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


// * Mongo ObjectIds are always 24-char hex strings — validate the shape
// * here so bad ids get a clean 400 instead of a raw Mongoose CastError.
const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");

// *=====================================================================
// * POST /api/study-task
// * Creating a study-task from a "listed task" suggestion (use-case: task
// * creation). `subject` is intentionally NOT accepted from the client —
// * the API derives it from the chapter/topic itself, see the route file.
// *=====================================================================
export const createStudyTaskSchema = z
  .object({
    refType: z.nativeEnum(studyTaskOptions),
    refId: objectIdSchema,
    tag: z.string().min(1),
  })
  // ? use-case 1: "topic" refType only accepts topicTags, "chapter" only chapterTags
  .refine(
    (data) =>
      data.refType === studyTaskOptions.Chapter
        ? Object.values(studyTaskOptionsChapterTags).includes(data.tag as studyTaskOptionsChapterTags)
        : Object.values(studyTaskOptionsTopicTags).includes(data.tag as studyTaskOptionsTopicTags),
    {
      message: "tag does not belong to the allowed tag-set for the given refType",
      path: ["tag"],
    },
  );

export type CreateStudyTaskInput = z.infer<typeof createStudyTaskSchema>;

// *=====================================================================
// * PUT /api/study-task/session
// * Drives both the start/end timer controls and the frontend "Done" button.
// *=====================================================================
export const sessionActionSchema = z.object({
  studyTaskId: objectIdSchema,
  action: z.enum(["start", "end", "done"]),
});

export type SessionActionInput = z.infer<typeof sessionActionSchema>;

// *=====================================================================
// * PUT /api/study-task/chapter-status
// * The chapter currentChapterStatus lifecycle transitions.
// *=====================================================================
export const chapterStatusUpdateSchema = z.object({
  chapterId: objectIdSchema,
  type: z.enum(["markAsUpcoming", "markAsInProgress", "markAsUnfinished", "markAsDone"]),
});

export type ChapterStatusUpdateInput = z.infer<typeof chapterStatusUpdateSchema>;