interface QuickRepliesProps {
  replies: string[];
  onSelect: (reply: string) => void;
}

export function QuickReplies({ replies, onSelect }: QuickRepliesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {replies.map((reply) => (
        <button
          key={reply}
          type="button"
          className="text-xs rounded-full border px-3 py-1 bg-muted/30 hover:bg-muted transition-colors"
          onClick={() => onSelect(reply)}
        >
          {reply}
        </button>
      ))}
    </div>
  );
}
