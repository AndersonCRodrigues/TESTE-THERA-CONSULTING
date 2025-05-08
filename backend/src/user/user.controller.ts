import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import User from './model/user.model';
import { UserService } from './user.service';

@ApiTags('Usuários')
@Controller('usuarios')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar todos os usuários',
    description:
      'Retorna uma lista com todos os usuários cadastrados. Requer permissão de administrador.',
  })
  @ApiOkResponse({
    description: 'Lista de usuários retornada com sucesso',
    type: [User],
  })
  @ApiUnauthorizedResponse({ description: 'Não autorizado' })
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Buscar usuário por ID',
    description: 'Retorna os dados de um usuário específico com base no ID.',
  })
  @ApiParam({ name: 'id', description: 'ID do usuário', example: 1 })
  @ApiOkResponse({ description: 'Usuário encontrado com sucesso', type: User })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  @ApiUnauthorizedResponse({ description: 'Não autorizado' })
  async findOne(@Param('id') id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Criar um novo usuário',
    description:
      'Cria um novo usuário no sistema com base nas informações fornecidas.',
  })
  @ApiCreatedResponse({ description: 'Usuário criado com sucesso', type: User })
  @ApiBadRequestResponse({ description: 'Dados inválidos fornecidos' })
  @ApiConflictResponse({ description: 'Email já está em uso' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar um usuário existente',
    description:
      'Atualiza as informações de um usuário existente com base no ID.',
  })
  @ApiParam({ name: 'id', description: 'ID do usuário', example: 1 })
  @ApiOkResponse({ description: 'Usuário atualizado com sucesso', type: User })
  @ApiBadRequestResponse({
    description: 'Dados inválidos fornecidos para atualização',
  })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  @ApiUnauthorizedResponse({ description: 'Não autorizado' })
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remover um usuário',
    description:
      'Remove um usuário do sistema com base no ID. Requer permissão de administrador.',
  })
  @ApiParam({ name: 'id', description: 'ID do usuário', example: 1 })
  @ApiNoContentResponse({ description: 'Usuário removido com sucesso' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  @ApiUnauthorizedResponse({ description: 'Não autorizado' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: number): Promise<void> {
    await this.userService.remove(id);
  }
}
