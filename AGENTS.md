<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Application architecture
- Keep TanStack Start and its file-based router; the fixed project runtime implements the requested React experience without introducing Next.js.
- Use a shared GalaxyShell for brand chrome and the browser-only particle canvas, keeping the same visual system across landing and demo destinations.
- Role sign-in is deliberately a client-only mock with no credential storage or real authorization; both dashboard routes are explicitly labeled demos.
- Define all visual tokens and reusable presentation classes in src/styles.css and use shared UI controls for interactions.
- Build charts with Recharts (v3) directly; do not reintroduce src/components/ui/chart.tsx, which is incompatible with Recharts v3.

- AI chat streams through /api/chat server route with AI Elements UI; chat history kept in browser localStorage (one conversation).
