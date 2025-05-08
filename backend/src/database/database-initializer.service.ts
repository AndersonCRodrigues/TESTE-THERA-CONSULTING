import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { AdminSeeder } from './seeders/admin.seeder';

@Injectable()
export class DatabaseInitializerService implements OnApplicationBootstrap {
  constructor(private adminSeeder: AdminSeeder) {}

  async onApplicationBootstrap() {
    console.log('Inicializando banco de dados...');
    await this.runSeeders();
  }

  private async runSeeders() {
    console.log('Executando seeders...');

    try {
      await this.adminSeeder.seed();

      console.log('Seeders executados com sucesso!');
    } catch (error) {
      console.error('Erro ao executar seeders:', error);
    }
  }
}
