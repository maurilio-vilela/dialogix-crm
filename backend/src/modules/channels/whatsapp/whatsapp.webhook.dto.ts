export interface WppConnectWebhookPayload {
  session?: string;
  sessionId?: string;
  status?: string;
  event?: string;
  phone?: string;
  displayName?: string;
  sender?: {
    id?: string;
    name?: string;
    pushname?: string;
  };
  payload?: Record<string, any>;
  data?: Record<string, any>;
  [key: string]: any;
}
