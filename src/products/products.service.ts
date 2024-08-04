import { Injectable } from '@nestjs/common';
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
        },
      },
      take: limit,
      skip,
    });
  }
}
