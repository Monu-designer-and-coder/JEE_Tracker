import z from "zod";


// * Reusable check for a valid MongoDB ObjectId string (24 hex characters).
// * Kept dependency-light (no `mongoose` import) since this file may run in
// * contexts where pulling in the full driver isn't desirable.
const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Must be a valid Mongo ObjectId.');

export const addChapterToSystem = z
    .object({
        _id: objectIdSchema,
    });
export const systemPUTRequestSchema = z
    .object({
        type: z.enum(["addChapterToSystem", "markChapterAsUnfinished", "markChapterAsUpComing"]),
        _id: objectIdSchema.optional(),
    });
