import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    let jwtSecret = configService.get('JWT_SECRET');
    if (process.env.JWT_SECRET_FILE) {
      try {
        jwtSecret = fs.readFileSync(process.env.JWT_SECRET_FILE, 'utf8').trim();
        console.log('[JwtStrategy] Secret lido do arquivo com sucesso');
      } catch (err) {
        console.log('[JwtStrategy] Erro ao ler secret file: ' + err.message);
      }
    } else {
      console.log('[JwtStrategy] Usando JWT_SECRET de config: ' + (jwtSecret ? 'definido' : 'não definido'));
    }
    if (!jwtSecret) {
      throw new Error('JWT_SECRET or JWT_SECRET_FILE must be set');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      tenantId: payload.tenantId,
      role: payload.role,
    };
  }
}
