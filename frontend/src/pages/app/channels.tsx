import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  channelsService,
  ChannelProvider,
  ChannelStatus,
} from '@/services/channels';
import {
  BadgeCheck,
  CheckCircle2,
  Clock,
  Loader2,
  MessageCircle,
  RefreshCcw,
  ShieldAlert,
  Smartphone,
} from 'lucide-react';

const statusMap: Record<ChannelStatus, { label: string; color: string }> = {
  disconnected: { label: 'Desconectado', color: 'bg-slate-500' },
  connecting: { label: 'Conectando', color: 'bg-amber-500' },
  qr_pending: { label: 'Aguardando QR', color: 'bg-sky-500' },
  connected: { label: 'Conectado', color: 'bg-emerald-500' },
  error: { label: 'Erro', color: 'bg-rose-500' },
};

const statusDescriptions: Record<ChannelStatus, string> = {
  disconnected: 'Conecte um número para iniciar os atendimentos.',
  connecting: 'Iniciando sessão e preparando QR Code.',
  qr_pending: 'Aguardando leitura do QR Code pelo WhatsApp.',
  connected: 'Canal conectado e pronto para atender clientes.',
  error: 'Falha na conexão. Tente novamente ou atualize o QR.',
};

const fetchWhatsAppStatus = channelsService.fetchWhatsAppStatus;
const connectWhatsApp = channelsService.connectWhatsApp;
const reconnectWhatsApp = channelsService.reconnectWhatsApp;
const disconnectWhatsApp = channelsService.disconnectWhatsApp;
const refreshQrCode = channelsService.refreshWhatsAppQr;

export function ChannelsPage() {
  const queryClient = useQueryClient();
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const prevStatusRef = useRef<ChannelStatus>('disconnected');

  const provider = (import.meta.env.VITE_WHATSAPP_PROVIDER || 'wppconnect') as ChannelProvider;
  const pollingInterval = Number(import.meta.env.VITE_CHANNELS_POLLING_MS || 5000);

  const { data: channel, isLoading } = useQuery({
    queryKey: ['channels', 'whatsapp', 'status', provider],
    queryFn: () => fetchWhatsAppStatus(provider),
    refetchInterval: pollingInterval,
  });

  const connectMutation = useMutation({
    mutationFn: () => connectWhatsApp(provider),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['channels', 'whatsapp', 'status', provider] }),
  });

  const reconnectMutation = useMutation({
    mutationFn: () => reconnectWhatsApp(provider),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['channels', 'whatsapp', 'status', provider] }),
  });

  const disconnectMutation = useMutation({
    mutationFn: () => disconnectWhatsApp(provider),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['channels', 'whatsapp', 'status', provider] }),
  });

  const qrMutation = useMutation({
    mutationFn: () => refreshQrCode(provider),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['channels', 'whatsapp', 'status', provider] }),
  });

  const status = channel?.status ?? 'disconnected';
  const statusInfo = statusMap[status];
  const isBusy =
    connectMutation.isPending ||
    reconnectMutation.isPending ||
    disconnectMutation.isPending ||
    qrMutation.isPending;

  const canShowQr = status === 'qr_pending';

  useEffect(() => {
    const previous = prevStatusRef.current;
    if (previous !== 'connected' && status === 'connected') {
      setIsQrOpen(false);
      setSuccessMessage(
        `WhatsApp conectado com sucesso${channel?.phone ? `: ${channel.phone}` : ''}.`,
      );
    }

    if (previous === 'connected' && status !== 'connected') {
      setSuccessMessage(null);
    }

    prevStatusRef.current = status;
  }, [channel?.phone, status]);

  const formattedLastUpdate = useMemo(() => {
    if (!channel?.lastUpdateAt) return '-';
    return new Date(channel.lastUpdateAt).toLocaleString('pt-BR');
  }, [channel?.lastUpdateAt]);

  const formattedHeartbeat = useMemo(() => {
    if (!channel?.lastHeartbeatAt) return 'Não informado';
    return new Date(channel.lastHeartbeatAt).toLocaleString('pt-BR');
  }, [channel?.lastHeartbeatAt]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight font-heading">Canais de atendimento</h2>
        <p className="text-muted-foreground">
          Integração WhatsApp (WPPConnect) para o MVP. Status em tempo real, QR Code e ações rápidas.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>WhatsApp (WPPConnect)</CardTitle>
              <p className="text-sm text-muted-foreground">Provedor v1 · MVP</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-2">
              <span className={`h-2 w-2 rounded-full ${statusInfo.color}`} />
              {statusInfo.label}
            </Badge>
            {channel?.provider && <Badge variant="outline">{channel.provider}</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            {statusDescriptions[status]}
          </div>

          {successMessage && (
            <div className="flex items-start justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              <div className="flex items-start gap-2">
                <BadgeCheck className="mt-0.5 h-4 w-4" />
                <span>{successMessage}</span>
              </div>
              <button
                type="button"
                className="text-emerald-700/70 hover:text-emerald-900"
                onClick={() => setSuccessMessage(null)}
                aria-label="Fechar aviso"
              >
                ✕
              </button>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Número conectado</p>
              <p className="mt-2 text-sm font-semibold">
                {status === 'connected' ? channel?.phone || 'Não informado' : 'Não conectado'}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Sessão / Instância</p>
              <p className="mt-2 text-sm font-semibold">{channel?.displayName || channel?.sessionId || '-'}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Última atualização</p>
              <p className="mt-2 text-sm font-semibold">{formattedLastUpdate}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Último heartbeat</p>
              <p className="mt-2 text-sm font-semibold">{formattedHeartbeat}</p>
            </div>
          </div>

          {channel?.errorMessage && status === 'error' && (
            <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <ShieldAlert className="mt-0.5 h-4 w-4" />
              <div>
                <p className="font-semibold">Erro na conexão</p>
                <p>{channel.errorMessage}</p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => {
                connectMutation.mutate();
                setIsQrOpen(true);
              }}
              disabled={isBusy || status === 'connected' || status === 'connecting'}
            >
              {connectMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Smartphone className="mr-2 h-4 w-4" />
              )}
              Conectar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                qrMutation.mutate();
                setIsQrOpen(true);
              }}
              disabled={isBusy}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Atualizar QR
            </Button>
            <Button
              variant="secondary"
              onClick={() => reconnectMutation.mutate()}
              disabled={isBusy}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Reconectar
            </Button>
            <Button
              variant="destructive"
              onClick={() => disconnectMutation.mutate()}
              disabled={isBusy || status === 'disconnected'}
            >
              Desconectar
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsQrOpen(true)}
              disabled={!canShowQr}
            >
              Ver QR Code
            </Button>
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Atualizando status do canal...
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Escaneie o QR Code no WhatsApp para autenticar a sessão.
            </p>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {channel?.qrCodeBase64 ? (
              <img
                src={channel.qrCodeBase64.startsWith('data:image')
                  ? channel.qrCodeBase64
                  : `data:image/png;base64,${channel.qrCodeBase64}`}
                alt="QR Code WhatsApp"
                className="h-64 w-64 rounded-xl border bg-white p-2"
              />
            ) : (
              <div className="flex h-64 w-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed text-sm text-muted-foreground">
                <Clock className="h-5 w-5" />
                QR Code ainda não disponível.
              </div>
            )}
            <Button variant="outline" onClick={() => qrMutation.mutate()} disabled={qrMutation.isPending}>
              {qrMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="mr-2 h-4 w-4" />
              )}
              Atualizar QR
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Checklist do MVP</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {[
            'Status em tempo real com polling',
            'Conectar e exibir QR Code',
            'Reconectar e desconectar',
            'Mensagens de erro amigáveis',
            'UI preparada para trocar provider',
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-lg border p-3 text-sm">
              <BadgeCheck className="h-4 w-4 text-emerald-500" />
              {item}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
