import { Injectable, NotFoundException } from '@nestjs/common';
import { unlink } from 'fs/promises';
import path from 'path';
import { PrismaService } from '../utils/services/prisma.service';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

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

    // if (existsSync(`.${path}`)) {
    // }
    await unlink(`.${path}`);

    return this.prisma.banner.delete({
      where: {
        id,
      },
    });
  }
}
