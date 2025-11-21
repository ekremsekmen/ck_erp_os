import { Module } from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { ShipmentController } from './shipment.controller';
import { PrismaService } from '../prisma.service';

import { PdfService } from '../common/pdf.service';

@Module({
  controllers: [ShipmentController],
  providers: [ShipmentService, PrismaService, PdfService],
})
export class ShipmentModule { }
