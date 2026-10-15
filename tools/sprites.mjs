// Dump the Phosphor-OS pixel crew (read only from ~/phosphor-os, MIT) into a compact JSON the site draws itself.
// node tools/sprites.mjs  (Node 24 strips the TypeScript types)
import { writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
const base = process.env.PHOSPHOR_SRC || `${homedir()}/phosphor-os/web/src/sprites`;
const { crewAnim } = await import(`${base}/crew.ts`);
const { operatorAnim } = await import(`${base}/operator.ts`);
const pack = (a) => ({ w: a.frames[0].w, h: a.frames[0].h, ends: a.ends, total: a.total, still: a.still,
  frames: a.frames.map((g) => Buffer.from(g.px).toString('base64')) });
const out = {
  operator: pack(operatorAnim('working')),
  scout: pack(crewAnim('scout', 0, 'running')),
  architect: pack(crewAnim('architect', 0, 'running')),
  engineer: pack(crewAnim('engineer', 0, 'running')),
  librarian: pack(crewAnim('librarian', 0, 'running')),
  crew: pack(crewAnim('crew', 1, 'running')),
};
for (const k of ['scout', 'architect', 'engineer', 'librarian']) out[`${k}Done`] = pack(crewAnim(k, 0, 'completed'));
out.crewDone = pack(crewAnim('crew', 1, 'completed'));
writeFileSync('src/sprites.json', JSON.stringify(out));
console.log(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, `${v.w}x${v.h} x${v.frames.length}`])));
