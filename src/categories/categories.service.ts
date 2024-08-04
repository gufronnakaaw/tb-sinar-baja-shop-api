import { Injectable } from '@nestjs/common';
import { PrismaService } from '../utils/services/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  getCategories() {
    return this.prisma.kategori.findMany({
      orderBy: {
        nama: 'asc',
      },
    });
  }
}
