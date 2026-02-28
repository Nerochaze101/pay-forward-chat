import { Sparkles } from "lucide-react";

const SUGGESTIONS = [
  { text: "What do you really think about me?", color: "#6366f1" },
  { text: "What's your honest first impression of me?", color: "#ec4899" },
  { text: "Tell me something you've never told me before", color: "#f97316" },
  { text: "If you could change one thing about me, what?", color: "#10b981" },
  { text: "Rate me from 1-10 and why?", color: "#3b82f6" },
  { text: "What's one thing you admire about me?", color: "#ec4899" },
  { text: "Describe me in 3 words", color: "#6366f1" },
  { text: "What vibe do I give off?", color: "#f97316" },
];

interface SuggestionQuestionsProps {
  onSelect: (text: string, color: string) => void;
}

export default function SuggestionQuestions({ onSelect }: SuggestionQuestionsProps) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
        <Sparkles className="w-3 h-3" /> Suggested questions
      </p>
      <div className="grid grid-cols-2 gap-2">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => onSelect(s.text, s.color)}
            className="text-left p-3 rounded-xl border border-border bg-secondary/50 hover:bg-secondary hover:border-primary/30 transition-all text-xs text-foreground leading-snug group"
          >
            <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" style={{ backgroundColor: s.color }} />
            {s.text}
          </button>
        ))}
      </div>
    </div>
  );
}
