import { Sparkles } from "lucide-react";
import { GRADIENT_PRESETS } from "./QuestionCard";

const SUGGESTIONS = [
  { text: "What do you really think about me?", color: "#6366f1", emoji: "🤔" },
  { text: "What's your honest first impression of me?", color: "#ec4899", emoji: "👀" },
  { text: "Tell me something you've never told me before", color: "#f97316", emoji: "🤫" },
  { text: "If you could change one thing about me, what?", color: "#10b981", emoji: "✨" },
  { text: "Rate me from 1-10 and why?", color: "#3b82f6", emoji: "🔥" },
  { text: "What's one thing you admire about me?", color: "#ec4899", emoji: "💯" },
  { text: "Describe me in 3 words", color: "#6366f1", emoji: "💬" },
  { text: "What vibe do I give off?", color: "#f97316", emoji: "🎭" },
];

interface SuggestionQuestionsProps {
  onSelect: (text: string, color: string) => void;
}

export default function SuggestionQuestions({ onSelect }: SuggestionQuestionsProps) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-primary" /> Tap a card to use it
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {SUGGESTIONS.map((s, i) => {
          const preset = GRADIENT_PRESETS[s.color] || GRADIENT_PRESETS["#6366f1"];
          return (
            <button
              key={i}
              onClick={() => onSelect(s.text, s.color)}
              className={`relative overflow-hidden text-left p-4 rounded-2xl bg-gradient-to-br ${preset.bg} transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] group`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.15),transparent_50%)]" />
              <div className="absolute top-2 right-2 text-lg opacity-60 group-hover:opacity-100 transition-opacity">
                {s.emoji}
              </div>
              <p className="relative text-white text-xs font-medium leading-snug pr-5">
                {s.text}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
