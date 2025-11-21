import { Injectable } from '@nestjs/common';
import { CreateProductDto, RecipeItemDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  create(createProductDto: CreateProductDto) {
    const { recipe, ...productData } = createProductDto;
    return this.prisma.product.create({
      data: {
        ...productData,
        recipe: {
          create: recipe?.map((item: RecipeItemDto) => ({
            materialId: item.materialId,
            quantity: item.quantity,
          })),
        },
      } as any,
      include: {
        recipe: {
          include: {
            material: true,
          },
        },
      },
    });
  }

  findAll() {
    return this.prisma.product.findMany({
      include: {
        recipe: {
          include: {
            material: true,
          },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        recipe: {
          include: {
            material: true,
          },
        },
      },
    });
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    const { recipe, ...productData } = updateProductDto;
    // For simplicity, we are not updating recipe items here in this basic implementation
    // In a real app, we would need to handle upsert/delete of recipe items
    return this.prisma.product.update({
      where: { id },
      data: productData as any,
    });
  }

  remove(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}
