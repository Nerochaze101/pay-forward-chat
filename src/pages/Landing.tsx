import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageCircle, Eye, Banknote, Sparkles, HelpCircle, Zap, ArrowRight, Shield, Clock } from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "Anonymous Messages",
    description: "Receive honest, unfiltered messages from anyone — completely anonymous.",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    icon: HelpCircle,
    title: "Question Cards",
    description: "Create stunning question cards and share directly to your status.",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: Eye,
    title: "Track Views",
    description: "Monitor how many people visit your message page in real-time.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Banknote,
    title: "Earn Money",
    description: "Earn ₦100 for every 1,000 views. Withdraw directly to your bank.",
    gradient: "from-emerald-500 to-green-600",
  },
];

const trustBadges = [
  { icon: Shield, text: "100% Anonymous" },
  { icon: Clock, text: "Messages auto-delete in 24h" },
  { icon: Zap, text: "Instant setup" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background bg-grid">
      <div className="fixed inset-0 bg-spotlight pointer-events-none" />

      {/* Nav */}
      <nav className="relative flex items-center justify-between px-4 sm:px-6 py-4 max-w-6xl mx-auto">
        <h1 className="font-display text-xl font-bold gradient-text flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          WhisperBox
        </h1>
        <div className="flex gap-2">
          <Link to="/auth">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button variant="hero" size="sm">Sign up free</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-20 sm:pb-32 text-center">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 glow-border">
            <Zap className="w-3.5 h-3.5" />
            Get paid for going viral
          </span>
        </div>
        <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 animate-fade-up-delay-1">
          Get anonymous<br />
          <span className="gradient-text">messages.</span>{" "}
          <span className="text-muted-foreground">Get paid.</span>
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8 animate-fade-up-delay-2">
          Create your link, share it on social media, receive anonymous messages, and earn money from every view.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-up-delay-3">
          <Link to="/auth?mode=signup">
            <Button variant="hero" size="lg" className="text-base px-8 py-6 w-full sm:w-auto animate-glow-pulse gap-2">
              Create Your Link <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="hero-outline" size="lg" className="text-base px-8 py-6 w-full sm:w-auto">
              Log In
            </Button>
          </Link>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-4 mt-10 animate-fade-up-delay-3">
          {trustBadges.map((b) => (
            <div key={b.text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <b.icon className="w-3.5 h-3.5 text-primary" />
              <span>{b.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-20 sm:pb-32">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-center mb-10">
          Why <span className="gradient-text">WhisperBox</span>?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`glass-card rounded-2xl p-6 animate-fade-up-delay-${Math.min(i + 1, 3)} group hover:scale-[1.03] transition-all duration-300`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow`}>
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-base font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative max-w-4xl mx-auto px-4 sm:px-6 pb-20 sm:pb-32 text-center">
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-12">
          How it <span className="gradient-text">works</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Sign Up", desc: "Create your free account in seconds", gradient: "from-indigo-500 to-violet-600" },
            { step: "02", title: "Share Link", desc: "Share your unique link on social media", gradient: "from-pink-500 to-rose-600" },
            { step: "03", title: "Earn Cash", desc: "Get paid ₦100 per 1,000 views", gradient: "from-emerald-500 to-green-600" },
          ].map((s) => (
            <div key={s.step} className="glass-card rounded-2xl p-6 hover:scale-[1.03] transition-all duration-300">
              <span className={`inline-block font-display text-4xl font-bold bg-gradient-to-br ${s.gradient} bg-clip-text text-transparent`}>{s.step}</span>
              <h3 className="font-display text-lg font-semibold mt-3 mb-1.5">{s.title}</h3>
              <p className="text-muted-foreground text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative max-w-3xl mx-auto px-4 sm:px-6 pb-20 sm:pb-32 text-center">
        <div className="glass-card rounded-3xl p-8 sm:p-12 glow-border">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">
            Ready to get <span className="gradient-text">started</span>?
          </h2>
          <p className="text-muted-foreground mb-6 text-sm sm:text-base">Join thousands of users receiving anonymous messages and earning money.</p>
          <Link to="/auth?mode=signup">
            <Button variant="hero" size="lg" className="text-base px-10 py-6 animate-glow-pulse gap-2">
              Create Your Link — It's Free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-muted-foreground">
          © 2026 WhisperBox. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
