import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Wifi, WifiOff, Send } from 'lucide-react';

export function ChatTestPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [pingCount, setPingCount] = useState(0);

  const { socket, isConnected, error, emit, on, off } = useWebSocket({
    autoConnect: true,
    onConnect: () => {
      addMessage('✅ Conectado ao servidor WebSocket!');
    },
    onDisconnect: () => {
      addMessage('❌ Desconectado do servidor WebSocket');
    },
    onError: (err) => {
      addMessage(`❌ Erro: ${err.message}`);
    },
  });

  useEffect(() => {
    // Listener para pong
    const handlePong = (data: any) => {
      addMessage(`🏓 Pong recebido: ${JSON.stringify(data)}`);
    };

    // Listener para user:online
    const handleUserOnline = (data: any) => {
      addMessage(`👤 Usuário online: ${data.userId}`);
    };

    // Listener para user:offline
    const handleUserOffline = (data: any) => {
      addMessage(`👤 Usuário offline: ${data.userId}`);
    };

    on('pong', handlePong);
    on('user:online', handleUserOnline);
    on('user:offline', handleUserOffline);

    return () => {
      off('pong', handlePong);
      off('user:online', handleUserOnline);
      off('user:offline', handleUserOffline);
    };
  }, [on, off]);

  const addMessage = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setMessages((prev) => [...prev, `[${timestamp}] ${msg}`]);
  };

  const handleSendPing = () => {
    emit('ping');
    setPingCount((prev) => prev + 1);
    addMessage(`📤 Ping enviado (#${pingCount + 1})`);
  };

  const handleClearMessages = () => {
    setMessages([]);
    setPingCount(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-heading">
            Teste WebSocket
          </h2>
          <p className="text-muted-foreground">
            Validação de conexão em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="default" className="bg-green-500 gap-1">
              <Wifi className="h-3 w-3" /> Conectado
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <WifiOff className="h-3 w-3" /> Desconectado
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Painel de Controle */}
        <Card>
          <CardHeader>
            <CardTitle>Controles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Socket ID:</strong> {socket?.id || 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Status:</strong>{' '}
                {isConnected ? 'Conectado' : 'Desconectado'}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Pings enviados:</strong> {pingCount}
              </p>
              {error && (
                <p className="text-sm text-red-500">
                  <strong>Erro:</strong> {error.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={handleSendPing}
                disabled={!isConnected}
                className="w-full"
              >
                <Send className="mr-2 h-4 w-4" /> Enviar Ping
              </Button>
              <Button
                variant="outline"
                onClick={handleClearMessages}
                className="w-full"
              >
                Limpar Log
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Console de Mensagens */}
        <Card>
          <CardHeader>
            <CardTitle>Console de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 overflow-y-auto bg-slate-950 rounded-lg p-4 font-mono text-xs text-green-400 space-y-1">
              {messages.length === 0 ? (
                <p className="text-slate-500">Aguardando eventos...</p>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className="break-words">
                    {msg}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sobre o Teste</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Esta página testa a conexão WebSocket em tempo real com o backend.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>
              <strong>Ping/Pong:</strong> Envia um ping e recebe um pong de
              volta do servidor
            </li>
            <li>
              <strong>user:online/offline:</strong> Notificações de usuários
              conectando/desconectando
            </li>
            <li>
              <strong>Isolamento Multi-Tenant:</strong> Cada tenant tem seu
              próprio "room"
            </li>
            <li>
              <strong>Autenticação JWT:</strong> Conexão autenticada via token
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
