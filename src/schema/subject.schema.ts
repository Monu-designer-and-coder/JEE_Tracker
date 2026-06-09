import { z } from 'zod';

export const CreateSubjectSchema = z.object({
	name: z
		.string()
		.trim()
		.lowercase()
		.min(3, 'The subject length must be at least 3 characters!'),
});

export const UpdateSubjectSchema = z.object({
	id: z.string().min(1, 'Subject ID is required for updates'),
	data: z.object({
		name: z
			.string()
			.trim()
			.lowercase()
			.min(3, 'The subject length must be at least 3 characters!'),
	}),
});

// ! IMPROVEMENTS IMPLEMENTED:
// * 1. Fixed typos in validation error messages ("al least" -> "at least").
// * 2. Renamed schemas to PascalCase (CreateSubjectSchema, UpdateSubjectSchema) for better naming consistency.
// * 3. Added ID validation in the UpdateSchema to ensure an ID is actually passed.
// * 4. Added lowercase formatting to the update schema to match creation.

// ! PERFORMANCE OPTIMIZATIONS MAINTAINED:
// * 1. Zod safely parses data before it ever hits the database, preventing invalid query execution.

// ! FUTURE IMPROVEMENTS:
// TODO: Abstract the 'name' validation logic into a base schema to DRY up the code.