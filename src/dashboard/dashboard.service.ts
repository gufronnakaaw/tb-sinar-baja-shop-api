import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import {
  chunk,
  join,
  kebabCase,
  orderBy,
  replace,
  sortBy,
  trim,
  words,
} from 'lodash';
import path from 'path';
import { firstValueFrom } from 'rxjs';
import ShortUniqueId from 'short-unique-id';
import { ProductQuery } from '../products/product.dto';
import { GlobalResponse } from '../utils/global/global.response';
import { removeKeys } from '../utils/removekey.util';
import { PrismaService } from '../utils/services/prisma.service';
import {
  CreateBankDto,
  CreatePollingDto,
  KategoriPollingResponse,
  PenggunaPollingResponse,
  ProdukPollingResponse,
  UpdateBankDto,
  UpdatePollingDto,
} from './dashboard.dto';

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
          active: true,
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

  async searchProducts(query: ProductQuery) {
    const defaultPage = 1;
    const limit = 10;

    const page = parseInt(query.page) ? parseInt(query.page) : defaultPage;

    const skip = (page - 1) * limit;

    const [total, sync, products] = await this.prisma.$transaction([
      this.prisma.produk.count({
        where: {
          OR: [
            {
              kode_item: {
                contains: query.q,
              },
            },
            {
              nama_produk_asli: {
                contains: query.q,
              },
            },
            {
              merk: {
                contains: query.q,
              },
            },
            {
              tipe: {
                contains: query.q,
              },
            },
            {
              kategori: {
                contains: query.q,
              },
            },
          ],
        },
      }),
      this.prisma.sync.findFirst({
        where: { label: 'produk' },
        orderBy: { synchronized_at: 'desc' },
      }),
      this.prisma.produk.findMany({
        where: {
          OR: [
            {
              kode_item: {
                contains: query.q,
              },
            },
            {
              nama_produk_asli: {
                contains: query.q,
              },
            },
            {
              merk: {
                contains: query.q,
              },
            },
            {
              tipe: {
                contains: query.q,
              },
            },
            {
              kategori: {
                contains: query.q,
              },
            },
          ],
        },
        select: {
          kode_item: true,
          slug: true,
          nama_produk_asli: true,
          kategori: true,
          harga_6: true,
          total_stok: true,
          active: true,
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

  getProductByKodeItem(kode_item: string) {
    return this.prisma.produk.findUnique({
      where: {
        kode_item,
      },
      select: {
        kode_item: true,
        slug: true,
        nama_produk: true,
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
        berat: true,
        volume: true,
        merk: true,
        tipe: true,
        satuan_kecil: true,
        satuan_besar: true,
        isi_satuan_besar: true,
        deskripsi: true,
      },
    });
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
          nama_produk: trim(replace(item.nama_produk, /\s+/g, ' ')),
          nama_produk_asli: trim(replace(item.nama_produk_asli, /\s+/g, ' ')),
          nama_produk_sebutan: trim(
            replace(item.nama_produk_sebutan, /\s+/g, ' '),
          ),
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
          nama_produk: trim(replace(item.nama_produk, /\s+/g, ' ')),
          nama_produk_asli: trim(replace(item.nama_produk_asli, /\s+/g, ' ')),
          nama_produk_sebutan: trim(
            replace(item.nama_produk_sebutan, /\s+/g, ' '),
          ),
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

    const promises = [];

    for (const category of categories) {
      if (
        !(await this.prisma.kategori.findFirst({
          where: { nama: category.nama },
        }))
      ) {
        promises.push(
          this.prisma.kategori.create({ data: { nama: category.nama } }),
        );
      } else {
        promises.push(
          this.prisma.kategori.updateMany({
            where: { nama: category.nama },
            data: { nama: category.nama },
          }),
        );
      }
    }

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

  async syncOperators() {
    const productUrl = await this.prisma.polling.findMany({
      where: {
        label: 'pengguna',
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

    const { data }: GlobalResponse<PenggunaPollingResponse[]> = response.data;

    const promises = [];

    const userFilter = data.filter(
      (item) =>
        item.role.split(',').includes('owner') ||
        item.role.split(',').includes('admin'),
    );

    for (const user of userFilter) {
      if (
        !(await this.prisma.operator.findFirst({
          where: { username: user.username },
        }))
      ) {
        promises.push(
          this.prisma.operator.create({
            data: {
              ...removeKeys(user, ['created_at', 'updated_at']),
            },
          }),
        );
      } else {
        promises.push(
          this.prisma.operator.updateMany({
            where: { username: user.username },
            data: {
              ...removeKeys(user, ['created_at', 'updated_at']),
            },
          }),
        );
      }
    }

    await Promise.all(promises);

    await this.prisma.sync.create({
      data: {
        label: 'operator',
        synchronized_at: date,
      },
    });

    return {
      synchronized_at: date,
    };
  }

  getPolling() {
    return this.prisma.polling.findMany();
  }

  async createPolling(body: CreatePollingDto) {
    if (await this.prisma.polling.count({ where: { url: body.url } })) {
      throw new BadRequestException('Polling url already exits');
    }

    return this.prisma.polling.create({
      data: {
        url: body.url,
        label: body.label,
      },
    });
  }

  async updatePolling(body: UpdatePollingDto) {
    if (!(await this.prisma.polling.count({ where: { id: body.id } }))) {
      throw new NotFoundException('Polling url notfound');
    }

    return this.prisma.polling.update({
      where: {
        id: body.id,
      },
      data: {
        url: body.url,
        label: body.label,
      },
    });
  }

  async destroyPolling(id: string) {
    if (!(await this.prisma.polling.count({ where: { id: parseInt(id) } }))) {
      throw new NotFoundException('Polling url notfound');
    }

    return this.prisma.polling.delete({ where: { id: parseInt(id) } });
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

  async updateActive(params: {
    type: 'category' | 'product';
    kode_item?: string;
    nama_kategori?: string;
    value: boolean;
  }) {
    if (params.type == 'category') {
      await this.prisma.$transaction([
        this.prisma.produk.updateMany({
          where: {
            kategori: params.nama_kategori,
          },
          data: {
            active: params.value,
          },
        }),
        this.prisma.kategori.update({
          where: {
            nama: params.nama_kategori,
          },
          data: {
            active: params.value,
          },
        }),
      ]);

      return {
        nama_kategori: params.nama_kategori,
        category_active: params.value,
      };
    }

    await this.prisma.produk.update({
      where: { kode_item: params.kode_item },
      data: {
        active: params.value,
      },
    });

    return {
      kode_item: params.kode_item,
      product_active: params.value,
    };
  }

  async getBanks() {
    return this.prisma.bankAccount.findMany();
  }

  async createBank(body: CreateBankDto) {
    if (
      await this.prisma.bankAccount.count({
        where: { no_rekening: body.no_rekening },
      })
    ) {
      throw new BadRequestException('Already bank account');
    }

    const uid = new ShortUniqueId({ length: 10 });

    return this.prisma.bankAccount.create({
      data: {
        bank_id: uid.rnd(),
        no_rekening: body.no_rekening,
        atas_nama: body.atas_nama,
        bank: body.bank,
      },
      select: {
        bank_id: true,
      },
    });
  }

  async updateBank(body: UpdateBankDto) {
    if (
      !(await this.prisma.bankAccount.count({
        where: { bank_id: body.bank_id },
      }))
    ) {
      throw new NotFoundException('Bank account not found');
    }

    return this.prisma.bankAccount.update({
      where: {
        bank_id: body.bank_id,
      },
      data: {
        no_rekening: body.no_rekening,
        atas_nama: body.atas_nama,
        bank: body.bank,
      },
    });
  }

  async destroyBank(bank_id: string) {
    if (
      !(await this.prisma.bankAccount.count({
        where: { bank_id },
      }))
    ) {
      throw new NotFoundException('Bank account not found');
    }

    return this.prisma.bankAccount.delete({ where: { bank_id } });
  }

  async getOperators() {
    const [sync, operators] = await this.prisma.$transaction([
      this.prisma.sync.findFirst({
        where: { label: 'operator' },
        orderBy: { synchronized_at: 'desc' },
      }),
      this.prisma.operator.findMany(),
    ]);

    return {
      operators: operators.map((operator) => removeKeys(operator, ['id'])),
      last_synchronized: sync ? sync.synchronized_at : '0',
    };
  }

  async deleteOperator(username: string) {
    if (!(await this.prisma.operator.count({ where: { username } }))) {
      throw new NotFoundException('Operator not found');
    }

    return this.prisma.operator.delete({
      where: { username },
      select: { username: true },
    });
  }

  async getOperationals() {
    return this.prisma.operational.findMany();
  }
}
