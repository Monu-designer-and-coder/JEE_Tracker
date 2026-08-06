import z from 'zod';

const objectIdSchema = z
	.string()
	.regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

export enum ToDoCategories {
	JEE = 'JEE_IIT_Bombay',
	Fit = 'fitness',
	Intel = 'intelligent',
	Skill = 'skillful',
	Chores = 'chores',
}

export const todoPostSchema = z.object({
	todo: z
		.string()
		.min(
			1,
			'Subject database relational tracking mapping string reference ID is required',
		),
	category: z.enum([
		'JEE_IIT_Bombay',
		'fitness',
		'intelligent',
		'skillful',
		'chores',
	]),
	perceivedDifficulty: z.string(),
	worthPoints: z.string(),
});
export const todoPostBackedSchema = z.object({
	todo: z
		.string()
		.min(
			1,
			'Subject database relational tracking mapping string reference ID is required',
		),
	category: z.enum(ToDoCategories),
	perceivedDifficulty: z.number(),
	worthPoints: z.number(),
});

export const todoSessionActionSchema = z.object({
	todoId: objectIdSchema,
	action: z.enum(['start', 'end', 'done', 'undone']),
});
