import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // Tenta ler do arquivo JWT_SECRET_FILE primeiro (Docker Swarm secrets)
        const secretFile = process.env.JWT_SECRET_FILE || '/run/secrets/jwt_secret';
        const fs = require('fs');
        let secret = '';

        try {
          if (fs.existsSync(secretFile)) {
            secret = fs.readFileSync(secretFile, 'utf8').trim();
            console.log(`[AuthModule] Secret lido do arquivo: ${secretFile}`);
          }
        } catch (error) {
          console.error('[AuthModule] Erro ao ler arquivo de secret:', error);
        }

        // Fallback para variável de ambiente
        if (!secret) {
          secret = configService.get<string>('JWT_SECRET');
          console.log('[AuthModule] Usando JWT_SECRET do environment');
        }

        if (!secret) {
          throw new Error('JWT_SECRET não encontrado (arquivo ou environment)');
        }

        // Log temporário de diagnóstico (hash do secret, sem expor valor)
        try {
          const { createHash } = require('crypto');
          const hash = createHash('sha256').update(secret).digest('hex');
          console.log('[AuthModule] JWT_SECRET hash (sha256):', hash.slice(0, 12));
        } catch (e) {
          console.log('[AuthModule] Falha ao gerar hash do JWT_SECRET');
        }

        return {
          secret,
          signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION') || '7d' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
