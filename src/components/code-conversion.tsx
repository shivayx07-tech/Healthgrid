import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Copy,
  FileCode2,
  Globe,
  Loader2,
  ScanSearch,
  Search,
  Sparkles,
} from "lucide-react";

type Mapping = {
  query: string;
  namaste: string;
  icd11: string;
  icdTitle: string;
  confidence: number;
  note: string;
};

const CODE_DB: Mapping[] = [
  { query: "Sandhivata", namaste: "AYU-MD-012", icd11: "FA00", icdTitle: "Osteoarthritis", confidence: 87, note: "Ayurveda · Vata-vyadhi chapter" },
  { query: "Vishama Jwara", namaste: "AYU-MD-204", icd11: "1E32", icdTitle: "Malaria", confidence: 93, note: "Ayurveda · Jwara chapter" },
  { query: "Kamala", namaste: "AYU-MD-118", icd11: "DB93", icdTitle: "Jaundice", confidence: 91, note: "Ayurveda · Rakta-vaha srotas" },
  { query: "Amlapitta", namaste: "AYU-MD-047", icd11: "DA74", icdTitle: "Gastritis", confidence: 84, note: "Ayurveda · Urdhvaga pitta" },
];

const SCAN_STEPS = [
  "Tokenizing traditional term…",
  "Matching NAMASTE dictionary…",
  "Aligning ICD-11 biomedical axis…",
  "Scoring model confidence…",
];

function lookup(term: string): Mapping {
  const norm = term.trim().toLowerCase();
  if (!norm) return SANDHIVATA;
  const hit = CODE_DB.find(
    m => norm.includes(m.query.toLowerCase()) || m.query.toLowerCase().includes(norm),
  );
  if (hit) return hit;
  return {
    query: term.trim(),
    namaste: "PENDING",
    icd11: "—",
    icdTitle: "Awaiting clinician review",
    confidence: 21,
    note: "No confident match — added to manual review queue",
  };
}

const SANDHIVATA: Mapping = {
  query: "Sandhivata",
  namaste: "AYU-MD-012",
  icd11: "FA00",
  icdTitle: "Osteoarthritis",
  confidence: 87,
  note: "Ayurveda · Vata-vyadhi chapter",
};

function CopyButton({ value, copied, onCopy }: { value: string; copied: string | null; onCopy: (v: string) => void }) {
  const isCopied = copied === value;
  return (
    <button type="button" className="code-card-copy" onClick={() => onCopy(value)}>
      {isCopied ? <Check /> : <Copy />}
      {isCopied ? "Copied" : "Copy"}
    </button>
  );
}

function ConfidenceRing({ value, reduced }: { value: number; reduced: boolean }) {
  const [display, setDisplay] = useState(reduced ? value : 0);
  const radius = 56;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 1200;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduced]);

  return (
    <div className="code-ring" role="img" aria-label={`AI confidence ${value}%`}>
      <svg viewBox="0 0 132 132" aria-hidden="true">
        <defs>
          <linearGradient id="conf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--lilac)" />
            <stop offset="100%" stopColor="var(--cyan)" />
          </linearGradient>
        </defs>
        <circle
          cx="66" cy="66" r={radius} fill="none"
          stroke="color-mix(in oklab, var(--foreground) 8%, transparent)"
          strokeWidth="9"
        />
        <motion.circle
          cx="66" cy="66" r={radius} fill="none"
          stroke="url(#conf-grad)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: reduced ? circumference * (1 - value / 100) : circumference }}
          animate={{ strokeDashoffset: circumference * (1 - display / 100) }}
          transition={{ duration: 0.2, ease: "linear" }}
          style={{ filter: "drop-shadow(0 0 10px color-mix(in oklab, var(--cyan) 55%, transparent))" }}
        />
      </svg>
      <div className="code-ring-readout">
        <div>
          <strong>{display}%</strong>
          <span>confidence</span>
        </div>
      </div>
    </div>
  );
}

export function CodeConversion({ reduced }: { reduced: boolean }) {
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<"idle" | "scanning" | "done">("done");
  const [result, setResult] = useState<Mapping | null>(SANDHIVATA);
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => {
    timers.current.forEach(t => window.clearTimeout(t));
  }, []);

  const run = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    timers.current.forEach(t => window.clearTimeout(t));
    timers.current = [];
    setQuery(term);
    setPhase("scanning");
    setStep(0);
    setResult(null);
    SCAN_STEPS.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setStep(i), 380 * i));
    });
    timers.current.push(
      window.setTimeout(() => {
        setResult(lookup(clean));
        setPhase("done");
      }, 380 * SCAN_STEPS.length + 260),
    );
  };

  const copy = (value: string) => {
    navigator.clipboard?.writeText(value).catch(() => {});
    setCopied(value);
    window.setTimeout(() => setCopied(current => (current === value ? null : current)), 1500);
  };

  return (
    <div className="code-shell">
      <form
        onSubmit={event => {
          event.preventDefault();
          run(query);
        }}
      >
        <div className="code-search-frame">
          <Search aria-hidden="true" />
          <input
            className="code-input"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Enter traditional diagnosis (e.g., Vishama Jwara)"
            aria-label="Traditional diagnosis"
            spellCheck={false}
            autoComplete="off"
          />
          <button type="submit" className="code-search-btn" disabled={phase === "scanning"}>
            {phase === "scanning" ? <Loader2 className="spin" aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
            {phase === "scanning" ? "Translating" : "Translate"}
          </button>
        </div>
        <p className="code-hint">
          <Sparkles aria-hidden="true" />
          AI-assisted mapping · NAMASTE ↔ ICD-11 · demo dictionary of {CODE_DB.length} terms
        </p>
      </form>

      {phase === "scanning" && (
        <div className="code-status" role="status">
          <Loader2 className="spin" aria-hidden="true" />
          <div>
            <strong>Processing “{query.trim()}”</strong>
            <span>{SCAN_STEPS[step]}</span>
          </div>
          <div className="code-status-dots" aria-hidden="true">
            {SCAN_STEPS.map((_, i) => (
              <i key={i} className={i <= step ? "on" : ""} />
            ))}
          </div>
        </div>
      )}

      {phase === "done" && result && (
        <motion.div
          key={result.query + result.namaste}
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="code-results-wrap"
        >
          <div className="code-results">
            <article className="code-card code-cyan">
              <span className="code-card-label"><ScanSearch aria-hidden="true" />Input · Traditional</span>
              <span className="code-card-value">{result.query}</span>
              <span className="code-card-sub">{result.note}</span>
            </article>
            <article className="code-card code-lilac">
              <span className="code-card-label"><FileCode2 aria-hidden="true" />NAMASTE Code</span>
              <span className="code-card-value">{result.namaste}</span>
              <span className="code-card-sub">Standard terminology for Ayush systems</span>
              <CopyButton value={result.namaste} copied={copied} onCopy={copy} />
            </article>
            <article className="code-card code-cyan">
              <span className="code-card-label"><Globe aria-hidden="true" />ICD-11 Mapping</span>
              <span className="code-card-value">{result.icd11}</span>
              <span className="code-card-sub">{result.icdTitle} · WHO ICD-11, TM2 aligned</span>
              {result.icd11 !== "—" && <CopyButton value={`${result.icd11} — ${result.icdTitle}`} copied={copied} onCopy={copy} />}
            </article>
          </div>

          <div className="code-confidence">
            <ConfidenceRing key={result.confidence} value={result.confidence} reduced={!!reduced} />
            <div className="code-pipeline">
              <h3>Mapping pipeline</h3>
              <ol>
                <li><Check aria-hidden="true" />Traditional term tokenized<em>{result.query}</em></li>
                <li><Check aria-hidden="true" />NAMASTE dictionary matched<em>{result.namaste}</em></li>
                <li><Check aria-hidden="true" />ICD-11 biomedical axis aligned<em>{result.icd11}</em></li>
                <li><Check aria-hidden="true" />Model confidence scored<em>{result.confidence}%</em></li>
              </ol>
              <p className="code-pipeline-foot">HealthGrid NAMASTE-align v2 · mock inference for demo purposes</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="code-quick">
        <div className="code-quick-head">
          <h3>Quick Reference</h3>
          <span>Recent searches · tap to convert</span>
        </div>
        <div className="code-quick-grid">
          {CODE_DB.filter(m => m.query !== SANDHIVATA.query).map(entry => (
            <button key={entry.query} type="button" className="code-chip" onClick={() => run(entry.query)}>
              <span className="code-chip-term">{entry.query} <span aria-hidden="true">→</span> {entry.icdTitle}</span>
              <span className="code-chip-code">{entry.icd11} · {entry.icdTitle}</span>
              <span className="code-chip-bar"><i style={{ width: `${entry.confidence}%` }} /></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
