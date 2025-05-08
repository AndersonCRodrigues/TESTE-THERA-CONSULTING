import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Smartphone XYZ', description: 'Nome do produto' })
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ example: 'Eletrônicos', description: 'Categoria do produto' })
  @IsString()
  @IsNotEmpty()
  categoria: string;

  @ApiProperty({
    example: 'Smartphone de última geração...',
    description: 'Descrição do produto',
    required: false,
  })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiProperty({ example: 1299.99, description: 'Preço do produto' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  preco: number;

  @ApiProperty({ example: 50, description: 'Quantidade em estoque' })
  @IsInt()
  @Min(0)
  quantidade_estoque: number;
}
