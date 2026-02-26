import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { getProfile, getMessages, getWithdrawals, updateUsername, requestWithdrawal, getQuestionsByProfile, getRepliesByQuestion, deleteQuestion } from "@/lib/supabase-helpers";
import { useToast } from "@/hooks/use-toast";
import { Copy, LogOut, MessageCircle, Eye, Banknote, Share2, Check, HelpCircle, Trash2 } from "lucide-react";
import CreateQuestion from "@/components/CreateQuestion";
import QuestionCard from "@/components/QuestionCard";

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionReplies, setQuestionReplies] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState<"messages" | "questions" | "earnings">("messages");

  // Withdrawal form
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [wAmount, setWAmount] = useState("");
  const [wBank, setWBank] = useState("");
  const [wAccNum, setWAccNum] = useState("");
  const [wAccName, setWAccName] = useState("");
  const [wSubmitting, setWSubmitting] = useState(false);

  // Username edit
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    try {
      const p = await getProfile(user!.id);
      setProfile(p);
      setNewUsername(p.username);
      const [msgs, wds, qs] = await Promise.all([getMessages(p.id), getWithdrawals(p.id), getQuestionsByProfile(p.id)]);
      setMessages(msgs);
      setWithdrawals(wds);
      setQuestions(qs);
      // Load replies for each question
      const repliesMap: Record<string, any[]> = {};
      await Promise.all(qs.map(async (q: any) => {
        const replies = await getRepliesByQuestion(q.id);
        repliesMap[q.id] = replies;
      }));
      setQuestionReplies(repliesMap);
    } catch (err: any) {
      toast({ title: "Error loading data", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const messageLink = profile ? `${window.location.origin}/m/${profile.username}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(messageLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Link copied!" });
  };

  const shareToWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(`Send me an anonymous message! ${messageLink}`)}`, "_blank");
  const shareToTwitter = () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Send me an anonymous message! ${messageLink}`)}`, "_blank");
  const shareToFacebook = () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(messageLink)}`, "_blank");

  const handleUsernameUpdate = async () => {
    try {
      await updateUsername(profile.id, newUsername);
      setProfile({ ...profile, username: newUsername });
      setEditingUsername(false);
      toast({ title: "Username updated!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(wAmount);
    if (amount < 1000) {
      toast({ title: "Minimum withdrawal is ₦1,000", variant: "destructive" });
      return;
    }
    if (amount > (profile?.balance ?? 0)) {
      toast({ title: "Insufficient balance", variant: "destructive" });
      return;
    }
    setWSubmitting(true);
    try {
      await requestWithdrawal(profile.id, amount, wBank, wAccNum, wAccName);
      toast({ title: "Withdrawal request submitted!" });
      setShowWithdraw(false);
      setWAmount("");
      loadData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setWSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const earnings = profile?.balance ?? 0;
  const totalViews = profile?.total_views ?? 0;
  const monetized = totalViews >= 2000;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="font-display text-xl font-bold gradient-text">WhisperBox</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{profile?.display_name}</span>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Link Section */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" /> Your Message Link
          </h2>
          <div className="flex gap-2 mb-4">
            <Input value={messageLink} readOnly className="font-mono text-sm" />
            <Button variant="hero" size="icon" onClick={copyLink}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          {editingUsername ? (
            <div className="flex gap-2 items-center mb-4">
              <Input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="max-w-xs"
                placeholder="new_username"
              />
              <Button size="sm" onClick={handleUsernameUpdate}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingUsername(false)}>Cancel</Button>
            </div>
          ) : (
            <button
              className="text-xs text-primary hover:underline mb-4 block"
              onClick={() => setEditingUsername(true)}
            >
              Edit username
            </button>
          )}
          <div className="flex gap-3 flex-wrap">
            <Button size="sm" variant="secondary" onClick={shareToWhatsApp}>
              WhatsApp
            </Button>
            <Button size="sm" variant="secondary" onClick={shareToTwitter}>
              Twitter / X
            </Button>
            <Button size="sm" variant="secondary" onClick={shareToFacebook}>
              Facebook
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard icon={MessageCircle} label="Messages" value={messages.length.toString()} />
          <StatCard icon={Eye} label="Total Views" value={totalViews.toLocaleString()} />
          <StatCard
            icon={Banknote}
            label="Balance"
            value={`₦${earnings.toLocaleString()}`}
            sub={!monetized ? `${2000 - totalViews} views to activate earnings` : undefined}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-secondary rounded-lg p-1 w-fit">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "messages" ? "gradient-bg text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setTab("messages")}
          >
            Messages
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "questions" ? "gradient-bg text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setTab("questions")}
          >
            Questions
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "earnings" ? "gradient-bg text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setTab("earnings")}
          >
            Earnings
          </button>
        </div>

        {tab === "messages" && (
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
                <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No messages yet. Share your link to start receiving messages!</p>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="glass-card rounded-xl p-5">
                  <p className="text-foreground">{m.content}</p>
                  <span className="text-xs text-muted-foreground mt-2 block">
                    {new Date(m.created_at).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "questions" && (
          <div className="space-y-4">
            <CreateQuestion profileId={profile.id} displayName={profile.display_name || profile.username} onCreated={loadData} />
            {questions.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center text-muted-foreground">
                <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No questions yet. Create one and share the link!</p>
              </div>
            ) : (
              questions.map((q) => (
                <div key={q.id} className="glass-card rounded-xl p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <QuestionCard questionText={q.question_text} bgColor={q.bg_color} displayName={profile.display_name || profile.username} compact />
                    <button
                      onClick={async () => { await deleteQuestion(q.id); loadData(); }}
                      className="text-muted-foreground hover:text-destructive ml-3 mt-2 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{(questionReplies[q.id] || []).length} replies</span>
                    <span>·</span>
                    <span>{new Date(q.created_at).toLocaleDateString()}</span>
                    <button
                      className="text-primary hover:underline ml-auto"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/q/${q.id}`);
                        toast({ title: "Link copied!" });
                      }}
                    >
                      Copy link
                    </button>
                  </div>
                  {(questionReplies[q.id] || []).length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-border">
                      {(questionReplies[q.id] || []).map((r: any) => (
                        <div key={r.id} className="bg-secondary rounded-lg p-3">
                          <p className="text-sm text-foreground">{r.content}</p>
                          <span className="text-xs text-muted-foreground mt-1 block">{new Date(r.created_at).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === "earnings" && (
          <div className="space-y-4">
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                  <p className="font-display text-3xl font-bold">₦{earnings.toLocaleString()}</p>
                </div>
                <Button
                  variant="hero"
                  onClick={() => setShowWithdraw(true)}
                  disabled={earnings < 1000}
                >
                  Withdraw
                </Button>
              </div>
              {!monetized && (
                <div className="bg-secondary rounded-lg p-3 text-sm text-muted-foreground">
                  💡 Earn ₦100 per 1,000 views. Monetization activates at 2,000 views.
                  You currently have {totalViews.toLocaleString()} views.
                </div>
              )}
              {earnings > 0 && earnings < 1000 && (
                <div className="bg-secondary rounded-lg p-3 text-sm text-muted-foreground mt-2">
                  Minimum withdrawal amount is ₦1,000.
                </div>
              )}
            </div>

            {showWithdraw && (
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Withdraw Funds</h3>
                <form onSubmit={handleWithdraw} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Amount (₦)</Label>
                    <Input type="number" min="1000" value={wAmount} onChange={(e) => setWAmount(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input value={wBank} onChange={(e) => setWBank(e.target.value)} placeholder="e.g. GTBank" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input value={wAccNum} onChange={(e) => setWAccNum(e.target.value)} placeholder="0123456789" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Name</Label>
                    <Input value={wAccName} onChange={(e) => setWAccName(e.target.value)} placeholder="John Doe" required />
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" variant="hero" disabled={wSubmitting}>
                      {wSubmitting ? "Submitting..." : "Submit Request"}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setShowWithdraw(false)}>Cancel</Button>
                  </div>
                </form>
              </div>
            )}

            {withdrawals.length > 0 && (
              <div className="glass-card rounded-xl p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Withdrawal History</h3>
                <div className="space-y-3">
                  {withdrawals.map((w) => (
                    <div key={w.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium">₦{w.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        w.status === "completed" ? "bg-success/20 text-success" :
                        w.status === "pending" ? "bg-warning/20 text-warning" :
                        "bg-destructive/20 text-destructive"
                      }`}>
                        {w.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="font-display text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}
