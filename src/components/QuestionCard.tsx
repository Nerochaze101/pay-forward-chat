import { HelpCircle, Sparkles, ArrowDown } from "lucide-react";

const GRADIENT_PRESETS: Record<string, { bg: string; glow: string }> = {
  "#6366f1": { bg: "from-indigo-500 via-violet-500 to-purple-600", glow: "shadow-[0_0_40px_rgba(99,102,241,0.3)]" },
  "#ec4899": { bg: "from-pink-500 via-rose-400 to-fuchsia-600", glow: "shadow-[0_0_40px_rgba(236,72,153,0.3)]" },
  "#f97316": { bg: "from-orange-500 via-amber-400 to-red-500", glow: "shadow-[0_0_40px_rgba(249,115,22,0.3)]" },
  "#10b981": { bg: "from-emerald-500 via-green-400 to-teal-600", glow: "shadow-[0_0_40px_rgba(16,185,129,0.3)]" },
  "#3b82f6": { bg: "from-blue-500 via-sky-400 to-cyan-500", glow: "shadow-[0_0_40px_rgba(59,130,246,0.3)]" },
};

interface QuestionCardProps {
  questionText: string;
  bgColor: string;
  displayName?: string;
  compact?: boolean;
  cardRef?: React.RefObject<HTMLDivElement>;
  showCaptionArrow?: boolean;
}

export default function QuestionCard({ questionText, bgColor, displayName, compact, cardRef, showCaptionArrow }: QuestionCardProps) {
  const preset = GRADIENT_PRESETS[bgColor] || GRADIENT_PRESETS["#6366f1"];

  return (
    <div
      ref={cardRef}
      className={`relative rounded-2xl bg-gradient-to-br ${preset.bg} ${preset.glow} overflow-hidden ${compact ? "p-5" : "p-8"}`}
    >
      {/* Decorative layers */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.2),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_90%,rgba(0,0,0,0.2),transparent_50%)]" />
      <div className="absolute top-3 right-3 opacity-10">
        <Sparkles className="w-16 h-16 text-white" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <HelpCircle className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white/90 text-xs font-semibold tracking-wide uppercase">
            {displayName || "Someone"} asks
          </span>
        </div>
        <h3 className={`font-display font-bold text-white leading-snug ${compact ? "text-base" : "text-xl"}`}>
          {questionText}
        </h3>
        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3">
          <span className="text-white/40 text-[10px] font-display font-semibold tracking-widest uppercase">WhisperBox</span>
          <span className="text-white/40 text-[10px] tracking-wide">✦ Anonymous replies</span>
        </div>

        {/* Caption arrow indicator for social sharing */}
        {showCaptionArrow && (
          <div className="mt-4 flex items-center justify-center gap-2 animate-bounce">
            <ArrowDown className="w-5 h-5 text-white/70" />
            <span className="text-white/70 text-xs font-semibold">Link in caption</span>
            <ArrowDown className="w-5 h-5 text-white/70" />
          </div>
        )}
      </div>
    </div>
  );
}

export { GRADIENT_PRESETS };
