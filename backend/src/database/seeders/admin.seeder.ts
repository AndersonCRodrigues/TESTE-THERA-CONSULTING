import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import User from '../../user/model/user.model';

@Injectable()
export class AdminSeeder {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private configService: ConfigService,
  ) {}

  async seed(): Promise<void> {
    try {
      const adminExists = await this.userModel.findOne({
        where: { role: 'admin' },
      });

      if (!adminExists) {
        const adminEmail =
          this.configService.get<string>('ADMIN_EMAIL') || 'admin@admin.com';
        const adminPassword =
          this.configService.get<string>('ADMIN_PASSWORD') || 'Admin@123';

        await this.userModel.create({
          nome: 'Administrador',
          email: adminEmail,
          senha: adminPassword,
          role: 'admin',
        });

        console.log('Usuário administrador criado com sucesso!');
      } else {
        console.log('Usuário administrador já existe no sistema.');
      }
    } catch (error) {
      console.error('Erro ao criar usuário administrador:', error);
    }
  }
}
