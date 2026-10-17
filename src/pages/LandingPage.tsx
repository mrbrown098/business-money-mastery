import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Badge, GlassCard } from '../ui';
import {
  FlaskConical,
  Zap,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  PackageCheck,
  Smartphone,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const showcaseRef = useRef<HTMLDivElement | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // Check performance settings & motion preferences
  const isLiteMode =
    typeof window !== 'undefined' &&
    (localStorage.getItem('mizanflow_lite_mode') === 'true' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4));

  // 1. Scroll header backdrop effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Interactive 3D Showcase Card Mouse Tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLiteMode || !showcaseRef.current) return;
    const card = showcaseRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotateX = (-y / rect.height) * 14;
    const rotateY = (x / rect.width) * 14;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    if (!showcaseRef.current) return;
    showcaseRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  // 3. Particle Canvas Engine (Auto-throttled when tab hidden or lite mode enabled)
  useEffect(() => {
    if (isLiteMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: { x: number; y: number; radius: number; vx: number; vy: number; color: string }[] = [];
    const colors = ['#f5c04a', '#00e5ff', '#8a5cff'];

    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const render = () => {
      if (document.hidden) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.globalAlpha = 0.6;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [isLiteMode]);

  return (
    <div className="relative min-h-screen bg-[#07070b] text-[#f2f2f7] overflow-x-hidden selection:bg-[#f5c04a] selection:text-black">
      {/* Particle Canvas & Radial Background Glow Orbs */}
      {!isLiteMode && (
        <>
          <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-60" />
          <div className="fixed -top-40 -right-40 w-96 h-96 bg-[#8a5cff]/20 rounded-full blur-[120px] pointer-events-none z-0" />
          <div className="fixed top-1/3 -left-40 w-96 h-96 bg-[#00e5ff]/15 rounded-full blur-[120px] pointer-events-none z-0" />
        </>
      )}

      {/* Sticky Glass Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? 'glass-panel py-3 shadow-2xl border-b border-white/10' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#f5c04a] to-[#8a5cff] text-slate-950 font-bold shadow-lg">
              <FlaskConical className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-wider font-[var(--font-orbitron)] text-white">
              MIZAN<span className="text-[#f5c04a]">FLOW</span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/app">
              <Button variant="primary" size="sm">
                Open App <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
        <Badge variant="gold" className="mb-6 glow-gold">
          Free - Works Offline - Your Data Stays Yours
        </Badge>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.15] font-[var(--font-playfair)]">
          Hisaab Saaf.{' '}
          <span className="gradient-text-gold">Munafa Saaf.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl font-light leading-relaxed">
          The ultimate offline-first business mastery software for chemical repacking shops in Pakistan.
          Track raw material costs, packing expenses, Udhaar recovery, and true net Bachat with complete zero-cost privacy.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link to="/app">
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              Open the App <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Button variant="ghost" size="lg" disabled className="w-full sm:w-auto opacity-60 cursor-not-allowed">
            Sign in with Google (coming soon)
          </Button>
        </div>

        {/* Orbitron Key Metrics Strip */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
          <GlassCard className="text-center py-4">
            <div className="text-xl font-bold text-[#f5c04a] font-[var(--font-orbitron)]">Rs 0</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Free Forever</div>
          </GlassCard>
          <GlassCard className="text-center py-4">
            <div className="text-xl font-bold text-[#00e5ff] font-[var(--font-orbitron)]">Offline</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Works Anywhere</div>
          </GlassCard>
          <GlassCard className="text-center py-4">
            <div className="text-xl font-bold text-[#8a5cff] font-[var(--font-orbitron)]">Drive</div>
            <div className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Cloud Backup Soon</div>
          </GlassCard>
        </div>

        {/* Interactive 3D Showcase Card */}
        <div
          className="mt-16 w-full max-w-4xl relative group"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Spinning Backlight Conic Gradient Ring */}
          {!isLiteMode && (
            <div className="absolute -inset-1 rounded-3xl bg-conic-gradient from-[#f5c04a] via-[#00e5ff] to-[#8a5cff] opacity-40 blur-xl group-hover:opacity-70 transition duration-500 animate-spin-slow" />
          )}

          <div
            ref={showcaseRef}
            className="relative glass-panel p-6 sm:p-8 rounded-3xl border-white/20 shadow-2xl transition-transform duration-200 ease-out text-left"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-[#ff5d7a]" />
                <span className="w-3 h-3 rounded-full bg-[#f5c04a]" />
                <span className="w-3 h-3 rounded-full bg-[#25d366]" />
                <span className="text-xs text-slate-400 ml-2 font-mono">MizanFlow Live Dashboard Preview</span>
              </div>
              <Badge variant="cyan">Sample Simulation</Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="text-[10px] uppercase text-slate-400 font-semibold">Total Udhaar</div>
                <div className="text-xl font-bold text-[#ff9f43] font-[var(--font-orbitron)] mt-1">Rs 18,500</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="text-[10px] uppercase text-slate-400 font-semibold">Monthly Sales</div>
                <div className="text-xl font-bold text-[#00e5ff] font-[var(--font-orbitron)] mt-1">Rs 142,000</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="text-[10px] uppercase text-slate-400 font-semibold">Total Kharcha</div>
                <div className="text-xl font-bold text-[#ff5d7a] font-[var(--font-orbitron)] mt-1">Rs 12,400</div>
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="text-[10px] uppercase text-slate-400 font-semibold">Net Bachat</div>
                <div className="text-xl font-bold text-[#f5c04a] font-[var(--font-orbitron)] mt-1">Rs 41,200</div>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-[#25d366]" />
                <span>Cypermethrin 10EC 100ml Pack Cost: <strong>Rs 250</strong> | Profit Margin: <strong className="text-[#25d366]">16.7%</strong></span>
              </div>
              <Badge variant="green">Live Ledger</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Strip */}
      <section className="border-y border-white/10 bg-white/5 py-4 overflow-hidden">
        <div className="flex space-x-12 animate-marquee whitespace-nowrap text-xs font-semibold uppercase tracking-widest text-slate-400">
          <span>Khata Management</span>
          <span className="text-[#f5c04a]">•</span>
          <span>Udhaar Recovery</span>
          <span className="text-[#00e5ff]">•</span>
          <span>Stock Ledger</span>
          <span className="text-[#25d366]">•</span>
          <span>PDF Invoices</span>
          <span className="text-[#8a5cff]">•</span>
          <span>WhatsApp Reminders</span>
          <span className="text-[#ff9f43]">•</span>
          <span>100% Offline PWA</span>
        </div>
      </section>

      {/* Four Feature Glass Cards Grid */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <Badge variant="gold" className="mb-3">Core Features</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold font-[var(--font-playfair)]">
            Built Specifically For Pakistan Repacking Businesses
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <GlassCard>
            <div className="p-3 rounded-2xl bg-[#00e5ff]/10 text-[#00e5ff] w-fit mb-4">
              <PackageCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Real Cost Per Pack</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Computes weighted average raw material cost, bottle/pouch cost, and mazduri per pack. Know your exact net margin on every pack size.
            </p>
          </GlassCard>

          <GlassCard>
            <div className="p-3 rounded-2xl bg-[#ff9f43]/10 text-[#ff9f43] w-fit mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Udhaar & Khata Recovery</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Track customer credit balances with automatic FIFO payment allocation. Know your exact overdue days and top debtors instantly.
            </p>
          </GlassCard>

          <GlassCard>
            <div className="p-3 rounded-2xl bg-[#25d366]/10 text-[#25d366] w-fit mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">100% Offline First</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              No internet connection required after initial visit. Works seamlessly in remote agri markets or warehouses using IndexedDB storage.
            </p>
          </GlassCard>

          <GlassCard>
            <div className="p-3 rounded-2xl bg-[#8a5cff]/10 text-[#8a5cff] w-fit mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">WhatsApp Reminders</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Send one-tap Roman Urdu payment reminders and bills via official wa.me click-to-chat links directly to customers.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4 text-[#f5c04a]" />
            <span>MizanFlow PWA • Free & Serverless Software</span>
          </div>
          <div>MIT License • Clean Local Storage</div>
        </div>
      </footer>
    </div>
  );
};
