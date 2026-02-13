import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, MessageDirection } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { ConversationsService } from '../conversations/conversations.service';
import { ChatGateway } from '../chat/chat.gateway';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    private conversationsService: ConversationsService,
    private chatGateway: ChatGateway,
  ) {}

  async create(tenantId: string, senderUserId: string, createMessageDto: CreateMessageDto): Promise<Message> {
    // 1. Validar se a conversa existe e pertence ao tenant
    const conversation = await this.conversationsService.findOne(createMessageDto.conversationId, tenantId);
    if (!conversation) {
      throw new NotFoundException(`Conversation #${createMessageDto.conversationId} not found`);
    }

    // 2. Criar a mensagem
    const message = this.messagesRepository.create({
      ...createMessageDto,
      tenantId,
      senderUserId,
      direction: MessageDirection.OUTBOUND, // Mensagens via API são sempre de saída
    });

    // 3. Salvar a mensagem
    const savedMessage = await this.messagesRepository.save(message);

    // 4. Atualizar a conversa com a última mensagem
    conversation.lastMessage = savedMessage.content.substring(0, 100);
    conversation.lastMessageAt = savedMessage.createdAt;
    await this.conversationsService.update(conversation.id, tenantId, { 
      status: conversation.status,
      assignedUserId: conversation.assignedUserId 
    });

    // 5. Emitir evento via WebSocket
    this.chatGateway.sendMessageToTenant(tenantId, 'message:new', savedMessage);

    return savedMessage;
  }

  findAllByConversation(conversationId: string, tenantId: string): Promise<Message[]> {
    return this.messagesRepository.find({
      where: { conversationId, tenantId },
      order: { createdAt: 'ASC' },
      relations: ['senderUser'],
    });
  }
}
