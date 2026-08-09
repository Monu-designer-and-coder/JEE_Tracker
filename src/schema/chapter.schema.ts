import { z } from 'zod';
import { objectIdSchema } from './schema';

export const chapterValidationSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, 'The subject Length must be of al least 3 character!'),
    subject: z.string().min(1, 'Standard is mandatory'),
    seqNumber: z.string(),
    done: z.boolean().optional(),
    theory: z.boolean().optional(),
    shortNotes: z.boolean().optional(),
    mindMap: z.boolean().optional(),
    DPP1: z.boolean().optional(),
    DPP2: z.boolean().optional(),
    Module: z.boolean().optional(),
    PYQ_Mains: z.boolean().optional(),
    PYQ_Advanced: z.boolean().optional(),
    Book: z.boolean().optional(),
});
export const chapterValidationPUTSchema = z.object({
    _id: z.string(),
    data: z.object({
        name: z
            .string()
            .trim()
            .min(3, 'The subject Length must be of al least 3 character!').optional(),
        subject: z.string().min(1, 'Subject is mandatory').optional(),
        seqNumber: z.string().optional(),
        done: z.boolean().optional(),
        theory: z.boolean().optional(),
        shortNotes: z.boolean().optional(),
        mindMap: z.boolean().optional(),
        DPP1: z.boolean().optional(),
        DPP2: z.boolean().optional(),
        Module: z.boolean().optional(),
        PYQ_Mains: z.boolean().optional(),
        PYQ_Advanced: z.boolean().optional(),
        Book: z.boolean().optional(),
    })
});
export const chapterValidationSchemaBackend = z.object({
    name: z
        .string()
        .trim()
        .min(3, 'The subject Length must be of al least 3 character!'),
    subject: z.string().min(1, 'Standard is mandatory'),
    seqNumber: z.string().transform(Number),
    done: z.boolean().optional(),
    theory: z.boolean().optional(),
    shortNotes: z.boolean().optional(),
    mindMap: z.boolean().optional(),
    DPP1: z.boolean().optional(),
    DPP2: z.boolean().optional(),
    Module: z.boolean().optional(),
    PYQ_Mains: z.boolean().optional(),
    PYQ_Advanced: z.boolean().optional(),
    Book: z.boolean().optional(),
});

/**
 * ! PUT /api/chapters request body schema
 * @desc Validates a partial chapter update — `_id` identifies the target
 * document, and `data` carries only the fields the client wants to change.
 */
export const chapterValidationPUTSchemaBackend = z.object({
    // * The document being targeted for update
    _id: objectIdSchema,
 
    data: z
        .object({
            name: z
                .string()
                .trim()
                .min(3, 'Chapter name must be at least 3 characters long.')
                .optional(),
            // * Foreign-key reference to a Subject document — validated as a real ObjectId
            subject: objectIdSchema.optional(),
            // * Accepts either a numeric or numeric-string input and coerces to a number
            seqNumber: z.coerce.number().int().min(0, 'Sequence number cannot be negative.').optional(),
            done: z.boolean().optional(),
            theory: z.boolean().optional(),
            shortNotes: z.boolean().optional(),
            mindMap: z.boolean().optional(),
            DPP1: z.boolean().optional(),
            DPP2: z.boolean().optional(),
            Module: z.boolean().optional(),
            PYQ_Mains: z.boolean().optional(),
            PYQ_Advanced: z.boolean().optional(),
            Book: z.boolean().optional(),
        })
        // ! Reject an empty `data` object up front — forwarding `{ $set: {} }` to
        // ! MongoDB throws a confusing "no operations to update" error deep inside
        // ! the driver. Catching it here gives the client a clear, actionable message.
        .refine((fields) => Object.keys(fields).length > 0, {
            message: 'At least one field must be provided to update.',
        }),
});