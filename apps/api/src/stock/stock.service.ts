import { Injectable } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StockService {
  constructor(private prisma: PrismaService) { }

  create(createStockDto: CreateStockDto) {
    return this.prisma.material.create({
      data: createStockDto as any,
    });
  }

  findAll() {
    return this.prisma.material.findMany();
  }

  findOne(id: string) {
    return this.prisma.material.findUnique({ where: { id } });
  }

  async update(id: string, updateStockDto: UpdateStockDto) {
    const currentMaterial = await this.prisma.material.findUnique({ where: { id } });

    if (currentMaterial && updateStockDto.unitPrice !== undefined && updateStockDto.unitPrice !== currentMaterial.unitPrice) {
      await this.prisma.materialPriceHistory.create({
        data: {
          materialId: id,
          price: currentMaterial.unitPrice, // Store previous price
          currency: currentMaterial.currency,
        },
      });
    }

    return this.prisma.material.update({
      where: { id },
      data: updateStockDto,
    });
  }

  async getPriceHistory(id: string) {
    return this.prisma.materialPriceHistory.findMany({
      where: { materialId: id },
      orderBy: { changedAt: 'asc' },
    });
  }

  remove(id: string) {
    return this.prisma.material.delete({ where: { id } });
  }

  async updateStockLevel(id: string, quantity: number) {
    return this.prisma.material.update({
      where: { id },
      data: {
        currentStock: {
          increment: quantity,
        },
      },
    });
  }
}
