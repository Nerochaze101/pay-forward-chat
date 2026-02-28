import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { createQuestion } from "@/lib/supabase-helpers";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, Plus, X, Share2, Palette } from "lucide-react";
import QuestionCard from "./QuestionCard";
import SuggestionQuestions from "./SuggestionQuestions";
import { SocialShareButtons } from "./SocialIcons";
import html2canvas from "html2canvas";

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
  const [sharing, setSharing] = useState(false);
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);

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

  const shareImage = async () => {
    if (!cardRef.current) return;
    setSharing(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/png")
      );
      const file = new File([blob], "whisperbox-question.png", { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          text: `Answer my question anonymously! 👀\n\n${createdLink}`,
          files: [file],
        });
      } else {
        // Fallback: download
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = "whisperbox-question.png";
        a.click();
        toast({ title: "Image downloaded!", description: "Post this image and paste the link in your caption." });
      }
    } catch {
      toast({ title: "Share cancelled or failed", variant: "destructive" });
    } finally {
      setSharing(false);
    }
  };

  const shareText = `Answer my question anonymously! 👀\n\n${createdLink}`;

  const handleSuggestionSelect = (suggestionText: string, suggestionColor: string) => {
    setText(suggestionText);
    setColor(suggestionColor);
  };

  const reset = () => {
    setText("");
    setCreatedLink("");
    setCopied(false);
    onCreated();
  };

  if (!open) {
    return (
      <Button variant="hero" onClick={() => setOpen(true)} className="gap-2 animate-glow-pulse">
        <Plus className="w-4 h-4" /> Ask a Question
      </Button>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 space-y-5 animate-border-glow">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">Create a Question</h3>
        <button onClick={() => { setOpen(false); reset(); }} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {!createdLink ? (
        <>
          {!text.trim() && <SuggestionQuestions onSelect={handleSuggestionSelect} />}

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's your question? e.g. 'What do you really think about me?'"
            className="w-full h-24 bg-secondary border border-border rounded-xl p-4 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground text-right">{text.length}/200</p>

          <div>
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" /> Card color
            </p>
            <div className="flex gap-2.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`w-9 h-9 rounded-full transition-all duration-200 ${color === c.value ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" : "opacity-60 hover:opacity-100 hover:scale-105"}`}
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
        <div className="space-y-5 animate-fade-up">
          <QuestionCard questionText={text} bgColor={color} displayName={displayName} cardRef={cardRef} showCaptionArrow />

          <p className="text-xs text-center text-muted-foreground">
            📸 Share this image to your status → paste the link in caption
          </p>

          {/* Share image button */}
          <Button variant="hero" className="w-full gap-2" onClick={shareImage} disabled={sharing}>
            <Share2 className="w-4 h-4" />
            {sharing ? "Preparing..." : "Share Image to Status"}
          </Button>

          {/* Copy link */}
          <div className="flex gap-2">
            <input value={createdLink} readOnly className="flex-1 bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm font-mono text-foreground" />
            <Button size="icon" variant="hero-outline" onClick={copyLink}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          {/* Social share */}
          <div>
            <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5" /> Or share link on
            </p>
            <SocialShareButtons
              shareText={shareText}
              shareUrl={createdLink}
              onInstagramClick={() => {
                navigator.clipboard.writeText(createdLink);
                toast({ title: "Link copied!", description: "Paste this link in your Instagram story or bio." });
              }}
            />
          </div>

          <Button variant="hero-outline" className="w-full" onClick={reset}>Create Another</Button>
        </div>
      )}
    </div>
  );
}
