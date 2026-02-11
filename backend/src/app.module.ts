import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';

// Módulos
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { MessagesModule } from './modules/messages/messages.module';
import { ChannelsModule } from './modules/channels/channels.module';
import { PipelinesModule } from './modules/pipelines/pipelines.module';
import { DealsModule } from './modules/deals/deals.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TagsModule } from './modules/tags/tags.module';
import { QuickRepliesModule } from './modules/quick-replies/quick-replies.module';
import { AIAgentsModule } from './modules/ai-agents/ai-agents.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'dialogix_dev',
      password: process.env.DB_PASSWORD || 'dev123',
      database: process.env.DB_DATABASE || 'dialogix_crm_dev',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      logging: process.env.DB_LOGGING === 'true',
    }),

    // Redis + BullMQ
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),

    // Application modules
    AuthModule,
    UsersModule,
    TenantsModule,
    ContactsModule,
    ConversationsModule,
    MessagesModule,
    ChannelsModule,
    PipelinesModule,
    DealsModule,
    TasksModule,
    TagsModule,
    QuickRepliesModule,
    AIAgentsModule,
    WebhooksModule,
    SubscriptionsModule,
    PaymentsModule,
    AnalyticsModule,
    DepartmentsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
