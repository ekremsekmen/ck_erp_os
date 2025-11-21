import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
    constructor(private prisma: PrismaService) { }

    create(createCustomerDto: CreateCustomerDto) {
        return this.prisma.customer.create({
            data: createCustomerDto,
        });
    }

    findAll() {
        return this.prisma.customer.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    findOne(id: string) {
        return this.prisma.customer.findUnique({
            where: { id },
            include: { orders: true },
        });
    }

    update(id: string, updateCustomerDto: UpdateCustomerDto) {
        return this.prisma.customer.update({
            where: { id },
            data: updateCustomerDto,
        });
    }

    remove(id: string) {
        return this.prisma.customer.delete({ where: { id } });
    }

    getOrders(id: string) {
        return this.prisma.order.findMany({
            where: { customerId: id },
            include: {
                items: {
                    include: {
                        product: true,
                    }
                },
                production: true,
                shipment: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}
