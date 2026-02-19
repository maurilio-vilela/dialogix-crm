import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.password) {
      const isMatch = await bcrypt.compare(pass, user.password);
      if (isMatch) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Log temporário: hash do secret usado no login (sem expor valor)
    try {
      const fs = require('fs');
      const secretFile = process.env.JWT_SECRET_FILE || '/run/secrets/jwt_secret';
      let secret = '';
      if (fs.existsSync(secretFile)) {
        secret = fs.readFileSync(secretFile, 'utf8').trim();
      } else if (process.env.JWT_SECRET) {
        secret = process.env.JWT_SECRET;
      }
      if (secret) {
        const { createHash } = require('crypto');
        const hash = createHash('sha256').update(secret).digest('hex');
        console.log('[AuthService] JWT_SECRET hash (sha256):', hash.slice(0, 12));
      }
    } catch (e) {
      console.log('[AuthService] Falha ao gerar hash do JWT_SECRET');
    }

    const payload = { sub: user.id, email: user.email, tenantId: user.tenantId, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }
}
