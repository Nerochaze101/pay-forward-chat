import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getProfileByUsername, sendAnonymousMessage, recordPageView } from "@/lib/supabase-helpers";
import { useToast } from "@/hooks/use-toast";
import { Send, MessageCircle, Sparkles } from "lucide-react";

export default function MessagePage() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!username) return;
    loadProfile();
  }, [username]);

  async function loadProfile() {
    try {
      const p = await getProfileByUsername(username!);
      setProfile(p);
      recordPageView(p.id).catch(() => {});
    } catch {
      setError(true);
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !profile) return;
    setSending(true);
    try {
      await sendAnonymousMessage(profile.id, message.trim());
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
          <h1 className="font-display text-2xl font-bold mb-2">User not found</h1>
          <p className="text-muted-foreground mb-6">This link may be invalid.</p>
          <Link to="/"><Button variant="hero">Go Home</Button></Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-grid flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-spotlight pointer-events-none" />
      <div className="relative w-full max-w-md">
        <Link to="/" className="block text-center mb-8">
          <span className="font-display text-lg font-bold gradient-text inline-flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            WhisperBox
          </span>
        </Link>

        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4 animate-glow-pulse">
            <MessageCircle className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="font-display text-xl font-bold mb-1">
            {profile.display_name || profile.username}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Send an anonymous message — they won't know who you are!
          </p>

          {sent ? (
            <div className="animate-fade-up">
              <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <Send className="w-7 h-7 text-success" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">Message Sent!</h3>
              <p className="text-muted-foreground text-sm mb-6">Your anonymous message has been delivered.</p>
              <div className="space-y-3">
                <Button variant="hero" className="w-full" onClick={() => { setSent(false); setMessage(""); }}>Send Another</Button>
                <Link to="/auth?mode=signup" className="block">
                  <Button variant="hero-outline" className="w-full">Create Your Own Link</Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSend}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your anonymous message here..."
                className="w-full h-32 bg-secondary border border-border rounded-xl p-4 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm mb-4 transition-all"
                maxLength={1000}
                required
              />
              <p className="text-xs text-muted-foreground mb-4 text-right">{message.length}/1000</p>
              <Button type="submit" variant="hero" className="w-full" disabled={sending || !message.trim()}>
                {sending ? "Sending..." : "Send Message"}
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
