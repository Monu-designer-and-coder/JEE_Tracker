import { z } from 'zod';
import { objectIdSchema } from './schema';

export const SubjectStreakPostSchema = z.object({
	date: z.coerce.date({
		error: 'A valid calendar date structure string is required',
	}),
	subject: objectIdSchema,
});

export const SubjectStreakGetSchema = z.object({
	date: z.coerce.date().optional(),
	subject: objectIdSchema.optional(),
	page: z.string().transform(Number).default(1),
	limit: z.string().transform(Number).default(10),
});

export const SubjectStreakUpdateSchema = z.object({
	_id: objectIdSchema,
	type: z.enum(['plusOneQuestion', 'addTimeStudied']),
	timeStudied: z
		.number()
		.min(1, 'Streak record time to be added is missing')
		.optional(),
});
