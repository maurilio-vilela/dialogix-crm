import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './database/data-source';
import { HealthController } from './health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ContactsModule } from './modules/contacts/contacts.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeORM
    TypeOrmModule.forRoot({
      ...dataSourceOptions,
      entities: [], // Deixa o autoLoadEntities gerenciar
      autoLoadEntities: true,
    }),

    // Application Modules
    AuthModule,
    UsersModule,
    ContactsModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
