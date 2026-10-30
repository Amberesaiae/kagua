# Kagwa Wire: AI Yako 2026 submission pack

Prepared 30 October 2026. Facts come from this repository, the AI Yako DoraHacks page, and the owner. Items marked TO BE ADDED are not done yet.

## Project

- **Name:** Kagwa Wire
- **One-line pitch:** An offline check, on your phone, before you release USDT in a peer-to-peer trade. It reads an address or a chat and shows one level: Stop, Check more, No flags found, or Can't tell, with the reason and the text that triggered it.
- **Track:** Offline AI apps
- **Repository:** https://github.com/Amberesaiae/kagua (public)
- **Landing page:** pending (open pull request #2, not merged)
- **Demo video:** Vimeo link: TO BE ADDED. The video must show the QVAC chat check running on a phone with airplane mode visible.

## Problem and who needs it

A peer-to-peer USDT trade often ends with one person releasing coins after a chat, a pasted address, or a picture of a payment. This repository checks for:

- an address that fails its checksum, sits on a different network from the one selected, matches a frozen-address entry, or looks like a saved contact (same first four and last four characters, different middle);
- a chat that asks for a seed phrase, a PIN or password, or a one-time code;
- a chat that rushes the trader, moves the talk off the trading app, poses as an exchange, admin, or support, or claims a payment was made and asks for release (English and Swahili).

The user is a USDT trader who checks before they release or send. There is no user study, trader count, or fraud statistic in the repo, so none is claimed here.

Kagwa Wire does not hold funds, sign anything, or send a transaction. "No flags found" means the checks that ran found nothing. It proves nothing about the trade.

## How QVAC is used

- Code chooses the level. The on-device model only adds tags tied to quoted text. A tag can raise "nothing found" to Check more. It cannot lower a level and cannot produce Stop (`decide` in `packages/core/src/chat.ts`).
- **Chat tagger:** `QWEN3_600M_INST_Q4` (`Qwen3-0.6B-Q4_0.gguf`), 382,156,480 bytes.
- **Screenshot reading:** `OCR_LATIN` (`latin_g2.gguf`), 15,396,512 bytes, `langList: ['en']`. The OCR text detector adds a small extra file whose size is not recorded.
- **SDK:** `@qvac/sdk` 0.22.0. The lockfile also resolves `@qvac/inference` 0.22.0, `@qvac/llm-llamacpp` 0.61.2, `@qvac/ocr-ggml` 0.29.1.
- **Worker bundle:** `apps/mobile/qvac.config.js` ships only `PLUGIN_LLM` and `PLUGIN_OCR`. The Expo plugin `@qvac/sdk/expo-plugin` sets Android minSdkVersion 29, NDK `29.0.14206865`, ABI `arm64-v8a` only.
- **Model download steps:** in the app, Settings, On-phone models (`apps/mobile/src/app/setup.tsx`) downloads both models once. A check never starts a download. The tagger is used only if both models are already loaded or cached.
- **Files where QVAC is used:**
  - `apps/mobile/src/model/provider.ts` (phone provider)
  - `packages/core/src/qvac.ts` (adapter, prompt, JSON schema, temperature 0, top_k 1, seed 1)
  - `packages/core/src/provider.ts` (`ModelProvider` interface, tag sanitiser, mock)
  - `apps/mobile/src/logic/tagger.ts`
  - `apps/mobile/src/app/setup.tsx`
  - `apps/mobile/qvac.config.js`, `apps/mobile/app.json`
- **Not checked yet:** the adapter was written from the package's type declarations and examples. It has not been checked against docs.qvac.tether.io.
- **Web build:** has no QVAC provider. It uses a keyword mock, and its tags are labelled "demo tag, web build". Screenshots in the README are of that web build, not the phone.

## Team (up to three)

- Lamptey Isaiah (hacker name: Isaiah Amber), engineer. Solo build, team size 1. NEEDS OWNER to confirm the spelling and the name to enter on DoraHacks.

## Built during the event, and existing code

- Commits in the repo are dated 29 and 30 October 2026 (UTC). There is no earlier commit. Git authors are Amberesaiae, Claude, and Cursor Agent.
- Third-party work to credit: the npm packages listed in the README licence table (`@qvac/sdk`, Expo, React Native and others); the frozen-address archive (CC-BY-4.0, KYT Group / cryptoalert.report, snapshot 2026-09-07) plus TronGrid events on the Tron USDT contract; model files downloaded from the QVAC catalogue.
- No other copied application was found in the git history.
- **NEEDS OWNER:** confirm no earlier private work exists outside this repo. The README cannot answer that.

## Device, OS, memory, licences

- **Device and OS used:** NOT YET. No phone has run the app. No native build, model download, on-device OCR, on-device tagging, or offline test has been done. The target is a physical arm64 Android phone (mission doc: Android 12+; plugin floor: API 29). A Redmi 15C is named as the intended test phone in another assistant's notes. That is not confirmed as arm64 or Android 12+ and nothing has run on it. Phone model and Android version are **NEEDS OWNER** once a run happens.
- **Memory:** not measured. Model files total about 398 MB before the detector file. RAM during a check is unknown.
- **Licences read from the installed tree:** `@qvac/*` packages and `react-native-bare-kit` are Apache-2.0. Expo, React, React Native, `@noble/hashes`, and the icon packages are MIT. TypeScript is Apache-2.0. Vitest and hyparquet are MIT. Geist fonts are MIT AND OFL-1.1. Full table in the README.
- **Model weight licences:** not confirmed for `Qwen3-0.6B-Q4_0.gguf` or `latin_g2.gguf`.
- **Repository licence:** MIT, copyright Lamptey Isaiah. See `LICENSE`.
- **Hardware limits:** arm64-v8a only. Mission doc says no emulator. 20-second timeout on the tagger; behaviour on a slow phone untested.

## Features that need a network

1. First-run model download on the phone (one time). Whether this counts as offline is an open question for the organisers.
2. Frozen-list refresh, on a build machine only (`packages/core/scripts/build-frozen.ts`). The app reads the committed JSON and has no updater.
3. Waitlist on the landing page (separate pull request), not part of a check.
4. Web build only: `expo-camera` loads a QR script from a CDN if that screen loads. The phone scan screen uses the native camera.

The check itself (address and chat) has no `fetch` in the repo's own source. That is a code reading, not a packet capture. `scripts/offline-proof.ts` does not exist yet.

## Honest status

- Verified in a cloud workspace on 30 October 2026: `npm test` (58 core tests and 22 mobile tests passed) and `npm run typecheck` with no errors.
- Not verified: anything on a phone, real OCR of a photo, real Qwen run on the current build, cached-model behaviour with the network off.
- Open pull requests, none merged: #1 (the app and QA fixes), #2 (landing page), #3 (README and screenshots). The default branch `main` has no `apps/` directory until #1 is merged. `main` already contains an earlier slice of `packages/core` (address and chat checks, frozen list) and does not contain the QVAC adapter or the Expo app.

## DoraHacks form checklist

The form's exact field list is not visible to me without logging in. This list follows the hackathon page's "What to submit" section. **NEEDS OWNER:** compare against the live form.

| Field | Status | Note |
| --- | --- | --- |
| Build name | READY | Kagwa Wire |
| One-line pitch | READY | See above |
| Track | READY | Offline AI apps |
| Problem, target user | READY | See above |
| Team members (up to 3) | NEEDS OWNER | Solo build: Lamptey Isaiah (Isaiah Amber), engineer. Confirm spelling and DoraHacks name, then add to the Build |
| Repository link | NEEDS OWNER | Link works. `main` lacks `apps/` until PR #1 is merged, and already has an earlier `packages/core` slice. Owner merges. |
| Setup instructions and dependencies | NEEDS OWNER | In README on PR #3. Reaches `main` only after merge. |
| What was built during the event, existing code disclosure | NEEDS OWNER | Drafted above. Confirm. |
| QVAC integration (versions, model, download steps, files) | READY | Above. Adapter not checked against docs.qvac.tether.io. |
| Device and OS used | BLOCKED | No phone run yet |
| Memory needs, hardware limits | BLOCKED | Not measured |
| Model licences | BLOCKED | Weight licences unconfirmed. Package licences READY. |
| Repo LICENSE | READY | MIT, copyright Lamptey Isaiah |
| Network-dependent features | READY | Above |
| Demo video, offline, QVAC chat check, airplane mode visible | BLOCKED | Needs a native Android build and a phone run first. Vimeo link: TO BE ADDED |
| Landing page link | NEEDS OWNER | PR #2 unmerged. Enter "pending" or deploy after merge. |
| No secrets in repo | READY | Tracked files and all git history were scanned on 30 October 2026. No API key, token, private-key block, or .env file was found. |
| Links accessible to judges | NEEDS OWNER | Repo is public. Video link must be public or unlisted. |
