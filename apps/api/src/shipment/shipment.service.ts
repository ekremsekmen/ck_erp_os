import { Injectable } from '@nestjs/common';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { PrismaService } from '../prisma.service';
import { PdfService } from '../common/pdf.service';

@Injectable()
export class ShipmentService {
  constructor(private prisma: PrismaService, private pdfService: PdfService) { }

  async create(createShipmentDto: CreateShipmentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: createShipmentDto.orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'READY_FOR_SHIPMENT') {
      throw new Error('Order is not ready for shipment');
    }

    const existingShipment = await this.prisma.shipment.findUnique({
      where: { orderId: createShipmentDto.orderId },
    });

    if (existingShipment) {
      return existingShipment;
    }

    // Update order status to SHIPPED
    await this.prisma.order.update({
      where: { id: createShipmentDto.orderId },
      data: { status: 'SHIPPED' },
    });

    return this.prisma.shipment.create({
      data: createShipmentDto as any,
    });
  }

  findAll() {
    return this.prisma.shipment.findMany({
      include: {
        order: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.shipment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              }
            }
          }
        }
      },
    });
  }

  update(id: string, updateShipmentDto: UpdateShipmentDto) {
    return this.prisma.shipment.update({
      where: { id },
      data: updateShipmentDto as any,
    });
  }

  remove(id: string) {
    return this.prisma.shipment.delete({ where: { id } });
  }

  async getWaybillPdf(id: string): Promise<Buffer> {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
            customer: true,
          },
        },
      },
    });

    if (!shipment) {
      throw new Error('Shipment not found');
    }

    return this.pdfService.generateWaybill(shipment);
  }
}
