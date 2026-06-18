import { z } from 'zod';

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
        subject: z.string().min(1, 'Standard is mandatory').optional(),
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
// * Reusable check for a valid MongoDB ObjectId string (24 hex characters).
// * Kept dependency-light (no `mongoose` import) since this file may run in
// * contexts where pulling in the full driver isn't desirable.
const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Must be a valid Mongo ObjectId.');
 
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
 
// ! IMPROVEMENTS IMPLEMENTED:
// * 1. Added a reusable `objectIdSchema` and applied it to both `_id` and `subject`,
// *    so malformed ids fail fast here with a clear 400 instead of surfacing later
// *    as a raw Mongoose `CastError`.
// * 2. Fixed a copy-paste bug in the `name` field's error message — it previously
// *    referenced "subject Length" (wrong field) and contained a typo, "al least".
// * 3. Replaced `.transform(Number)` with `z.coerce.number().int().min(0, ...)` on
// *    `seqNumber` for stricter, more descriptive validation (also rejects negatives
// *    and non-integers, which `transform(Number)` alone would silently accept/NaN on).
// * 4. Added a `.refine()` guard rejecting an empty `data` object, preventing a
// *    confusing downstream MongoDB error for a client mistake that's cheap to catch here.
 
// ! PERFORMANCE OPTIMIZATIONS MAINTAINED:
// * 1. Validation remains fully synchronous and dependency-light — no `mongoose`
// *    import needed just to check ObjectId shape.
 
// ! FUTURE IMPROVEMENTS:
// TODO: Extract `objectIdSchema` into a shared validation utils file and reuse it
//       across the chapter/topic/subject validation schemas instead of redefining it.
// TODO: True `seqNumber` uniqueness can't be verified from this file alone — it
//       still relies on the database-level unique index plus the PUT route's
//       E11000 error handling to catch conflicts.