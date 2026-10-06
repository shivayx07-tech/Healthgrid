import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, ClipboardList, HeartPulse, ArrowLeft, Users, Stethoscope, Sparkles } from "lucide-react";
import { GalaxyShell } from "@/components/galaxy-shell";
import { Button } from "@/components/ui/button";

export function MockDashboard({ role }: { role: "citizen" | "hospital" }) {
  const patient = role === "citizen";
  const reduced = useReducedMotion();
  const items = patient ? [
    { icon: CalendarDays, title: "Your appointments", description: "No upcoming appointments in this demo account." },
    { icon: ClipboardList, title: "Health records", description: "Your health records will appear here when your hospital account is connected." },
    { icon: HeartPulse, title: "Your care journey", description: "A connected view of your care, prescriptions, and follow-ups." },
  ] : [
    { icon: Users, title: "Patient overview", description: "No patients assigned to this demo account." },
    { icon: CalendarDays, title: "Today's appointments", description: "No scheduled appointments in this demo workspace." },
    { icon: Stethoscope, title: "Clinical workspace", description: "Patient records and clinical tools will appear when your hospital account is connected." },
  ];
  return <GalaxyShell><div className="demo-banner">Demo workspace · No real patient data or authenticated session</div><motion.main className="dashboard-main" initial={{ opacity: 0, y: reduced ? 0 : 15 }} animate={{ opacity: 1, y: 0 }}><div className="dashboard-top"><div><div className="eyebrow"><Sparkles />{patient ? "Citizen portal" : "Hospital portal"}</div><h1>{patient ? "Your health, connected." : "Care starts with connection."}</h1><p className="dashboard-intro">Welcome to your {patient ? "citizen" : "hospital staff"} workspace.</p></div><Button variant="outline" asChild><Link to="/"><ArrowLeft /> Exit demo</Link></Button></div><div className="dashboard-overview">{items.map(item => <section key={item.title} className="overview-item"><item.icon /><h2>{item.title}</h2><p>{item.description}</p></section>)}</div></motion.main></GalaxyShell>;
}