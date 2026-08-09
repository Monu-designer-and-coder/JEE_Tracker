import {
	TopicBackendValidationSchema,
	TopicValidationPUTSchema,
	TopicValidationPUTSchemaBackend,
	TopicValidationSchema,
} from '@/schema/topic.schema';
import z from 'zod';

export type tTopicValidationSchema = z.infer<typeof TopicValidationSchema>;
export type tTopicBackendValidationSchema = z.infer<
	typeof TopicBackendValidationSchema
>;
export type tTopicValidationPUTSchema = z.infer<
	typeof TopicValidationPUTSchema
>;
export type tTopicValidationPUTSchemaBackend = z.infer<
	typeof TopicValidationPUTSchemaBackend
>;
