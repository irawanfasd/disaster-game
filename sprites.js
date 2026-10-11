const SP=(()=>{
const BASE=["....OOOOOOOO....","...OHHHHHHHHO...","..OHHHHHHHHHHO..","..OHHhHHHHhHHO..",".OHHHSSSSSSHHHO.",".OHHSSSSSSSSHHO.",".OHSWeSSSSWeSHO.",".OHSeeSSSSeeSHO.",".OHScSSSSSScSHO.","..OsSSSmmSSSsO..","...OsSSSSSSsO...","....OOOOOOOO....","...OTTTTTTTTO...","..OSOTTttTTOSO..","..OSOTTTTTTOSO..","..OSOTTttTTOSO..","..OSOTTTTTTOSO..","...OOPPPPPPOO...","....OPPPPPPO....","....OPPppPPO....","....OPPOOPPO....","....OPPOOPPO....","...OBBBOOBBBO...","...OOOOOOOOOO..."];
const FEM={9:"OHOsSSSmmSSSsOHO",10:".OHOsSSSSSSsOHO.",11:"..OHOOOOOOOOOHO."};
const CK={std:{m:{T:'#3b82f6',t:'#2563eb',P:'#9ca3af',p:'#6b7280'},f:{T:'#ec6fa3',t:'#d4558a',P:'#f472b6',p:'#d4558a'}},
 sar:{T:'#374151',t:'#1f2937',P:'#1f2937',p:'#111827',A:'#f59e0b',a:'#d97706',cap:1},
 gempa:{T:'#f8fafc',t:'#cbd5e1',P:'#1f2937',p:'#111827',A:'#ef4444',a:'#b91c1c',cap:1},
 adat:{m:{T:'#b91c1c',t:'#7f1d1d',P:'#111827',p:'#000000',A:'#facc15',a:'#ca8a04',cap:1,feather:1},f:{T:'#fde047',t:'#eab308',P:'#b91c1c',p:'#7f1d1d',A:'#facc15',a:'#ca8a04',cap:1}}};
const cfg=(id,g)=>CK[id].m?CK[id][g]:CK[id];
function grid(id,g){const k=cfg(id,g),r=[...BASE];if(g==='f')for(const j in FEM)r[j]=FEM[j];
 if(k.cap)for(let j=1;j<4;j++)r[j]=r[j].replace(/H/g,'A').replace(/h/g,'a');
 if(k.feather)r[0]="A..AOOOOOOOOA..A";return r}
function pal(id,g){const k=cfg(id,g);return{O:'#1a1a2e',H:g==='m'?'#e8b830':'#4a2c1a',h:g==='m'?'#c8941a':'#33200f',S:'#f5c9a0',s:'#e0a878',e:'#1f2937',W:'#ffffff',c:'#f4a0a0',m:'#c0392b',B:'#6b4423',...k}}
return{ids:['std','sar','gempa','adat'],grid,pal,W:16,H:24}})();
if(typeof module!=='undefined')module.exports=SP;
