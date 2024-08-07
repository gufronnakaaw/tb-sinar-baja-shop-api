import { z } from 'zod';

export const loginOperatorSchema = z.object({
  username: z.string().trim(),
  password: z.string().trim(),
});

export type LoginOperatorDto = z.infer<typeof loginOperatorSchema>;
