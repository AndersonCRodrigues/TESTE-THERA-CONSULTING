import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome do usuário',
    example: 'João Silva',
  })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @IsString({ message: 'O nome deve ser uma string' })
  nome: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao@email.com',
  })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  @IsEmail({}, { message: 'O email fornecido é inválido' })
  email: string;

  @ApiProperty({
    description: 'Senha do usuário (mínimo 6 caracteres)',
    example: 'senha123',
  })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  senha: string;

  @ApiProperty({
    description: 'Papel do usuário no sistema',
    example: 'user',
    enum: ['admin', 'user'],
    default: 'user',
  })
  @IsOptional()
  @IsEnum(['admin', 'user'], { message: 'O papel deve ser admin ou user' })
  role?: string;
}
