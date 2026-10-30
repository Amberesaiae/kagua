import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pageHtml } from "./src/page.ts";

const forbidden = [
  /#FBF6EE/i,
  /#E07A3F/i,
  /#A8481A/i,
  /#C27A12/i,
  /\bsafe\b/i,
  /\bprotected\b/i,
  /\bsecure\b/i,
  /minipay/i,
  /google play/i,
  /app store/i,
  /<script/i,
  /https?:\/\//i,
];

const allowedHex = new Set(["#FFFFFF", "#111111", "#0B7A4B", "#F4F6F5"]);

function byteLength(value: string): number {
  let bytes = 0;
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    if (code < 0x80) bytes += 1;
    else if (code < 0x800) bytes += 2;
    else if (code < 0x10000) bytes += 3;
    else bytes += 4;
  }
  return bytes;
}

function assertPage(html: string): void {
  for (const pattern of forbidden) {
    if (pattern.test(html)) {
      throw new Error(`Landing page failed check: ${pattern}`);
    }
  }
  const hexes = html.match(/#[0-9A-Fa-f]{3,8}/g) ?? [];
  for (const hex of hexes) {
    const key = hex.toUpperCase();
    if (!allowedHex.has(key)) {
      throw new Error(`Unexpected color ${hex}`);
    }
  }
  const bytes = byteLength(html);
  if (bytes > 100_000) {
    throw new Error(`Landing page is ${bytes} bytes (limit 100000)`);
  }
}

assertPage(pageHtml);

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, "dist", "index.html");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, pageHtml);
console.log(`wrote ${out} (${byteLength(pageHtml)} bytes)`);
