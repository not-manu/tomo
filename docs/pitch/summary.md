# tomo — project summary

> **One computer for your team and its agents.**
> https://tomo.computer · made by manu & chris · MIT

This doc is the handoff for whoever builds the **business half of the slides** (problem, impact, market, differentiation, roadmap). The product and tech are summarized below so you don't need to read the code. Existing pitch material lives next to this file: `angles.md` (story/hooks + judge prep), `problems.md` (case studies), `notes.md` (rough slide outline).

## Context

- Hackathon, theme: **"the future of work"**. ~3-minute pitch + live demo.
- Built from scratch starting 2026-09-25; ~126 commits, currently v0.5.19, deployed live on Google Cloud.
- Judges (see `angles.md` for how each will likely react):
  - **Jim Giles**, CTO Indeed (ex-Google Workspace: Docs/Sheets/Drive)
  - **Robert Hohman**, Glassdoor co-founder (consumer product, "focus")
  - **Damien Contreras**, Google Cloud (data/AI, infra)
  - **Ho Joon Cha**, OpenAI (applied AI architect, enterprise agents)

## The thesis

> **Work is multiplayer. Computers (and AI agents) are single-player.**

- Word → Google Docs made the *document* shared. Illustrator → Figma made the *canvas* shared. **tomo makes the whole computer shared** — for humans *and* agents.
- Computers were single-user because they had one keyboard and one chair. Agents don't need a chair, so a computer can now have a crowd.
- Today's workaround is screen share, which is **read-only**: one person drives, everyone else backseat-drives, and it's gone when you hang up.

## What tomo is

A **persistent, multiplayer cloud desktop** per team ("workspace"), in the browser. Everyone on the team — plus AI agents — works on the same machine at the same time, and it's still there after everyone logs off.

## What's built and working today

| Area | What exists |
| --- | --- |
| **Accounts & teams** | Email login (OTP), create workspaces, invite teammates (invite inbox), members, workspace settings |
| **Workspace lobby** | Workspace list, live presence icons (who's online), resource usage meters (CPU/memory/storage) |
| **Shared desktop** | Browser-based desktop with windows, tabs, a macOS-style dock (with animations), wallpapers, multiple desktops per workspace |
| **Apps on the desktop** | Terminal (real shell, shared live between users), Finder/file browser, code/text editor with **real-time co-editing**, file preview, notes |
| **Agent** | OpenAI **Codex** CLI runs inside the workspace's machine, so the agent works on the same files/terminal the humans see |
| **Real-time sync** | Everyone sees the same windows, files, and edits live (CRDT-based sync server) |
| **Isolated sandboxes** | Each workspace gets its own isolated Linux container (Python, Node, git, Playwright/headless browser preinstalled) |
| **Plans / limits** | A "Free" tier is defined: 1 CPU, 1 GB RAM, 5 GB storage, 4 desktops per workspace. Paid tiers are a TODO (no billing yet) |
| **Landing page** | tomo.computer, with a section skeleton for the pitch (see below) |

**Demo plan:** two laptops. Drop a file on one, it appears on the other; the agent writes a file, both screens see it; both people type in the same terminal/editor.

## How it works (one paragraph, for the tech slide)

Web app (React) talks to an API server (Node/Hono) over WebSockets. Each workspace is a Docker container (the "computer") with its own files and shell; the API streams terminal sessions to every connected user and syncs desktop state/documents with Yjs (CRDTs, the same tech class behind collaborative editors). Codex runs inside that container. Everything is deployed on a single Google Compute Engine VM (Terraform-managed, Caddy for HTTPS, SQLite for app data). Scaling path: reap idle containers, then VM-per-workspace.

## What makes it different

| Alternative | What it does | Where it breaks down |
| --- | --- | --- |
| Screen share (Zoom/Meet) | Shows one person's computer | Read-only, one driver, gone after the call |
| Google Docs / Figma | Multiplayer for one file type | Doesn't cover code, terminals, tools, "the rest of the computer" |
| Cursor cloud agents, Codex, etc. | Agent gets a cloud VM | Single-player: one human, no shared desktop |
| Multi-agent bots (e.g. "team of agents") | Agents collaborate with each other | Humans aren't in the room |
| Remote desktop / VDI | Remote access to a machine | One user at a time, IT-heavy, not built for agents |

**tomo = VM + shared desktop + humans and agents together, persistent.**

## Pitch structure (from the landing page skeleton)

The landing page (`packages/web/app/routes/home/page.tsx`) already has these sections — **the bold ones are the business parts that still need content:**

1. Problem & urgency — "AI is single-player. Work isn't." → **who, the moment it happens, cost (quantified), why current options fall short**
2. **Inspiration / key insight** — the deeper problem, "why now"
3. Solution overview — "One computer for your team and its agents." → **who it's for, what changes for them**
4. **Quantified impact** — headline number + **how it was calculated**
5. **What makes this different** — comparison table (draft above), why it's hard to copy
6. Technical design — architecture diagram (manu/chris)
7. Demo
8. **Future roadmap** — 3 milestones, each with a timeframe + measurable goal

## Open business questions (what we need from you)

- **Target user.** Current best guess: small teams (startups, eng/design teams) who already use AI agents. Who's the *one* user, and why do they come back tomorrow? (Draft answer: "because the files live there now.")
- **Market size.** Remote/hybrid collaboration + AI agent tooling. Needs real numbers and sources.
- **Quantified impact.** e.g. time lost to handoffs/"send me that"/env setup per week; onboarding ramp time (Gallup: only 12% of employees say onboarding is done well — see `problems.md`).
- **Business model.** Free tier exists in code; likely per-workspace or per-seat pricing with compute-based paid tiers. Needs a proposal.
- **Go-to-market.** How the first 100 teams find it.
- **Roadmap milestones.** Ideas so far: paid tiers, VM-per-workspace, more agents (Gemini/Google agent platform is a TODO), "every team has their own tomo."
- **Risks / "what breaks at scale?"** Compute cost per workspace, security of shared machines, agent permissions.

## Messaging rules (from `angles.md`)

- Lead with the feeling, not the feature list. Let the demo show features.
- Say "Figma" at most once.
- Don't claim tomo would have prevented the famous disasters in `problems.md`; say it's the everyday version of the same friction.
- Say what we're **not**: not a chat app, not an IDE, not an agent framework.
- Closing line: **"We deleted the send button."**
