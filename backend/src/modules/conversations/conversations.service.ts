import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { ConversationsQueryDto } from './dto/conversations-query.dto';
import { Channel } from '../channels/entities/channel.entity';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
    @InjectRepository(Channel)
    private channelsRepository: Repository<Channel>,
  ) {}

  async create(tenantId: string, createConversationDto: CreateConversationDto): Promise<Conversation> {
    const channelId = await this.resolveChannelId(tenantId, createConversationDto.channelId, createConversationDto.channel);

    const conversation = this.conversationsRepository.create({
      contactId: createConversationDto.contactId,
      assignedUserId: createConversationDto.assignedUserId,
      channel: channelId,
      tenantId,
    });

    return this.conversationsRepository.save(conversation);
  }

  async findAll(tenantId: string, filters: ConversationsQueryDto = {}): Promise<any[]> {
    const { status, assignedUserId, channelId, channel, contactId, search } = filters;

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
    } else if (channel) {
      queryBuilder
        .leftJoin('channels', 'ch', 'ch.id = conversation.channel AND ch.tenant_id = conversation.tenantId')
        .andWhere('(LOWER(ch.type) = LOWER(:channel) OR LOWER(ch.name) = LOWER(:channel))', {
          channel,
        });
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

    const conversations = await queryBuilder
      .orderBy('conversation.lastMessageAt', 'DESC', 'NULLS LAST')
      .addOrderBy('conversation.updatedAt', 'DESC')
      .getMany();

    return conversations.map((conversation) => ({
      ...conversation,
      channel_id: conversation.channel,
      last_message: conversation.lastMessage ?? null,
      last_message_at: conversation.lastMessageAt ?? null,
    }));
  }

  async findOne(id: string, tenantId: string): Promise<Conversation> {
    const conversation = await this.conversationsRepository.findOne({ where: { id, tenantId }, relations: ['contact', 'assignedUser', 'messages'] });
    if (!conversation) {
      throw new NotFoundException(`Conversation #${id} not found`);
    }
    return conversation;
  }

  async update(id: string, tenantId: string, updateConversationDto: UpdateConversationDto): Promise<Conversation> {
    const conversation = await this.findOne(id, tenantId);

    Object.assign(conversation, updateConversationDto);

    return this.conversationsRepository.save(conversation);
  }

  async updateLastMessage(id: string, tenantId: string, lastMessage: string, lastMessageAt: Date): Promise<void> {
    const normalizedLastMessage = (lastMessage || '').trim();

    const result = await this.conversationsRepository.update(
      { id, tenantId },
      {
        lastMessage: normalizedLastMessage.length > 0 ? normalizedLastMessage : null,
        lastMessageAt: lastMessageAt || new Date(),
      },
    );

    if (!result.affected) {
      throw new NotFoundException(`Conversation #${id} not found`);
    }
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const conversation = await this.findOne(id, tenantId);
    await this.conversationsRepository.remove(conversation);
  }

  private async resolveChannelId(tenantId: string, channelId?: string, channel?: string): Promise<string> {
    if (channelId) {
      const byId = await this.channelsRepository.findOne({ where: { id: channelId, tenantId } });
      if (!byId) throw new NotFoundException('Canal não encontrado para este tenant');
      return byId.id;
    }

    if (channel) {
      const byTypeOrName = await this.channelsRepository
        .createQueryBuilder('ch')
        .where('ch.tenantId = :tenantId', { tenantId })
        .andWhere('(LOWER(ch.type) = LOWER(:channel) OR LOWER(ch.name) = LOWER(:channel))', { channel })
        .orderBy('ch.isDefault', 'DESC')
        .addOrderBy('ch.createdAt', 'ASC')
        .getOne();

      if (!byTypeOrName) {
        throw new NotFoundException('Canal informado não encontrado para este tenant');
      }

      return byTypeOrName.id;
    }

    const defaultChannel = await this.channelsRepository.findOne({ where: { tenantId, isDefault: true } });
    if (defaultChannel) return defaultChannel.id;

    const firstChannel = await this.channelsRepository.findOne({ where: { tenantId }, order: { createdAt: 'ASC' } });
    if (firstChannel) return firstChannel.id;

    throw new NotFoundException('Nenhum canal disponível para criar conversa');
  }
}
