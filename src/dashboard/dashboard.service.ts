import { Injectable } from '@nestjs/common';
import { ProductQuery } from '../products/product.dto';
import { PrismaService } from '../utils/services/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getProducts(query: ProductQuery) {
    const defaultPage = 1;
    const limit = 10;

    const page = parseInt(query.page) ? parseInt(query.page) : defaultPage;

    const skip = (page - 1) * limit;

    const [total, products] = await this.prisma.$transaction([
      this.prisma.produk.count(),
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
}
