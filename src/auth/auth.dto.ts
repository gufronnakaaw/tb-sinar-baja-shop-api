import { z } from 'zod';

export const loginOperatorSchema = z.object({
  username: z.string().trim(),
  password: z.string().trim(),
});

export type LoginOperatorDto = z.infer<typeof loginOperatorSchema>;

export const loginUserSchema = z.object({
  email: z
    .string()
    .email({
      message: 'Email tidak valid',
    })
    .trim(),
  password: z.string().trim(),
});

export type LoginUserDto = z.infer<typeof loginUserSchema>;

export const registerUserSchema = z.object({
  nama: z.string().trim(),
  email: z
    .string()
    .email({
      message: 'Email not valid',
    })
    .trim(),
  no_telpon: z
    .string()
    .regex(/^(?:\+62|62|0)8[1-9][0-9]{6,9}$/, {
      message: 'Nomor telepon not valid',
    })
    .trim(),
  password: z.string().trim(),
});

export type RegisterUserDto = z.infer<typeof registerUserSchema>;
