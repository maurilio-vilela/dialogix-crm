import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { readFileSync } from 'fs';
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

    await this.persistSession(tenantId, {
      sessionId,
      status: 'connecting',
      qrCodeBase64: undefined,
      phone: undefined,
      displayName: undefined,
      lastUpdateAt: new Date().toISOString(),
      errorMessage: undefined,
    });

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
      phoneNumber: null,
    });

    this.logger.log(`WhatsApp connect requested for tenant ${tenantId}`);

    return this.toResponse(tenantId, session);
  }

  async reconnect(tenantId: string) {
    const sessionId = await this.ensureSessionId(tenantId);

    await this.persistSession(tenantId, {
      sessionId,
      status: 'connecting',
      qrCodeBase64: undefined,
      phone: undefined,
      displayName: undefined,
      lastUpdateAt: new Date().toISOString(),
      errorMessage: undefined,
    });

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
      try {
        await this.callWppConnect('post', `/api/${sessionId}/logout-session`);
      } catch (error) {
        this.logger.warn(`Falha ao desconectar sessão ${sessionId}`);
      }
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
        }
      }

      mapped.qrCodeBase64 = undefined;
      mapped.errorMessage = undefined;
      await this.persistSession(tenantId, mapped);

      await this.upsertChannel(tenantId, {
        status: ChannelStatus.CONNECTED,
        phoneNumber: mapped.phone ?? channel.phoneNumber ?? undefined,
      });
    }

    if (status === 'disconnected') {
      mapped.phone = undefined;
      mapped.displayName = undefined;
      mapped.qrCodeBase64 = undefined;
      await this.persistSession(tenantId, mapped);

      await this.upsertChannel(tenantId, {
        status: ChannelStatus.DISCONNECTED,
        phoneNumber: null,
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
    const status =
      this.mapStatus(payload.status ?? payload.event ?? payload?.payload?.state) ??
      (stored.status as WhatsAppChannelStatus);
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
    const sessionName = this.configService.get('WPPCONNECT_SESSION_NAME') || 'dialogix';
    const stored = await this.sessionsRepository.findOne({ where: { tenantId } });
    if (stored) {
      if (stored.sessionId !== sessionName) {
        stored.sessionId = sessionName;
        await this.sessionsRepository.save(stored);
      }
      return stored.sessionId;
    }

    if (!createIfMissing) {
      return null;
    }

    const created = this.sessionsRepository.create({
      tenantId,
      sessionId: sessionName,
      status: 'disconnected',
    });
    await this.sessionsRepository.save(created);

    return sessionName;
  }

  private async getSessionState(tenantId: string) {
    if (this.sessions.has(tenantId)) {
      return this.sessions.get(tenantId) ?? null;
    }

    if (!(await this.whatsappTableExists())) {
      return null;
    }

    let stored: WhatsAppSession | null = null;
    try {
      stored = await this.sessionsRepository.findOne({ where: { tenantId } });
    } catch (error) {
      this.logger.warn('Tabela whatsapp_sessions não encontrada. Ignorando sessão.');
      return null;
    }

    if (!stored) {
      return null;
    }

    const sessionName = this.configService.get('WPPCONNECT_SESSION_NAME') || 'dialogix';
    if (stored.sessionId !== sessionName) {
      stored.sessionId = sessionName;
      await this.sessionsRepository.save(stored);
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
    const rawToken = this.getWppConnectToken();

    if (!baseURL || !rawToken) {
      throw new NotFoundException('WPPConnect não configurado');
    }

    const token = rawToken.includes(':') ? rawToken.split(':').slice(-1)[0] : rawToken;

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

  private getWppConnectToken() {
    const direct = this.configService.get('WPPCONNECT_TOKEN');
    if (direct) {
      return direct;
    }

    const tokenFile = this.configService.get('WPPCONNECT_TOKEN_FILE');
    const fallbackFile = '/run/secrets/wppconnect_token';
    const fileToRead = tokenFile || fallbackFile;

    try {
      return readFileSync(fileToRead, 'utf8').trim();
    } catch (error) {
      this.logger.warn(`Não foi possível ler WPPCONNECT_TOKEN_FILE em ${fileToRead}`);
      return null;
    }
  }

  private async whatsappTableExists() {
    try {
      const [{ exists }] = await this.channelsRepository.query(`
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = 'whatsapp_sessions'
        ) AS exists
      `);
      return Boolean(exists);
    } catch (error) {
      return false;
    }
  }

  private async fetchDeviceInfo(sessionId: string) {
    try {
      const response = await this.callWppConnect('get', `/api/${sessionId}/host-device`);
      const data = response?.data || {};
      const wid = data?.wid;
      const phone =
        (typeof wid === 'string' ? wid : undefined) ||
        (wid && typeof wid === 'object' ? wid.user || wid._serialized : undefined) ||
        data?.phone ||
        data?.number;
      return {
        phone,
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
      payload?.payload?.session ||
      payload?.payload?.sessionId ||
      payload?.payload?.instance ||
      payload?.data?.session ||
      payload?.data?.sessionId ||
      payload?.data?.instance
    );
  }

  private extractPhone(payload: WppConnectWebhookPayload) {
    const nested = payload?.payload || payload?.data || {};
    return payload?.phone || nested?.phone || nested?.from || payload?.sender?.id || nested?.sender?.id;
  }

  private extractDisplayName(payload: WppConnectWebhookPayload) {
    const nested = payload?.payload || payload?.data || {};
    return (
      payload?.displayName ||
      nested?.displayName ||
      nested?.notifyName ||
      payload?.sender?.pushname ||
      payload?.sender?.name ||
      nested?.sender?.pushname ||
      nested?.sender?.name
    );
  }

  private mapStatus(status?: string): WhatsAppChannelStatus | null {
    if (!status || typeof status !== 'string') return null;

    const normalized = status.toLowerCase();

    if (
      normalized === 'connected' ||
      normalized === 'open' ||
      normalized.includes('connected') ||
      normalized.includes('open')
    ) {
      return 'connected';
    }

    if (normalized.includes('qr') || normalized.includes('qrcode') || normalized.includes('scan')) {
      return 'qr_pending';
    }

    if (
      normalized.includes('init') ||
      normalized.includes('start') ||
      normalized.includes('opening') ||
      normalized.includes('loading')
    ) {
      return 'connecting';
    }

    if (
      normalized.includes('close') ||
      normalized.includes('disconnect') ||
      normalized.includes('unpaired') ||
      normalized.includes('logout')
    ) {
      return 'disconnected';
    }

    if (normalized.includes('error') || normalized.includes('fail') || normalized.includes('conflict')) {
      return 'error';
    }

    return null;
  }

  private extractQrCode(payload: Record<string, any> | undefined) {
    if (!payload) return undefined;
    return payload?.qrcode || payload?.qrCode || payload?.qr || payload?.base64Qr;
  }
}
