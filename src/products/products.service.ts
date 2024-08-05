import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import { trim } from 'lodash';
import path from 'path';
import { PrismaService } from '../utils/services/prisma.service';
import { ProductQuery } from './product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  getProducts(query: ProductQuery) {
    const defaultPage = 1;
    const limit = 10;

    const page = parseInt(query.page) ? parseInt(query.page) : defaultPage;

    const skip = (page - 1) * limit;

    if (query.sort) {
      if (query.sort == 'newest') {
        return this.prisma.produk.findMany({
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
            total_stok: true,
            image: {
              select: {
                url: true,
              },
              orderBy: {
                created_at: 'desc',
              },
            },
          },
          take: limit,
          skip,
          orderBy: {
            created_at: 'desc',
          },
        });
      }

      if (query.sort == 'oldest') {
        return this.prisma.produk.findMany({
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
            total_stok: true,
            image: {
              select: {
                url: true,
              },
              orderBy: {
                created_at: 'desc',
              },
            },
          },
          take: limit,
          skip,
          orderBy: {
            created_at: 'asc',
          },
        });
      }

      if (query.sort == 'highest') {
        return this.prisma.produk.findMany({
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
            total_stok: true,
            image: {
              select: {
                url: true,
              },
              orderBy: {
                created_at: 'desc',
              },
            },
          },
          take: limit,
          skip,
          orderBy: {
            harga_6: 'desc',
          },
        });
      }

      if (query.sort == 'lowest') {
        return this.prisma.produk.findMany({
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
            total_stok: true,
            image: {
              select: {
                url: true,
              },
              orderBy: {
                created_at: 'desc',
              },
            },
          },
          take: limit,
          skip,
          orderBy: {
            harga_6: 'asc',
          },
        });
      }
    }

    return this.prisma.produk.findMany({
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
        total_stok: true,
        image: {
          select: {
            url: true,
          },
          orderBy: {
            created_at: 'desc',
          },
        },
      },
      take: limit,
      skip,
    });
  }

  async createImage(file: Express.Multer.File, url: string, kode_item: string) {
    if (!kode_item) {
      const filename = trim(file.originalname.split('.')[0])
        .replace('+', '/')
        .replace('_', '.');
      return this.prisma.image.create({
        data: {
          kode_item: filename,
          url: url + '/' + file.path.split(path.sep).join('/'),
        },
      });
    }

    return this.prisma.image.create({
      data: {
        kode_item,
        url: url + '/' + file.path.split(path.sep).join('/'),
      },
    });
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
