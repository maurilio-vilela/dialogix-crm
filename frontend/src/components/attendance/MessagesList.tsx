import { Loader2 } from 'lucide-react';

export interface MessageItem {
  id: string;
  direction: 'inbound' | 'outbound';
  content: string;
  createdAt: string;
  senderName: string;
  senderInitials: string;
}

interface MessagesListProps {
  isLoading: boolean;
  messages: MessageItem[];
  formatTime: (date?: string) => string;
}

export function MessagesList({ isLoading, messages, formatTime }: MessagesListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Nenhuma mensagem ainda. Envie a primeira!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => {
        const isOutbound = msg.direction === 'outbound';
        return (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${isOutbound ? 'justify-end' : 'justify-start'}`}
          >
            {!isOutbound && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                {msg.senderInitials}
              </div>
            )}
            <div
              className={`rounded-2xl p-3 max-w-lg shadow-sm border ${
                isOutbound
                  ? 'bg-primary text-primary-foreground border-primary/20'
                  : 'bg-background border-muted'
              }`}
            >
              <p className="text-xs opacity-70 mb-1">{msg.senderName}</p>
              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              <span className="text-xs opacity-70 mt-1 block text-right">
                {formatTime(msg.createdAt)}
              </span>
            </div>
            {isOutbound && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                {msg.senderInitials}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
