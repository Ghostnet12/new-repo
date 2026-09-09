import { z } from 'zod';
import { dreamMoods, dreamVersion } from '../../../shared/dreams.js';
import { TEXT_LIMIT } from './limits.js';

export const dreamInput = z.object({
  text: z.string().trim().min(20, 'Add a little more detail—at least 20 characters.').max(TEXT_LIMIT),
  mood: z.enum(['', ...dreamMoods]).optional().default(''),
  context: z.string().trim().max(TEXT_LIMIT).optional().default('')
});
const prose = z.string().trim().min(10).max(2400);
export const dreamAnswer = z.object({
  title: z.string().trim().min(3).max(100),
  summary: prose,
  themes: z.array(z.object({ label: z.string().trim().min(2).max(70), detail: z.string().trim().min(3).max(200).optional(), observation: prose, question: z.string().trim().min(10).max(450) })).min(1).max(3),
  practice: z.string().trim().min(10).max(650),
  question: z.string().trim().min(10).max(450)
});
export const savedDreamReflection = dreamAnswer.extend({
  version: z.literal(dreamVersion),
  mode: z.enum(['ai', 'guided']),
  message: z.string().max(400)
});
export const dreamEntryId = z.string().uuid('This dream could not be identified. Please reopen your journal.');
export const dreamSaveInput = dreamInput.extend({
  entryId: dreamEntryId,
  reflection: savedDreamReflection.nullable().optional().default(null)
});
