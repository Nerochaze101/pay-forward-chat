import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getQuestionById, sendQuestionReply, recordPageView } from "@/lib/supabase-helpers";
import { useToast } from "@/hooks/use-toast";
import { Send, Sparkles } from "lucide-react";
import QuestionCard from "@/components/QuestionCard";

export default function QuestionPage() {
  const { questionId } = useParams<{ questionId: string }>();
  const [question, setQuestion] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!questionId) return;
    loadQuestion();
  }, [questionId]);

  async function loadQuestion() {
    try {
      const q = await getQuestionById(questionId!);
      setQuestion(q);
      recordPageView(q.profile_id).catch(() => {});
    } catch {
      setError(true);
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !question) return;
    setSending(true);
    try {
      await sendQuestionReply(question.id, reply.trim());
      setSent(true);
    } catch (err: any) {
      toast({ title: "Failed to send", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background bg-grid flex items-center justify-center px-4">
        <div className="fixed inset-0 bg-spotlight pointer-events-none" />
        <div className="relative text-center">
          <h1 className="font-display text-2xl font-bold mb-2">Question not found</h1>
          <p className="text-muted-foreground mb-6">This link may be invalid.</p>
          <Link to="/"><Button variant="hero">Go Home</Button></Link>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const profile = question.profiles;

  return (
    <div className="min-h-screen bg-background bg-grid flex items-center justify-center px-4 py-8">
      <div className="fixed inset-0 bg-spotlight pointer-events-none" />
      <div className="relative w-full max-w-md">
        <Link to="/" className="block text-center mb-8">
          <span className="font-display text-lg font-bold gradient-text inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            WhisperBox
          </span>
        </Link>

        {/* Question Card */}
        <div className="mb-6">
          <QuestionCard
            questionText={question.question_text}
            bgColor={question.bg_color}
            displayName={profile?.display_name || profile?.username}
          />
        </div>

        {/* Reply Form */}
        <div className="glass-card rounded-2xl p-6">
          {sent ? (
            <div className="animate-fade-up text-center">
              <div className="w-14 h-14 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4 animate-glow-pulse">
                <Send className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">Reply Sent!</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Your anonymous reply has been delivered.
              </p>
              <div className="space-y-3">
                <Button variant="hero" className="w-full" onClick={() => { setSent(false); setReply(""); }}>
                  Send Another Reply
                </Button>
                <Link to="/auth?mode=signup" className="block">
                  <Button variant="hero-outline" className="w-full">Create Your Own Link</Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSend}>
              <p className="text-sm text-muted-foreground mb-3">Reply anonymously — they won't know who you are!</p>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your anonymous reply..."
                className="w-full h-28 bg-secondary border border-border rounded-xl p-4 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm mb-3 transition-all"
                maxLength={1000}
                required
              />
              <p className="text-xs text-muted-foreground mb-4 text-right">{reply.length}/1000</p>
              <Button type="submit" variant="hero" className="w-full" disabled={sending || !reply.trim()}>
                {sending ? "Sending..." : "Send Reply"}
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Powered by <Link to="/" className="text-primary hover:underline">WhisperBox</Link>
        </p>
      </div>
    </div>
  );
}
