# Learnings

- TronGrid returns USDT freeze events (`AddedBlackList` / `RemovedBlackList`) with no API key. Contract `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t`. Event `_user` is a 0x 20-byte hex; convert with `tronFromHex` (0x41 prefix, base58check).
- The frozen-list dataset is `cryptoalert/usdt-blacklist-archive` on **Hugging Face** (not GitHub). CC-BY-4.0, KYT Group / cryptoalert.report, snapshot 2026-09-07, 11,900 addresses ever affected, 7,946 currently frozen; includes USDC events. Credit it in the README.
- `scripts/build-frozen.ts` run on 29 Oct 2026: 8,089 Tron + 1,650 EVM addresses. Cross-check: 16 Tron addresses only in the archive, 1,809 only on chain. The archive is from 7 Sep so newer freezes explain some; the gap is not fully explained yet (see Decisions).
- Test vectors: Tron `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t` and `TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7` are valid; EIP-55 vector `0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed`.
- A Tron look-alike that also passes the checksum can't be built by hand (the last chars are checksum-coupled), so look-alike is tested on EVM addresses and on the raw `isLookAlike` function for Tron.
- Grok-generated claims (a Tether quote about connections, a ₦3.6bn figure, "no other entry does this") are unverified. Keep them out of the repo.
- `docs.qvac.tether.io` is blocked from the cloud run. `npm pack @qvac/sdk` (no install scripts) ships `dist/examples` (ocr-fasttext, llamacpp-structured-output) and full `.d.ts`; the model registry lives in `@qvac/inference` `dist/models/registry/models.js`. OCR_LATIN expectedSize 15,396,512 B; QWEN3_600M_INST_Q4 382,156,480 B.
- QVAC Expo plugin is `@qvac/sdk/expo-plugin`: minSdk 29, arm64-v8a only, NDK 29.0.14206865, bundles a worker at prebuild; `qvac.config.js` `plugins: [PLUGIN_LLM, PLUGIN_OCR]` tree-shakes it. `completion` needs `stream` set; `ocr` takes a file path or Buffer.
- The USDT contract address `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t` is in the real frozen list; use `TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7` as the "not on list" demo.
- expo-sqlite on web needs WASM + COOP/COEP headers, so the web build stores in localStorage behind the same `Repo` interface.
- RN web: long addresses need `wordBreak: 'break-all'` or they overflow.
