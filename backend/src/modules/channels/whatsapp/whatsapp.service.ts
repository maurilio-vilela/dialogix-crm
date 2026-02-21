import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Channel, ChannelStatus, ChannelType } from '../entities/channel.entity';

export type WhatsAppChannelStatus =
  | 'disconnected'
  | 'connecting'
  | 'qr_pending'
  | 'connected'
  | 'error';

export interface WhatsAppChannelState {
  provider: 'wppconnect';
  sessionId: string;
  status: WhatsAppChannelStatus;
  phone?: string;
  displayName?: string;
  qrCodeBase64?: string;
  lastUpdateAt?: string;
  lastHeartbeatAt?: string;
  errorMessage?: string;
}

interface SessionState {
  sessionId: string;
  status: WhatsAppChannelStatus;
  phone?: string;
  displayName?: string;
  qrCodeBase64?: string;
  lastUpdateAt?: string;
  lastHeartbeatAt?: string;
  errorMessage?: string;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly sessions = new Map<string, SessionState>();

  constructor(
    @InjectRepository(Channel)
    private readonly channelsRepository: Repository<Channel>,
  ) {}

  async connect(tenantId: string) {
    const sessionId = uuid();
    const session: SessionState = {
      sessionId,
      status: 'qr_pending',
      qrCodeBase64: this.placeholderQr(),
      lastUpdateAt: new Date().toISOString(),
    };

    this.sessions.set(tenantId, session);
    await this.upsertChannel(tenantId, {
      status: ChannelStatus.DISCONNECTED,
    });

    this.logger.log(`WhatsApp connect requested for tenant ${tenantId}`);

    return this.toResponse(tenantId, session);
  }

  async reconnect(tenantId: string) {
    const session = this.sessions.get(tenantId);
    if (!session) {
      return this.connect(tenantId);
    }

    session.status = 'qr_pending';
    session.qrCodeBase64 = this.placeholderQr();
    session.lastUpdateAt = new Date().toISOString();
    session.errorMessage = undefined;
    this.sessions.set(tenantId, session);

    this.logger.log(`WhatsApp reconnect requested for tenant ${tenantId}`);

    return this.toResponse(tenantId, session);
  }

  async disconnect(tenantId: string) {
    const session = this.sessions.get(tenantId);

    await this.upsertChannel(tenantId, {
      status: ChannelStatus.DISCONNECTED,
      phoneNumber: null,
    });

    if (session) {
      this.sessions.delete(tenantId);
    }

    this.logger.log(`WhatsApp disconnected for tenant ${tenantId}`);

    return {
      success: true,
      message: 'WhatsApp desconectado com sucesso',
    };
  }

  async getStatus(tenantId: string): Promise<WhatsAppChannelState> {
    const channel = await this.findOrCreateChannel(tenantId);
    const session = this.sessions.get(tenantId);

    if (!session) {
      return {
        provider: 'wppconnect',
        sessionId: channel.id,
        status: 'disconnected',
        phone: channel.phoneNumber ?? undefined,
        displayName: channel.name,
        lastUpdateAt: channel.updatedAt?.toISOString(),
      };
    }

    return this.toResponse(tenantId, session);
  }

  async getQrCode(tenantId: string) {
    const session = this.sessions.get(tenantId);

    if (!session) {
      throw new NotFoundException('Sessão WhatsApp não encontrada');
    }

    return {
      qrCodeBase64: session.qrCodeBase64 ?? null,
    };
  }

  private async findOrCreateChannel(tenantId: string) {
    const existing = await this.channelsRepository.findOne({
      where: { tenantId, type: ChannelType.WHATSAPP },
    });

    if (existing) {
      return existing;
    }

    const created = this.channelsRepository.create({
      tenantId,
      type: ChannelType.WHATSAPP,
      name: 'WhatsApp',
      status: ChannelStatus.DISCONNECTED,
    });

    return this.channelsRepository.save(created);
  }

  private async upsertChannel(tenantId: string, data: Partial<Channel>) {
    const channel = await this.findOrCreateChannel(tenantId);
    const updated = this.channelsRepository.merge(channel, data);
    return this.channelsRepository.save(updated);
  }

  private async toResponse(tenantId: string, session: SessionState): Promise<WhatsAppChannelState> {
    const channel = await this.findOrCreateChannel(tenantId);

    return {
      provider: 'wppconnect',
      sessionId: session.sessionId,
      status: session.status,
      phone: session.phone ?? channel.phoneNumber ?? undefined,
      displayName: session.displayName ?? channel.name,
      qrCodeBase64: session.qrCodeBase64,
      lastUpdateAt: session.lastUpdateAt ?? channel.updatedAt?.toISOString(),
      lastHeartbeatAt: session.lastHeartbeatAt,
      errorMessage: session.errorMessage,
    };
  }

  private placeholderQr() {
    return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';
  }
}
