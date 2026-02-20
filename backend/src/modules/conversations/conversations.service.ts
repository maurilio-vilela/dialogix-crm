import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ConversationsQueryDto } from './dto/conversations-query.dto';

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

  async findAll(tenantId: string, filters: ConversationsQueryDto = {}): Promise<Conversation[]> {
    const { status, assignedUserId, channelId, contactId, search } = filters;

    const queryBuilder = this.conversationsRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.contact', 'contact')
      .leftJoinAndSelect('conversation.assignedUser', 'assignedUser')
      .where('conversation.tenantId = :tenantId', { tenantId });

    if (status) {
      queryBuilder.andWhere('conversation.status = :status', { status });
    }

    if (assignedUserId) {
      queryBuilder.andWhere('conversation.assignedUserId = :assignedUserId', { assignedUserId });
    }

    if (channelId) {
      queryBuilder.andWhere('conversation.channel = :channelId', { channelId });
    }

    if (contactId) {
      queryBuilder.andWhere('conversation.contactId = :contactId', { contactId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(contact.name ILIKE :search OR contact.email ILIKE :search OR contact.phone ILIKE :search OR conversation.lastMessage ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    return queryBuilder.orderBy('conversation.lastMessageAt', 'DESC', 'NULLS LAST').getMany();
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

  async updateLastMessage(id: string, tenantId: string, lastMessage: string, lastMessageAt: Date): Promise<void> {
    const result = await this.conversationsRepository.update({ id, tenantId }, { lastMessage, lastMessageAt });
    if (!result.affected) {
      throw new NotFoundException(`Conversation #${id} not found`);
    }
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const conversation = await this.findOne(id, tenantId);
    await this.conversationsRepository.remove(conversation);
  }
}
