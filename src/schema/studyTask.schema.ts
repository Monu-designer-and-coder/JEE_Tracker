import { z } from 'zod';
import { objectIdSchema } from './schema';
import {
	eStudyTaskOptions,
	eStudyTaskOptionsChapterTags,
	eStudyTaskOptionsTopicTags,
} from '@/types/model/study-task.model.types';

// *=====================================================================
// * POST /api/study-task
// * Creating a study-task from a "listed task" suggestion (use-case: task
// * creation). `subject` is intentionally NOT accepted from the client —
// * the API derives it from the chapter/topic itself, see the route file.
// *=====================================================================
export const createStudyTaskSchema = z
	.object({
		refType: z.nativeEnum(eStudyTaskOptions),
		refId: objectIdSchema,
		tag: z.string().min(1),
	})
	// ? use-case 1: "topic" refType only accepts topicTags, "chapter" only chapterTags
	.refine(
		(data) =>
			data.refType === eStudyTaskOptions.Chapter
				? Object.values(eStudyTaskOptionsChapterTags).includes(
						data.tag as eStudyTaskOptionsChapterTags,
					)
				: Object.values(eStudyTaskOptionsTopicTags).includes(
						data.tag as eStudyTaskOptionsTopicTags,
					),
		{
			message:
				'tag does not belong to the allowed tag-set for the given refType',
			path: ['tag'],
		},
	);

// *=====================================================================
// * PUT /api/study-task/session
// * Drives both the start/end timer controls and the frontend "Done" button.
// *=====================================================================
export const sessionActionSchema = z.object({
	studyTaskId: objectIdSchema,
	action: z.enum(['start', 'end', 'done']),
});

// *=====================================================================
// * PUT /api/study-task/chapter-status
// * The chapter currentChapterStatus lifecycle transitions.
// *=====================================================================
export const chapterStatusUpdateSchema = z.object({
	chapterId: objectIdSchema,
	type: z.enum([
		'markAsUpcoming',
		'markAsInProgress',
		'markAsUnfinished',
		'markAsDone',
	]),
});
