import { gzipSync } from "node:zlib";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

// Gzipped budgets in KB. The content script is the one that runs on every github.com page load.
const BUDGETS = [
  { match: /content-scripts\/.*\.js$/, label: "content script JS", kb: 135 },
  { match: /content-scripts\/.*\.css$/, label: "content script CSS", kb: 12 },
  { match: /^background\.js$/, label: "background", kb: 32 },
];
const TOTAL_BUDGET_KB = 175;

const outDir = process.argv[2] ?? ".output/chrome-mv3";
const files = walk(outDir);
let total = 0;
let failed = false;

for (const budget of BUDGETS) {
  const matched = files.filter((file) => budget.match.test(file.name));
  if (matched.length === 0) {
    console.error(`✗ ${budget.label}: no file matched ${budget.match}`);
    failed = true;
    continue;
  }
  const kb = matched.reduce((sum, file) => sum + gzipKb(file.path), 0);
  total += kb;
  const ok = kb <= budget.kb;
  failed ||= !ok;
  console.log(`${ok ? "✓" : "✗"} ${budget.label}: ${kb.toFixed(1)} KB gzip (budget ${budget.kb})`);
}

const totalOk = total <= TOTAL_BUDGET_KB;
failed ||= !totalOk;
console.log(
  `${totalOk ? "✓" : "✗"} total: ${total.toFixed(1)} KB gzip (budget ${TOTAL_BUDGET_KB})`,
);
process.exit(failed ? 1 : 0);

function gzipKb(path) {
  return gzipSync(readFileSync(path)).byteLength / 1024;
}

function walk(dir, root = dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return walk(path, root);
    return statSync(path).isFile() ? [{ path, name: relative(root, path) }] : [];
  });
}
