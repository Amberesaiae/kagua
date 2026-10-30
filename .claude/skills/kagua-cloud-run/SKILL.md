---
name: kagua-cloud-run
description: Start/resume/handover loop for the autonomous Kagua cloud run (offline USDT scam check, AI Yako hackathon).
---

# Kagua cloud run

1. `git fetch origin && git checkout cloud/build && git pull origin cloud/build` (create `cloud/build` from `origin/main` if missing). Never push to main. Never open a PR.
2. Read `docs/cloud-run/MISSION.md`, `docs/cloud-run/DESIGN-SYSTEM.md`, `docs/cloud-run/LEARNINGS.md` and the handover at the top of `docs/cloud-run/PROGRESS.md`. Skim `docs/PRD.pdf` only if the spec is unclear.
3. Continue from the handover's next step, otherwise the first unchecked task (workstream order: B app shell, C QVAC adapters on mock, A remaining core, D offline proof + README).
4. Work in small batches. After each batch: `npm install` if deps changed, `npm test`, `npx tsc -p packages/core`. Fix failures before moving on. Never end with failing tests.
5. Commit small with clear messages, push `cloud/build`, tick PROGRESS.md, add a log line. Rebase on `origin/cloud/build` first if needed.
6. Check time: after Fri 30 Oct 08:00 UTC freeze features and work only on README, QVAC details, declarations, offline proof and the submission checklist until the 14:00 UTC deadline. This routine runs until the owner stops it: never stop for good. After the deadline keep polishing and continue the unchecked tasks without changing behaviour the README claims.
7. Before your context fills or before stopping: update the handover (exact next step), add learnings, commit, push. If everything left needs the owner, say so in the handover and stop.
8. When you finish something the owner should see, or you are blocked, send a push notification with a short summary.

Non-negotiables: code decides and the model only tags; never write the word "safe" in any result or screen; no secrets or real funds; honest, measured numbers only.
