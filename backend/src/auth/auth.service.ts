import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    senha: string,
  ): Promise<{ id: string; nome: string; email: string; role: string } | null> {
    try {
      const user = await this.userService.findByEmail(email);

      if (!user) {
        return null;
      }

      const isPasswordValid = await user.validatePassword(senha);

      if (isPasswordValid) {
        return user.toJSON();
      }

      return null;
    } catch (error) {
      console.error('Erro durante a validação do usuário:', error);
      return null;
    }
  }

  async login(loginDto: LoginDto): Promise<{
    user: { id: string; nome: string; email: string; role: string };
    access_token: string;
  }> {
    const user = await this.validateUser(loginDto.email, loginDto.senha);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
      },
      access_token: access_token,
    };
  }
}
