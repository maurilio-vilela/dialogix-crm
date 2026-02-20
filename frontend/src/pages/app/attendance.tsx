import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from '@/hooks/useWebSocket';
import { MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/axios';
import { toast } from 'react-hot-toast';
import {
  ConversationsList,
  ChatHeader,
  MessagesList,
  MessageComposer,
  DetailsPanel,
  ConversationSummary,
  MessageItem,
} from '@/components/attendance';

interface ApiConversation {
  id: string;
  status: string;
  channel: string;
  contact?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  unreadCount: number;
  lastMessage?: string;
  lastMessageAt?: string;
}

interface Conversation {
  id: string;
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

interface ApiMessage {
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

const quickReplies = [
  'Olá! Como posso ajudar?',
  'Pode me passar mais detalhes?',
  'Perfeito, vou verificar agora.',
  'Obrigado! Já retorno com a solução.',
];

export function AttendancePage() {
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Query: Listar conversas
  const { data: conversations = [], isLoading: loadingConversations } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.get<ApiConversation[]>('/conversations');
      const data = response.data || [];
      return data.map((convo) => ({
        id: convo.id,
        contact: convo.contact,
        channel: convo.channel || 'unknown',
        status: convo.status,
        lastMessage: convo.lastMessage,
        lastMessageAt: convo.lastMessageAt,
        unreadCount: convo.unreadCount || 0,
      }));
    },
    refetchInterval: 10000, // Atualiza a cada 10s (fallback se WebSocket falhar)
  });

  // Query: Listar mensagens da conversa ativa
  const { data: messages = [], isLoading: loadingMessages } = useQuery<Message[]>({
    queryKey: ['messages', activeConversationId],
    queryFn: async () => {
      if (!activeConversationId) return [];
      const response = await api.get<ApiMessage[]>(`/messages/conversation/${activeConversationId}`);
      const data = response.data || [];
      return data.map((msg) => ({
        id: msg.id,
        conversationId: msg.conversationId,
        senderUser: msg.senderUser,
        direction: msg.direction,
        type: msg.type,
        content: msg.content,
        createdAt: msg.createdAt,
      }));
    },
    enabled: !!activeConversationId,
  });

  // Mutation: Enviar mensagem
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!activeConversationId) throw new Error('Nenhuma conversa selecionada');
      const response = await api.post('/messages', {
        conversationId: activeConversationId,
        type: 'text',
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

  const normalizeMessage = (data: any): Message => {
    if (data?.conversationId) {
      return {
        id: data.id,
        conversationId: data.conversationId,
        senderUser: data.senderUser,
        direction: data.direction,
        type: data.type,
        content: data.content,
        createdAt: data.createdAt,
      };
    }
    if (data?.conversation_id) {
      return {
        id: data.id,
        conversationId: data.conversation_id,
        senderUser: data.sender_user,
        direction: data.direction,
        type: data.content_type,
        content: data.content,
        createdAt: data.created_at,
      };
    }
    return data as Message;
  };

  useEffect(() => {
    const handleNewMessage = (payload: any) => {
      const data = normalizeMessage(payload);
      console.log('📨 Nova mensagem recebida via WebSocket:', data);

      if (data.conversationId === activeConversationId) {
        queryClient.setQueryData(['messages', activeConversationId], (old: Message[] = []) => {
          if (old.some((m) => m.id === data.id)) return old;
          return [...old, data];
        });
      }

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId),
    [conversations, activeConversationId]
  );

  const formatTime = (date?: string) => {
    if (!date) return '';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 24) {
      return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (hours < 48) {
      return 'Ontem';
    }
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
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

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-emerald-500',
      pending: 'bg-amber-500',
      closed: 'bg-slate-500',
    };
    return colors[status] || 'bg-slate-500';
  };

  const initialsFromName = (name?: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '??';
  };

  const activeContactName = activeConversation?.contact?.name || 'Sem nome';
  const contactInitials = initialsFromName(activeContactName);

  const conversationSummaries: ConversationSummary[] = conversations.map((convo) => ({
    id: convo.id,
    contactName: convo.contact?.name || 'Sem nome',
    channel: convo.channel,
    status: convo.status,
    lastMessage: convo.lastMessage,
    lastMessageAt: convo.lastMessageAt,
    unreadCount: convo.unreadCount,
  }));

  const messageItems: MessageItem[] = messages.map((msg) => {
    const isOutbound = msg.direction === 'outbound';
    const senderName = isOutbound ? msg.senderUser?.name || 'Você' : activeContactName;
    return {
      id: msg.id,
      direction: msg.direction,
      content: msg.content,
      createdAt: msg.createdAt,
      senderName,
      senderInitials: initialsFromName(senderName),
    };
  });

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
          <ConversationsList
            isLoading={loadingConversations}
            conversations={conversationSummaries}
            activeConversationId={activeConversationId}
            onSelect={setActiveConversationId}
            formatTime={formatTime}
            getChannelBadge={getChannelBadge}
            getStatusBadge={getStatusBadge}
          />
        </div>
      </aside>

      {/* Coluna 2: Chat Ativo */}
      <main className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            <ChatHeader
              contactName={activeContactName}
              contactInitials={contactInitials}
              channel={activeConversation.channel}
              status={activeConversation.status}
              isConnected={isConnected}
              getChannelBadge={getChannelBadge}
              getStatusBadge={getStatusBadge}
            />

            <div className="flex-1 p-4 overflow-y-auto bg-muted/20 space-y-4">
              <MessagesList isLoading={loadingMessages} messages={messageItems} formatTime={formatTime} />
              <div ref={messagesEndRef} />
            </div>

            <MessageComposer
              messageInput={messageInput}
              onChange={setMessageInput}
              onSend={handleSendMessage}
              onKeyDown={handleKeyDown}
              isSending={sendMessageMutation.isPending}
              quickReplies={quickReplies}
              onQuickReply={setMessageInput}
            />
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
        <DetailsPanel
          hasConversation={!!activeConversation}
          contactName={activeContactName}
          contactInitials={contactInitials}
          status={activeConversation?.status}
          email={activeConversation?.contact?.email}
          phone={activeConversation?.contact?.phone}
        />
      </aside>
    </div>
  );
}
