/** Bounded end-to-end QA run using normal host commands, without edits to XP or supplies. */
import {createLocalRealmServer} from './realm-server.mjs';
import {checkedXamView} from '../dist/xam-view.js';
import {writeFile} from 'node:fs/promises';
const ticks=Number(process.argv[2]??120000);if(!Number.isSafeInteger(ticks)||ticks<1||ticks>500000)throw Error('Tick limit must be 1–500000');
const host=await createLocalRealmServer({xam:true,autoTick:false});
try{for(let i=0;i<ticks;i++)host.advance(50);const view=checkedXamView(host.xam.examine()),d=view.diagnostics;
 const report={version:'2.2.0',ticks,simulatedMinutes:ticks/1200,faulted:host.faulted,skills:view.skills,inventory:view.inventory,resourcePack:view.pack,resourceBank:view.bank,supplies:view.supplies,caveSupplies:view.caveSupplies,...d,uncompleted:Object.entries(d.coverage).filter(([,c])=>!c.completed).map(([id,c])=>({id,...c})),failures:Object.entries(d.coverage).filter(([,c])=>c.failures).map(([id,c])=>({id,...c}))};
 await writeFile('verification/v220-xam-coverage.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({ticks,selections:d.selections,covered:d.covered,total:d.total,failures:report.failures,uncompleted:report.uncompleted}));if(host.faulted||report.failures.length||Object.values(d.coverage).some(c=>c.completed+c.blocked+c.failures===0))process.exitCode=1;
}finally{await host.close();}
