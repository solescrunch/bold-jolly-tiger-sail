import {readFileSync} from 'node:fs';
// One release identity feeds health, lifecycle logs and packaging.
const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
if(!/^\d+\.\d+\.\d+$/.test(pkg.version))throw Error('Invalid release version');
export const RELEASE_VERSION=pkg.version;
