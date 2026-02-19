import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secretFile = process.env.JWT_SECRET_FILE || '/run/secrets/jwt_secret';
        const fs = require('fs');
        let secret = '';

        try {
          if (fs.existsSync(secretFile)) {
            secret = fs.readFileSync(secretFile, 'utf8').trim();
          }
        } catch (error) {
          console.error('[ChatModule] Erro ao ler arquivo de secret:', error);
        }

        if (!secret) {
          secret = configService.get<string>('JWT_SECRET');
        }

        if (!secret) {
          throw new Error('JWT_SECRET não encontrado (arquivo ou environment)');
        }

        return {
          secret,
          signOptions: { expiresIn: configService.get<string>('JWT_EXPIRATION') || '7d' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class ChatModule {}
