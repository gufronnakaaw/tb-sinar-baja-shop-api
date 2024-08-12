import { Injectable, NotFoundException } from '@nestjs/common';
import ShortUniqueId from 'short-unique-id';
import { PrismaService } from '../utils/services/prisma.service';
import { CreateCartDto } from './carts.dto';

@Injectable()
export class CartsService {
  constructor(private prisma: PrismaService) {}

  async getCarts(user_id: string) {
    const carts = await this.prisma.cart.findMany({
      where: {
        user_id,
      },
      select: {
        cart_id: true,
        qty: true,
        active: true,
        produk: {
          select: {
            image: {
              select: {
                url: true,
              },
              orderBy: {
                created_at: 'desc',
              },
            },
            nama_produk_asli: true,
            harga_6: true,
            kategori: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return carts.map((cart) => {
      const { produk, ...all } = cart;

      return {
        ...all,
        ...produk,
      };
    });
  }

  async createCart(body: CreateCartDto, user_id: string) {
    const cart = await this.prisma.cart.count({
      where: {
        user_id,
        kode_item: body.kode_item,
      },
    });

    if (cart) {
      await this.prisma.cart.updateMany({
        where: {
          user_id,
          kode_item: body.kode_item,
        },
        data: {
          qty: {
            increment: body.qty,
          },
        },
      });

      return {
        add_cart: true,
      };
    } else {
      const uid = new ShortUniqueId({ length: 10 });

      await this.prisma.cart.create({
        data: {
          cart_id: uid.rnd(),
          user_id,
          qty: body.qty,
          kode_item: body.kode_item,
        },
      });

      return {
        add_cart: true,
      };
    }
  }

  async deleteCart(cart_id: string, user_id: string) {
    if (!(await this.prisma.cart.findUnique({ where: { cart_id, user_id } }))) {
      throw new NotFoundException('Cart not found');
    }

    return this.prisma.cart.delete({
      where: {
        cart_id,
        user_id,
      },
    });
  }

  async updateActiveCart({
    cart_id,
    user_id,
    value,
  }: {
    cart_id: string;
    user_id: string;
    value: boolean;
  }) {
    if (!(await this.prisma.cart.findUnique({ where: { cart_id, user_id } }))) {
      throw new NotFoundException('Cart not found');
    }

    await this.prisma.cart.update({
      where: {
        cart_id,
        user_id,
      },
      data: {
        active: value,
      },
    });

    return {
      cart_id,
      cart_active: value,
    };
  }
}
