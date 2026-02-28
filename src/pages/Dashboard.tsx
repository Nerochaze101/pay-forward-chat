import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { getProfile, getMessages, getWithdrawals, updateUsername, requestWithdrawal, getQuestionsByProfile, getRepliesByQuestion, deleteQuestion } from "@/lib/supabase-helpers";
import { useToast } from "@/hooks/use-toast";
import { Copy, LogOut, MessageCircle, Eye, Banknote, Share2, Check, HelpCircle, Trash2, Sparkles, Clock, ChevronRight } from "lucide-react";
import CreateQuestion from "@/components/CreateQuestion";
import QuestionCard from "@/components/QuestionCard";
import MessageModal from "@/components/MessageModal";
import { SocialShareButtons } from "@/components/SocialIcons";

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
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [wAmount, setWAmount] = useState("");
  const [wBank, setWBank] = useState("");
  const [wAccNum, setWAccNum] = useState("");
  const [wAccName, setWAccName] = useState("");
  const [wSubmitting, setWSubmitting] = useState(false);

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
    if (amount < 1000) { toast({ title: "Minimum withdrawal is ₦1,000", variant: "destructive" }); return; }
    if (amount > (profile?.balance ?? 0)) { toast({ title: "Insufficient balance", variant: "destructive" }); return; }
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
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-bg animate-glow-pulse" />
          <span className="text-muted-foreground text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  const earnings = profile?.balance ?? 0;
  const totalViews = profile?.total_views ?? 0;
  const monetized = totalViews >= 2000;

  const tabs = [
    { key: "messages" as const, label: "Messages", icon: MessageCircle, count: messages.length },
    { key: "questions" as const, label: "Questions", icon: HelpCircle, count: questions.length },
    { key: "earnings" as const, label: "Earnings", icon: Banknote },
  ];

  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="fixed inset-0 bg-spotlight pointer-events-none" />

      <MessageModal message={selectedMessage} onClose={() => setSelectedMessage(null)} />

      {/* Header */}
      <header className="relative border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="font-display text-lg font-bold gradient-text flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            WhisperBox
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">{profile?.display_name}</span>
            <Button variant="ghost" size="icon" onClick={signOut} className="h-8 w-8">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="relative max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Welcome & Link */}
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div>
            <h2 className="font-display text-xl font-bold mb-1">
              Hey, {profile?.display_name || profile?.username} 👋
            </h2>
            <p className="text-sm text-muted-foreground">Share your link to receive anonymous messages</p>
          </div>

          <div className="flex gap-2">
            <Input value={messageLink} readOnly className="font-mono text-xs bg-secondary/50" />
            <Button variant="hero" size="icon" onClick={copyLink} className="shrink-0">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          {editingUsername ? (
            <div className="flex gap-2 items-center">
              <Input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="max-w-[200px] text-sm" placeholder="new_username" />
              <Button size="sm" onClick={handleUsernameUpdate}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingUsername(false)}>Cancel</Button>
            </div>
          ) : (
            <button className="text-xs text-primary hover:underline" onClick={() => setEditingUsername(true)}>
              Edit username
            </button>
          )}

          <SocialShareButtons
            shareText={`Send me an anonymous message! ${messageLink}`}
            shareUrl={messageLink}
            onInstagramClick={() => {
              navigator.clipboard.writeText(messageLink);
              toast({ title: "Link copied!", description: "Paste this link in your Instagram bio or story." });
            }}
          />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={MessageCircle} label="Messages" value={messages.length.toString()} />
          <StatCard icon={Eye} label="Views" value={totalViews.toLocaleString()} />
          <StatCard icon={Banknote} label="Balance" value={`₦${earnings.toLocaleString()}`} />
        </div>

        {!monetized && (
          <div className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{2000 - totalViews} more views to activate earnings (₦100 per 1,000 views)</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-secondary/50 rounded-xl p-1 border border-border">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                tab === t.key
                  ? "gradient-bg text-primary-foreground shadow-lg glow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setTab(t.key)}
            >
              <t.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
              {t.count !== undefined && t.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  tab === t.key ? "bg-white/20" : "bg-primary/10 text-primary"
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Messages Tab */}
        {tab === "messages" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>Messages disappear after 24 hours</span>
            </div>
            {messages.length === 0 ? (
              <div className="glass-card rounded-2xl p-10 text-center">
                <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 animate-float">
                  <MessageCircle className="w-7 h-7 text-primary-foreground" />
                </div>
                <p className="font-display font-semibold mb-1">No messages yet</p>
                <p className="text-sm text-muted-foreground">Share your link to start receiving messages!</p>
              </div>
            ) : (
              messages.map((m) => (
                <button
                  key={m.id}
                  className="glass-card rounded-2xl p-5 w-full text-left hover:border-primary/30 transition-all duration-200 cursor-pointer active:scale-[0.98] group"
                  onClick={() => setSelectedMessage(m)}
                >
                  <p className="text-foreground line-clamp-2 text-sm">{m.content}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</span>
                    <span className="text-xs text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                      View <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Questions Tab */}
        {tab === "questions" && (
          <div className="space-y-4">
            <CreateQuestion profileId={profile.id} displayName={profile.display_name || profile.username} onCreated={loadData} />
            {questions.length === 0 ? (
              <div className="glass-card rounded-2xl p-10 text-center">
                <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 animate-float">
                  <HelpCircle className="w-7 h-7 text-primary-foreground" />
                </div>
                <p className="font-display font-semibold mb-1">No questions yet</p>
                <p className="text-sm text-muted-foreground">Create one and share the link!</p>
              </div>
            ) : (
              questions.map((q) => (
                <div key={q.id} className="glass-card rounded-2xl p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <QuestionCard questionText={q.question_text} bgColor={q.bg_color} displayName={profile.display_name || profile.username} compact />
                    </div>
                    <button onClick={async () => { await deleteQuestion(q.id); loadData(); }} className="text-muted-foreground hover:text-destructive mt-2 shrink-0 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{(questionReplies[q.id] || []).length} replies</span>
                    <span>{new Date(q.created_at).toLocaleDateString()}</span>
                    <button className="text-primary hover:underline ml-auto flex items-center gap-1" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/q/${q.id}`); toast({ title: "Link copied!" }); }}>
                      <Copy className="w-3 h-3" /> Copy link
                    </button>
                  </div>
                  {(questionReplies[q.id] || []).length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-border">
                      {(questionReplies[q.id] || []).map((r: any) => (
                        <div key={r.id} className="bg-secondary/50 border border-border rounded-xl p-3">
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

        {/* Earnings Tab */}
        {tab === "earnings" && (
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Available Balance</p>
                  <p className="font-display text-3xl font-bold gradient-text">₦{earnings.toLocaleString()}</p>
                </div>
                <Button variant="hero" onClick={() => setShowWithdraw(true)} disabled={earnings < 1000}>Withdraw</Button>
              </div>
              {earnings > 0 && earnings < 1000 && (
                <div className="bg-secondary/50 border border-border rounded-xl p-3 text-sm text-muted-foreground">Minimum withdrawal amount is ₦1,000.</div>
              )}
            </div>

            {showWithdraw && (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Withdraw Funds</h3>
                <form onSubmit={handleWithdraw} className="space-y-4">
                  <div className="space-y-2"><Label>Amount (₦)</Label><Input type="number" min="1000" value={wAmount} onChange={(e) => setWAmount(e.target.value)} required /></div>
                  <div className="space-y-2"><Label>Bank Name</Label><Input value={wBank} onChange={(e) => setWBank(e.target.value)} placeholder="e.g. GTBank" required /></div>
                  <div className="space-y-2"><Label>Account Number</Label><Input value={wAccNum} onChange={(e) => setWAccNum(e.target.value)} placeholder="0123456789" required /></div>
                  <div className="space-y-2"><Label>Account Name</Label><Input value={wAccName} onChange={(e) => setWAccName(e.target.value)} placeholder="John Doe" required /></div>
                  <div className="flex gap-3">
                    <Button type="submit" variant="hero" disabled={wSubmitting}>{wSubmitting ? "Submitting..." : "Submit Request"}</Button>
                    <Button type="button" variant="ghost" onClick={() => setShowWithdraw(false)}>Cancel</Button>
                  </div>
                </form>
              </div>
            )}

            {withdrawals.length > 0 && (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-display text-lg font-semibold mb-4">History</h3>
                <div className="space-y-3">
                  {withdrawals.map((w) => (
                    <div key={w.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div>
                        <p className="font-medium text-sm">₦{w.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${w.status === "completed" ? "bg-success/20 text-success" : w.status === "pending" ? "bg-warning/20 text-warning" : "bg-destructive/20 text-destructive"}`}>
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

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="glass-card rounded-2xl p-4 text-center group hover:scale-[1.02] transition-transform duration-200">
      <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center mx-auto mb-2 group-hover:animate-glow-pulse">
        <Icon className="w-4 h-4 text-primary-foreground" />
      </div>
      <p className="font-display text-lg font-bold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
