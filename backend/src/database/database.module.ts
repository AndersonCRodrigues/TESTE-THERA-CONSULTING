import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'mysql',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 3306),
        username: configService.get('DATABASE_USER', 'nestjs_user'),
        password: configService.get('DATABASE_PASSWORD', 'nestjs_password'),
        database: configService.get('DATABASE_NAME', 'nestjs_app'),
        models: [__dirname + '/../**/*.model.{ts,js}'],
        autoLoadModels: true,
        synchronize: true,
        logging: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
