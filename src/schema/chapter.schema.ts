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
export const chapterValidationPUTSchemaBackend = z.object({
    _id: z.string(),
    data: z.object({
        name: z
            .string()
            .trim()
            .min(3, 'The subject Length must be of al least 3 character!').optional(),
        subject: z.string().min(1, 'Standard is mandatory').optional(),
        seqNumber: z.string().transform(Number).optional(),
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