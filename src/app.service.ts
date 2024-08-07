import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { chunk, join, kebabCase, orderBy, sortBy, trim, words } from 'lodash';
import { firstValueFrom } from 'rxjs';
import { KategoriPollingResponse, ProdukPollingResponse } from './app.dto';
import { GlobalResponse } from './utils/global/global.response';
import { PrismaService } from './utils/services/prisma.service';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private readonly httpService: HttpService,
  ) {}

  async syncProducts() {
    const productUrl = await this.prisma.polling.findMany({
      where: {
        label: 'produk',
      },
      select: {
        url: true,
      },
    });

    if (!productUrl.length) {
      throw new NotFoundException('Polling url not found!');
    }

    const date = new Date();

    const response = await firstValueFrom(
      this.httpService.get(productUrl[0].url),
    );

    const { data }: GlobalResponse<{ produk: ProdukPollingResponse[] }> =
      response.data;

    const batches = chunk(orderBy(data.produk, ['created_at']), 50);

    for (const batch of batches) {
      const promises = batch.map((item) => {
        const produk = {
          barcode: item.barcode,
          kode_pabrik: item.kode_pabrik,
          kode_toko: item.kode_toko,
          kode_supplier: item.kode_supplier,
          nama_produk: join(words(trim(item.nama_produk)), ' '),
          nama_produk_asli: join(words(trim(item.nama_produk_asli)), ' '),
          nama_produk_sebutan: join(words(trim(item.nama_produk_sebutan)), ' '),
          harga_1: item.harga_1,
          harga_2: item.harga_2,
          harga_3: item.harga_3,
          harga_4: item.harga_4,
          harga_5: item.harga_5,
          harga_6: item.harga_6,
          harga_pokok: item.harga_pokok,
          harga_diskon: item.harga_diskon,
          berat: item.berat,
          volume: item.volume,
          konversi: item.konversi,
          isi_satuan_besar: item.isi_satuan_besar,
          merk: item.merk,
          satuan_besar: item.satuan_besar,
          satuan_kecil: item.satuan_kecil,
          tipe: item.tipe,
          slug: kebabCase(join(words(trim(item.nama_produk_asli)), ' ')),
          kategori: item.kategori,
          subkategori: item.subkategori,
          kode_item: item.kode_item,
          total_stok: item.total_stok,
        };

        return this.prisma.produk.upsert({
          where: {
            kode_item: item.kode_item,
          },
          create: {
            ...produk,
          },
          update: {
            ...produk,
          },
        });
      });

      await Promise.all(promises);
    }

    await this.prisma.sync.create({
      data: {
        label: 'produk',
        synchronized_at: date,
      },
    });

    return {
      synchronized: true,
    };
  }

  async syncProductByCategories(id_kategori: string) {
    const productUrl = await this.prisma.polling.findMany({
      where: {
        label: 'produk',
      },
      select: {
        url: true,
      },
    });

    if (!productUrl.length) {
      throw new NotFoundException('Polling url not found!');
    }

    const date = new Date();

    const response = await firstValueFrom(
      this.httpService.get(productUrl[0].url),
    );

    const { data }: GlobalResponse<{ produk: ProdukPollingResponse[] }> =
      response.data;

    const filter = data.produk.filter((item) => item.kategori == id_kategori);

    const batches = chunk(orderBy(filter, ['created_at']), 50);

    for (const batch of batches) {
      const promises = batch.map((item) => {
        const produk = {
          barcode: item.barcode,
          kode_pabrik: item.kode_pabrik,
          kode_toko: item.kode_toko,
          kode_supplier: item.kode_supplier,
          nama_produk: join(words(trim(item.nama_produk)), ' '),
          nama_produk_asli: join(words(trim(item.nama_produk_asli)), ' '),
          nama_produk_sebutan: join(words(trim(item.nama_produk_sebutan)), ' '),
          harga_1: item.harga_1,
          harga_2: item.harga_2,
          harga_3: item.harga_3,
          harga_4: item.harga_4,
          harga_5: item.harga_5,
          harga_6: item.harga_6,
          harga_pokok: item.harga_pokok,
          harga_diskon: item.harga_diskon,
          berat: item.berat,
          volume: item.volume,
          konversi: item.konversi,
          isi_satuan_besar: item.isi_satuan_besar,
          merk: item.merk,
          satuan_besar: item.satuan_besar,
          satuan_kecil: item.satuan_kecil,
          tipe: item.tipe,
          slug: kebabCase(join(words(trim(item.nama_produk_asli)), ' ')),
          kategori: item.kategori,
          subkategori: item.subkategori,
          kode_item: item.kode_item,
          total_stok: item.total_stok,
        };

        return this.prisma.produk.upsert({
          where: {
            kode_item: item.kode_item,
          },
          create: {
            ...produk,
          },
          update: {
            ...produk,
          },
        });
      });

      await Promise.all(promises);
    }

    await this.prisma.sync.create({
      data: {
        label: 'produk',
        synchronized_at: date,
      },
    });

    return {
      synchronized: true,
    };
  }

  async syncCategories() {
    const productUrl = await this.prisma.polling.findMany({
      where: {
        label: 'kategori',
      },
      select: {
        url: true,
      },
    });

    if (!productUrl.length) {
      throw new NotFoundException('Polling url not found!');
    }

    const date = new Date();

    const response = await firstValueFrom(
      this.httpService.get(productUrl[0].url),
    );

    const { data }: GlobalResponse<KategoriPollingResponse[]> = response.data;

    const categories = sortBy(data, ['id_kategori']);

    const promises = categories.map((item) =>
      this.prisma.kategori.upsert({
        where: {
          id: item.id_kategori,
        },
        create: {
          nama: item.nama,
        },
        update: {
          nama: item.nama,
        },
      }),
    );

    await Promise.all(promises);

    await this.prisma.sync.create({
      data: {
        label: 'kategori',
        synchronized_at: date,
      },
    });

    return {
      synchronized: true,
    };
  }

  polling() {
    return this.prisma.polling.findMany();
  }

  async getHomepage() {
    const [banners, products] = await this.prisma.$transaction([
      this.prisma.banner.findMany(),
      this.prisma.produk.findMany({
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
}
