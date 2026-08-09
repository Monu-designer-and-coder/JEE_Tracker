import { z } from 'zod';
import { objectIdSchema } from './schema';

export const TopicValidationSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, 'The subject Length must be of al least 3 character!'),

    chapter: z.string().min(1, 'Chapter is mandatory'),
    seqNumber: z.string(),
    done: z.boolean().optional(),
    theory: z.boolean().optional(),
    inTextQuestions: z.boolean().optional(),
    inClassQuestions: z.boolean().optional(),
});
export const TopicBackendValidationSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, 'The subject Length must be of al least 3 character!'),

    chapter: z.string().min(1, 'Chapter is mandatory'),
    seqNumber: z.coerce.number().int().min(0, 'Sequence number cannot be negative.'),
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
        seqNumber: z.string().optional(),
        done: z.boolean().optional(),
        theory: z.boolean().optional(),
        inTextQuestions: z.boolean().optional(),
        inClassQuestions: z.boolean().optional(),
    })
});


/**
 * ! PUT /api/topics request body schema
 * @desc Validates a partial chapter update — `_id` identifies the target
 * document, and `data` carries only the fields the client wants to change.
 */

export const TopicValidationPUTSchemaBackend = z.object({
    _id: z.string(),
    data: z.object({
        name: z
            .string()
            .trim()
            .min(3, 'Chapter name must be at least 3 characters long.')
            .optional(),
        // * Foreign-key reference to a Subject document — validated as a real ObjectId
        chapter: objectIdSchema.optional(),
        // * Accepts either a numeric or numeric-string input and coerces to a number
        seqNumber: z.coerce.number().int().min(0, 'Sequence number cannot be negative.').optional(),
        done: z.boolean().optional(),
        theory: z.boolean().optional(),
        inTextQuestions: z.boolean().optional(),
        inClassQuestions: z.boolean().optional(),
    })
});