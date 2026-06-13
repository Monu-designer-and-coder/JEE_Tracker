import { z } from 'zod';

export const TopicValidationSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, 'The subject Length must be of al least 3 character!'),

    chapter: z.string().min(1, 'Chapter is mandatory'),
    seqNumber: z.string().transform(Number),
    done: z.boolean().optional().default(false),
    theory: z.boolean().optional().default(false),
    inTextQuestions: z.boolean().optional().default(false),
    inClassQuestions: z.boolean().optional().default(false),
});

export const TopicValidationPUTSchema = z.object({
    _id: z.string(),
    data: z.object({
        name: z
            .string()
            .trim()
            .min(3, 'The subject Length must be of al least 3 character!').optional(),
        chapter: z.string().min(1, 'chapter is mandatory').optional(),
        seqNumber: z.string().transform(Number).optional(),
        done: z.boolean().optional().default(false),
        theory: z.boolean().optional().default(false),
        inTextQuestions: z.boolean().optional().default(false),
        inClassQuestions: z.boolean().optional().default(false),
    })
});