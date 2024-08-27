import { z } from 'zod';

export const createTransactionSchema = z.object({
  type: z.enum(['pickup', 'delivery']),
  bank: z.object({
    atas_nama: z.string(),
    bank: z.string(),
    no_rekening: z.string(),
  }),
  products: z.array(
    z.object({
      nama_produk_asli: z.string(),
      kode_item: z.string(),
      kategori: z.string(),
      harga: z.number(),
      quantity: z.number(),
      subtotal_produk: z.number(),
    }),
  ),
  address: z
    .object({
      id: z.number(),
      address_id: z.string(),
      user_id: z.string(),
      nama_penerima: z.string(),
      no_telpon: z.string(),
      provinsi: z.string(),
      kota: z.string(),
      kecamatan: z.string(),
      alamat_lengkap: z.string(),
      label: z.string(),
      kode_pos: z.string(),
      main_address: z.boolean(),
    })
    .optional(),
  subtotal_ongkir: z.number(),
  total: z.number(),
});

export type CreateTransactionDto = z.infer<typeof createTransactionSchema>;
