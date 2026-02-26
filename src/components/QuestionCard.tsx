import { HelpCircle } from "lucide-react";

const GRADIENT_PRESETS: Record<string, string> = {
  "#6366f1": "from-indigo-500 to-purple-600",
  "#ec4899": "from-pink-500 to-rose-600",
  "#f97316": "from-orange-500 to-red-500",
  "#10b981": "from-emerald-500 to-teal-600",
  "#3b82f6": "from-blue-500 to-cyan-500",
};

interface QuestionCardProps {
  questionText: string;
  bgColor: string;
  displayName?: string;
  compact?: boolean;
}

export default function QuestionCard({ questionText, bgColor, displayName, compact }: QuestionCardProps) {
  const gradientClass = GRADIENT_PRESETS[bgColor] || "from-indigo-500 to-purple-600";

  return (
    <div className={`relative rounded-2xl bg-gradient-to-br ${gradientClass} shadow-xl overflow-hidden ${compact ? "p-5" : "p-8"}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3 opacity-80">
          <HelpCircle className="w-4 h-4 text-white" />
          <span className="text-white/80 text-xs font-medium">
            {displayName || "Someone"} asks:
          </span>
        </div>
        <h3 className={`font-display font-bold text-white leading-snug ${compact ? "text-base" : "text-xl"}`}>
          {questionText}
        </h3>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-white/50 text-[10px] font-display">WhisperBox</span>
          <span className="text-white/50 text-[10px]">Anonymous replies</span>
        </div>
      </div>
    </div>
  );
}
