import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import User from '../user/model/user.model';
import { AdminSeeder } from './seeders/admin.seeder';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'mysql',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: parseInt(configService.get('DATABASE_PORT', '3306'), 10),
        username: configService.get('DATABASE_USER', 'nestjs_user'),
        password: configService.get('DATABASE_PASSWORD', 'nestjs_password'),
        database: configService.get('DATABASE_NAME', 'nestjs_app'),
        models: [__dirname + '/../**/*.model.{ts,js}'],
        autoLoadModels: true,
        synchronize: true,
        logging: false,
      }),
    }),
    SequelizeModule.forFeature([User]),
  ],
  providers: [AdminSeeder],
  exports: [AdminSeeder, SequelizeModule],
})
export class DatabaseModule {}
