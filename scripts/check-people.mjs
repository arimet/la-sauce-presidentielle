// Validates people files against the schema without a full build (safe to run in parallel).
// Usage: node scripts/check-people.mjs [files…]  (default: every file in src/content/people)
import { readFileSync, readdirSync } from 'node:fs';
import yaml from 'js-yaml';
import { person } from '../src/schema.ts';

const dir = 'src/content/people/';
const files = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(dir).map((f) => dir + f);
const candidates = new Set(readdirSync(dir).filter((f) => readFileSync(dir + f, 'utf8').includes('role: candidate')).map((f) => f.slice(0, -3)));
let failed = 0;
for (const file of files) {
  const data = yaml.load(readFileSync(file, 'utf8').split(/^---$/m)[1]);
  const result = person.safeParse(data);
  const issues = result.success ? [] : result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
  if (data?.candidateOf && !candidates.has(data.candidateOf)) issues.push(`candidateOf "${data.candidateOf}" is not a candidate slug`);
  if (issues.length) {
    failed++;
    console.error(`✖ ${file}\n  ${issues.join('\n  ')}`);
  } else console.log(`✔ ${file}`);
}
process.exit(failed ? 1 : 0);
