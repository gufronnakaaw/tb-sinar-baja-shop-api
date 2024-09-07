import { z } from 'zod';

export type ProdukPollingResponse = {
  kode_item: string;
  barcode: string;
  kode_pabrik: string;
  kode_toko: string;
  kode_supplier: string;
  nama_produk: string;
  nama_produk_asli: string;
  nama_produk_sebutan: string;
  merk: string;
  tipe: string;
  satuan_besar: string;
  satuan_kecil: string;
  isi_satuan_besar: string;
  konversi: number;
  harga_pokok: number;
  harga_1: number;
  harga_2: number;
  harga_3: number;
  harga_4: number;
  harga_5: number;
  harga_6: number;
  harga_diskon: number;
  berat: number;
  volume: number;
  created_at: string;
  updated_at: string;
  subkategori: string;
  kategori: string;
  gudang: {
    stok: number;
    stok_aman: number;
    rak: string;
    nama: string;
    kode_gudang: string;
    status_stok: string;
  }[];
  total_stok: number;
  total_stok_aman: number;
};

export type KategoriPollingResponse = {
  id_kategori: number;
  nama: string;
  created_at: string;
  updated_at: string;
};

export type PenggunaPollingResponse = {
  username: string;
  nama: string;
  password_hash: string;
  password_encrypt: string;
  role: string;
  created_at: string;
  updated_at: string;
};

export const updateActive = z.object({
  kode_item: z.string().trim().optional(),
  nama_kategori: z.string().trim().optional(),
  value: z.boolean(),
});

export type UpdateActive = z.infer<typeof updateActive>;

export const createBankSchema = z.object({
  no_rekening: z.string(),
  atas_nama: z.string(),
  bank: z.string(),
});

export type CreateBankDto = z.infer<typeof createBankSchema>;

export const updateBankSchema = z.object({
  bank_id: z.string(),
  no_rekening: z.string().optional(),
  atas_nama: z.string().optional(),
  bank: z.string().optional(),
});

export type UpdateBankDto = z.infer<typeof updateBankSchema>;

export const createPollingSchema = z.object({
  url: z.string(),
  label: z.enum(['pengguna', 'produk', 'kategori']),
});

export type CreatePollingDto = z.infer<typeof createPollingSchema>;

export const updatePollingSchema = z.object({
  id: z.number(),
  url: z.string().optional(),
  label: z.enum(['pengguna', 'produk', 'kategori']).optional(),
});

export type UpdatePollingDto = z.infer<typeof updatePollingSchema>;

export const updateCostSchema = z.object({
  transaksi_id: z.string(),
  subtotal_ongkir: z.number(),
});

export type UpdateCostDto = z.infer<typeof updateCostSchema>;

export type TransactionQuery = {
  status:
    | 'waitrep'
    | 'waituser'
    | 'paypend'
    | 'payverif'
    | 'process'
    | 'done'
    | 'canceled';
  page: string;
};

export const updateVerificationSchema = z.object({
  transaksi_id: z.string(),
  is_verification: z.boolean(),
});

export type UpdateVerificationDto = z.infer<typeof updateVerificationSchema>;

export const updateDoneSchema = z.object({
  transaksi_id: z.string(),
  is_done: z.boolean(),
});

export type UpdateDoneDto = z.infer<typeof updateDoneSchema>;

export const updateCancelSchema = z.object({
  transaksi_id: z.string(),
  is_cancel: z.boolean(),
  alasan: z.string().optional(),
  type: z.enum(['transaksi', 'pembayaran']),
});

export type UpdateCancelDto = z.infer<typeof updateCancelSchema>;

export const createOperationalSchema = z
  .array(
    z.object({
      hari: z.string(),
      open: z.string(),
      close: z.string(),
    }),
  )
  .min(7);

export type CreateOperationalDto = z.infer<typeof createOperationalSchema>;
