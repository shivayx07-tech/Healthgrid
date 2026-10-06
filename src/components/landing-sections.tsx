import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform, animate } from "framer-motion";
import { Binary, BedDouble, MessageCircleHeart, FolderLock, Stethoscope, Route as RouteIcon, BrainCircuit, ArrowRight } from "lucide-react";

const reveal = (i: number, reduced: boolean | null) => ({
  initial: { opacity: 0, y: reduced ? 0 : 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
});

const TERMS = [
  ["Sandhivata", "FA00"],
  ["Kamala", "ME10.1"],
  ["Vishama Jwara", "1F4Z"],
];

function CodeMorph() {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI(v => (v + 1) % TERMS.length), 2400); return () => clearInterval(t); }, []);
  const [term, code] = TERMS[i] ?? ["Sandhivata", "FA00"];
  return <div className="bento-morph" aria-hidden="true">
    <motion.span key={term} className="morph-term" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>{term}</motion.span>
    <span className="morph-arrow"><i /><ArrowRight /></span>
    <motion.span key={code} className="morph-code" initial={{ opacity: 0, scale: .8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: .5 }}>ICD-11 · {code}</motion.span>
  </div>;
}

export function FeaturesBento() {
  const reduced = useReducedMotion();
  const cards = [
    { cls: "bento-lg", icon: Binary, title: "Dual AI Coding Engine", text: "Traditional AYUSH diagnoses mapped to NAMASTE and ICD-11 codes in a single pass.", art: <CodeMorph /> },
    { cls: "bento-md", icon: BedDouble, title: "Real-Time Bed Tracking", text: "Live ICU, general and emergency capacity across the network.", art: <div className="bento-live"><span className="live-pulse" /> 65 beds open now</div> },
    { cls: "bento-md", icon: MessageCircleHeart, title: "AI Health Concierge", text: "Symptom guidance and personal meal plans, any time of day.", art: <div className="bento-chat"><MessageCircleHeart /></div> },
    { cls: "bento-lg", icon: FolderLock, title: "Universal Portable Records", text: "Your ABHA-linked history travels with you — encrypted, consented, always yours.", art: <div className="bento-folder"><motion.div className="folder-lid" animate={reduced ? {} : { rotateX: [0, -28, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }} /><div className="folder-body"><FolderLock /></div></div> },
  ];
  return <section className="landing-section">
    <motion.div className="landing-head" {...reveal(0, reduced)}><span className="eyebrow">Platform</span><h2>Powering Modern Healthcare</h2><p>Four intelligent layers, one connected hospital.</p></motion.div>
    <div className="bento-grid">{cards.map((c, i) => <motion.article key={c.title} className={`bento-card ${c.cls}`} {...reveal(i, reduced)} whileHover={{ y: reduced ? 0 : -6 }}>
      <div className="bento-icon"><c.icon /></div><h3>{c.title}</h3><p>{c.text}</p>{c.art}
    </motion.article>)}</div>
  </section>;
}

export function JourneyTimeline() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  const { scrollYProgress: bg } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y1 = useTransform(bg, [0, 1], reduced ? [0, 0] : [120, -160]);
  const y2 = useTransform(bg, [0, 1], reduced ? [0, 0] : [-80, 140]);
  const steps = [
    { icon: BrainCircuit, title: "Symptom Analysis", text: "The patient describes how they feel and receives instant AI guidance." },
    { icon: RouteIcon, title: "Smart Routing & Bed Reservation", text: "The nearest suitable hospital is notified in real time and a bed is held." },
    { icon: Stethoscope, title: "Unified Treatment", text: "Doctors open translated, coded records instantly — no paperwork lag." },
  ];
  return <section className="landing-section journey" ref={ref}>
    <motion.div className="journey-orb orb-a" style={{ y: y1 }} aria-hidden="true" />
    <motion.div className="journey-orb orb-b" style={{ y: y2 }} aria-hidden="true" />
    <motion.div className="landing-head" {...reveal(0, reduced)}><span className="eyebrow">How it works</span><h2>The Connected Care Journey</h2></motion.div>
    <div className="timeline">
      <div className="timeline-track"><motion.div className="timeline-fill" style={{ scaleY: fill }} /></div>
      {steps.map((s, i) => <motion.div key={s.title} className="timeline-step" initial={{ opacity: 0, x: reduced ? 0 : 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: .6 }} transition={{ duration: .7 }}>
        <div className="timeline-node"><s.icon /></div>
        <div className="timeline-body"><span>Step {i + 1}</span><h3>{s.title}</h3><p>{s.text}</p></div>
      </motion.div>)}
    </div>
  </section>;
}

function Counter({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: .6 });
  const [v, setV] = useState(0);
  useEffect(() => { if (!inView) return; const c = animate(0, to, { duration: 1.6, ease: "easeOut", onUpdate: n => setV(Math.round(n)) }); return () => c.stop(); }, [inView, to]);
  return <span ref={ref}>{prefix}{v}{suffix}</span>;
}

export function ImpactMetrics() {
  const reduced = useReducedMotion();
  const items = [
    { node: <Counter to={100} suffix="%" />, label: "Real-Time Integration" },
    { node: <Counter to={22} suffix="+" />, label: "Languages Supported" },
    { node: <Counter to={1} prefix="< " suffix="s" />, label: "Translation Time" },
  ];
  return <section className="landing-section">
    <motion.div className="landing-head" {...reveal(0, reduced)}><span className="eyebrow">Impact</span><h2>Built for scale, tuned for speed</h2></motion.div>
    <div className="metrics-grid">{items.map((m, i) => <motion.div key={m.label} className="metric-tile" {...reveal(i, reduced)}><div className="metric-number">{m.node}</div><div className="metric-label">{m.label}</div></motion.div>)}</div>
  </section>;
}
