// Precomputes solvable levels so the game never has to search at runtime.
// Usage: node scripts/gen-levels.mjs [count]
import { writeFileSync } from 'node:fs';
import { generateLevel, encodeBoard } from '../src/engine.js';

const count = Number(process.argv[2] || 2000);
const levels = [];
const t0 = Date.now();
for (let n = 1; n <= count; n++) {
  levels.push(encodeBoard(generateLevel(n).board));
  if (n % 250 === 0) console.log(`level ${n} (${((Date.now() - t0) / 1000).toFixed(1)}s)`);
}
writeFileSync(new URL('../src/levels.json', import.meta.url), JSON.stringify(levels));
console.log(`wrote ${levels.length} levels`);
