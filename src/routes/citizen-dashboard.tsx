import { createFileRoute } from "@tanstack/react-router";
import { CitizenWorkspace } from "@/components/citizen-workspace";

export const Route = createFileRoute("/citizen-dashboard")({
  head: () => ({ meta: [
    { title: "Citizen Portal — Kanpur Metro Hospital" },
    { name: "description", content: "Your Kanpur Metro Hospital HealthGrid citizen demo workspace for appointments, health records, and connected care." },
    { property: "og:title", content: "Citizen Portal — Kanpur Metro Hospital" },
    { property: "og:description", content: "Your health, connected through HealthGrid." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
    { name: "robots", content: "noindex" },
  ] }),
  component: CitizenWorkspace,
});