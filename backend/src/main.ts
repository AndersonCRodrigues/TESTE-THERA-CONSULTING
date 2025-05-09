import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API de Gerenciamento de Pedidos e Produtos')
    .setDescription(
      'API RESTful para gerenciamento de produtos e pedidos. Permite criar, listar, editar e excluir produtos, bem como criar e listar pedidos com verificação de estoque e cálculo automático do total.',
    )
    .setVersion('1.0')
    .addTag('Produtos', 'Operações relacionadas ao gerenciamento de produtos')
    .addTag('Pedidos', 'Operações relacionadas ao gerenciamento de pedidos')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Entre com o JWT token',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
void bootstrap();
