# Pitch angles

The one-line thesis the angles hang off:

> **Work is multiplayer. Computers are single-player.**

Each angle starts from something the judges have already felt and names the absurd part out loud.

## 1. "Screen share is read-only"

> The most-used collaboration tool in the world is screen share. And it's read-only.

Everyone knows the call: "no, click there… no, the other one… here, let me drive." One person has the mouse and everyone else backseat-drives. **Tomo is screen share where everyone has a mouse, and the screen is still there after you hang up.**

**Use:** the opener. It needs no explanation, and the two-laptop demo proves it on the spot.

## 2. "It works on my machine"

> "It works on my machine" is a meme because everyone has a different machine. What if there was only one?

Every handoff is really "rebuild my machine on yours": send the zip, pull my branch, install the deps, which Python are you on. On tomo it's *our* machine, so "works on mine" and "works on yours" mean the same thing.

**Use:** Q&A with the technical judges, or the second beat if the room is engineering-heavy.

## 3. "We deleted the send button"

> Every attach, upload, push and "can you send me that" exists for one reason: we're on different computers.

Google Docs removed "send" for documents. Nobody removed it for everything else.

**Use:** the closing line.

## Suggested 3-minute flow

1. **Hook:** screen share is read-only (#1).
2. **Why now:** computers were single-user because they had one keyboard and one chair. Agents don't need a chair, so now a computer can have a crowd. The thesis line goes here.
3. **Demo:** two laptops. Drop a file, it appears on the other screen; the agent writes a file, both screens see it.
4. **Close:** "we deleted the send button" (#3) + tomo.computer.

## How the judges might react

| Judge | Background | Likely reaction | Prep |
| --- | --- | --- | --- |
| **Jim Giles** (CTO, Indeed) | Ran Google Workspace: Docs, Sheets, Drive | Will map #1 and #3 straight onto the Docs story ("Docs made the document shared; this shares the computer"). Most likely to buy the thesis. | "What breaks at scale?" One container per workspace today; reaping idle ones and VM-per-workspace are on the roadmap. |
| **Robert Hohman** (Glassdoor co-founder) | Consumer product, "focus, focus, focus" | #1 works for him because it's non-technical and one sentence. He'll push on focus. | "Who's the one user, and why do they come back tomorrow?" A small team running agents; they come back because the files live there now. Say what you're *not* building: not a chat app, not an IDE, not an agent framework. |
| **Damien Contreras** (Google Cloud, data/AI) | Cloud infra, agents and metadata | #2 lands. He'll look at whether the infra choices are sensible. | "Where do GCP/Gemini fit?" Answer honestly; don't overclaim. |
| **Ho Joon Cha** (OpenAI, applied AI architect) | Enterprise agent deployments | #2 lands. The agent-on-a-shared-desktop idea will interest him most. | "How does the agent act on the desktop, and how did you use Codex?" One honest sentence each. |

## Don'ts

- Say "Figma" at most once ("multiplayer, like Figma"). Any more and it sounds like "Figma clone with extras."
- Don't lead with the feature list (terminal + desktop + agent + files). Lead with the feeling; let the demo show the features.
