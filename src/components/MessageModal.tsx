import { X } from "lucide-react";

interface MessageModalProps {
  message: { content: string; created_at: string } | null;
  onClose: () => void;
}

export default function MessageModal({ message, onClose }: MessageModalProps) {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative glass-card rounded-2xl p-8 max-w-lg w-full animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <p className="text-foreground text-lg leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <div className="mt-6 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {new Date(message.created_at).toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">
            Expires {getTimeLeft(message.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}

function getTimeLeft(createdAt: string): string {
  const expires = new Date(createdAt).getTime() + 24 * 60 * 60 * 1000;
  const now = Date.now();
  const diff = expires - now;
  if (diff <= 0) return "soon";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `in ${hours}h ${mins}m`;
  return `in ${mins}m`;
}
