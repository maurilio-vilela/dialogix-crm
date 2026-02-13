import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Message } from './entities/message.entity';
import { ConversationsModule } from '../conversations/conversations.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    ConversationsModule, // Importa para usar o ConversationsService
    ChatModule, // Importa para usar o ChatGateway
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
