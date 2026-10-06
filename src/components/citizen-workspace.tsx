import { useEffect, useState, type ComponentType } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { UIMessage } from "ai";
import {
  Activity, AlertTriangle, Apple, BedDouble, Bell, Bot, Brain, BookOpen, Building2, FileText, HeartPulse,
  LayoutDashboard, Leaf, LogOut, MapPin, Menu, Navigation, Search, ShieldAlert, Star, Syringe, TestTube, User, X,
} from "lucide-react";
import { GalaxyShell } from "@/components/galaxy-shell";
import { ChatWindow, STORE_KEY } from "@/components/health-assistant";

type View = "dashboard" | "hospitals" | "assistant" | "records" | "beds" | "alerts" | "education";
type Icon = ComponentType<{ className?: string }>;

const NAV: { id: View; label: string; icon: Icon }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "hospitals", label: "Find Hospitals", icon: MapPin },
  { id: "assistant", label: "AI Health Assistant", icon: Bot },
  { id: "records", label: "My Health Records", icon: FileText },
  { id: "beds", label: "Bed Availability", icon: BedDouble },
  { id: "alerts", label: "Emergency Alerts", icon: Bell },
  { id: "education", label: "Health Education", icon: BookOpen },
];

const HOSPITALS = [
  { name: "City Hospital", area: "Swaroop Nagar", km: 1.2, rating: 4.6, icu: 12, gen: 45, er: 8, icuT: 24, genT: 120, erT: 18, x: 46, y: 42 },
  { name: "AIIMS Delhi", area: "Ansari Nagar", km: 3.4, rating: 4.9, icu: 6, gen: 22, er: 4, icuT: 40, genT: 150, erT: 20, x: 70, y: 28 },
  { name: "Apollo Healthcare", area: "Civil Lines", km: 2.8, rating: 4.7, icu: 9, gen: 14, er: 5, icuT: 20, genT: 60, erT: 12, x: 24, y: 30 },
  { name: "Max Super Speciality", area: "Kidwai Nagar", km: 4.1, rating: 4.5, icu: 1, gen: 3, er: 1, icuT: 18, genT: 80, erT: 10, x: 62, y: 70 },
  { name: "Regency Hospital", area: "Govind Nagar", km: 5.0, rating: 4.4, icu: 3, gen: 5, er: 2, icuT: 16, genT: 70, erT: 10, x: 30, y: 72 },
];

const ALERTS = [
  { title: "Dengue Outbreak Alert", body: "Spike in cases detected in Civil Lines. Remove standing water and use repellents.", sev: "HIGH", date: "05 Oct 2026" },
  { title: "Malaria Cases Rising", body: "Kalyanpur reports increased malaria. Sleep under nets; seek testing for fever with chills.", sev: "HIGH", date: "03 Oct 2026" },
  { title: "Hospital Capacity Notice", body: "Max Super Speciality is near full capacity. Consider nearby alternatives.", sev: "MEDIUM", date: "02 Oct 2026" },
  { title: "Seasonal Flu Advisory", body: "Flu season begins. Vaccination recommended for elderly and children.", sev: "LOW", date: "28 Sep 2026" },
] as const;

const RECORDS = [
  { kind: "Diagnosis", title: "Annual Health Checkup", note: "All vitals normal · Dr. Neha Srivastava", date: "12 Sep 2026", icon: Activity },
  { kind: "Prescription", title: "Fever Treatment (Paracetamol)", note: "500mg · 1-0-1 · 5 days", date: "18 Aug 2026", icon: FileText },
  { kind: "Lab Report", title: "Complete Blood Count", note: "Haemoglobin 14.2 g/dL · within range", date: "02 Jul 2026", icon: TestTube },
  { kind: "Vaccination", title: "Influenza", note: "Annual dose · next due Sep 2027", date: "20 Mar 2026", icon: Syringe },
];

const EDUCATION = [
  { cat: "Cardiology", title: "Understanding Heart Health", body: "Know the warning signs, healthy habits and how to keep your heart strong.", icon: HeartPulse },
  { cat: "Nutrition", title: "Nutrition & Ayurvedic Diet", body: "Balanced Indian meals guided by Ayurvedic principles of dosha and season.", icon: Apple },
  { cat: "Mental Health", title: "Caring for Your Mind", body: "Simple practices for stress, sleep and emotional wellbeing.", icon: Brain },
  { cat: "Education", title: "Traditional Medicine Guide", body: "How AYUSH therapies like Ayurveda and Yoga complement modern care.", icon: Leaf },
];

const CHIPS = ["I have fever and headache", "Explain Vishama Jwara", "What hospitals near me have beds?"];

const status = (h: (typeof HOSPITALS)[number]) => {
  const free = (h.icu + h.gen + h.er) / (h.icuT + h.genT + h.erT);
  return free >= 0.3 ? "available" : free >= 0.12 ? "limited" : "critical";
};
const STATUS_LABEL = { available: "Available", limited: "Limited", critical: "Critical" } as const;

function Card({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  const reduced = useReducedMotion();
  const hover = reduced ? {} : { scale: 1.02, y: -2 };
  const t = { type: "spring" as const, stiffness: 300, damping: 22 };
  if (onClick) return <motion.button type="button" onClick={onClick} className={`cp-card ${className}`} whileHover={hover} transition={t}>{children}</motion.button>;
  return <motion.div className={`cp-card ${className}`} whileHover={hover} transition={t}>{children}</motion.div>;
}

function SevTag({ sev }: { sev: "HIGH" | "MEDIUM" | "LOW" }) {
  return <span className={`cp-sev sev-${sev.toLowerCase()}`}>{sev}</span>;
}

function DashboardView({ go }: { go: (v: View) => void }) {
  const metrics = [
    { label: "Nearby Hospitals", value: "5", icon: Building2, tone: "cyan" },
    { label: "Available Beds", value: "89", icon: BedDouble, tone: "lilac" },
    { label: "Active Alerts", value: "4", icon: ShieldAlert, tone: "rose" },
    { label: "AI Assistant", value: "Online", icon: Bot, tone: "green" },
  ];
  return (
    <div className="cp-stack">
      <div><h2 className="cp-welcome">Welcome back, Citizen</h2><p className="cp-sub">Here's your health overview for today.</p></div>
      <div className="cp-metrics">
        {metrics.map(m => <Card key={m.label} className={`cp-metric tone-${m.tone}`}><m.icon className="cp-metric-icon" /><span>{m.label}</span><strong>{m.value}</strong></Card>)}
      </div>
      <section>
        <h3 className="cp-h3">Quick Access</h3>
        <div className="cp-quick">
          {NAV.filter(n => n.id !== "dashboard").map(n => (
            <Card key={n.id} onClick={() => go(n.id)} className="cp-quick-card"><n.icon className="cp-quick-icon" /><strong>{n.label}</strong></Card>
          ))}
        </div>
      </section>
      <div className="cp-two">
        <section className="cp-card cp-panel">
          <h3 className="cp-h3">Nearby Hospitals</h3>
          <ul className="cp-list">
            {[...HOSPITALS].sort((a, b) => a.km - b.km).map(h => { const s = status(h); return (
              <li key={h.name}><div><strong>{h.name}</strong><span><Navigation />{h.km} km · {h.area}</span></div><span className={`cp-badge st-${s}`}>{STATUS_LABEL[s]}</span></li>
            ); })}
          </ul>
        </section>
        <section className="cp-card cp-panel">
          <h3 className="cp-h3">Latest Alerts</h3>
          <ul className="cp-list">
            {ALERTS.map(a => <li key={a.title}><div><strong><AlertTriangle className={`warn sev-c-${a.sev.toLowerCase()}`} />{a.title}</strong><span>{a.date}</span></div><SevTag sev={a.sev} /></li>)}
          </ul>
        </section>
      </div>
    </div>
  );
}

function HospitalsView() {
  const [sel, setSel] = useState(HOSPITALS[0]!.name);
  return (
    <div className="cp-stack">
      <div className="cp-card cp-map" role="group" aria-label="Map of nearby hospitals (illustrative)">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path className="map-river" d="M-5 12 C 25 6, 45 18, 60 10 S 95 2, 105 8" />
          <path className="map-road" d="M0 55 C 30 50, 60 58, 100 48" />
          <path className="map-road" d="M45 0 C 50 30, 44 60, 52 100" />
          <path className="map-road thin" d="M0 85 L 100 25" />
          <path className="map-road thin" d="M10 0 L 80 100" />
        </svg>
        <span className="map-you" style={{ left: "44%", top: "52%" }}><i />You</span>
        {HOSPITALS.map(h => (
          <button key={h.name} type="button" className={`cp-pin st-${status(h)}${sel === h.name ? " is-sel" : ""}`} style={{ left: `${h.x}%`, top: `${h.y}%` }} onClick={() => setSel(h.name)} aria-label={h.name}>
            <MapPin /><em>{h.name}</em>
          </button>
        ))}
      </div>
      <div className="cp-hgrid">
        {HOSPITALS.map(h => (
          <Card key={h.name} className={`cp-hcard${sel === h.name ? " is-sel" : ""}`}>
            <div className="cp-hcard-top"><strong>{h.name}</strong><span className="cp-rating"><Star />{h.rating}</span></div>
            <span className="cp-muted"><Navigation />{h.km} km · {h.area}</span>
            <p className="cp-beds">ICU: {h.icu} | General: {h.gen} | Emergency: {h.er}</p>
            <button type="button" className="cp-btn" onClick={() => setSel(h.name)}>View Details</button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AssistantView() {
  const [initial, setInitial] = useState<UIMessage[] | null>(null);
  const [key, setKey] = useState(0);
  useEffect(() => {
    try { setInitial(JSON.parse(localStorage.getItem(STORE_KEY) ?? "[]") as UIMessage[]); } catch { setInitial([]); }
  }, []);
  const reset = () => { try { localStorage.removeItem(STORE_KEY); } catch { /* ignore */ } setInitial([]); setKey(k => k + 1); };
  return <div className="cp-card cp-chat assist-panel-inline">{initial && <ChatWindow key={key} initial={initial} onReset={reset} suggestions={CHIPS} />}</div>;
}

function RecordsView() {
  return (
    <div className="cp-stack">
      <div className="cp-card cp-profile">
        <div className="cp-avatar"><User /></div>
        <div><h2>Rahul Sharma</h2><div className="cp-tags"><span>ID: P001</span><span>Age: 34</span><span>Blood Group: B+</span></div></div>
      </div>
      <ul className="cp-stack cp-records">
        {RECORDS.map(r => (
          <li key={r.title}><Card className="cp-record"><r.icon className="cp-record-icon" /><div><strong>{r.kind}: {r.title}</strong><span>{r.note}</span></div><time>{r.date}</time></Card></li>
        ))}
      </ul>
    </div>
  );
}

function Bar({ label, free, total }: { label: string; free: number; total: number }) {
  const pct = Math.round((free / total) * 100);
  const s = pct >= 30 ? "available" : pct >= 12 ? "limited" : "critical";
  return (
    <div className="cp-bar">
      <div className="cp-bar-label"><span>{label}</span><span>{free}/{total} free</span></div>
      <div className="cp-bar-track"><motion.div className={`cp-bar-fill st-${s}`} initial={{ width: 0 }} animate={{ width: `${Math.max(pct, 3)}%` }} transition={{ duration: 0.8 }} /></div>
    </div>
  );
}

function BedsView() {
  return (
    <div className="cp-stack">
      {HOSPITALS.map(h => { const s = status(h); return (
        <Card key={h.name} className="cp-bedcard">
          <div className="cp-hcard-top"><div><strong>{h.name}</strong><span className="cp-muted"><Navigation />{h.km} km · {h.area}</span></div><span className={`cp-badge st-${s}`}>{STATUS_LABEL[s]}</span></div>
          <Bar label="ICU" free={h.icu} total={h.icuT} /><Bar label="General" free={h.gen} total={h.genT} /><Bar label="Emergency" free={h.er} total={h.erT} />
        </Card>
      ); })}
    </div>
  );
}

function AlertsView() {
  return (
    <ul className="cp-stack">
      {ALERTS.map(a => (
        <li key={a.title}><Card className={`cp-alert sev-b-${a.sev.toLowerCase()}`}><AlertTriangle className={`warn sev-c-${a.sev.toLowerCase()}`} /><div><div className="cp-alert-top"><strong>{a.title}</strong><SevTag sev={a.sev} /></div><p>{a.body}</p></div><time>{a.date}</time></Card></li>
      ))}
    </ul>
  );
}

function EducationView() {
  return (
    <div className="cp-edu">
      {EDUCATION.map(e => <Card key={e.title} className="cp-educard"><e.icon className="cp-quick-icon" /><span className="cp-cat">{e.cat}</span><strong>{e.title}</strong><p>{e.body}</p></Card>)}
    </div>
  );
}

export function CitizenWorkspace() {
  const [view, setView] = useState<View>("dashboard");
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const current = NAV.find(n => n.id === view)!;
  const go = (v: View) => { setView(v); setMenu(false); };

  return (
    <GalaxyShell>
      <div className="demo-banner">Demo workspace · No real patient data or authenticated session</div>
      <div className="cp-layout">
        <aside className={`cp-side${menu ? " is-open" : ""}`}>
          <div className="cp-logo"><HeartPulse /><span>HealthGrid</span><button type="button" className="cp-close" onClick={() => setMenu(false)} aria-label="Close menu"><X /></button></div>
          <nav className="cp-nav">
            {NAV.map(n => (
              <button key={n.id} type="button" className={`cp-nav-item${view === n.id ? " is-active" : ""}`} onClick={() => go(n.id)} aria-current={view === n.id ? "page" : undefined}>
                <n.icon /><span>{n.label}</span>
              </button>
            ))}
          </nav>
          <button type="button" className="cp-nav-item cp-logout" onClick={() => navigate({ to: "/" })}><LogOut /><span>Logout</span></button>
        </aside>
        <div className="cp-main">
          <header className="cp-top">
            <button type="button" className="cp-menu" onClick={() => setMenu(true)} aria-label="Open menu"><Menu /></button>
            <h1>{current.label}</h1>
            <label className="cp-search"><Search /><input placeholder="Search hospitals, records…" aria-label="Search" /><kbd>⌘K</kbd></label>
            <div className="cp-user"><span className="cp-avatar sm"><User /></span><span>citizen@test.com</span></div>
          </header>
          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, y: reduced ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -8 }} transition={{ duration: 0.22 }}>
              {view === "dashboard" && <DashboardView go={go} />}
              {view === "hospitals" && <HospitalsView />}
              {view === "assistant" && <AssistantView />}
              {view === "records" && <RecordsView />}
              {view === "beds" && <BedsView />}
              {view === "alerts" && <AlertsView />}
              {view === "education" && <EducationView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </GalaxyShell>
  );
}
