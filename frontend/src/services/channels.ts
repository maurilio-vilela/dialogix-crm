import api from '@/lib/axios';

export type ChannelStatus =
  | 'disconnected'
  | 'connecting'
  | 'qr_pending'
  | 'connected'
  | 'error';

export interface WhatsAppChannelState {
  provider: 'wppconnect';
  sessionId: string;
  status: ChannelStatus;
  phone?: string;
  displayName?: string;
  qrCodeBase64?: string;
  lastUpdateAt?: string;
  errorMessage?: string;
  lastHeartbeatAt?: string;
}

export const channelsService = {
  fetchWhatsAppStatus: async (): Promise<WhatsAppChannelState> => {
    const response = await api.get('/channels/whatsapp/status');
    return response.data;
  },
  connectWhatsApp: async () => api.post('/channels/whatsapp/connect'),
  reconnectWhatsApp: async () => api.post('/channels/whatsapp/reconnect'),
  disconnectWhatsApp: async () => api.post('/channels/whatsapp/disconnect'),
  refreshWhatsAppQr: async () => api.get('/channels/whatsapp/qrcode'),
};
