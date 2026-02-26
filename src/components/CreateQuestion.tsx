import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createQuestion } from "@/lib/supabase-helpers";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, Plus, X } from "lucide-react";
import QuestionCard from "./QuestionCard";

const COLOR_OPTIONS = [
  { value: "#6366f1", label: "Indigo" },
  { value: "#ec4899", label: "Pink" },
  { value: "#f97316", label: "Orange" },
  { value: "#10b981", label: "Green" },
  { value: "#3b82f6", label: "Blue" },
];

interface CreateQuestionProps {
  profileId: string;
  displayName?: string;
  onCreated: () => void;
}

export default function CreateQuestion({ profileId, displayName, onCreated }: CreateQuestionProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [color, setColor] = useState("#6366f1");
  const [creating, setCreating] = useState(false);
  const [createdLink, setCreatedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!text.trim()) return;
    setCreating(true);
    try {
      const q = await createQuestion(profileId, text.trim(), color);
      const link = `${window.location.origin}/q/${q.id}`;
      setCreatedLink(link);
      toast({ title: "Question created!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(createdLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(`Answer my question anonymously! ${createdLink}`)}`, "_blank");

  const reset = () => {
    setText("");
    setCreatedLink("");
    setCopied(false);
    onCreated();
  };

  if (!open) {
    return (
      <Button variant="hero" onClick={() => setOpen(true)} className="gap-2">
        <Plus className="w-4 h-4" /> Ask a Question
      </Button>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Create a Question</h3>
        <button onClick={() => { setOpen(false); reset(); }} className="text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      {!createdLink ? (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's your question? e.g. 'What do you really think about me?'"
            className="w-full h-24 bg-secondary border border-border rounded-xl p-4 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground text-right">{text.length}/200</p>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Card color</p>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full transition-all ${color === c.value ? "ring-2 ring-white ring-offset-2 ring-offset-background scale-110" : "opacity-70 hover:opacity-100"}`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {text.trim() && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Preview</p>
              <QuestionCard questionText={text} bgColor={color} displayName={displayName} compact />
            </div>
          )}

          <Button variant="hero" className="w-full" onClick={handleCreate} disabled={creating || !text.trim()}>
            {creating ? "Creating..." : "Create & Get Link"}
          </Button>
        </>
      ) : (
        <div className="space-y-4 animate-fade-up">
          <QuestionCard questionText={text} bgColor={color} displayName={displayName} compact />
          <div className="flex gap-2">
            <input value={createdLink} readOnly className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground" />
            <Button size="icon" variant="hero" onClick={copyLink}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={shareToWhatsApp}>WhatsApp</Button>
            <Button size="sm" variant="secondary" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Answer my question anonymously! ${createdLink}`)}`, "_blank")}>Twitter / X</Button>
            <Button size="sm" variant="secondary" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(createdLink)}`, "_blank")}>Facebook</Button>
          </div>
          <Button variant="hero-outline" className="w-full" onClick={reset}>Create Another</Button>
        </div>
      )}
    </div>
  );
}
