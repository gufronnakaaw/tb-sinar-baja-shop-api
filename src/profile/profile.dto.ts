import { z } from 'zod';

export type ProfileQuery = {
  address_id?: string;
};

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

export const createAddressSchema = z.object({
  nama_penerima: z.string(),
  no_telpon: z.string(),
  provinsi: z.string(),
  kota: z.string(),
  kecamatan: z.string(),
  alamat_lengkap: z.string(),
  label: z.string(),
  kode_pos: z.string(),
  main_address: z.boolean().optional(),
});

export type CreateAddressDto = z.infer<typeof createAddressSchema>;

export const updateAddressSchema = z.object({
  address_id: z.string(),
  nama_penerima: z.string().optional(),
  no_telpon: z.string().optional(),
  provinsi: z.string().optional(),
  kota: z.string().optional(),
  kecamatan: z.string().optional(),
  alamat_lengkap: z.string().optional(),
  label: z.string().optional(),
  kode_pos: z.string().optional(),
  main_address: z.boolean().optional(),
});

export type UpdateAddressDto = z.infer<typeof updateAddressSchema>;
