import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import { PdfService } from '../common/pdf.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService, private pdfService: PdfService) { }

  async create(createOrderDto: CreateOrderDto) {
    const { items, customerInfo, customerId, ...orderData } = createOrderDto;

    const { totalAmount, orderItemsData } = await this.calculateOrderTotal(items);

    return this.prisma.order.create({
      data: {
        ...orderData,
        customerInfo: typeof customerInfo === 'object' ? JSON.stringify(customerInfo) : customerInfo,
        customerId,
        totalAmount,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          }
        },
      },
    });
  }

  private async calculateOrderTotal(items: CreateOrderDto['items']) {
    let totalAmount = 0;
    const orderItemsData = [];

    if (items) {
      for (const item of items) {
        const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
        if (product) {
          const itemTotal = product.basePrice * item.quantity;
          totalAmount += itemTotal;
          orderItemsData.push({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: product.basePrice,
            configuration: typeof item.configuration === 'object' ? JSON.stringify(item.configuration) : item.configuration,
          });
        }
      }
    }

    return { totalAmount, orderItemsData };
  }

  findAll() {
    return this.prisma.order.findMany({
      include: {
        items: true,
        production: true,
        shipment: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          }
        },
        production: {
          include: {
            history: true,
          }
        },
        shipment: true,
      },
    });
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    // Use Prisma.OrderUpdateInput to ensure type safety without 'as any' if possible,
    // or at least be more specific than 'any'.
    // However, UpdateOrderDto usually maps well.
    // If there are issues with specific fields, we should handle them.
    // For now, removing 'as any' and letting TypeScript infer or using a cleaner cast if needed.
    // Ideally UpdateOrderDto should match Prisma's update input.
    return this.prisma.order.update({
      where: { id },
      data: updateOrderDto as Prisma.OrderUpdateInput,
    });
  }

  remove(id: string) {
    return this.prisma.order.delete({ where: { id } });
  }

  async startProduction(id: string) {
    return this.prisma.$transaction(async (prisma) => {
      // Check if order exists and is in PENDING status INSIDE the transaction
      // This ensures we have the latest state and locks the row if needed (depending on isolation level)
      // For stricter safety, we could use raw SQL "SELECT ... FOR UPDATE" or optimistic locking.
      // But moving it inside the transaction is the first critical step.
      const order = await prisma.order.findUnique({ where: { id } });

      if (!order) throw new Error('Order not found');
      if (order.status !== 'PENDING') throw new Error('Order must be PENDING to start production');

      // Update order status
      const updatedOrder = await prisma.order.update({
        where: { id },
        data: { status: 'IN_PRODUCTION' },
      });

      // Deduct stock for each item in the order
      await this.deductStock(id, prisma);

      // Create production tracking record
      await prisma.productionTracking.create({
        data: {
          orderId: id,
          currentStage: 'CUTTING_BENDING', // Initial stage as per framing.txt
          startedAt: new Date(),
          history: {
            create: {
              stage: 'CUTTING_BENDING',
              enteredAt: new Date(),
              notes: 'Production started',
            },
          },
        },
      });

      return updatedOrder;
    });
  }

  private async deductStock(orderId: string, prisma: Prisma.TransactionClient) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                recipe: true,
              },
            },
          },
        },
      },
    });

    if (!order) return;

    for (const item of order.items) {
      if (item.product && item.product.recipe) {
        for (const recipeItem of item.product.recipe) {
          const quantityToDeduct = recipeItem.quantity * item.quantity;
          await prisma.material.update({
            where: { id: recipeItem.materialId },
            data: {
              currentStock: {
                decrement: quantityToDeduct,
              },
            },
          });
        }
      }
    }
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  async getProformaPdf(id: string): Promise<Buffer> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return this.pdfService.generateProforma(order);
  }
}
