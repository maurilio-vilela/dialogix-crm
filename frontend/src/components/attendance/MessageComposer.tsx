import { Paperclip, Smile, Zap, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickReplies } from './QuickReplies';

interface MessageComposerProps {
  messageInput: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  isSending: boolean;
  quickReplies: string[];
  onQuickReply: (reply: string) => void;
}

export function MessageComposer({
  messageInput,
  onChange,
  onSend,
  onKeyDown,
  isSending,
  quickReplies,
  onQuickReply,
}: MessageComposerProps) {
  return (
    <footer className="p-4 border-t space-y-3">
      <QuickReplies replies={quickReplies} onSelect={onQuickReply} />
      <div className="flex gap-2 items-end">
        <div className="flex items-center gap-1">
          <Button type="button" variant="outline" size="icon">
            <Smile className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="icon">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="icon">
            <Zap className="h-4 w-4" />
          </Button>
        </div>
        <textarea
          className="flex-1 bg-muted border rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Digite sua mensagem..."
          rows={2}
          value={messageInput}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isSending}
        />
        <Button
          onClick={onSend}
          disabled={!messageInput.trim() || isSending}
          size="icon"
          className="self-end"
        >
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </footer>
  );
}
