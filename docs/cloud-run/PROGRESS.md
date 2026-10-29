# Progress

## Handover (update before stopping)
**State at 29 Oct 2026, 09:00 UTC:** `packages/core` is built and tested (validators, address check, chat check, risk code, frozen-list build script and a real frozen list). Design mockups are in `docs/design/canvases`. Nothing else is built: no Expo app, no QVAC integration, no offline-proof script, no README.
**Next step:** Workstream B, scaffold `apps/mobile` (Expo + TypeScript + Expo Router) with the four screens from DESIGN-SYSTEM.md on the core package using a mock `ModelProvider`.

## Decisions for the owner
- [ ] Frozen list cross-check: 1,809 Tron addresses are frozen on chain but not marked banned in the 7 Sep archive. Probably newer freezes; confirm or accept the chain as the source of truth (current choice).
- [ ] Phone: confirm model and Android version; test the QVAC Expo plugin on it (owner-only). Until then everything runs on the mock provider.
- [ ] Allow `docs.qvac.tether.io` in this cloud environment's network settings (blocked on 29 Oct). The QVAC adapter must be checked against those docs before it is written; until then the app runs on the mock provider.
- [ ] Expo SDK 54 was chosen because `@qvac/sdk` 0.x peers on `expo-file-system >=19` (SDK 54+). Confirm against the QVAC Expo docs when testing on the phone.
- [ ] Ask the organisers (Victor, DoraHacks page / Discord) whether the one-time model download counts as offline.
- [ ] Repo visibility: private for now. Make it public before submission (the hackathon needs it).

## Workstreams
### A. Core (packages/core)
- [x] Tron base58check + EVM EIP-55 validators, wrong-network
- [x] Frozen list check, look-alike vs contacts, saved contact
- [x] Chat rules (English + Swahili), address extraction, risk code (model can't lower, can't Stop)
- [x] Frozen-list build script + provenance (8,089 Tron, 1,650 EVM)
- [ ] Receipt reuse: SHA-256, perceptual hash, ledger (pure TS, tested)
- [ ] "First time sending to this address" warning (needs history)
- [ ] Swahili/English phrase rules: widen and add tests; dev/test split of a small labelled chat set; report recall and false positives from the test split only
- [ ] Evidence pack builder (ZIP: items, OCR text, tags, verdict, list date, hashes)
### B. App (apps/mobile, Expo)
- [x] Scaffold, theme tokens (dark + light, toggle), fonts, Hugeicons (Expo SDK 54, Expo Router, `apps/mobile`)
- [x] Screens: Check, Checking, Stop, Check more, No flags found, Can't tell (+ Paste chat, Settings with session contacts)
- [ ] Contacts + recent checks + receipt ledger in expo-sqlite
- [ ] Share target / paste intake, QR scan
- [ ] First-run model download screen (states the only network use)
- [ ] Settings: theme, wipe data
### C. QVAC (verify against docs.qvac.tether.io first)
- [x] `ModelProvider` interface + mock provider + tests (`packages/core/src/provider.ts`; tags must quote the chat verbatim or are dropped)
- [ ] OCR adapter, one small LLM tagger adapter (schema-forced JSON tags with quoted spans)
- [ ] List exactly what the owner must test on the phone
### D. Offline proof + submission
- [ ] `scripts/offline-proof.ts`: runs address, chat, receipt checks end to end, logs every outbound connection attempt, expects zero
- [ ] README: setup, dependencies, what was built during the event, QVAC SDK versions/models/files, device/OS, memory, licences (CC-BY credit), network-only features, honest limits, measured numbers only
- [ ] Demo video script (airplane mode visible, offline-proof result on screen)
- [ ] Submission checklist matches DoraHacks requirements

## Log
- 2026-10-29 09:40 UTC: ModelProvider + mock in core; Expo app shell with all four result screens, Checking with measured step timings, chat paste, settings. Web build checked in Playwright, dark and light: all flows render and the page made 0 requests to other hosts. 36 tests pass. (cloud run)
- 2026-10-29: core package, frozen-list script and list, design canvases, PRD committed. (manual session)
