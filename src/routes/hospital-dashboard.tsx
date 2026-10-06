import { createFileRoute } from "@tanstack/react-router";
import { HospitalWorkspace } from "@/components/hospital-workspace";

export const Route = createFileRoute("/hospital-dashboard")({
  head: () => ({ meta: [
    { title: "Hospital Staff Portal — Kanpur Metro Hospital" },
    { name: "description", content: "The Kanpur Metro Hospital HealthGrid staff demo workspace for patient care and clinical workflows." },
    { property: "og:title", content: "Hospital Staff Portal — Kanpur Metro Hospital" },
    { property: "og:description", content: "Connected care for hospital teams through HealthGrid." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
    { name: "robots", content: "noindex" },
  ] }),
  component: () => <HospitalWorkspace />,
});