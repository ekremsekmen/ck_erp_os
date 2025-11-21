import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductionModule } from './production/production.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { StockModule } from './stock/stock.module';
import { AuthModule } from './auth/auth.module';
import { ShipmentModule } from './shipment/shipment.module';
import { PrismaModule } from './prisma.module';
import { CustomersModule } from './customers/customers.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    StockModule,
    ProductsModule,
    OrdersModule,
    ProductionModule,
    ShipmentModule,
    CustomersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
