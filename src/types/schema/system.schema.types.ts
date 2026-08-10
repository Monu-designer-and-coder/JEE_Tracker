import {
	chapterStatusUpdateSchema,
	createStudyTaskSchema,
	sessionActionSchema,
} from '@/schema/studyTask.schema';
import {
	addChapterToSystem,
	systemPUTRequestSchema,
} from '@/schema/system.schema';
import z from 'zod';

export type tCreateStudyTaskSchema = z.infer<typeof createStudyTaskSchema>;
export type tSessionActionSchema = z.infer<typeof sessionActionSchema>;
export type tChapterStatusUpdateSchema = z.infer<
	typeof chapterStatusUpdateSchema
>;

export type tAddChapterToSystem = z.infer<typeof addChapterToSystem>;
export type tSystemPUTRequestSchema = z.infer<typeof systemPUTRequestSchema>;
