import { MessageSquare, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface ConversationSummary {
  id: string;
  contactName: string;
  channel: string;
  status: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

interface ConversationsListProps {
  isLoading: boolean;
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  onSelect: (id: string) => void;
  formatTime: (date?: string) => string;
  getChannelBadge: (channel: string) => string;
  getStatusBadge: (status: string) => string;
}

export function ConversationsList({
  isLoading,
  conversations,
  activeConversationId,
  onSelect,
  formatTime,
  getChannelBadge,
  getStatusBadge,
}: ConversationsListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-sm">Nenhuma conversa ainda</p>
      </div>
    );
  }

  return (
    <>
      {conversations.map((convo) => (
        <div
          key={convo.id}
          className={`p-4 border-b cursor-pointer transition-colors ${
            activeConversationId === convo.id ? 'bg-muted' : 'hover:bg-muted/50'
          }`}
          onClick={() => onSelect(convo.id)}
        >
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold truncate flex-1">{convo.contactName}</h3>
            <span className="text-xs text-muted-foreground ml-2">
              {formatTime(convo.lastMessageAt)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground truncate flex-1">
              {convo.lastMessage || 'Sem mensagens'}
            </p>
            {convo.unreadCount > 0 && <Badge className="ml-2">{convo.unreadCount}</Badge>}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge className={`${getChannelBadge(convo.channel)} text-white text-xs`}>
              {convo.channel}
            </Badge>
            <Badge className={`${getStatusBadge(convo.status)} text-white text-xs`}>
              {convo.status}
            </Badge>
          </div>
        </div>
      ))}
    </>
  );
}
