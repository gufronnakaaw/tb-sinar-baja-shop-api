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
