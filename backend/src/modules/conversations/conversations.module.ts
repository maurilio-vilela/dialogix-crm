import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { Conversation } from './entities/conversation.entity';
import { Channel } from '../channels/entities/channel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Channel])],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
