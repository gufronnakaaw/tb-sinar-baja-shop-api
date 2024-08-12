import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { RegionalPollingResponse } from './app.dto';
import { removeKeys } from './utils/removekey.util';
import { PrismaService } from './utils/services/prisma.service';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async getHomepage() {
    const [banners, products] = await this.prisma.$transaction([
      this.prisma.banner.findMany({
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.produk.findMany({
        where: {
          active: true,
          harga_6: {
            gt: 0,
          },
          total_stok: {
            gt: 0,
          },
        },
        select: {
          kode_item: true,
          slug: true,
          nama_produk: true,
          nama_produk_asli: true,
          kategori: true,
          harga_1: true,
          harga_2: true,
          harga_3: true,
          harga_4: true,
          harga_5: true,
          harga_6: true,
          image: {
            select: {
              url: true,
            },
            orderBy: {
              created_at: 'desc',
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        take: 14,
      }),
    ]);

    return {
      banners,
      newest: products,
    };
  }

  async getProvinces() {
    const response = await firstValueFrom(
      this.httpService.get('https://wilayah.id/api/provinces.json'),
    );

    const { data }: { data: RegionalPollingResponse[] } = response.data;

    return data.map((item) => {
      return removeKeys(item, ['coordinates', 'google_place_id']);
    });
  }

  async getRegencies(code: string) {
    const response = await firstValueFrom(
      this.httpService.get(`https://wilayah.id/api/regencies/${code}.json`),
    );

    const { data }: { data: RegionalPollingResponse[] } = response.data;

    return data.map((item) => {
      return removeKeys(item, ['coordinates', 'google_place_id']);
    });
  }

  async getDistricts(code: string) {
    const response = await firstValueFrom(
      this.httpService.get(`https://wilayah.id/api/districts/${code}.json`),
    );

    const { data }: { data: RegionalPollingResponse[] } = response.data;

    return data.map((item) => {
      return removeKeys(item, ['coordinates', 'google_place_id']);
    });
  }

  getCategories() {
    return this.prisma.kategori.findMany({
      orderBy: {
        nama: 'asc',
      },
    });
  }
}
