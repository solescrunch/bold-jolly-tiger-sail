import {LIFE_RECIPES,LIFE_ITEMS} from '../dist/skill-life.js';
import {readFile,writeFile} from 'node:fs/promises';
import {TRAINING_METHODS} from '../dist/skill-curriculum.js';
import {XP_THRESHOLDS,TIER_LEVELS,XP_LEVEL_99} from '../dist/progression.js';
await writeFile(new URL('../SKILL-CURRICULUM.json',import.meta.url),JSON.stringify({version:2,connectedStarterActivities:LIFE_RECIPES,supplyTypes:LIFE_ITEMS,release:JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8')).version,maxSkillLevel:99,maxCombatLevel:126,xpTo99:XP_LEVEL_99,tierLevels:TIER_LEVELS,xpThresholds:XP_THRESHOLDS,methods:TRAINING_METHODS,limitations:['Gathering methods share existing pooled materials and nodes','Curriculum commissions donate output; connected starter activities produce usable skill supplies','Advanced guide bands are planned; connected starter methods are executable','Every skill also retains a 1-XP practice drill']},null,2)+'\n');
console.log('Exported original Wayfarer skill curriculum.');
