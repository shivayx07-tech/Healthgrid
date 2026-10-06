import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck, HeartPulse, Workflow, UserRound, Stethoscope, CalendarDays, FileText, Activity, Users, LockKeyhole, LoaderCircle } from "lucide-react";
import { GalaxyShell } from "@/components/galaxy-shell";
import { FeaturesBento, JourneyTimeline, ImpactMetrics } from "@/components/landing-sections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Kanpur Metro Hospital — Powered by HealthGrid" },
    { name: "description", content: "Your AI-powered unified health bridge. Connect to the Kanpur Metro Hospital citizen and hospital staff portals with HealthGrid." },
    { property: "og:title", content: "Kanpur Metro Hospital — Powered by HealthGrid" },
    { property: "og:description", content: "Connected care for citizens and hospital teams. One unified health ecosystem." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Index,
});

function Index() {
  const [role, setRole] = useState<"citizen" | "hospital" | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const signIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!role || loading) return;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 650));
    await navigate({ to: role === "citizen" ? "/citizen-dashboard" : "/hospital-dashboard" });
  };
  const roles = [
    { id: "citizen" as const, icon: UserRound, tag: "FOR YOU & YOUR FAMILY", title: "Citizen / Patient Login", description: "Your health journey, all in one place. Access your records, connect with doctors, and take charge of your wellbeing.", benefits: [{ icon: FileText, text: "Health records" }, { icon: CalendarDays, text: "Appointments" }, { icon: HeartPulse, text: "Personalized care" }], cta: "Enter Citizen Portal", note: "Your care. Your control." },
    { id: "hospital" as const, icon: Stethoscope, tag: "FOR HEALTHCARE TEAMS", title: "Hospital Staff Login", description: "A smarter way to deliver care. Unified patient insights, streamlined workflows, and AI-powered clinical support.", benefits: [{ icon: Users, text: "Patient management" }, { icon: Activity, text: "Clinical insights" }, { icon: Workflow, text: "Smart workflows" }], cta: "Enter Hospital Portal", note: "Authorized hospital personnel only" },
  ];
  return <GalaxyShell><main className="welcome-main">
    <motion.section initial={{ opacity: 0, y: reduced ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }}>
      <div className="eyebrow"><Sparkles /> The next generation of connected care</div>
      <h1 className="hero-title">Kanpur Metro Hospital<span>One bridge. A healthier tomorrow.</span></h1>
      <p className="hero-description">Bringing people, care, and intelligence together. Your AI-powered unified health bridge — built around you, powered by HealthGrid.</p>
      <div className="hero-signals"><span><ShieldCheck /> Secure by design</span><span><Sparkles /> AI-powered care</span><span><Workflow /> Seamlessly connected</span></div>
    </motion.section>
    <section className="role-section"><div className="section-heading"><h2>Your gateway to better care</h2><span><i className="live-dot" /> HealthGrid ecosystem</span></div><div className="role-grid">{roles.map((item, i) => <motion.article key={item.id} className={`role-card role-${item.id}`} initial={{ opacity: 0, y: reduced ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55, delay: .15 + i * .1 }}><div className="role-card-top"><div className="role-icon"><item.icon /></div><span className="role-tag">{item.tag}</span></div><h3>{item.title}</h3><p>{item.description}</p><div className="role-benefits">{item.benefits.map(benefit => <span key={benefit.text}><benefit.icon />{benefit.text}</span>)}</div><Button variant={item.id} className="role-cta" onClick={() => setRole(item.id)}>{item.cta}<ArrowRight /></Button><div className="role-note"><LockKeyhole />{item.note}</div></motion.article>)}</div></section>
    <p className="privacy-line"><ShieldCheck /> A connected health experience, with your privacy at its heart.</p>
    <FeaturesBento /><JourneyTimeline /><ImpactMetrics />
  </main><Dialog open={role !== null} onOpenChange={open => { if (!open && !loading) setRole(null); }}><DialogContent className="auth-dialog"><div className={`role-icon role-${role ?? "citizen"}`}>{role === "hospital" ? <Stethoscope /> : <UserRound />}</div><DialogTitle>{role === "hospital" ? "Hospital Staff Login" : "Citizen / Patient Login"}</DialogTitle><DialogDescription>Welcome to Kanpur Metro Hospital.</DialogDescription><form className="auth-form" onSubmit={signIn}><div className="demo-notice">Demo sign-in only. Use any email and any password of at least 6 characters. Please don't use your real credentials.</div><label>Email address<Input type="email" placeholder={role === "hospital" ? "doctor@example.com" : "you@example.com"} required autoComplete="off" /></label><label>Password<Input type="password" placeholder="Enter a demo password" minLength={6} required autoComplete="off" /></label><Button variant={role ?? "citizen"} className="role-cta" type="submit" disabled={loading}>{loading ? "Opening your workspace…" : "Sign in to demo"}{loading ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}</Button></form></DialogContent></Dialog></GalaxyShell>;
}
