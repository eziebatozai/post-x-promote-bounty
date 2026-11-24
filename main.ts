// main.ts: copies POST.json to /output/POST.json (Node 22, standard library only).
import { copyFileSync, mkdirSync } from 'node:fs';
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(out, { recursive: true });
copyFileSync('POST.json', `${out}/POST.json`);
