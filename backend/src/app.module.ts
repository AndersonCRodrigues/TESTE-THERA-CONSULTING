import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { DatabaseInitializerService } from './database/database-initializer.service';
import { DatabaseModule } from './database/database.module';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    OrderModule,
    ProductModule,
    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [DatabaseInitializerService],
})
export class AppModule {}
