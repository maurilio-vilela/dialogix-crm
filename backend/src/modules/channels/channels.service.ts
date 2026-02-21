import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from './entities/channel.entity';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(Channel)
    private readonly channelsRepository: Repository<Channel>,
  ) {}

  async create(tenantId: string, createChannelDto: CreateChannelDto) {
    if (createChannelDto.isDefault === true) {
      await this.channelsRepository.update({ tenantId, isDefault: true }, { isDefault: false });
    }

    const channel = this.channelsRepository.create({
      ...createChannelDto,
      tenantId,
    });

    const saved = await this.channelsRepository.save(channel);
    return this.toResponse(saved);
  }

  async findAll(tenantId: string) {
    const channels = await this.channelsRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });

    return channels.map((channel) => this.toResponse(channel));
  }

  async findOne(id: string, tenantId: string) {
    const channel = await this.channelsRepository.findOne({
      where: { id, tenantId },
    });

    if (!channel) {
      throw new NotFoundException('Canal não encontrado');
    }

    return channel;
  }

  async update(id: string, tenantId: string, updateChannelDto: UpdateChannelDto) {
    const channel = await this.findOne(id, tenantId);

    if (updateChannelDto.isDefault === true) {
      await this.channelsRepository.update({ tenantId, isDefault: true }, { isDefault: false });
    }

    const updated = this.channelsRepository.merge(channel, updateChannelDto);
    const saved = await this.channelsRepository.save(updated);

    return this.toResponse(saved);
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    await this.channelsRepository.softDelete({ id, tenantId });

    return {
      success: true,
      message: 'Canal removido com sucesso',
    };
  }

  private toResponse(channel: Channel) {
    return {
      id: channel.id,
      tenant_id: channel.tenantId,
      tenantId: channel.tenantId,
      name: channel.name,
      type: channel.type,
      status: channel.status,
      phone_number: channel.phoneNumber ?? null,
      phoneNumber: channel.phoneNumber ?? null,
      is_default: channel.isDefault,
      isDefault: channel.isDefault,
      created_at: channel.createdAt,
      createdAt: channel.createdAt,
      updated_at: channel.updatedAt,
      updatedAt: channel.updatedAt,
    };
  }
}
