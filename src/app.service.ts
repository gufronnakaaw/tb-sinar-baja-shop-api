import { HttpService } from '@nestjs/axios';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { isArray } from 'lodash';
import { firstValueFrom } from 'rxjs';
import { PreviewQuery, RegionalPollingResponse } from './app.dto';
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
      where: {
        active: true,
      },
      orderBy: {
        nama: 'asc',
      },
    });
  }

  async getCheckout(user_id: string) {
    const [banks, address] = await this.prisma.$transaction([
      this.prisma.bankAccount.findMany(),
      this.prisma.address.findMany({ where: { user_id } }),
    ]);

    return {
      banks: banks.map((bank) =>
        removeKeys(bank, ['created_at', 'updated_at']),
      ),
      address: address.map((item) => removeKeys(item, ['id', 'main_address'])),
    };
  }

  async checkQuantity(kode_item: string, quantity: number) {
    const product = await this.prisma.produk.findUnique({
      where: { kode_item },
      select: { total_stok: true },
    });

    if (quantity > product.total_stok) {
      throw new UnprocessableEntityException(
        'Input stock exceeds total product stock.',
      );
    }

    return {
      can_checkout: true,
    };
  }

  async getPreview(query: PreviewQuery) {
    if (query.code) {
      const [bank, product] = await this.prisma.$transaction([
        this.prisma.bankAccount.findUnique({
          where: { bank_id: query.bank },
          select: {
            atas_nama: true,
            bank: true,
            no_rekening: true,
          },
        }),
        this.prisma.produk.findUnique({
          where: { kode_item: query.code },
          select: {
            kode_item: true,
            nama_produk_asli: true,
            kategori: true,
            harga_6: true,
            image: {
              select: {
                url: true,
              },
            },
          },
        }),
      ]);

      if (!bank || !product) {
        return {};
      }

      const { nama_produk_asli, harga_6, image, kategori, kode_item } = product;

      if (query.type == 'pickup') {
        return {
          type: 'pickup',
          bank,
          products: [
            {
              kode_item,
              nama_produk_asli,
              image,
              kategori,
              quantity: parseInt(query.quantity),
              harga: harga_6,
              subtotal_produk: parseInt(query.quantity) * harga_6,
            },
          ],
          subtotal_ongkir: 0,
          total: parseInt(query.quantity) * harga_6,
        };
      }

      const address = await this.prisma.address.findUnique({
        where: { address_id: query.address },
      });

      if (!address) {
        return {};
      }

      return {
        type: 'delivery',
        bank,
        products: [
          {
            kode_item,
            image,
            nama_produk_asli,
            kategori,
            quantity: parseInt(query.quantity),
            harga: harga_6,
            subtotal_produk: parseInt(query.quantity) * harga_6,
          },
        ],
        address,
        subtotal_ongkir: 0,
        total: parseInt(query.quantity) * harga_6,
      };
    }

    if (query.carts) {
      const bank = await this.prisma.bankAccount.findUnique({
        where: { bank_id: query.bank },
        select: {
          atas_nama: true,
          bank: true,
          no_rekening: true,
        },
      });

      if (!bank) {
        return {};
      }

      if (isArray(query.carts)) {
        const products = [];

        for (const item of query.carts) {
          const cart = await this.prisma.cart.findUnique({
            where: { cart_id: item },
            select: {
              qty: true,
              produk: {
                select: {
                  kode_item: true,
                  nama_produk_asli: true,
                  kategori: true,
                  harga_6: true,
                  image: {
                    select: {
                      url: true,
                    },
                  },
                },
              },
            },
          });

          products.push({
            kode_item: cart.produk.kode_item,
            nama_produk_asli: cart.produk.nama_produk_asli,
            image: cart.produk.image,
            kategori: cart.produk.kategori,
            quantity: cart.qty,
            harga: cart.produk.harga_6,
            subtotal_produk: cart.qty * cart.produk.harga_6,
          });
        }

        if (query.type == 'pickup') {
          return {
            type: 'pickup',
            bank,
            products,
            subtotal_ongkir: 0,
            total: products.reduce((a, b) => a + b.subtotal_produk, 0),
          };
        }

        const address = await this.prisma.address.findUnique({
          where: { address_id: query.address },
        });

        if (!address) {
          return {};
        }

        return {
          type: 'delivery',
          bank,
          products,
          address,
          subtotal_ongkir: 0,
          total: products.reduce((a, b) => a + b.subtotal_produk, 0),
        };
      }

      const cart = await this.prisma.cart.findUnique({
        where: { cart_id: query.carts },
        select: {
          qty: true,
          produk: {
            select: {
              kode_item: true,
              nama_produk_asli: true,
              kategori: true,
              harga_6: true,
              image: {
                select: {
                  url: true,
                },
              },
            },
          },
        },
      });

      if (query.type == 'pickup') {
        return {
          type: 'pickup',
          bank,
          products: [
            {
              kode_item: cart.produk.kode_item,
              nama_produk_asli: cart.produk.nama_produk_asli,
              image: cart.produk.image,
              kategori: cart.produk.kategori,
              quantity: cart.qty,
              harga: cart.produk.harga_6,
              subtotal_produk: cart.qty * cart.produk.harga_6,
            },
          ],
          subtotal_ongkir: 0,
          total: cart.qty * cart.produk.harga_6,
        };
      }

      const address = await this.prisma.address.findUnique({
        where: { address_id: query.address },
      });

      if (!address) {
        return {};
      }

      return {
        type: 'delivery',
        bank,
        products: [
          {
            kode_item: cart.produk.kode_item,
            nama_produk_asli: cart.produk.nama_produk_asli,
            image: cart.produk.image,
            kategori: cart.produk.kategori,
            quantity: cart.qty,
            harga: cart.produk.harga_6,
            subtotal_produk: cart.qty * cart.produk.harga_6,
          },
        ],
        address,
        subtotal_ongkir: 0,
        total: cart.qty * cart.produk.harga_6,
      };
    }
  }
}
