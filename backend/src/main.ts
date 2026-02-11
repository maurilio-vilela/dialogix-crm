import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  // Cookie parser
  app.use(cookieParser());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Dialogix CRM API')
    .setDescription('API Documentation for Dialogix CRM - Omnichannel Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('contacts', 'Contact management')
    .addTag('conversations', 'Conversation management')
    .addTag('messages', 'Message management')
    .addTag('channels', 'Channel management')
    .addTag('pipelines', 'Sales pipeline')
    .addTag('deals', 'Deal management')
    .addTag('tasks', 'Task management')
    .addTag('tags', 'Tag management')
    .addTag('quick-replies', 'Quick replies')
    .addTag('ai-agents', 'AI Agents')
    .addTag('webhooks', 'Webhooks')
    .addTag('subscriptions', 'Subscriptions')
    .addTag('payments', 'Payments')
    .addTag('analytics', 'Analytics and reports')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log('');
  console.log('🚀 Dialogix CRM Backend started successfully!');
  console.log('');
  console.log(`📡 API Server: http://localhost:${port}/api/v1`);
  console.log(`📚 API Docs: http://localhost:${port}/api/docs`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('');
}

bootstrap();
