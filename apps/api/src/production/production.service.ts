import { Injectable } from '@nestjs/common';
import { CreateProductionDto } from './dto/create-production.dto';
import { UpdateProductionDto } from './dto/update-production.dto';
import { PrismaService } from '../prisma.service';


@Injectable()
export class ProductionService {
  constructor(private prisma: PrismaService) { }

  async create(createProductionDto: CreateProductionDto) {
    const { orderId } = createProductionDto;

    // Check if already exists
    const existing = await this.prisma.productionTracking.findUnique({
      where: { orderId },
    });

    if (existing) {
      return existing;
    }

    // Create tracking and update order status
    const production = await this.prisma.productionTracking.create({
      data: {
        orderId,
        currentStage: 'CUTTING_BENDING',
        history: {
          create: {
            stage: 'CUTTING_BENDING',
            notes: 'Production started',
          }
        }
      },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'IN_PRODUCTION' },
    });

    return production;
  }

  findAll() {
    return this.prisma.productionTracking.findMany({
      where: {
        order: {
          status: {
            notIn: ['SHIPPED', 'COMPLETED']
          }
        }
      },
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
      }
    });
  }

  findOne(id: string) {
    return this.prisma.productionTracking.findUnique({
      where: { id },
      include: {
        history: true,
        order: {
          include: {
            items: {
              include: {
                product: true,
              }
            }
          }
        }
      }
    });
  }

  update(id: string, updateProductionDto: UpdateProductionDto) {
    return `This action updates a #${id} production`;
  }

  remove(id: string) {
    return `This action removes a #${id} production`;
  }

  // Define valid stages and their order
  private readonly STAGES = [
    'CUTTING_BENDING',
    'WELDING_GRINDING',
    'PAINTING_WASHING',
    'ASSEMBLY_PACKAGING',
    'READY_FOR_SHIPMENT'
  ];

  async updateStage(id: string, stage: string) {
    // 1. Validate stage
    if (!this.STAGES.includes(stage)) {
      throw new Error(`Invalid stage. Must be one of: ${this.STAGES.join(', ')}`);
    }

    // 2. Get current state
    const currentTracking = await this.prisma.productionTracking.findUnique({
      where: { id },
    });

    if (!currentTracking) {
      throw new Error('Production tracking not found');
    }

    // 3. Validate transition (optional: enforce sequential order)
    const currentIndex = this.STAGES.indexOf(currentTracking.currentStage);
    const newIndex = this.STAGES.indexOf(stage);

    if (newIndex < currentIndex) {
      throw new Error('Cannot move production stage backwards');
    }

    // 4. Update to new stage and add history
    const updatedTracking = await this.prisma.productionTracking.update({
      where: { id },
      data: {
        currentStage: stage,
        history: {
          create: {
            stage: stage,
            notes: `Moved from ${currentTracking.currentStage} to ${stage}`,
          }
        }
      },
    });

    // 5. If stage is "Ready for Shipment", update order status
    if (stage === 'READY_FOR_SHIPMENT') {
      await this.prisma.order.update({
        where: { id: currentTracking.orderId },
        data: { status: 'READY_FOR_SHIPMENT' },
      });
    }

    return updatedTracking;
  }
}
