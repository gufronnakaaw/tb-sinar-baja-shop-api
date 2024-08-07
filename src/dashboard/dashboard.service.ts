import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import { chunk, join, kebabCase, orderBy, sortBy, trim, words } from 'lodash';
import path from 'path';
import { firstValueFrom } from 'rxjs';
import { KategoriPollingResponse, ProdukPollingResponse } from 'src/app.dto';
import { GlobalResponse } from 'src/utils/global/global.response';
import { ProductQuery } from '../products/product.dto';
import { PrismaService } from '../utils/services/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async getProducts(query: ProductQuery) {
    const defaultPage = 1;
    const limit = 10;

    const page = parseInt(query.page) ? parseInt(query.page) : defaultPage;

    const skip = (page - 1) * limit;

    const [total, sync, products] = await this.prisma.$transaction([
      this.prisma.produk.count(),
      this.prisma.sync.findFirst({
        where: { label: 'produk' },
        orderBy: { synchronized_at: 'desc' },
      }),
      this.prisma.produk.findMany({
        select: {
          kode_item: true,
          slug: true,
          nama_produk_asli: true,
          kategori: true,
          harga_6: true,
          total_stok: true,
          image: {
            select: {
              url: true,
            },
            orderBy: {
              created_at: 'desc',
            },
          },
          deskripsi: true,
        },
        take: limit,
        skip,
      }),
    ]);
    return {
      products,
      last_synchronized: sync.synchronized_at,
      total_items: total,
    };
  }

  async getProductBySlug(slug: string) {
    if (!slug) {
      return {};
    }

    const product = await this.prisma.produk.findMany({
      where: {
        slug,
      },
      select: {
        kode_item: true,
        slug: true,
        nama_produk_asli: true,
        kategori: true,
        harga_6: true,
        total_stok: true,
        image: {
          select: {
            url: true,
          },
          orderBy: {
            created_at: 'desc',
          },
        },
        deskripsi: true,
      },
    });

    return product[0];
  }

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
      synchronized_at: date,
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
      synchronized_at: date,
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
      synchronized_at: date,
    };
  }

  polling() {
    return this.prisma.polling.findMany();
  }

  getBanners() {
    return this.prisma.banner.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  createBanner(file: Express.Multer.File, url: string) {
    return this.prisma.banner.create({
      data: {
        url: url + '/' + file.path.split(path.sep).join('/'),
      },
    });
  }

  async deleteBanner(id: number, url: string) {
    const banner = await this.prisma.banner.findUnique({
      where: {
        id,
      },
      select: {
        url: true,
      },
    });

    if (!banner) {
      throw new NotFoundException('Image not found!');
    }

    const split = banner.url.split(url);

    const path = split[split.length - 1];

    if (existsSync(`.${path}`)) {
      await unlink(`.${path}`);
    }

    return this.prisma.banner.delete({
      where: {
        id,
      },
    });
  }

  async getCategories() {
    const [sync, categories] = await this.prisma.$transaction([
      this.prisma.sync.findFirst({
        where: { label: 'kategori' },
        orderBy: { synchronized_at: 'desc' },
      }),
      this.prisma.kategori.findMany({
        orderBy: {
          nama: 'asc',
        },
      }),
    ]);

    return {
      categories,
      last_synchronized: sync.synchronized_at,
    };
  }

  async createImage(
    file: Express.Multer.File,
    url: string,
    kode_item: string,
    deskripsi: string,
  ) {
    if (!file) {
      return this.prisma.produk.update({
        where: {
          kode_item,
        },
        data: {
          deskripsi,
        },
      });
    }

    return this.prisma.$transaction([
      this.prisma.produk.update({
        where: {
          kode_item,
        },
        data: {
          deskripsi,
        },
      }),
      this.prisma.image.create({
        data: {
          kode_item,
          url: url + '/' + file.path.split(path.sep).join('/'),
        },
      }),
    ]);
  }

  async deleteImage(id: number, url: string) {
    const image = await this.prisma.image.findUnique({
      where: {
        id,
      },
      select: {
        url: true,
      },
    });

    if (!image) {
      throw new NotFoundException('Image not found!');
    }

    const split = image.url.split(url);

    const path = split[split.length - 1];

    if (existsSync(`.${path}`)) {
      await unlink(`.${path}`);
    }

    return this.prisma.image.delete({
      where: {
        id,
      },
    });
  }
}
