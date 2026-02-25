import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MessageCircle, Eye, Banknote, Share2 } from "lucide-react";

const features = [
  {
    icon: MessageCircle,
    title: "Anonymous Messages",
    description: "Receive honest, unfiltered messages from anyone — completely anonymous.",
  },
  {
    icon: Share2,
    title: "Share Everywhere",
    description: "Share your unique link on WhatsApp, Twitter, Facebook and more.",
  },
  {
    icon: Eye,
    title: "Track Views",
    description: "Monitor how many people visit your message page in real-time.",
  },
  {
    icon: Banknote,
    title: "Earn Money",
    description: "Earn ₦100 for every 1,000 views. Withdraw directly to your bank.",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <h1 className="font-display text-xl font-bold gradient-text">WhisperBox</h1>
        <div className="flex gap-3">
          <Link to="/auth">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button variant="hero" size="sm">Sign up free</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="animate-fade-up">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            🔥 Get paid for going viral
          </span>
        </div>
        <h2 className="font-display text-5xl sm:text-7xl font-bold leading-tight mb-6 animate-fade-up-delay-1">
          Get anonymous<br />
          <span className="gradient-text">messages.</span>{" "}
          <span className="text-muted-foreground">Get paid.</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 animate-fade-up-delay-2">
          Create your link, share it on social media, receive anonymous messages, and earn money from every view.
        </p>
        <div className="flex gap-4 justify-center animate-fade-up-delay-3">
          <Link to="/auth?mode=signup">
            <Button variant="hero" size="lg" className="text-base px-8 py-6">
              Create Your Link
            </Button>
          </Link>
          <Link to="/auth">
            <Button variant="hero-outline" size="lg" className="text-base px-8 py-6">
              Log In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`glass-card rounded-xl p-6 animate-fade-up-delay-${Math.min(i + 1, 3)}`}
            >
              <div className="w-12 h-12 rounded-lg gradient-bg flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 pb-32 text-center">
        <h2 className="font-display text-3xl font-bold mb-12">
          How it <span className="gradient-text">works</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Sign Up", desc: "Create your free account in seconds" },
            { step: "02", title: "Share Link", desc: "Share your unique link on social media" },
            { step: "03", title: "Earn Cash", desc: "Get paid ₦100 per 1,000 views" },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <span className="font-display text-5xl font-bold gradient-text">{s.step}</span>
              <h3 className="font-display text-xl font-semibold mt-4 mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-muted-foreground">
          © 2026 WhisperBox. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
