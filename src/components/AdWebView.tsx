import { useEffect, useRef, useState } from "react";

const AdWebView = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    // Auto-refresh iframe every 15-20 seconds
    const scheduleRefresh = () => {
      const delay = 15000 + Math.random() * 5000;
      return setTimeout(() => {
        setIframeKey((k) => k + 1);
      }, delay);
    };

    let timer = scheduleRefresh();
    const interval = setInterval(() => {
      clearTimeout(timer);
      timer = scheduleRefresh();
    }, 20000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [iframeKey]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="pointer-events-auto mt-2 mx-2 w-full max-w-[340px] rounded-xl overflow-hidden border border-primary/30 shadow-[0_0_20px_hsl(270_80%_65%/0.2)]"
        style={{ background: "hsl(250 18% 7% / 0.95)", backdropFilter: "blur(16px)" }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-primary/20">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-destructive" />
            <span className="w-2 h-2 rounded-full bg-warning" />
            <span className="w-2 h-2 rounded-full bg-success" />
          </div>
          <span className="text-[10px] text-muted-foreground font-display tracking-wide">Sponsored</span>
        </div>
        {/* Iframe */}
        <iframe
          ref={iframeRef}
          key={iframeKey}
          src="/adview.html"
          className="w-full border-0"
          style={{ height: "120px" }}
          sandbox="allow-scripts allow-same-origin allow-popups"
          title="Ad View"
        />
      </div>
    </div>
  );
};

export default AdWebView;
