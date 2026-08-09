import { CreateSubjectSchema } from '@/schema/subject.schema';
import z from 'zod';

export type subjectSubjectType = z.infer<typeof CreateSubjectSchema>;
