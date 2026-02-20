import { MessageSquare, Loader2, Instagram, Facebook, MessageCircle, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface ConversationSummary {
  id: string;
  contactName: string;
  contactInitials: string;
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

  const channelIcon = (channel: string) => {
    switch (channel) {
      case 'instagram':
        return <Instagram className="h-3.5 w-3.5" />;
      case 'messenger':
        return <Facebook className="h-3.5 w-3.5" />;
      case 'whatsapp':
      default:
        return <MessageCircle className="h-3.5 w-3.5" />;
    }
  };

  return (
    <>
      {conversations.map((convo) => (
        <div
          key={convo.id}
          className={`p-4 border-b cursor-pointer transition-colors ${
            activeConversationId === convo.id
              ? 'bg-muted/70'
              : 'hover:bg-muted/40'
          }`}
          onClick={() => onSelect(convo.id)}
        >
          <div className="flex gap-3 items-start">
            <div className="relative w-10 h-10">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                {convo.contactInitials}
              </div>
              <span
                className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full text-white border border-background flex items-center justify-center ${getChannelBadge(
                  convo.channel
                )}`}
                title={convo.channel}
              >
                {channelIcon(convo.channel)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold truncate flex-1">{convo.contactName}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground ml-2">
                  <span>{formatTime(convo.lastMessageAt)}</span>
                  <Eye className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground truncate flex-1">
                  {convo.lastMessage || 'Sem mensagens'}
                </p>
                {convo.unreadCount > 0 && (
                  <Badge className="ml-2 bg-primary text-primary-foreground">
                    {convo.unreadCount}
                  </Badge>
                )}
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
          </div>
        </div>
      ))}
    </>
  );
}
