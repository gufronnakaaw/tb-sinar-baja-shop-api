import { Injectable, NotFoundException } from '@nestjs/common';
import path from 'path';
import { PrismaService } from '../utils/services/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async createImage(params: {
    file: Express.Multer.File;
    url: string;
    body: { nama: string; dari: string; transaksi_id: string };
    user_id: string;
  }) {
    if (
      !(await this.prisma.transaksi.count({
        where: {
          transaksi_id: params.body.transaksi_id,
        },
      }))
    ) {
      throw new NotFoundException('Transaction not found');
    }

    const now = Math.floor(Date.now() / 1000);

    const oneDayInSeconds = 24 * 60 * 60;
    const expired = now + oneDayInSeconds;

    await this.prisma.payment.update({
      where: {
        transaksi_id: params.body.transaksi_id,
      },
      data: {
        status: 'paid',
        url: params.url + '/' + params.file.path.split(path.sep).join('/'),
        nama: params.body.nama,
        dari: params.body.dari,
        expired,
        metode: 'transfer',
      },
    });

    return {
      ...params.body,
    };
  }
}
