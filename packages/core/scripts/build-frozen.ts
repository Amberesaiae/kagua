/**
 * Build-time only (needs internet). The app never runs this.
 * Writes data/frozen.json (currently frozen addresses) and data/frozen.provenance.json.
 *
 * Sources:
 *  1. cryptoalert/usdt-blacklist-archive on Hugging Face (CC-BY-4.0, KYT Group / cryptoalert.report),
 *     filtered to is_banned = true. Used for Ethereum and as a cross-check for Tron.
 *  2. TronGrid events on the Tron USDT contract (AddedBlackList / RemovedBlackList), netted.
 */
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { asyncBufferFromFile, parquetReadObjects } from 'hyparquet';
import { tronFromHex } from '../src/base58';
import { isValidTron } from '../src/validate';

const HF = 'https://huggingface.co/datasets/cryptoalert/usdt-blacklist-archive/resolve/main/addresses.parquet';
const TRON_USDT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getJson(url: string): Promise<any> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(url);
    if (res.ok) return res.json();
    if (res.status === 429 || res.status >= 500) await sleep(1500 * (attempt + 1));
    else throw new Error(`${res.status} ${url}`);
  }
  throw new Error(`gave up on ${url}`);
}

async function tronNet(): Promise<Set<string>> {
  const state = new Map<string, number>(); // address -> last event timestamp, sign by type
  const frozen = new Set<string>();
  const events: { ts: number; add: boolean; addr: string }[] = [];
  for (const name of ['AddedBlackList', 'RemovedBlackList']) {
    let url: string | null = `https://api.trongrid.io/v1/contracts/${TRON_USDT}/events?event_name=${name}&only_confirmed=true&limit=200&order_by=block_timestamp,asc`;
    while (url) {
      const j: any = await getJson(url);
      for (const e of j.data ?? []) {
        events.push({ ts: e.block_timestamp * 1000 + (e.event_index ?? 0), add: name === 'AddedBlackList', addr: tronFromHex(e.result._user) });
      }
      url = j.meta?.links?.next ?? null;
      await sleep(250);
    }
  }
  events.sort((a, b) => a.ts - b.ts);
  for (const e of events) (e.add ? frozen.add(e.addr) : frozen.delete(e.addr));
  void state;
  return frozen;
}

async function main() {
  const res = await fetch(HF);
  if (!res.ok) throw new Error(`HF ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const tmp = '/tmp/kagua-addresses.parquet';
  await writeFile(tmp, buf);
  const rows = (await parquetReadObjects({ file: await asyncBufferFromFile(tmp) })) as any[];
  const banned = rows.filter((r) => r.is_banned === true);

  const hfTron = new Set<string>();
  const evm = new Set<string>();
  for (const r of banned) {
    if (r.chain === 'tron') hfTron.add(tronFromHex(r.address));
    else if (r.chain === 'eth') evm.add('0x' + String(r.address).toLowerCase().replace(/^0x/, ''));
  }

  const chainTron = await tronNet();
  const onlyHf = [...hfTron].filter((a) => !chainTron.has(a)).length;
  const onlyChain = [...chainTron].filter((a) => !hfTron.has(a)).length;
  // The chain is the source of truth for Tron. HF is the cross-check.
  const tron = [...chainTron].filter(isValidTron).sort();

  // Tron comes from the chain pull on this run. EVM comes from the archive snapshot, which is older.
  const EVM_ARCHIVE_DATE = '2026-09-07';
  const tronDate = new Date().toISOString().slice(0, 10);
  const out = { date: tronDate, dates: { tron: tronDate, evm: EVM_ARCHIVE_DATE }, tron, evm: [...evm].sort() };
  const json = JSON.stringify(out);
  await mkdir('data', { recursive: true });
  await writeFile('data/frozen.json', json);
  await writeFile(
    'data/frozen.provenance.json',
    JSON.stringify(
      {
        builtAt: new Date().toISOString(),
        sha256: createHash('sha256').update(json).digest('hex'),
        counts: { tron: tron.length, evm: out.evm.length },
        sources: [
          { name: 'USDT Blacklist Archive (ETH + TRON)', url: 'https://huggingface.co/datasets/cryptoalert/usdt-blacklist-archive', licence: 'CC-BY-4.0', attribution: 'KYT Group / cryptoalert.report', use: 'Ethereum frozen addresses; Tron cross-check', rowsBanned: banned.length, asOf: EVM_ARCHIVE_DATE },
          { name: 'Tron USDT contract events via TronGrid', url: `https://api.trongrid.io/v1/contracts/${TRON_USDT}/events`, use: 'Tron frozen addresses (net of AddedBlackList and RemovedBlackList)', asOf: tronDate },
        ],
        crossCheck: { tronOnlyInArchive: onlyHf, tronOnlyOnChain: onlyChain },
        notAnyList: 'A frozen list only catches known freezes. Not being on it proves nothing.',
      },
      null,
      2,
    ),
  );
  console.log(`tron ${tron.length}  evm ${out.evm.length}  tron archive-only ${onlyHf}  chain-only ${onlyChain}`);
}
main();
