import { z } from 'zod';

export const loginOperatorSchema = z.object({
  username: z.string().trim(),
  password: z.string().trim(),
});

export type LoginOperatorDto = z.infer<typeof loginOperatorSchema>;

export const loginUserSchema = z.object({
  email: z.string().email().trim(),
  password: z.string().trim(),
});

export type LoginUserDto = z.infer<typeof loginUserSchema>;
