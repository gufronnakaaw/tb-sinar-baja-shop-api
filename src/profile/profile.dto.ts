import { z } from 'zod';

export const updateProfileSchema = z.object({
  nama: z.string().trim().optional(),
  no_telpon: z
    .string()
    .regex(/^(?:\+62|62|0)8[1-9][0-9]{6,9}$/, {
      message: 'Nomor telepon not valid',
    })
    .trim()
    .optional(),
  tanggal_lahir: z.string().optional(),
  jenis_kelamin: z.enum(['P', 'W']).optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
