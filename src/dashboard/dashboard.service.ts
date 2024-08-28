import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  ForbiddenException,
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
  TransactionQuery,
  UpdateBankDto,
  UpdateCancelDto,
  UpdateCostDto,
  UpdateDoneDto,
  UpdatePollingDto,
  UpdateVerificationDto,
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

  async getTransactions(query: TransactionQuery) {
    const defaultPage = 1;
    const limit = 10;

    const page = parseInt(query.page) ? parseInt(query.page) : defaultPage;

    const skip = (page - 1) * limit;

    const status = !query.status ? 'waitrep' : query.status;

    if (status == 'waitrep') {
      const [total, transactions] = await this.prisma.$transaction([
        this.prisma.transaksi.count({
          where: {
            payment: {
              status: 'draft',
            },
            replied: false,
          },
        }),
        this.prisma.transaksi.findMany({
          where: {
            payment: {
              status: 'draft',
            },
            replied: false,
          },
          select: {
            transaksi_id: true,
            nama_penerima: true,
            total: true,
            type: true,
            created_at: true,
          },
          orderBy: {
            created_at: 'desc',
          },
          take: limit,
          skip,
        }),
      ]);

      return {
        transactions,
        total,
      };
    }

    if (status == 'waituser') {
      const [total, transactions] = await this.prisma.$transaction([
        this.prisma.transaksi.count({
          where: {
            payment: {
              status: 'draft',
            },
            replied: true,
          },
        }),
        this.prisma.transaksi.findMany({
          where: {
            payment: {
              status: 'draft',
            },
            replied: true,
          },
          select: {
            transaksi_id: true,
            nama_penerima: true,
            total: true,
            type: true,
            created_at: true,
          },
          orderBy: {
            created_at: 'desc',
          },
          take: limit,
          skip,
        }),
      ]);

      return {
        transactions,
        total,
      };
    }

    if (status == 'paypend') {
      const [total, transactions] = await this.prisma.$transaction([
        this.prisma.transaksi.count({
          where: {
            payment: {
              status: 'pending',
            },
          },
        }),
        this.prisma.transaksi.findMany({
          where: {
            payment: {
              status: 'pending',
            },
          },
          select: {
            transaksi_id: true,
            nama_penerima: true,
            total: true,
            type: true,
            created_at: true,
          },
          orderBy: {
            created_at: 'desc',
          },
          take: limit,
          skip,
        }),
      ]);

      return {
        transactions,
        total,
      };
    }

    if (status == 'payverif') {
      const [total, transactions] = await this.prisma.$transaction([
        this.prisma.transaksi.count({
          where: {
            payment: {
              status: 'paid',
            },
          },
        }),
        this.prisma.transaksi.findMany({
          where: {
            payment: {
              status: 'paid',
            },
          },
          select: {
            transaksi_id: true,
            nama_penerima: true,
            total: true,
            type: true,
            created_at: true,
          },
          orderBy: {
            created_at: 'desc',
          },
          take: limit,
          skip,
        }),
      ]);

      return {
        transactions,
        total,
      };
    }

    if (status == 'process') {
      const [total, transactions] = await this.prisma.$transaction([
        this.prisma.transaksi.count({
          where: {
            status: 'process',
          },
        }),
        this.prisma.transaksi.findMany({
          where: {
            status: 'process',
          },
          select: {
            transaksi_id: true,
            nama_penerima: true,
            total: true,
            type: true,
            created_at: true,
          },
          orderBy: {
            created_at: 'desc',
          },
          take: limit,
          skip,
        }),
      ]);

      return {
        transactions,
        total,
      };
    }

    if (status == 'done') {
      const [total, transactions] = await this.prisma.$transaction([
        this.prisma.transaksi.count({
          where: {
            status: 'done',
          },
        }),
        this.prisma.transaksi.findMany({
          where: {
            status: 'done',
          },
          select: {
            transaksi_id: true,
            nama_penerima: true,
            total: true,
            type: true,
            created_at: true,
          },
          orderBy: {
            created_at: 'desc',
          },
          take: limit,
          skip,
        }),
      ]);

      return {
        transactions,
        total,
      };
    }

    if (status == 'canceled') {
      const [total, transactions] = await this.prisma.$transaction([
        this.prisma.transaksi.count({
          where: {
            OR: [
              {
                status: 'canceled',
              },
              {
                payment: {
                  status: 'canceled',
                },
              },
            ],
          },
        }),
        this.prisma.transaksi.findMany({
          where: {
            OR: [
              {
                status: 'canceled',
              },
              {
                payment: {
                  status: 'canceled',
                },
              },
            ],
          },
          select: {
            transaksi_id: true,
            nama_penerima: true,
            total: true,
            type: true,
            created_at: true,
            alasan: true,
            payment: {
              select: {
                alasan: true,
              },
            },
          },
          orderBy: {
            created_at: 'desc',
          },
          take: limit,
          skip,
        }),
      ]);

      return {
        transactions,
        total,
      };
    }
  }

  async updateCost(body: UpdateCostDto) {
    const transaction = await this.prisma.transaksi.findUnique({
      where: { transaksi_id: body.transaksi_id },
      select: {
        type: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.type != 'delivery') {
      throw new ForbiddenException('Forbidden resource');
    }

    await this.prisma.transaksi.update({
      where: {
        transaksi_id: body.transaksi_id,
      },
      data: {
        subtotal_ongkir: body.subtotal_ongkir,
        replied: true,
      },
    });

    return body;
  }

  async updateVerification(body: UpdateVerificationDto) {
    const transaction = await this.prisma.transaksi.findUnique({
      where: { transaksi_id: body.transaksi_id },
      select: {
        type: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (body.is_verification) {
      await this.prisma.transaksi.update({
        where: {
          transaksi_id: body.transaksi_id,
        },
        data: {
          status: 'process',
          payment: {
            update: {
              status: 'done',
            },
          },
        },
      });
    }

    return body;
  }

  async updateDone(body: UpdateDoneDto) {
    const transaction = await this.prisma.transaksi.findUnique({
      where: { transaksi_id: body.transaksi_id },
      select: {
        type: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (body.is_done) {
      await this.prisma.transaksi.update({
        where: {
          transaksi_id: body.transaksi_id,
        },
        data: {
          status: 'done',
        },
      });
    }

    return body;
  }

  async updateCancel(body: UpdateCancelDto) {
    const transaction = await this.prisma.transaksi.findUnique({
      where: { transaksi_id: body.transaksi_id },
      select: {
        type: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (body.is_cancel) {
      if (body.type == 'pembayaran') {
        await this.prisma.payment.update({
          where: {
            transaksi_id: body.transaksi_id,
          },
          data: {
            status: 'canceled',
            alasan: body.alasan,
            expired: null,
          },
        });
      }

      if (body.type == 'transaksi') {
        await this.prisma.transaksi.update({
          where: {
            transaksi_id: body.transaksi_id,
          },
          data: {
            status: 'canceled',
            alasan: body.alasan,
          },
        });
      }
    }

    return body;
  }

  async getDashboard() {
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));

    const [transactions, delivery] = await this.prisma.$transaction([
      this.prisma.transaksi.findMany({
        where: {
          created_at: {
            gte: start,
            lte: end,
          },
        },
        select: {
          total: true,
        },
      }),
      this.prisma.transaksi.findMany({
        where: {
          AND: [
            {
              created_at: {
                gte: start,
                lte: end,
              },
            },
            { type: 'delivery' },
          ],
        },
        select: {
          total: true,
        },
      }),
    ]);

    return {
      transactions: {
        amount: transactions.length,
        total: transactions.reduce((a, b) => a + b.total, 0),
      },
      delivery: {
        amount: delivery.length,
        total: delivery.reduce((a, b) => a + b.total, 0),
      },
    };
  }

  async getTransactionTabs() {
    const transactions = await this.prisma.transaksi.findMany({
      select: {
        status: true,
        replied: true,
        payment: { select: { status: true } },
      },
    });

    return {
      waitrep: transactions.filter(
        (item) => item.payment.status == 'draft' && !item.replied,
      ).length,
      waituser: transactions.filter(
        (item) => item.payment.status == 'draft' && item.replied,
      ).length,
      paypend: transactions.filter((item) => item.payment.status == 'pending')
        .length,
      payverif: transactions.filter((item) => item.payment.status == 'paid')
        .length,
      process: transactions.filter((item) => item.status == 'process').length,
      done: transactions.filter((item) => item.status == 'done').length,
      canceled: transactions.filter(
        (item) =>
          item.status == 'canceled' || item.payment.status == 'canceled',
      ).length,
    };
  }

  async getTransactionDetail(transaksi_id: string) {
    const { payment, transaksiDetail, ...transaction } =
      await this.prisma.transaksi.findUnique({
        where: {
          transaksi_id,
        },
        select: {
          transaksi_id: true,
          type: true,
          nama_penerima: true,
          created_at: true,
          no_telpon: true,
          provinsi: true,
          kota: true,
          kecamatan: true,
          alamat_lengkap: true,
          kode_pos: true,
          subtotal_produk: true,
          subtotal_ongkir: true,
          total: true,
          alasan: true,
          replied: true,
          status: true,
          payment: {
            select: {
              url: true,
              dari: true,
              expired: true,
              metode: true,
              nama: true,
              alasan: true,
              status: true,
            },
          },
          transaksiDetail: {
            select: {
              nama_produk: true,
              kode_item: true,
              harga: true,
              kategori: true,
              quantity: true,
              subtotal_produk: true,
            },
          },
        },
      });

    let status = '';

    if (payment.status == 'draft' && !transaction.replied) {
      status += 'Menunggu balasan';
    } else if (payment.status == 'draft' && transaction.replied) {
      status += 'Menunggu konfirmasi user';
    } else if (payment.status == 'pending') {
      status += 'Menunggu pembayaran';
    } else if (payment.status == 'paid') {
      status += 'Menunggu verifikasi';
    } else if (payment.status == 'canceled') {
      status += 'Pembayaran dibatalkan';
    } else if (payment.status == 'done') {
      if (transaction.status == 'process') {
        status += 'Diproses';
      } else if (transaction.status == 'done') {
        status += 'Selesai';
      } else if (transaction.status == 'canceled') {
        status += 'Transaksi Dibatalkan';
      }
    }

    return {
      ...transaction,
      status,
      payment,
      products: transaksiDetail,
    };
  }
}
