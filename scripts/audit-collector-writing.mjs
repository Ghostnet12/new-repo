import {readFileSync} from 'node:fs';
import {assessCollectorWriting} from '../server/src/collectors/editorial.js';
const manifest=JSON.parse(readFileSync(new URL('../server/data/collector-first-edition.json',import.meta.url)));
console.log(JSON.stringify(assessCollectorWriting(manifest),null,2));
if(process.argv.includes('--require-ready')&&!assessCollectorWriting(manifest).passes)process.exitCode=1;
