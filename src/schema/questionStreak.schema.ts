import { z } from 'zod';

export const questionStreakPostSchema = z.object({
    date: z.date(),
    subject: z.string(),
});
export const questionStreakGetSchema = z.object({
    date: z.date().optional(),
    subject: z.string().optional(),
});
export const questionStreakPlusOneSchema = z.object({
    _id: z.string(),
});
