import { SetMetadata } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

/**
 * Decorator para pular rate limiting em rotas específicas
 * Útil para: health checks, webhooks, uploads de arquivos grandes
 */
export const SkipThrottling = () => SkipThrottle();
