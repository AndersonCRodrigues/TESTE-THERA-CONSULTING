import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import User from './model/user.model';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.findAll({
      attributes: { exclude: ['senha'] },
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userModel.findByPk(id, {
      attributes: { exclude: ['senha'] },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com email ${email} não encontrado`);
    }

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.userModel.findOne({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Este email já está em uso');
      }

      const user = await this.userModel.create({
        ...createUserDto,
      });

      const result: Partial<User> = user.toJSON();
      delete result.senha;
      return result as User;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('Erro ao criar usuário:', error);
      throw new BadRequestException('Erro ao criar o usuário: ' + errorMessage);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    try {
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.userModel.findOne({
          where: { email: updateUserDto.email },
        });

        if (existingUser) {
          throw new ConflictException('Este email já está em uso');
        }
      }

      if (updateUserDto.senha) {
        updateUserDto.senha = await bcrypt.hash(updateUserDto.senha, 10);
      }

      await user.update(updateUserDto);

      const updatedUser = await this.userModel.findByPk(id, {
        attributes: { exclude: ['senha'] },
      });

      if (!updatedUser) {
        throw new NotFoundException(
          `Usuário com ID ${id} não encontrado após atualização`,
        );
      }

      return updatedUser;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      console.error(`Erro ao atualizar usuário com ID ${id}:`, error);
      throw new BadRequestException(
        'Erro ao atualizar o usuário: ' + errorMessage,
      );
    }
  }

  async remove(id: number): Promise<void> {
    const deletedCount = await this.userModel.destroy({
      where: { id },
    });

    if (deletedCount === 0) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
  }
}
