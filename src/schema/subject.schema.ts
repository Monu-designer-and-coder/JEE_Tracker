import { z } from 'zod';

export const subjectValidationSchema = z.object({
	name: z
		.string()
		.trim()
		.lowercase()
		.min(3, 'The subject Length must be of al least 3 character!'),
});
export const subjectValidationPUTSchema = z.object({
	id: z.string(),
	data: z.object({
		name: z
			.string()
			.trim()
			.min(3, 'The subject Length must be of al least 3 character!'),
	}),
});
