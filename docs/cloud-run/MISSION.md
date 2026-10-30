# Kagua mission

Kagua is an offline scam check for USDT traders. Before a trader releases or sends USDT, it checks an address or a chat on the phone and shows one level: **Stop**, **Check more** or **No flags found**, with the reason and the exact text that triggered it. Nothing leaves the device.

Built for the AI Yako hackathon (QVAC, Tether, Node NBO). Submission deadline: **Fri 30 Oct 2026, 14:00 UTC** on DoraHacks (https://dorahacks.io/hackathon/ai-yako/detail). Track: Offline AI apps (700 USDt) and the overall prize. Full spec: `docs/PRD.pdf` (cut-down MVP, revised 29 Oct 04:00 UTC).

## Principles (never break)
1. **Code decides, the model tags.** Risk levels come from fixed, tested code. A model may add reasons and raise none -> check_more. It can never lower a level and never produce Stop. (`packages/core/src/chat.ts`, covered by tests.)
2. **Never say "safe".** No result, string or screen uses the word. "No flags found" is not a verdict. A frozen address is not proof of a scam; absence from the list proves nothing.
3. **No guessing.** If the app can't read or place something, it says "Can't tell".
4. **Offline.** After the one-time model download there are zero network calls. Keep `scripts/offline-proof` honest.
5. **Honest numbers.** The README reports only measured numbers. Unverified claims (Tether quotes, fraud statistics, "no other entry does this") stay out of the repo and the pitch.
6. **Privacy.** No analytics, no crash upload, no remote lookups. No secrets, keys or real wallet data in the repo. Test values only.

## Stack (decided)
- App: Expo (React Native) + TypeScript, Expo Router. Android 12+ arm64 physical phone for QVAC (no emulator). Expo web build is the desktop fallback.
- Core: `packages/core` plain TypeScript (validators, frozen list, look-alike, chat rules, risk code). No UI or model dependency. Vitest.
- UI: Geist + Geist Mono, Hugeicons (react-native), Reanimated + Skia for the lens/shimmer, expo-sqlite for contacts/ledger/recent checks.
- AI: `@qvac/sdk` for OCR and one small LLM tagger, behind a `ModelProvider` interface with a mock so everything runs without a phone. Verify SDK calls against https://docs.qvac.tether.io before use; do not invent API names.

## Scope
In: address check, chat check (paste + OCR), receipt reuse (SHA-256 + perceptual hash + ledger), evidence pack, offline-proof script, light/dark theme, README + submission pack.
Cut (future work, say so in the README): vision receipt extraction, provider formats, balance chain, Whisper, translation beyond Swahili, WDK step.

## Rules for the cloud run
- Work ONLY on branch `cloud/build`. Never push to `main`. Never open a pull request.
- Run `npm test` (from repo root) after every batch. Never end a run with failing tests or a failing typecheck (`npx tsc -p packages/core`).
- Never run the frozen-list build script in the cloud unless the network allows it; the committed `packages/core/data/frozen.json` is the source until the owner refreshes it.
- Never commit secrets, API keys, `.env`, or large model files. Models download on the phone at first run.
- Test values only. No real messages, accounts or funds.
- Owner-only decisions go under "Decisions for the owner" in `docs/cloud-run/PROGRESS.md`; carry on with other work.
- Phone testing (QVAC on the device) is owner-only. Build everything else so it runs on the mock provider, and list exactly what the owner must test.
- Commit small, push `cloud/build` after each finished task, tick PROGRESS.md and add a log line. If another run pushed, rebase on `origin/cloud/build` first.
- Timeline: feature freeze Fri 30 Oct 08:00 UTC; until the 14:00 UTC deadline only README, QVAC details, device/network declaration, offline-proof output and the submission checklist. **This routine runs until the owner stops it.** Never decide to stop for good. After the deadline keep improving (polish, tests, docs, accessibility, next unchecked tasks) without changing behaviour the README claims. If nothing can be done without the owner, update the handover briefly and end that run; the next one continues.
