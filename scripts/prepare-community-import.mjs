import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { communityImport } from './lib/community-import.mjs';

const input = process.argv[2];
if (!input) throw new Error('Usage: node scripts/prepare-community-import.mjs <contacts.csv>');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const bytes = await fs.readFile(input);
const result = communityImport(bytes.toString('utf8'), { filename: path.basename(input), hash: createHash('sha256').update(bytes).digest('hex') });
const output = path.join(root, 'output', 'community-members');
await fs.mkdir(output, { recursive: true });
await fs.writeFile(path.join(output, 'import.sql'), result.sql);
await fs.writeFile(path.join(output, 'import-summary.json'), JSON.stringify(result.summary, null, 2) + '\n');
// Private contact data is written only to ignored output files, never source code or logs.
console.log(JSON.stringify(result.summary, null, 2));
