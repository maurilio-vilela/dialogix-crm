import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
  ) {}

  async create(tenantId: string, createConversationDto: CreateConversationDto): Promise<Conversation> {
    const conversation = this.conversationsRepository.create({
      ...createConversationDto,
      tenantId,
    });
    return this.conversationsRepository.save(conversation);
  }

  findAll(tenantId: string): Promise<Conversation[]> {
    return this.conversationsRepository.find({ 
      where: { tenantId },
      relations: ['contact', 'assignedUser'],
      order: { lastMessageAt: 'DESC' } 
    });
  }

  async findOne(id: string, tenantId: string): Promise<Conversation> {
    const conversation = await this.conversationsRepository.findOne({ where: { id, tenantId }, relations: ['contact', 'assignedUser', 'messages'] });
    if (!conversation) {
      throw new NotFoundException(`Conversation #${id} not found`);
    }
    return conversation;
  }

  async update(id: string, tenantId: string, updateConversationDto: UpdateConversationDto): Promise<Conversation> {
    const conversation = await this.findOne(id, tenantId); // Reuses findOne to ensure tenant isolation and existence check
    
    Object.assign(conversation, updateConversationDto);

    return this.conversationsRepository.save(conversation);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const conversation = await this.findOne(id, tenantId);
    await this.conversationsRepository.remove(conversation);
  }
}
