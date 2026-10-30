import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pageHtml } from "./src/page.ts";

const banned = [
  /#0B7A4B/i,
  /#FFFFFF/i,
  /#FFF\b/i,
  /#FBF6EE/i,
  /#E07A3F/i,
  /#A8481A/i,
  /#C27A12/i,
  /Welcome back/i,
  /T9yK/,
  /Placeholder/i,
  /\bsafe\b/i,
  /\bprotected\b/i,
  /\bsecure\b/i,
];

const allowedUrl = "https://github.com/Amberesaiae/kagua";

function assertPage(html: string): void {
  for (const pattern of banned) {
    if (pattern.test(html)) {
      throw new Error(`Landing page failed check: ${pattern}`);
    }
  }
  const urls = html.match(/https?:\/\/[^\s"'<>]+/g) ?? [];
  for (const url of urls) {
    if (url !== allowedUrl) {
      throw new Error(`Unexpected URL ${url}`);
    }
  }
}

assertPage(pageHtml);

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, "dist");
const assetsOut = join(dist, "assets");
mkdirSync(assetsOut, { recursive: true });

const assetsIn = join(root, "src", "assets");
for (const name of readdirSync(assetsIn)) {
  if (!name.endsWith(".webp")) continue;
  copyFileSync(join(assetsIn, name), join(assetsOut, name));
}
const brand = join(assetsIn, "brand");
copyFileSync(join(brand, "favicon-512.png"), join(assetsOut, "favicon-512.png"));
copyFileSync(join(brand, "apple-touch-icon-180.png"), join(assetsOut, "apple-touch-icon-180.png"));

writeFileSync(join(dist, "index.html"), pageHtml);
console.log(`wrote ${join(dist, "index.html")} (${pageHtml.length} chars)`);
