import { z } from 'zod';

export const QuestionStreakPostSchema = z.object({
    date: z.coerce.date({
        error: "A valid calendar date structure string is required",
    }),
    subject: z.string().min(1, 'Subject database relational tracking mapping string reference ID is required'),
});

export const QuestionStreakGetSchema = z.object({
    date: z.coerce.date().optional(),
    subject: z.string().optional(),
    page: z.string().transform(Number).default(1),
    limit: z.string().transform(Number).default(10),
});

export const QuestionStreakPlusOneSchema = z.object({
    _id: z.string().min(1, 'Streak record identifier object string validation key missing'),
});

// ! IMPROVEMENTS IMPLEMENTED:
// * 1. PascalCased all structural runtime data validation declarations (QuestionStreakPostSchema, QuestionStreakGetSchema).
// * 2. Upgraded standard string validations to target type coercions via z.coerce.date() to properly absorb variable payloads.
// * 3. Integrated data transform mechanisms dynamically generating standardized numeric definitions for pagination structures.

// ! PERFORMANCE OPTIMIZATIONS MAINTAINED:
// * 1. Safe parsing structures process schema errors on computing edge runtimes ahead of resource allocation requests.

// ! FUTURE IMPROVEMENTS:
// TODO: Extend string schema checks to execute native string matching confirmations against regular hexadecimal MongoDB Object IDs.