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
