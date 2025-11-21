import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PrismaService } from '../prisma.service';

import { PdfService } from '../common/pdf.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, PrismaService, PdfService],
})
export class OrdersModule { }
