

import { objectIdSchema } from '@/schema/schema';
import z from 'zod';

export type objectIdType = z.infer<typeof objectIdSchema>;