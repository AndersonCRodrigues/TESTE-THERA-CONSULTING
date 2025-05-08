import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Nome do usuário',
    example: 'João Silva',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O nome deve ser uma string' })
  nome?: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao@email.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'O email fornecido é inválido' })
  email?: string;

  @ApiProperty({
    description: 'Senha do usuário (mínimo 6 caracteres)',
    example: 'senha123',
    required: false,
  })
  @IsOptional()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  senha?: string;

  @ApiProperty({
    description: 'Papel do usuário no sistema',
    example: 'user',
    enum: ['admin', 'user'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['admin', 'user'], { message: 'O papel deve ser admin ou user' })
  role?: string;
}
