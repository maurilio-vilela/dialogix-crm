import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Channel, ChannelStatus, ChannelType } from '../entities/channel.entity';
import { WhatsAppSession } from './entities/whatsapp-session.entity';
import { WppConnectWebhookPayload } from './whatsapp.webhook.dto';

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
    @InjectRepository(WhatsAppSession)
    private readonly sessionsRepository: Repository<WhatsAppSession>,
    private readonly configService: ConfigService,
  ) {}

  async connect(tenantId: string) {
    const sessionId = await this.ensureSessionId(tenantId);

    const response = await this.callWppConnect('post', `/api/${sessionId}/start-session`, {
      webhook: this.configService.get('WPP_WEBHOOK_URL') || undefined,
      waitQrCode: true,
    });

    const session = this.mergeSession(tenantId, {
      sessionId,
      status: this.mapStatus(response?.data?.status) ?? 'connecting',
      qrCodeBase64: this.extractQrCode(response?.data),
      lastUpdateAt: new Date().toISOString(),
      errorMessage: response?.data?.message,
    });

    await this.persistSession(tenantId, session);
    await this.upsertChannel(tenantId, {
      status: ChannelStatus.DISCONNECTED,
    });

    this.logger.log(`WhatsApp connect requested for tenant ${tenantId}`);

    return this.toResponse(tenantId, session);
  }

  async reconnect(tenantId: string) {
    const sessionId = await this.ensureSessionId(tenantId);

    const response = await this.callWppConnect('post', `/api/${sessionId}/start-session`, {
      webhook: this.configService.get('WPP_WEBHOOK_URL') || undefined,
      waitQrCode: true,
    });

    const session = this.mergeSession(tenantId, {
      sessionId,
      status: this.mapStatus(response?.data?.status) ?? 'connecting',
      qrCodeBase64: this.extractQrCode(response?.data),
      lastUpdateAt: new Date().toISOString(),
      errorMessage: response?.data?.message,
    });

    await this.persistSession(tenantId, session);

    this.logger.log(`WhatsApp reconnect requested for tenant ${tenantId}`);

    return this.toResponse(tenantId, session);
  }

  async disconnect(tenantId: string) {
    const sessionId = await this.ensureSessionId(tenantId, false);

    if (sessionId) {
      await this.callWppConnect('post', `/api/${sessionId}/logout-session`);
    }

    await this.upsertChannel(tenantId, {
      status: ChannelStatus.DISCONNECTED,
      phoneNumber: null,
    });

    this.sessions.delete(tenantId);
    await this.removeSession(tenantId);

    this.logger.log(`WhatsApp disconnected for tenant ${tenantId}`);

    return {
      success: true,
      message: 'WhatsApp desconectado com sucesso',
    };
  }

  async getStatus(tenantId: string): Promise<WhatsAppChannelState> {
    const channel = await this.findOrCreateChannel(tenantId);
    const session = await this.getSessionState(tenantId);

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

    const sessionId = session.sessionId;
    const response = await this.callWppConnect('get', `/api/${sessionId}/check-connection-session`);
    const status = this.mapStatus(response?.data?.status) ?? session.status;
    const mapped = this.mergeSession(tenantId, {
      status,
      lastHeartbeatAt: new Date().toISOString(),
      lastUpdateAt: new Date().toISOString(),
      errorMessage: response?.data?.message,
    });

    await this.persistSession(tenantId, mapped);

    if (status === 'connected') {
      if (!mapped.phone || !mapped.displayName) {
        const device = await this.fetchDeviceInfo(sessionId);
        if (device?.phone || device?.displayName) {
          mapped.phone = device.phone ?? mapped.phone;
          mapped.displayName = device.displayName ?? mapped.displayName;
          await this.persistSession(tenantId, mapped);
        }
      }

      await this.upsertChannel(tenantId, {
        status: ChannelStatus.CONNECTED,
        phoneNumber: mapped.phone ?? channel.phoneNumber ?? undefined,
      });
    }

    return this.toResponse(tenantId, mapped);
  }

  private mergeSession(tenantId: string, patch: Partial<SessionState>): SessionState {
    const existing = this.sessions.get(tenantId);
    const sessionId = patch.sessionId ?? existing?.sessionId ?? uuid();
    const status = patch.status ?? existing?.status ?? 'disconnected';

    return {
      sessionId,
      status,
      phone: patch.phone ?? existing?.phone,
      displayName: patch.displayName ?? existing?.displayName,
      qrCodeBase64: patch.qrCodeBase64 ?? existing?.qrCodeBase64,
      lastUpdateAt: patch.lastUpdateAt ?? existing?.lastUpdateAt,
      lastHeartbeatAt: patch.lastHeartbeatAt ?? existing?.lastHeartbeatAt,
      errorMessage: patch.errorMessage ?? existing?.errorMessage,
    };
  }

  async getQrCode(tenantId: string) {
    const session = await this.getSessionState(tenantId);

    if (!session) {
      throw new NotFoundException('Sessão WhatsApp não encontrada');
    }

    const response = await this.callWppConnect('get', `/api/${session.sessionId}/qrcode-session`);
    const qrCodeBase64 = this.extractQrCode(response?.data) ?? session.qrCodeBase64;
    const mapped = this.mergeSession(tenantId, {
      qrCodeBase64,
      lastUpdateAt: new Date().toISOString(),
    });

    await this.persistSession(tenantId, mapped);

    return {
      qrCodeBase64: mapped.qrCodeBase64 ?? null,
    };
  }

  async handleWebhook(payload: WppConnectWebhookPayload) {
    const sessionId = this.extractSessionId(payload);

    if (!sessionId) {
      this.logger.warn('Webhook recebido sem sessionId');
      return { received: true };
    }

    const stored = await this.sessionsRepository.findOne({ where: { sessionId } });
    if (!stored) {
      this.logger.warn(`Webhook para sessão desconhecida: ${sessionId}`);
      return { received: true };
    }

    const tenantId = stored.tenantId;
    const status = this.mapStatus(payload.status ?? payload.event) ?? stored.status;
    const mapped = this.mergeSession(tenantId, {
      sessionId,
      status,
      phone: this.extractPhone(payload) ?? stored.phoneNumber ?? undefined,
      displayName: this.extractDisplayName(payload) ?? stored.displayName ?? undefined,
      lastHeartbeatAt: new Date().toISOString(),
      lastUpdateAt: new Date().toISOString(),
      errorMessage: payload?.message ?? stored.errorMessage ?? undefined,
    });

    await this.persistSession(tenantId, mapped);

    if (status === 'connected') {
      await this.upsertChannel(tenantId, {
        status: ChannelStatus.CONNECTED,
        phoneNumber: mapped.phone ?? undefined,
      });
    }

    if (status === 'disconnected') {
      await this.upsertChannel(tenantId, {
        status: ChannelStatus.DISCONNECTED,
      });
    }

    return { received: true };
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

  private async ensureSessionId(tenantId: string, createIfMissing = true) {
    const stored = await this.sessionsRepository.findOne({ where: { tenantId } });
    if (stored) {
      return stored.sessionId;
    }

    if (!createIfMissing) {
      return null;
    }

    const sessionId = `tenant-${tenantId}`;
    const created = this.sessionsRepository.create({
      tenantId,
      sessionId,
      status: 'disconnected',
    });
    await this.sessionsRepository.save(created);

    return sessionId;
  }

  private async getSessionState(tenantId: string) {
    if (this.sessions.has(tenantId)) {
      return this.sessions.get(tenantId) ?? null;
    }

    const stored = await this.sessionsRepository.findOne({ where: { tenantId } });
    if (!stored) {
      return null;
    }

    const session: SessionState = {
      sessionId: stored.sessionId,
      status: stored.status as WhatsAppChannelStatus,
      phone: stored.phoneNumber ?? undefined,
      displayName: stored.displayName ?? undefined,
      lastUpdateAt: stored.lastUpdateAt?.toISOString(),
      lastHeartbeatAt: stored.lastHeartbeatAt?.toISOString(),
      errorMessage: stored.errorMessage ?? undefined,
    };

    this.sessions.set(tenantId, session);
    return session;
  }

  private async persistSession(tenantId: string, session: SessionState) {
    this.sessions.set(tenantId, session);

    const stored = await this.sessionsRepository.findOne({ where: { tenantId } });
    if (!stored) {
      const created = this.sessionsRepository.create({
        tenantId,
        sessionId: session.sessionId,
        status: session.status,
        phoneNumber: session.phone,
        displayName: session.displayName,
        lastUpdateAt: session.lastUpdateAt ? new Date(session.lastUpdateAt) : undefined,
        lastHeartbeatAt: session.lastHeartbeatAt ? new Date(session.lastHeartbeatAt) : undefined,
        errorMessage: session.errorMessage,
      });
      await this.sessionsRepository.save(created);
      return;
    }

    const updated = this.sessionsRepository.merge(stored, {
      status: session.status,
      phoneNumber: session.phone,
      displayName: session.displayName,
      lastUpdateAt: session.lastUpdateAt ? new Date(session.lastUpdateAt) : stored.lastUpdateAt,
      lastHeartbeatAt: session.lastHeartbeatAt
        ? new Date(session.lastHeartbeatAt)
        : stored.lastHeartbeatAt,
      errorMessage: session.errorMessage,
    });
    await this.sessionsRepository.save(updated);
  }

  private async removeSession(tenantId: string) {
    await this.sessionsRepository.delete({ tenantId });
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

  private async callWppConnect(method: 'get' | 'post', path: string, data?: Record<string, unknown>) {
    const baseURL = this.configService.get('WPPCONNECT_BASE_URL');
    const token = this.configService.get('WPPCONNECT_TOKEN');

    if (!baseURL || !token) {
      throw new NotFoundException('WPPConnect não configurado');
    }

    return axios({
      method,
      url: `${baseURL}${path}`,
      data,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  }

  private async fetchDeviceInfo(sessionId: string) {
    try {
      const response = await this.callWppConnect('get', `/api/${sessionId}/host-device`);
      const data = response?.data || {};
      return {
        phone: data?.wid || data?.phone || data?.number,
        displayName: data?.pushname || data?.displayName || data?.name,
      };
    } catch (error) {
      this.logger.warn(`Não foi possível obter device info para ${sessionId}`);
      return null;
    }
  }

  private extractSessionId(payload: WppConnectWebhookPayload) {
    return (
      payload?.session ||
      payload?.sessionId ||
      payload?.data?.session ||
      payload?.data?.sessionId ||
      payload?.data?.instance
    );
  }

  private extractPhone(payload: WppConnectWebhookPayload) {
    return payload?.phone || payload?.data?.phone || payload?.sender?.id;
  }

  private extractDisplayName(payload: WppConnectWebhookPayload) {
    return payload?.displayName || payload?.data?.displayName || payload?.sender?.name;
  }

  private mapStatus(status?: string): WhatsAppChannelStatus | null {
    if (!status) return null;

    const normalized = status.toLowerCase();
    if (normalized.includes('connect') || normalized.includes('open')) {
      return 'connected';
    }
    if (normalized.includes('qr')) {
      return 'qr_pending';
    }
    if (normalized.includes('init') || normalized.includes('start')) {
      return 'connecting';
    }
    if (normalized.includes('close') || normalized.includes('disconnect')) {
      return 'disconnected';
    }
    if (normalized.includes('error')) {
      return 'error';
    }

    return null;
  }

  private extractQrCode(payload: Record<string, any> | undefined) {
    if (!payload) return undefined;
    return payload?.qrcode || payload?.qrCode || payload?.qr || payload?.base64Qr;
  }
}
