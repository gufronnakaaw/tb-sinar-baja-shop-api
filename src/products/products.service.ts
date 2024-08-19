import { Injectable } from '@nestjs/common';
import { PrismaService } from '../utils/services/prisma.service';
import { ProductQuery } from './product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  getProducts(query: ProductQuery) {
    const defaultPage = 1;
    const limit = 20;

    const page = parseInt(query.page) ? parseInt(query.page) : defaultPage;

    const skip = (page - 1) * limit;

    if (query.sort) {
      if (query.sort == 'newest') {
        return this.prisma.produk.findMany({
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

  async searchProduct(query: ProductQuery) {
    const defaultPage = 1;
    const limit = 20;

    const page = parseInt(query.page) ? parseInt(query.page) : defaultPage;

    const skip = (page - 1) * limit;

    if (query.sort) {
      if (query.sort == 'newest') {
        return this.prisma.produk.findMany({
          where: {
            OR: [
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
            AND: [
              { active: true },
              {
                harga_6: {
                  gt: 0,
                },
              },
              {
                total_stok: {
                  gt: 0,
                },
              },
            ],
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
          where: {
            OR: [
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
            AND: [
              { active: true },
              {
                harga_6: {
                  gt: 0,
                },
              },
              {
                total_stok: {
                  gt: 0,
                },
              },
            ],
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
          where: {
            OR: [
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
            AND: [
              { active: true },
              {
                harga_6: {
                  gt: 0,
                },
              },
              {
                total_stok: {
                  gt: 0,
                },
              },
            ],
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
          where: {
            OR: [
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
            AND: [
              { active: true },
              {
                harga_6: {
                  gt: 0,
                },
              },
              {
                total_stok: {
                  gt: 0,
                },
              },
            ],
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
      where: {
        OR: [
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
        AND: [
          { active: true },
          {
            harga_6: {
              gt: 0,
            },
          },
          {
            total_stok: {
              gt: 0,
            },
          },
        ],
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

  async getProductBySlug(slug: string) {
    const product = await this.prisma.produk.findFirst({
      where: {
        slug,
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

    if (product) {
      Object.assign(product, { terjual: 0 });
    }

    return product;
  }

  async getProductByKodeItem(kode_item: string) {
    const product = await this.prisma.produk.findFirst({
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

    if (product) {
      Object.assign(product, { terjual: 0 });
    }

    return product;
  }

  getProductsByCategory(name: string, query: ProductQuery) {
    const defaultPage = 1;
    const limit = 20;

    const page = parseInt(query.page) ? parseInt(query.page) : defaultPage;

    const skip = (page - 1) * limit;

    if (query.sort) {
      if (query.sort == 'newest') {
        return this.prisma.produk.findMany({
          where: {
            active: true,
            harga_6: {
              gt: 0,
            },
            total_stok: {
              gt: 0,
            },
            kategori: {
              contains: name,
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
          where: {
            active: true,
            harga_6: {
              gt: 0,
            },
            total_stok: {
              gt: 0,
            },
            kategori: {
              contains: name,
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
          where: {
            active: true,
            harga_6: {
              gt: 0,
            },
            total_stok: {
              gt: 0,
            },
            kategori: {
              contains: name,
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
          where: {
            active: true,
            harga_6: {
              gt: 0,
            },
            total_stok: {
              gt: 0,
            },
            kategori: {
              contains: name,
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
      where: {
        active: true,
        harga_6: {
          gt: 0,
        },
        total_stok: {
          gt: 0,
        },
        kategori: {
          contains: name,
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
}
