
import { chapterValidationPUTSchema, chapterValidationPUTSchemaBackend, chapterValidationSchema, chapterValidationSchemaBackend } from '@/schema/chapter.schema';
import z from 'zod';

export type tChapterValidationSchema = z.infer<typeof chapterValidationSchema>;
export type tChapterValidationPUTSchema = z.infer<typeof chapterValidationPUTSchema>;
export type tChapterValidationSchemaBackend = z.infer<typeof chapterValidationSchemaBackend>;
export type tChapterValidationPUTSchemaBackend = z.infer<typeof chapterValidationPUTSchemaBackend>;
