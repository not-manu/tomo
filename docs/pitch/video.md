# Demo video (≤ 1:30)

Submission needs a demo link or a video ≤ 1.5 min that works without our login. The live site needs an account, so ship the video (unlisted YouTube, like Radian did) and put tomo.computer in the post as a bonus.

## Setup

- Two Chrome windows side by side at 1920×1080, each ~960 wide: **left = Manu**, **right = Christian** (separate profiles, both signed in).
- One fresh workspace "Bakery" (both members), wallpaper set, dock visible. Close stray windows.
- Do a full dry run of the Codex shot first so the npm cache is warm and the real take isn't waiting on installs.
- Record with `Cmd+Shift+5` (full screen, hide the cursor-less Chrome UI with `Cmd+Shift+F`), or OBS at 60fps.
- Record voice-over separately after the cut; speed agent/typing waits 3–4×.

## Shot list

| Time | Screen | Voice-over |
|---|---|---|
| 0:00–0:07 | Landing page demo animation, full screen | "The most-used collaboration tool in the world is screen share. And it's read-only." |
| 0:07–0:17 | Split: Manu opens Bakery; Christian clicks it from the list, his cursor appears on Manu's screen | "tomo is one computer your team shares — people and agents. Everyone gets a mouse." |
| 0:17–0:27 | Manu drags `menu.csv` from macOS into Finder → appears on Christian's side. Christian opens it in the editor, both type on the same line | "No upload, no 'can you send me that'. It's already here." |
| 0:27–0:50 (sped up) | Terminal: `codex "turn menu.csv into a landing page in site/, vite + react"`. Both screens watch it write files; Finder fills in live | "Agents work on the same machine, not a sandbox you can't see." |
| 0:50–1:02 | `npm run dev` → open Browser app at 5173. Christian edits the headline in the editor; the preview hot-reloads on both screens | "'Works on my machine' becomes works on *our* machine." |
| 1:02–1:10 | Copy the preview URL, open in an incognito window (or phone) — site loads | "Share the running app with anyone, one link." |
| 1:10–1:20 | Both hit back → lobby shows the desktop snapshot card. Reopen → everything exactly where it was | "And it's still there after you hang up." |
| 1:20–1:28 | Title card: logo, "We deleted the send button.", tomo.computer, GitHub URL, Aura 67 — Manu Anish & Christian Lee | "We deleted the send button. tomo." |

## Fallbacks

- Codex slow/flaky → pre-record that segment earlier, or have it write one file (`index.html`) instead of a Vite app.
- Preview proxy hiccup → skip the incognito shot; the in-desktop Browser shot carries it.
- Over time → cut the 1:02–1:10 shot first, then shorten the file drop.

## Post format (#announcements-all, before 11:00 PDT)

```
Team: Aura 67 — Manu Anish (<role>), Christian Lee (<role>)
GitHub: https://github.com/not-manu/tomo
Video: <unlisted YouTube>
Live: https://tomo.computer
Presentation: <attached PDF>
```
