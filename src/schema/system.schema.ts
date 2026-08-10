import z from "zod";
import { objectIdSchema } from "./schema";


export const addChapterToSystem = z
    .object({
        _id: objectIdSchema,
    });
export const systemPUTRequestSchema = z
    .object({
        type: z.enum(["addChapterToSystem", "markChapterAsUnfinished", "markChapterAsUpComing"]),
        _id: objectIdSchema.optional(),
    });
