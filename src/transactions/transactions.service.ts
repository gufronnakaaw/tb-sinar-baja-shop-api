import { Injectable } from '@nestjs/common';
import { generateID } from '../utils/generate.util';
import { PrismaService } from '../utils/services/prisma.service';
import { CreateTransactionDto } from './transactions.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(body: CreateTransactionDto, user_id: string) {
    const date = new Date();
    const decrementStock = [];

    for (const product of body.products) {
      decrementStock.push(
        this.prisma.produk.update({
          where: { kode_item: product.kode_item },
          data: { total_stok: { decrement: product.quantity } },
        }),
      );
    }

    if (body.type == 'pickup') {
      await this.prisma.$transaction([
        ...decrementStock,
        this.prisma.transaksi.create({
          data: {
            transaksi_id: generateID('#', date),
            user_id,
            no_rekening: body.bank.no_rekening,
            atas_nama: body.bank.atas_nama,
            bank: body.bank.bank,
            type: body.type,
            subtotal_produk: body.products.reduce(
              (a, b) => a + b.subtotal_produk,
              0,
            ),
            subtotal_ongkir: body.subtotal_ongkir,
            total: body.total,
            status: 'pending',
            created_at: date,
            updated_at: date,
            payment: {
              create: {
                payment_id: generateID('PAY', date),
                status: 'pending',
                created_at: date,
                updated_at: date,
              },
            },
            transaksiDetail: {
              createMany: {
                data: body.products.map((product) => {
                  return {
                    kode_item: product.kode_item,
                    kategori: product.kategori,
                    nama_produk: product.nama_produk_asli,
                    harga: product.harga,
                    quantity: product.quantity,
                    subtotal_produk: product.subtotal_produk,
                  };
                }),
              },
            },
          },
        }),
      ]);

      if (body.carts) {
        await this.prisma.cart.deleteMany({
          where: {
            cart_id: {
              in: body.carts,
            },
          },
        });
      }

      return {
        transaksi_id: generateID('#', date),
        type: body.type,
        products: body.products,
        subtotal_ongkir: body.subtotal_ongkir,
        total: body.total,
      };
    }

    await this.prisma.$transaction([
      ...decrementStock,
      this.prisma.transaksi.create({
        data: {
          transaksi_id: generateID('#', date),
          user_id,
          no_rekening: body.bank.no_rekening,
          atas_nama: body.bank.atas_nama,
          bank: body.bank.bank,
          nama_penerima: body.address.nama_penerima,
          no_telpon: body.address.no_telpon,
          provinsi: body.address.provinsi,
          kota: body.address.kota,
          kecamatan: body.address.kecamatan,
          alamat_lengkap: body.address.alamat_lengkap,
          kode_pos: body.address.kode_pos,
          type: body.type,
          subtotal_produk: body.products.reduce(
            (a, b) => a + b.subtotal_produk,
            0,
          ),
          subtotal_ongkir: body.subtotal_ongkir,
          total: body.total,
          status: 'draft',
          created_at: date,
          updated_at: date,
          payment: {
            create: {
              payment_id: generateID('PAY', date),
              status: 'draft',
              created_at: date,
              updated_at: date,
            },
          },
          transaksiDetail: {
            createMany: {
              data: body.products.map((product) => {
                return {
                  kode_item: product.kode_item,
                  kategori: product.kategori,
                  nama_produk: product.nama_produk_asli,

                  harga: product.harga,
                  quantity: product.quantity,
                  subtotal_produk: product.subtotal_produk,
                };
              }),
            },
          },
        },
      }),
    ]);

    return {
      transaksi_id: generateID('#', date),
      type: body.type,
      products: body.products,
      subtotal_ongkir: body.subtotal_ongkir,
      total: body.total,
    };
  }

  async findAll(user_id: string) {
    const results = await this.prisma.transaksi.findMany({
      where: { user_id },
      select: {
        transaksi_id: true,
        created_at: true,
        status: true,
        total: true,
        replied: true,
        transaksiDetail: {
          select: {
            kode_item: true,
          },
        },
        payment: {
          select: {
            status: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    const transactions = [];

    for (const result of results) {
      let status = '';

      if (result.payment.status == 'draft' && !result.replied) {
        status += 'Menunggu balasan';
      } else if (result.payment.status == 'draft' && result.replied) {
        status += 'Menunggu konfirmasi anda';
      } else if (result.payment.status == 'pending') {
        status += 'Menunggu pembayaran';
      } else if (result.payment.status == 'paid') {
        status += 'Menunggu verifikasi';
      } else if (result.payment.status == 'canceled') {
        status += 'Pembayaran dibatalkan';
      } else if (result.payment.status == 'done') {
        if (result.status == 'process') {
          status += 'Diproses';
        } else if (result.status == 'done') {
          status += 'Selesai';
        } else if (result.status == 'canceled') {
          status += 'Transaksi Dibatalkan';
        }
      }

      transactions.push({
        transaksi_id: result.transaksi_id,
        created_at: result.created_at,
        total: result.total,
        total_item: result.transaksiDetail.length,
        status,
      });
    }

    return transactions;
  }

  async findOne(transaksi_id: string) {
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
      status += 'Menunggu konfirmasi anda';
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
