import { z } from 'zod';

export const createCartSchema = z.object({
  kode_item: z.string().trim(),
  qty: z.number().min(1),
});

export type CreateCartDto = z.infer<typeof createCartSchema>;

export const updateActiveCart = z.object({
  cart_id: z.string().trim(),
  value: z.boolean(),
});

export type UpdateActiveCart = z.infer<typeof updateActiveCart>;

export const updateQuantity = z.object({
  cart_id: z.string(),
  kode_item: z.string(),
  qty: z.number().optional(),
  type: z.enum(['increment', 'decrement', 'input']),
});

export type UpdateQuantity = z.infer<typeof updateQuantity>;
