import { z } from 'zod';

export const createCartSchema = z.object({
  kode_item: z.string().trim(),
  qty: z.number().min(1),
});

export type CreateCartDto = z.infer<typeof createCartSchema>;
