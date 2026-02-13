import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from '@/hooks/useWebSocket';
import { MessageSquare, Info, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';

interface Conversation {
  id: string;
  contactId: string;
  contact?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  channel: string;
  status: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

interface Message {
  id: string;
  conversationId: string;
  senderUser?: {
    id: string;
    name: string;
  };
  direction: 'inbound' | 'outbound';
  type: string;
  content: string;
  createdAt: string;
}

export function AttendancePage() {
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Query: Listar conversas
  const { data: conversations = [], isLoading: loadingConversations } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.get('/conversations');
      return response.data;
    },
    refetchInterval: 10000, // Atualiza a cada 10s (fallback se WebSocket falhar)
  });

  // Query: Listar mensagens da conversa ativa
  const { data: messages = [], isLoading: loadingMessages } = useQuery<Message[]>({
    queryKey: ['messages', activeConversationId],
    queryFn: async () => {
      if (!activeConversationId) return [];
      const response = await api.get(`/messages/conversation/${activeConversationId}`);
      return response.data;
    },
    enabled: !!activeConversationId,
  });

  // Mutation: Enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!activeConversationId) throw new Error('Nenhuma conversa selecionada');
      const response = await api.post('/messages', {
        conversationId: activeConversationId,
        content,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', activeConversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessageInput('');
      toast.success('Mensagem enviada!');
    },
    onError: () => {
      toast.error('Erro ao enviar mensagem');
    },
  });

  // WebSocket: Escutar novas mensagens em tempo real
  const { isConnected, on, off } = useWebSocket({
    autoConnect: true,
  });

  useEffect(() => {
    const handleNewMessage = (data: Message) => {
      console.log('📨 Nova mensagem recebida via WebSocket:', data);

      // Se a mensagem é da conversa ativa, adicionar à lista
      if (data.conversationId === activeConversationId) {
        queryClient.setQueryData(['messages', activeConversationId], (old: Message[] = []) => {
          // Evitar duplicatas
          if (old.some(m => m.id === data.id)) return old;
          return [...old, data];
        });
      }

      // Atualizar a lista de conversas
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    on('message:new', handleNewMessage);

    return () => {
      off('message:new', handleNewMessage);
    };
  }, [activeConversationId, on, off, queryClient]);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    const trimmed = messageInput.trim();
    if (!trimmed) return;
    sendMessageMutation.mutate(trimmed);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 24) {
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (hours < 48) {
      return 'Ontem';
    } else {
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  const getChannelBadge = (channel: string) => {
    const colors: Record<string, string> = {
      whatsapp: 'bg-green-500',
      instagram: 'bg-pink-500',
      telegram: 'bg-blue-500',
      email: 'bg-gray-500',
      webchat: 'bg-purple-500',
    };
    return colors[channel] || 'bg-gray-500';
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background text-foreground">
      {/* Coluna 1: Lista de Conversas */}
      <aside className="w-80 border-r flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Atendimento</h2>
          {isConnected ? (
            <Badge className="bg-green-500">Online</Badge>
          ) : (
            <Badge variant="destructive">Offline</Badge>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Nenhuma conversa ainda</p>
            </div>
          ) : (
            conversations.map(convo => (
              <div
                key={convo.id}
                className={`p-4 border-b cursor-pointer transition-colors ${
                  activeConversationId === convo.id ? 'bg-muted' : 'hover:bg-muted/50'
                }`}
                onClick={() => setActiveConversationId(convo.id)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold truncate flex-1">
                    {convo.contact?.name || 'Sem nome'}
                  </h3>
                  <span className="text-xs text-muted-foreground ml-2">
                    {convo.lastMessageAt ? formatTime(convo.lastMessageAt) : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground truncate flex-1">
                    {convo.lastMessage || 'Sem mensagens'}
                  </p>
                  {convo.unreadCount > 0 && (
                    <Badge className="ml-2">{convo.unreadCount}</Badge>
                  )}
                </div>
                <div className="mt-2">
                  <Badge className={`${getChannelBadge(convo.channel)} text-white text-xs`}>
                    {convo.channel}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Coluna 2: Chat Ativo */}
      <main className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            <header className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {activeConversation.contact?.name || 'Sem nome'}
                </h3>
                <span className="text-sm text-muted-foreground capitalize">
                  {activeConversation.channel} • {activeConversation.status}
                </span>
              </div>
            </header>

            <div className="flex-1 p-4 overflow-y-auto bg-muted/20 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Nenhuma mensagem ainda. Envie a primeira!</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`rounded-lg p-3 max-w-lg ${
                        msg.direction === 'outbound'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {msg.direction === 'outbound' && msg.senderUser && (
                        <p className="text-xs opacity-70 mb-1">{msg.senderUser.name}</p>
                      )}
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <span className="text-xs opacity-70 mt-1 block text-right">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <footer className="p-4 border-t">
              <div className="flex gap-2">
                <textarea
                  className="flex-1 bg-muted border rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Digite sua mensagem..."
                  rows={2}
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={sendMessageMutation.isPending}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendMessageMutation.isPending}
                  size="icon"
                  className="self-end"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">Selecione uma conversa para começar</p>
          </div>
        )}
      </main>

      {/* Coluna 3: Detalhes do Contato/Conversa */}
      <aside className="w-80 border-l flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Detalhes</h2>
        </div>
        {activeConversation?.contact ? (
          <div className="flex-1 p-4 space-y-4">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-2 flex items-center justify-center">
                <span className="text-3xl font-bold text-muted-foreground">
                  {activeConversation.contact.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="text-lg font-semibold">{activeConversation.contact.name}</h3>
              <Badge className="mt-2">{activeConversation.status}</Badge>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Informações</h4>
              {activeConversation.contact.email && (
                <p className="text-sm">
                  <strong>Email:</strong> {activeConversation.contact.email}
                </p>
              )}
              {activeConversation.contact.phone && (
                <p className="text-sm">
                  <strong>Telefone:</strong> {activeConversation.contact.phone}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <Info className="w-16 h-16 mb-4 opacity-50" />
            <p>Selecione uma conversa para ver os detalhes</p>
          </div>
        )}
      </aside>
    </div>
  );
}
