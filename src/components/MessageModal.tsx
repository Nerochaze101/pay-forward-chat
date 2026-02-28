import { X, Clock, MessageCircle } from "lucide-react";

interface MessageModalProps {
  message: { content: string; created_at: string } | null;
  onClose: () => void;
}

export default function MessageModal({ message, onClose }: MessageModalProps) {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <div
        className="relative glass-card rounded-3xl p-0 max-w-md w-full animate-fade-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient header */}
        <div className="gradient-bg p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-white/90 text-sm font-semibold">Anonymous Message</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-foreground text-lg leading-relaxed whitespace-pre-wrap">{message.content}</p>
          <div className="mt-6 flex items-center justify-between pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground">
              {new Date(message.created_at).toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Expires {getTimeLeft(message.created_at)}
            </span>
          </div>
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
