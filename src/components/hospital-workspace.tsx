import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Activity, AlertTriangle, BedDouble, Code2, HeartPulse, LayoutDashboard, LogOut, MapPin, Menu, Minus, Pill, Plus,
  Search, ShieldAlert, Stethoscope, TrendingDown, TrendingUp, User, Users, X,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { GalaxyShell } from "@/components/galaxy-shell";
import { CodeConversion } from "@/components/code-conversion";

type View = "overview" | "patients" | "beds" | "analytics" | "inventory" | "code";
type Icon = ComponentType<{ className?: string }>;

const NAV: { id: View; label: string; title: string; icon: Icon }[] = [
  { id: "overview", label: "Dashboard", title: "City Hospital - Overview", icon: LayoutDashboard },
  { id: "patients", label: "Patient Records", title: "Patient Records", icon: Users },
  { id: "beds", label: "Bed Management", title: "Bed Management", icon: BedDouble },
  { id: "analytics", label: "Disease Analytics", title: "Disease Outbreak Analytics", icon: Activity },
  { id: "inventory", label: "Drug Inventory", title: "Drug Inventory", icon: Pill },
  { id: "code", label: "Medicinal Code Conversion", title: "Medicinal Code Conversion", icon: Code2 },
];

function Card({ children, className = "", onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const reduced = useReducedMotion();
  const hover = reduced ? {} : { scale: 1.02, y: -2 };
  const t = { type: "spring" as const, stiffness: 300, damping: 22 };
  if (onClick) return <motion.button type="button" onClick={onClick} className={`cp-card ${className}`} whileHover={hover} transition={t}>{children}</motion.button>;
  return <motion.div className={`cp-card ${className}`} whileHover={hover} transition={t}>{children}</motion.div>;
}

type TipItem = { name?: string | number; value?: number | string; color?: string };
function GlassTip({ active, payload, label, unit = "" }: { active?: boolean; payload?: TipItem[]; label?: string | number; unit?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="hs-tip">
      <strong>{label}</strong>
      {payload.map(p => <span key={String(p.name)}><i style={{ background: p.color }} />{p.name}<b>{p.value}{unit}</b></span>)}
    </div>
  );
}

const axis = { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false } as const;

/* ---------- Overview ---------- */
const TODAY_BEDS = [
  { ward: "ICU", Occupied: 12, Vacant: 12 }, { ward: "General", Occupied: 75, Vacant: 45 },
  { ward: "Emergency", Occupied: 10, Vacant: 8 }, { ward: "Maternity", Occupied: 18, Vacant: 6 }, { ward: "Paediatric", Occupied: 14, Vacant: 9 },
];
const ACTIVE_ALERTS = [
  { title: "Dengue Outbreak Alert", sub: "Civil Lines · +23% cases this week", sev: "high" },
  { title: "Malaria cases rising", sub: "Kalyanpur · 9 positive of 40 tests", sev: "high" },
  { title: "Emergency capacity at 62%", sub: "Trauma wing · monitor intake", sev: "medium" },
  { title: "Critical stock: Ceftriaxone", sub: "Pharmacy · reorder raised", sev: "medium" },
] as const;

function OverviewView({ go, mounted }: { go: (v: View) => void; mounted: boolean }) {
  const metrics = [
    { label: "Patients Today", value: "127", icon: Users, tone: "cyan" },
    { label: "Available Beds", value: "23", icon: BedDouble, tone: "lilac" },
    { label: "Emergency Capacity", value: "62%", icon: AlertTriangle, tone: "orange" },
    { label: "Disease Alerts", value: "4", icon: ShieldAlert, tone: "rose" },
  ];
  return (
    <div className="cp-stack">
      <div className="cp-metrics">
        {metrics.map(m => <Card key={m.label} className={`cp-metric tone-${m.tone}`}><m.icon className="cp-metric-icon" /><span>{m.label}</span><strong>{m.value}</strong></Card>)}
      </div>
      <section>
        <h3 className="cp-h3">Quick Access</h3>
        <div className="hs-quick">
          {NAV.filter(n => n.id !== "overview" && n.id !== "code").map(n => (
            <Card key={n.id} onClick={() => go(n.id)} className="cp-quick-card"><n.icon className="cp-quick-icon" /><strong>{n.label}</strong><span className="cp-muted">Open module →</span></Card>
          ))}
        </div>
      </section>
      <div className="cp-two">
        <section className="cp-card cp-panel">
          <h3 className="cp-h3">Bed Occupancy Today</h3>
          <div className="hs-chart sm">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={TODAY_BEDS} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ovOcc" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--cyan)" /><stop offset="100%" stopColor="var(--cyan)" stopOpacity={0.2} /></linearGradient>
                    <linearGradient id="ovVac" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--lilac)" /><stop offset="100%" stopColor="var(--lilac)" stopOpacity={0.2} /></linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="ward" {...axis} /><YAxis {...axis} />
                  <Tooltip cursor={{ fill: "color-mix(in oklab, var(--cyan) 8%, transparent)" }} content={<GlassTip />} />
                  <Bar dataKey="Occupied" stackId="a" fill="url(#ovOcc)" />
                  <Bar dataKey="Vacant" stackId="a" fill="url(#ovVac)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
        <section className="cp-card cp-panel">
          <h3 className="cp-h3">Active Alerts</h3>
          <ul className="cp-list">
            {ACTIVE_ALERTS.map(a => (
              <li key={a.title} className={`hs-alert hs-${a.sev}`}>
                <div><strong><AlertTriangle className="warn" />{a.title}</strong><span>{a.sub}</span></div>
                <span className={`cp-sev sev-${a.sev}`}>{a.sev.toUpperCase()}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

/* ---------- Patients ---------- */
const PATIENTS = [
  { id: "P001", name: "Rahul Sharma", age: 34, dx: "Vishama Jwara (Malaria)", doc: "Dr. Neha Srivastava", tx: "Artemether + Guduchi", date: "06 Oct 2026" },
  { id: "P002", name: "Priya Verma", age: 52, dx: "Prameha (Type 2 Diabetes)", doc: "Dr. Arvind Mishra", tx: "Metformin + diet plan", date: "06 Oct 2026" },
  { id: "P003", name: "Mohd. Imran", age: 61, dx: "Sandhivata (Osteoarthritis)", doc: "Dr. Kavita Rao", tx: "Physiotherapy + Shallaki", date: "05 Oct 2026" },
  { id: "P004", name: "Sunita Yadav", age: 28, dx: "Kamala (Jaundice)", doc: "Dr. Neha Srivastava", tx: "Hepatoprotective care", date: "05 Oct 2026" },
  { id: "P005", name: "Amit Tiwari", age: 45, dx: "Amlapitta (Acid reflux)", doc: "Dr. Rajesh Gupta", tx: "Pantoprazole + Avipattikar", date: "04 Oct 2026" },
  { id: "P006", name: "Kiran Bajpai", age: 9, dx: "Kasa (Bronchitis)", doc: "Dr. Kavita Rao", tx: "Nebulisation + Sitopaladi", date: "04 Oct 2026" },
  { id: "P007", name: "Deepak Saxena", age: 38, dx: "Dengue fever", doc: "Dr. Arvind Mishra", tx: "IV fluids + monitoring", date: "03 Oct 2026" },
  { id: "P008", name: "Anjali Dubey", age: 31, dx: "Tamaka Shwasa (Asthma)", doc: "Dr. Rajesh Gupta", tx: "Salbutamol inhaler", date: "02 Oct 2026" },
  { id: "P009", name: "Ravi Pandey", age: 67, dx: "Hridroga (Heart disease)", doc: "Dr. Kavita Rao", tx: "Statins + Arjunarishta", date: "01 Oct 2026" },
];

function PatientsView() {
  const [q, setQ] = useState("");
  const rows = useMemo(() => PATIENTS.filter(p => `${p.id} ${p.name}`.toLowerCase().includes(q.toLowerCase())), [q]);
  return (
    <div className="cp-stack">
      <label className="inv-search hs-wide"><Search /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name or ID..." aria-label="Search patients" /></label>
      <div className="inv-table-wrap">
        <table className="inv-table">
          <thead><tr><th>ID</th><th>Name</th><th className="num">Age</th><th>Diagnosis</th><th>Doctor</th><th>Treatment</th><th>Date</th></tr></thead>
          <tbody>
            {rows.map(p => (
              <tr key={p.id}><td className="mono txt-cyan">{p.id}</td><td>{p.name}</td><td className="num">{p.age}</td><td>{p.dx}</td><td>{p.doc}</td><td>{p.tx}</td><td className="mono">{p.date}</td></tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7} className="inv-empty">No patients match.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Beds ---------- */
const BED_START = [
  { id: "icu", label: "ICU Beds", value: 12, tone: "cyan", icon: Stethoscope },
  { id: "general", label: "General Beds", value: 45, tone: "lilac", icon: BedDouble },
  { id: "emergency", label: "Emergency Beds", value: 8, tone: "orange", icon: Activity },
] as const;

const TREND = ["6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM"].map((t, i) => ({
  t,
  ICU: Math.round(58 + 22 * Math.sin(i / 3) + i * 0.8),
  General: Math.round(55 + 14 * Math.sin(i / 4 + 1) + i),
  Emergency: Math.round(40 + 25 * Math.sin(i / 2.5 + 2) + i * 1.2),
}));

function BedsView({ mounted }: { mounted: boolean }) {
  const [counts, setCounts] = useState<Record<string, number>>(() => Object.fromEntries(BED_START.map(b => [b.id, b.value])));
  const bump = (id: string, d: number) => setCounts(c => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + d) }));
  const glow = (v: string) => ({ filter: `drop-shadow(0 0 6px color-mix(in oklab, ${v} 70%, transparent))` });
  return (
    <div className="cp-stack">
      <div className="hs-three">
        {BED_START.map(b => (
          <Card key={b.id} className={`cp-metric tone-${b.tone}`}>
            <b.icon className="cp-metric-icon" /><span>{b.label}</span>
            <div className="hs-counter">
              <button type="button" onClick={() => bump(b.id, -1)} aria-label={`Decrease ${b.label}`}><Minus /></button>
              <motion.strong key={counts[b.id]} initial={{ scale: 1.15, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }}>{counts[b.id]}</motion.strong>
              <button type="button" onClick={() => bump(b.id, 1)} aria-label={`Increase ${b.label}`}><Plus /></button>
            </div>
            <span>vacant</span>
          </Card>
        ))}
      </div>
      <section className="cp-card cp-panel">
        <h3 className="cp-h3">Bed Occupancy Trend <span className="cp-muted">· 6 AM – 9 PM</span></h3>
        <div className="hs-chart">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND} margin={{ top: 10, right: 12, left: -14, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="t" {...axis} minTickGap={20} /><YAxis {...axis} unit="%" domain={[0, 100]} />
                <Tooltip content={<GlassTip unit="%" />} />
                <Line type="monotone" dataKey="ICU" stroke="var(--cyan)" strokeWidth={2.6} dot={false} style={glow("var(--cyan)")} />
                <Line type="monotone" dataKey="General" stroke="var(--lilac)" strokeWidth={2.6} dot={false} style={glow("var(--lilac)")} />
                <Line type="monotone" dataKey="Emergency" stroke="var(--warning)" strokeWidth={2.6} dot={false} style={glow("var(--warning)")} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </div>
  );
}

/* ---------- Analytics ---------- */
const DISEASE = [
  { month: "May", Malaria: 21, Dengue: 12, Influenza: 52 }, { month: "Jun", Malaria: 26, Dengue: 18, Influenza: 47 },
  { month: "Jul", Malaria: 33, Dengue: 27, Influenza: 44 }, { month: "Aug", Malaria: 39, Dengue: 31, Influenza: 49 },
  { month: "Sep", Malaria: 37, Dengue: 37, Influenza: 46 }, { month: "Oct", Malaria: 42, Dengue: 45, Influenza: 38 },
];

function AnalyticsView({ mounted }: { mounted: boolean }) {
  const cards = [
    { name: "Malaria", value: 42, change: 14, tone: "cyan" }, { name: "Dengue", value: 45, change: 23, tone: "lilac" }, { name: "Influenza", value: 38, change: -17, tone: "orange" },
  ];
  const series = [["Malaria", "var(--cyan)"], ["Dengue", "var(--lilac)"], ["Influenza", "var(--warning)"]] as const;
  return (
    <div className="cp-stack">
      <div className="hs-three">
        {cards.map(c => (
          <Card key={c.name} className={`cp-metric tone-${c.tone}`}>
            <span>{c.name} · cases this week</span><strong>{c.value}</strong>
            <em className={`hs-change ${c.change > 0 ? "up" : "down"}`}>{c.change > 0 ? <TrendingUp /> : <TrendingDown />}{c.change > 0 ? "+" : ""}{c.change}%</em>
          </Card>
        ))}
      </div>
      <section className="cp-card cp-panel">
        <h3 className="cp-h3">Disease Trend (6 Months)</h3>
        <div className="hs-chart">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DISEASE} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
                <defs>
                  {series.map(([k, c]) => (
                    <linearGradient key={k} id={`ar-${k}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c} stopOpacity={0.45} /><stop offset="100%" stopColor={c} stopOpacity={0} /></linearGradient>
                  ))}
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="month" {...axis} /><YAxis {...axis} />
                <Tooltip content={<GlassTip />} />
                {series.map(([k, c]) => (
                  <Area key={k} type="monotone" dataKey={k} stroke={c} strokeWidth={2.4} fill={`url(#ar-${k})`} style={{ filter: `drop-shadow(0 0 6px ${c})` }} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
      <section className="cp-card cp-panel">
        <h3 className="cp-h3">Geographic Heatmap</h3>
        <div className="hs-heat" role="img" aria-label="Illustrative heatmap: hotspot at Civil Lines">
          <span className="hs-blob b1" /><span className="hs-blob b2" /><span className="hs-blob b3" />
          <div className="hs-pin"><MapPin /><em>Civil Lines · Dengue hotspot</em></div>
          <small>Illustrative map · Kanpur wards</small>
        </div>
      </section>
    </div>
  );
}

/* ---------- Inventory ---------- */
const STOCK = [
  { name: "Paracetamol 500mg", stock: 4820, unit: "Tablets", status: "Adequate" },
  { name: "Guduchi Extract", stock: 36, unit: "Bottles", status: "Low" },
  { name: "Amoxicillin 250mg", stock: 1260, unit: "Capsules", status: "Adequate" },
  { name: "Ceftriaxone 1g", stock: 9, unit: "Injections", status: "Critical" },
  { name: "Ashwagandha Churna", stock: 410, unit: "Packs", status: "Adequate" },
  { name: "Insulin Glargine", stock: 22, unit: "Vials", status: "Low" },
  { name: "Triphala Tablets", stock: 980, unit: "Tablets", status: "Adequate" },
  { name: "Salbutamol Inhaler", stock: 6, unit: "Inhalers", status: "Critical" },
] as const;

function InventoryView() {
  return (
    <div className="cp-stack">
      <div className="hs-three">
        <Card className="cp-metric tone-cyan"><Pill className="cp-metric-icon" /><span>Total Items</span><strong>{STOCK.length}</strong></Card>
        <Card className="cp-metric tone-orange"><AlertTriangle className="cp-metric-icon" /><span>Low Stock</span><strong>{STOCK.filter(s => s.status === "Low").length}</strong></Card>
        <Card className="cp-metric tone-rose"><ShieldAlert className="cp-metric-icon" /><span>Critical</span><strong className="hs-glow-red">{STOCK.filter(s => s.status === "Critical").length}</strong></Card>
      </div>
      <div className="inv-table-wrap">
        <table className="inv-table">
          <thead><tr><th>Medicine</th><th className="num">Stock</th><th>Unit</th><th>Status</th><th>Alert</th></tr></thead>
          <tbody>
            {STOCK.map(s => (
              <tr key={s.name}>
                <td>{s.name}</td><td className="num mono">{s.stock.toLocaleString("en-IN")}</td><td>{s.unit}</td>
                <td><span className={`inv-badge ${s.status === "Adequate" ? "ok" : s.status === "Low" ? "warn" : "bad"}`}><i />{s.status}</span></td>
                <td>{s.status !== "Adequate" ? <AlertTriangle className={`hs-tri ${s.status === "Critical" ? "crit" : ""}`} aria-label={`${s.status} stock`} /> : <span className="cp-muted">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Shell ---------- */
export function HospitalWorkspace() {
  const [view, setView] = useState<View>("overview");
  const [menu, setMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const current = NAV.find(n => n.id === view)!;
  const go = (v: View) => { setView(v); setMenu(false); };
  useEffect(() => setMounted(true), []);

  return (
    <GalaxyShell>
      <div className="demo-banner">Demo workspace · No real patient data or authenticated session</div>
      <div className="cp-layout">
        <aside className={`cp-side${menu ? " is-open" : ""}`}>
          <div className="cp-logo"><HeartPulse /><span>HealthGrid</span><button type="button" className="cp-close" onClick={() => setMenu(false)} aria-label="Close menu"><X /></button></div>
          <nav className="cp-nav" aria-label="Hospital sections">
            {NAV.map(n => (
              <motion.button key={n.id} type="button" whileHover={reduced ? {} : { x: 3 }} className={`cp-nav-item${view === n.id ? " is-active" : ""}`} onClick={() => go(n.id)} aria-current={view === n.id ? "page" : undefined}>
                <n.icon /><span>{n.label}</span>
              </motion.button>
            ))}
          </nav>
          <button type="button" className="cp-nav-item cp-logout" onClick={() => navigate({ to: "/" })}><LogOut /><span>Logout</span></button>
        </aside>
        <div className="cp-main">
          <header className="cp-top">
            <button type="button" className="cp-menu" onClick={() => setMenu(true)} aria-label="Open menu"><Menu /></button>
            <AnimatePresence mode="wait">
              <motion.h1 key={view} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>{current.title}</motion.h1>
            </AnimatePresence>
            <div className="cp-user hs-user"><span className="cp-avatar sm"><User /></span><span>City Hospital Admin</span></div>
          </header>
          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, y: reduced ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : -8 }} transition={{ duration: 0.22 }}>
              {view === "overview" && <OverviewView go={go} mounted={mounted} />}
              {view === "patients" && <PatientsView />}
              {view === "beds" && <BedsView mounted={mounted} />}
              {view === "analytics" && <AnalyticsView mounted={mounted} />}
              {view === "inventory" && <InventoryView />}
              {view === "code" && <CodeConversion reduced={!!reduced} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </GalaxyShell>
  );
}
