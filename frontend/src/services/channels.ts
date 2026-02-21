import api from '@/lib/axios';

export type ChannelStatus =
  | 'disconnected'
  | 'connecting'
  | 'qr_pending'
  | 'connected'
  | 'error';

export type ChannelProvider = 'wppconnect' | 'whatsmeow';

export interface WhatsAppChannelState {
  provider: ChannelProvider;
  sessionId: string;
  status: ChannelStatus;
  phone?: string;
  displayName?: string;
  qrCodeBase64?: string;
  lastUpdateAt?: string;
  errorMessage?: string;
  lastHeartbeatAt?: string;
}

interface ChannelAdapter {
  fetchStatus: () => Promise<WhatsAppChannelState>;
  connect: () => Promise<unknown>;
  reconnect: () => Promise<unknown>;
  disconnect: () => Promise<unknown>;
  refreshQr: () => Promise<unknown>;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockAdapter: ChannelAdapter = {
  fetchStatus: async () => {
    await delay(300);
    return {
      provider: 'wppconnect',
      sessionId: 'mock-session',
      status: 'qr_pending',
      phone: '+55 11 99999-1234',
      displayName: 'Dialogix Demo',
      qrCodeBase64: '',
      lastUpdateAt: new Date().toISOString(),
      lastHeartbeatAt: new Date().toISOString(),
    };
  },
  connect: async () => delay(300),
  reconnect: async () => delay(300),
  disconnect: async () => delay(300),
  refreshQr: async () => delay(300),
};

const wppconnectAdapter: ChannelAdapter = {
  fetchStatus: async () => {
    const response = await api.get('/channels/whatsapp/status');
    return response.data;
  },
  connect: async () => api.post('/channels/whatsapp/connect'),
  reconnect: async () => api.post('/channels/whatsapp/reconnect'),
  disconnect: async () => api.post('/channels/whatsapp/disconnect'),
  refreshQr: async () => api.get('/channels/whatsapp/qrcode'),
};

const whatsmeowAdapter: ChannelAdapter = {
  fetchStatus: async () => {
    const response = await api.get('/channels/whatsapp/status');
    return response.data;
  },
  connect: async () => api.post('/channels/whatsapp/connect'),
  reconnect: async () => api.post('/channels/whatsapp/reconnect'),
  disconnect: async () => api.post('/channels/whatsapp/disconnect'),
  refreshQr: async () => api.get('/channels/whatsapp/qrcode'),
};

const getAdapter = (provider: ChannelProvider): ChannelAdapter => {
  if (import.meta.env.VITE_CHANNELS_MOCKS === 'true') {
    return mockAdapter;
  }

  switch (provider) {
    case 'whatsmeow':
      return whatsmeowAdapter;
    case 'wppconnect':
    default:
      return wppconnectAdapter;
  }
};

export const channelsService = {
  fetchWhatsAppStatus: async (provider: ChannelProvider = 'wppconnect') => {
    return getAdapter(provider).fetchStatus();
  },
  connectWhatsApp: async (provider: ChannelProvider = 'wppconnect') =>
    getAdapter(provider).connect(),
  reconnectWhatsApp: async (provider: ChannelProvider = 'wppconnect') =>
    getAdapter(provider).reconnect(),
  disconnectWhatsApp: async (provider: ChannelProvider = 'wppconnect') =>
    getAdapter(provider).disconnect(),
  refreshWhatsAppQr: async (provider: ChannelProvider = 'wppconnect') =>
    getAdapter(provider).refreshQr(),
};
