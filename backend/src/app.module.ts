import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './database/data-source';
import { HealthController } from './health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeORM
    TypeOrmModule.forRoot(dataSourceOptions),

    // Application Modules
    AuthModule,
    UsersModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
