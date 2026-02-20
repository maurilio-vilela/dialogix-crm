import { Badge } from '@/components/ui/badge';

interface ChatHeaderProps {
  contactName: string;
  contactInitials: string;
  channel: string;
  status: string;
  isConnected: boolean;
  getChannelBadge: (channel: string) => string;
  getStatusBadge: (status: string) => string;
}

export function ChatHeader({
  contactName,
  contactInitials,
  channel,
  status,
  isConnected,
  getChannelBadge,
  getStatusBadge,
}: ChatHeaderProps) {
  return (
    <header className="p-4 border-b flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
          {contactInitials}
        </div>
        <div>
          <h3 className="text-lg font-semibold">{contactName}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground capitalize">
            <Badge className={`${getChannelBadge(channel)} text-white text-xs`}>{channel}</Badge>
            <Badge className={`${getStatusBadge(status)} text-white text-xs`}>{status}</Badge>
            {isConnected ? (
              <span className="text-xs text-emerald-600">Online</span>
            ) : (
              <span className="text-xs text-red-500">Offline</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
