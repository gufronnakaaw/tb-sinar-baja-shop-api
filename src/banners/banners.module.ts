import { Module } from '@nestjs/common';
import { PrismaService } from '../utils/services/prisma.service';
import { BannersController } from './banners.controller';
import { BannersService } from './banners.service';

@Module({
  controllers: [BannersController],
  providers: [BannersService, PrismaService],
})
export class BannersModule {}
