import { Injectable, NotFoundException } from '@nestjs/common';
import ShortUniqueId from 'short-unique-id';
import { removeKeys } from '../utils/removekey.util';
import { PrismaService } from '../utils/services/prisma.service';
import {
  CreateAddressDto,
  UpdateAddressDto,
  UpdateProfileDto,
} from './profile.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(user_id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        user_id,
      },
      select: {
        nama: true,
        email: true,
      },
    });

    return {
      ...user,
      total_transaction: await this.prisma.transaksi.count({
        where: { user_id },
      }),
    };
  }

  getProfileDetail(user_id: string) {
    return this.prisma.user.findUnique({
      where: {
        user_id,
      },
      select: {
        nama: true,
        tanggal_lahir: true,
        jenis_kelamin: true,
        email: true,
        no_telpon: true,
      },
    });
  }

  async updateProfile(body: UpdateProfileDto, user_id: string) {
    return removeKeys(
      await this.prisma.user.update({
        where: {
          user_id,
        },
        data: {
          nama: body.nama,
          jenis_kelamin: body.jenis_kelamin,
          no_telpon: body.no_telpon,
          tanggal_lahir: body.tanggal_lahir,
        },
      }),
      ['id'],
    );
  }

  async getAddressById(address_id: string, user_id: string) {
    const address = await this.prisma.address.findUnique({
      where: { address_id, user_id },
    });

    return removeKeys(address, ['id']);
  }

  async getAddress(user_id: string) {
    const address = await this.prisma.address.findMany({
      where: { user_id },
      orderBy: { id: 'desc' },
    });

    return address.map((item) => removeKeys(item, ['id']));
  }

  async deleteAddress(address_id: string, user_id: string) {
    const address = await this.prisma.address.count({
      where: { address_id, user_id },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return this.prisma.address.delete({
      where: { address_id, user_id },
      select: {
        address_id: true,
        user_id: true,
      },
    });
  }

  async createAddress(body: CreateAddressDto, user_id: string) {
    const uid = new ShortUniqueId({ length: 10 });

    return this.prisma.address.create({
      data: {
        address_id: uid.rnd(),
        user_id,
        nama_penerima: body.nama_penerima,
        no_telpon: body.no_telpon,
        provinsi: body.provinsi,
        kota: body.kota,
        kecamatan: body.kecamatan,
        alamat_lengkap: body.alamat_lengkap,
        kode_pos: body.kode_pos,
        label: body.label,
        main_address: false,
      },
      select: {
        address_id: true,
        user_id: true,
      },
    });
  }

  updateAddress(body: UpdateAddressDto, user_id: string) {
    return this.prisma.address.update({
      where: {
        address_id: body.address_id,
        user_id,
      },
      data: {
        user_id,
        nama_penerima: body.nama_penerima,
        no_telpon: body.no_telpon,
        provinsi: body.provinsi,
        kota: body.kota,
        kecamatan: body.kecamatan,
        alamat_lengkap: body.alamat_lengkap,
        kode_pos: body.kode_pos,
        label: body.label,
        main_address: false,
      },
      select: {
        address_id: true,
        user_id: true,
      },
    });
  }
}
