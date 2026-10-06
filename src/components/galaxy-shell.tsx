import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Activity, Plus, ShieldCheck, CircleHelp, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import networkImage from "@/assets/health-network.jpg";

export function ParticleBackground() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const colors = getComputedStyle(document.documentElement);
    const cyan = colors.getPropertyValue("--cyan").trim();
    const lilac = colors.getPropertyValue("--lilac").trim();
    let width = 0, height = 0, frame = 0;
    const points = Array.from({ length: 45 }, (_, i) => ({ x: Math.random(), y: Math.random(), r: i % 3 === 0 ? 1.2 : .65, speed: .00002 + Math.random() * .000025 }));
    const resize = () => { width = canvas.clientWidth; height = canvas.clientHeight; canvas.width = width * Math.min(window.devicePixelRatio, 2); canvas.height = height * Math.min(window.devicePixelRatio, 2); ctx.setTransform(Math.min(window.devicePixelRatio, 2), 0, 0, Math.min(window.devicePixelRatio, 2), 0, 0); };
    resize();
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      points.forEach((p, i) => { if (!reduced) p.y = (p.y - p.speed + 1) % 1; ctx.fillStyle = i % 3 === 0 ? cyan : lilac; ctx.beginPath(); ctx.arc(p.x * width, p.y * height, p.r, 0, Math.PI * 2); ctx.fill(); });
      if (!reduced) frame = requestAnimationFrame(draw);
    };
    draw(); window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas className="particle-canvas" ref={ref} aria-hidden="true" />;
}

export function GalaxyShell({ children }: { children: ReactNode }) {
  const [info, setInfo] = useState<string | null>(null);
  const copy: Record<string, string> = {
    "Need help?": "For patient assistance, please visit the hospital reception. Hospital staff can contact their internal IT administrator for access support.",
    "Privacy Policy": "This is a demonstration of the HealthGrid portal. No health information is collected or stored. Do not enter real medical information or passwords.",
    "Terms of Use": "This preview is for demonstration only and is not a medical service. For medical advice or urgent care, contact a qualified healthcare professional.",
  };
  return <div className="galaxy-page">
    <img className="galaxy-art" src={networkImage} width={1920} height={1024} alt="" aria-hidden="true" />
    <div className="galaxy-shade" /><ParticleBackground />
    <header className="site-header">
      <Link to="/" className="hospital-brand" aria-label="Kanpur Metro Hospital home">
        <div className="brand-symbol"><Plus strokeWidth={3.5} /></div>
        <div><div className="brand-name">Kanpur Metro Hospital</div><div className="brand-sub">POWERED BY <Activity size={11} /><strong>HealthGrid</strong></div></div>
      </Link>
      <div className="header-right"><span className="secure-badge"><ShieldCheck /> Secure health ecosystem</span><Button variant="ghost" className="help-button" onClick={() => setInfo("Need help?")}><CircleHelp size={15} /><span>Need help?</span><ArrowUpRight size={12} /></Button></div>
    </header>
    {children}
    <footer className="site-footer footer-xl"><div className="footer-grid">
      <div><div className="footer-brand"><Activity /><strong>HealthGrid</strong><span>·</span><span>Connected care. Better lives.</span></div><p className="footer-tag">The AI-powered unified health bridge for Kanpur Metro Hospital — linking citizens, clinicians and care.</p></div>
      <div className="footer-col"><h4>Portals</h4><ul><li><Link className="footer-glow" to="/citizen-dashboard">Citizen portal</Link></li><li><Link className="footer-glow" to="/hospital-dashboard">Hospital portal</Link></li></ul></div>
      <div className="footer-col"><h4>Support</h4><ul><li><button className="footer-glow" onClick={() => setInfo("Need help?")}>Need help?</button></li></ul></div>
      <div className="footer-col"><h4>Legal</h4><ul><li><button className="footer-glow" onClick={() => setInfo("Privacy Policy")}>Privacy Policy</button></li><li><button className="footer-glow" onClick={() => setInfo("Terms of Use")}>Terms of Use</button></li></ul></div>
    </div><div className="footer-bottom"><span>© 2026 Kanpur Metro Hospital</span><span>Powered by HealthGrid</span></div></footer>
    <Dialog open={info !== null} onOpenChange={open => { if (!open) setInfo(null); }}><DialogContent className="auth-dialog"><DialogTitle>{info}</DialogTitle><DialogDescription className="leading-7">{info ? copy[info] : ""}</DialogDescription></DialogContent></Dialog>
  </div>;
}