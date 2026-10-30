# Progress

## Handover (update before stopping)
**State at 29 Oct 2026, 11:10 UTC:** core + Expo app built on `cloud/build`. Verified only in the cloud: 49 unit tests, typecheck (incl. against real `@qvac/sdk` 0.22.0 types), web build flows in headless Chromium (dark + light, 0 requests to other hosts), Android JS bundle compiles. **Nothing has run on a phone yet**: no native build, no model download, no on-device OCR/tagging, no offline test. The QVAC adapter was written from the npm package's type declarations and shipped examples because `docs.qvac.tether.io` is blocked here; it has not been checked against the docs site.
**Next step:** A. Receipt reuse (SHA-256 + perceptual hash + ledger, pure TS, tested), then D: `scripts/offline-proof.ts` and the README draft. Re-check the QVAC adapter against docs.qvac.tether.io if the network allows it.

### Owner phone test list (Android 12+ arm64, physical phone)
1. `cd apps/mobile && npx expo prebuild -p android && npx expo run:android` builds and launches (QVAC plugin bundles its worker; minSdk 29, arm64 only).
2. Settings > Set up on-phone models: download completes; note the real time and total MB.
3. Turn on airplane mode, force-close, reopen. Paste a chat with "haraka" / "WhatsApp": Check more with model tags. Note time per check and RAM.
4. Screenshot tile on a chat screenshot (test text only): text is read; result appears. Note OCR time.
5. While in airplane mode, confirm nothing fails for lack of network (cached model load must not need the internet).
6. Scan QR of a test address (`tron:` and plain): fills address + network. Check it works in airplane mode.
7. Contacts and recent checks survive an app restart; Wipe clears them.
8. Stop screen vibrates; TalkBack reads addresses in groups of four.

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
- [x] Contacts + recent checks + theme in expo-sqlite (localStorage on the web build; chat text is never stored)
- [ ] Receipt ledger in expo-sqlite (after A: receipt reuse)
- [x] Paste intake (address + chat) and QR scan (`parseQr` in core: bare, `tron:`, EIP-681 incl. token transfer recipient; expo-camera screen, phone only)
- [ ] Android share target (needs a native plugin and the phone to test)
- [x] First-run model download screen (states the only network use), untested on a phone
- [x] Settings: theme, wipe data, contacts, recent checks, list provenance
### C. QVAC (verify against docs.qvac.tether.io first)
- [x] `ModelProvider` interface + mock provider + tests (`packages/core/src/provider.ts`; tags must quote the chat verbatim or are dropped)
- [x] OCR adapter, one small LLM tagger adapter (schema-forced JSON tags with quoted spans), tested on a fake SDK only; wired into the app (`apps/mobile/src/model/provider.ts`)
- [x] List exactly what the owner must test on the phone (handover above)
### D. Offline proof + submission
- [ ] `scripts/offline-proof.ts`: runs address, chat, receipt checks end to end, logs every outbound connection attempt, expects zero
- [ ] README: setup, dependencies, what was built during the event, QVAC SDK versions/models/files, device/OS, memory, licences (CC-BY credit), network-only features, honest limits, measured numbers only
- [ ] Demo video script (airplane mode visible, offline-proof result on screen)
- [ ] Submission checklist matches DoraHacks requirements

## Log
- 2026-10-29 11:10 UTC: QVAC wired: `@qvac/sdk` 0.22.0 + Expo plugin, `qvac.config.js` (LLM + OCR plugins only), setup screen, screenshot flow; web keeps a labelled demo tagger. Not run on a phone. 49 tests pass. (cloud run)
- 2026-10-29 10:20 UTC: QR scan: `parseQr` in core (5 tests), Scan screen on expo-camera filling address + network. 44 tests pass. (cloud run)
- 2026-10-29 10:05 UTC: local storage behind a `Repo` interface (SQLite native, localStorage web, memory in tests); settings shows recent checks; Android JS bundle exports cleanly. 39 tests pass. (cloud run)
- 2026-10-29 09:40 UTC: ModelProvider + mock in core; Expo app shell with all four result screens, Checking with measured step timings, chat paste, settings. Web build checked in Playwright, dark and light: all flows render and the page made 0 requests to other hosts. 36 tests pass. (cloud run)
- 2026-10-29: core package, frozen-list script and list, design canvases, PRD committed. (manual session)
