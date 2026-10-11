const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const store={get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const api=(p,b)=>fetch('/api/'+p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(r=>r.json()).catch(()=>({}));
let D,me=store.get('dq_me',null),P=store.get('dq_p',{unlocked:[],costume:'std',gender:'m'}),L,i,sc,ok,tm,t0,busy;
store.get('dq_done',[]).forEach(x=>P.unlocked.includes(x)||P.unlocked.push(x));
const COS=[{id:'std',n:'Kostum Standar'},{id:'sar',n:'Penjelajah SAR',u:3,h:'TSUNAMI'},{id:'gempa',n:'Relawan Gempa',u:1,h:'GEMPA'},{id:'adat',n:{m:'Kabasaran',f:'Maengket'},u:2,h:'ERUPSI'}];
$('#mu').textContent=(window.muted!==undefined?window.muted:localStorage.dq_mute==='1')?'🔇':'🔊';
function show(v){['home','play','wardrobe','rank'].forEach(x=>$('#'+x).hidden=x!==v);if(v!=='play'){stopScene();bgmStop();clearInterval(tm)}scrollTo(0,0)}
fetch('data/scenarios.json').then(r=>r.json()).then(d=>{D=d;$('#levels').innerHTML=d.levels.map(l=>`<button class="card lv" onclick="start(${l.id})"><span class="big">${l.icon}</span><small>LEVEL ${l.id}</small><h3>${l.title}</h3><b>${l.place}</b><p>${l.intro} ${l.decisions.length} keputusan</p></button>`).join('')});
$('#join').onsubmit=async e=>{e.preventDefault();const name=$('#nm').value.trim().slice(0,20),code=$('#cd').value.trim().toUpperCase();if(!name)return;
 me={name,code:'',sid:''};
 if(code){const r=await api('join',{code,name});if(!r.sid){$('#jmsg').textContent=r.error||'Gagal terhubung.';me=null;return}
  me.code=code;me.sid=r.sid;P={unlocked:r.unlocked,costume:r.costume,gender:r.gender};store.set('dq_p',P)}
 store.set('dq_me',me);$('#jmsg').textContent='Halo, '+name+'! Pilih level di bawah.'};
async function start(n){if(!me){$('#jmsg').textContent='Isi namamu dulu ya.';scrollTo(0,0);return}
 L=D.levels[n-1];i=0;sc=0;ok=0;
 if(me.sid){const r=await api('start',{code:me.code,sid:me.sid,level:n});if(r.error){me.sid='';$('#jmsg').textContent='Sesi kelas tidak ditemukan — main solo.'}}
 show('play');prog=0;scene($('#cv'),n,P);bgmStart(n);ask()}
function ask(){const d=L.decisions[i];busy=false;prog=i/L.decisions.length;
 $('#pc').innerHTML=`<div class="card"><small>LEVEL ${L.id} · KEPUTUSAN ${i+1}/${L.decisions.length}</small><h2>${esc(L.title)} — ${esc(L.place)}</h2>${i?'':`<p>${esc(L.intro)}</p>`}<h3>${esc(d.q)}</h3>${d.timer?'<div class="bar"><i id="tb"></i></div>':''}${d.opts.map((o,k)=>`<button class="opt" onclick="pick(${k})"><b>${'ABC'[k]}</b> ${esc(o)}</button>`).join('')}</div>`;
 clearInterval(tm);t0=Date.now();if(me.sid)api('ask',{code:me.code,sid:me.sid,level:L.id,dp:i});
 if(d.timer)tm=setInterval(()=>{const r=Math.max(0,d.timer-(Date.now()-t0)/1000);$('#tb').style.width=r/d.timer*100+'%';if(r<=0)pick(-1)},100)}
async function pick(k){if(busy)return;busy=true;clearInterval(tm);const d=L.decisions[i],el=(Date.now()-t0)/1000;
 let good=k===d.ok,pts=good?100+(d.timer?Math.round(50*Math.max(0,1-el/d.timer)):0):0;
 if(me.sid){const r=await api('answer',{code:me.code,sid:me.sid,choice:k});if(r.points!==undefined){good=r.ok;pts=r.points}}
 sc+=pts;ok+=good?1:0;if(good){sfx.good();jump=14}else{sfx.bad();mood=24}
 $('#pc').innerHTML=`<div class="card ${good?'good':'bad'}"><h2>${good?'✅ Tepat!':k<0?'⏰ Waktu habis':'❌ Kurang tepat'}</h2>${good?'':`<p>Jawaban tepat: <b>${esc(d.opts[d.ok])}</b></p>`}<div class="fact">📖 <b>Fakta resmi:</b> ${esc(d.fact)}</div><p>Skor: <b>${sc}</b> · Tidak ada hukuman, terus belajar!</p><button class="btn" onclick="nxt()">${i+1<L.decisions.length?'Lanjut':'Lihat Ending'}</button></div>`}
function nxt(){i++;i<L.decisions.length?ask():end()}
async function end(){const r=ok/L.decisions.length,x=r<.4?0:r<.7?1:r<1?2:3,e=D.endings[x];let un=P.unlocked;
 if(me.sid){const f=await api('finish',{code:me.code,sid:me.sid});if(f.unlocked)un=f.unlocked;else if(!f.error&&!un.includes(L.id))un=[...un,L.id]}else if(!un.includes(L.id))un=[...un,L.id];
 const fresh=!P.unlocked.includes(L.id)&&un.includes(L.id);P.unlocked=un;store.set('dq_p',P);prog=1;bgmStop();sfx.end();setTimeout(rankNote,700);
 $('#pc').innerHTML=`<div class="card"><small>ENDING ${x+1}/4</small><h2>${e.t}</h2><p>${e.d}</p><p>Skor <b>${sc}</b> · Benar ${ok}/${L.decisions.length}</p>${fresh?'<p>👕 Kostum baru terbuka di Lemari Baju!</p>':''}<p id="rk"></p><button class="btn" onclick="start(${L.id})">Main Lagi</button> <button class="btn alt" onclick="show('home')">Peta</button> <button class="btn alt" onclick="rank(${L.id})">🏆 Ranking</button></div>`}
function sync(){store.set('dq_p',P);if(me&&me.sid)api('profile',{code:me.code,sid:me.sid,costume:P.costume,gender:P.gender});wardrobe()}
function setG(g){P.gender=g;sync()}function setC(c){P.costume=c;sync()}
function wardrobe(){const g=P.gender;
 $('#wardrobe').innerHTML=`<small>KUSTOMISASI KARAKTER</small><h2>Pilih Kostummu</h2><p>Setiap misi yang selesai membuka kostum baru.</p><p><button class="btn ${g=='m'?'':'alt'}" onclick="setG('m')">COWOK</button> <button class="btn ${g=='f'?'':'alt'}" onclick="setG('f')">CEWEK</button></p><div class="grid">${COS.map(c=>{const o=!c.u||P.unlocked.includes(c.u),n=typeof c.n=='object'?c.n[g]:c.n;return`<button class="card cos ${P.costume==c.id?'on':''}" ${o?'':'disabled'} onclick="setC('${c.id}')"><span data-c="${c.id}" ${o?'':'data-l="1"'}></span><br><b>${n}</b><br><small>${o?(P.costume==c.id?'AKTIF':'TERBUKA'):'Selesaikan misi '+c.h}</small></button>`}).join('')}</div>`;
 document.querySelectorAll('#wardrobe [data-c]').forEach(e=>{const c=spriteCanvas(e.dataset.c,g,6);if(e.dataset.l)c.className='lock';e.replaceWith(c)});show('wardrobe')}
/* v3: ranking kelas — tampil 5 teratas + posisi sendiri (tidak mempermalukan yang di bawah) */
async function rank(lv){if(!D)return;lv=lv||(L?L.id:1);show('rank');
 if(!me||!me.sid){$('#rank').innerHTML='<div class="card"><h2>🏆 Ranking Kelas</h2><p>Masuk dengan kode kelas dari gurumu untuk ikut ranking!</p></div>';return}
 const r=await fetch('/api/rank/'+me.code+'?level='+lv+'&sid='+me.sid).then(r=>r.json()).catch(()=>({})),med=['🥇','🥈','🥉','4️⃣','5️⃣'];
 const li=(a,u)=>a&&a.length?a.map((x,k)=>`<div class="row"><span>${med[k]} ${esc(x.name)}</span><b>${x.v}${u}</b></div>`).join(''):'<p>Belum ada data.</p>';
 $('#rank').innerHTML=`<small>RANKING KELAS</small><h2>Siapa yang paling siaga?</h2><p>Level untuk ⚡: <select onchange="rank(+this.value)">${D.levels.map(l=>`<option value="${l.id}" ${l.id==lv?'selected':''}>Level ${l.id} — ${l.title}</option>`).join('')}</select></p>
 <div class="grid"><div class="card"><h3>🏆 Skor Total</h3>${li(r.score,'')}<p>${r.myScore?'Posisimu: <b>#'+r.myScore+'</b> dari '+r.nScore:'Mainkan level untuk masuk ranking!'}</p></div>
 <div class="card"><h3>⚡ Tercepat (semua benar)</h3>${li(r.fast,' dtk')}<p>${r.myFast?'Posisimu: <b>#'+r.myFast+'</b> dari '+r.nFast:'Selesaikan level dengan semua benar!'}</p></div></div>`}
async function rankNote(){if(!me||!me.sid||!$('#rk'))return;
 const r=await fetch('/api/rank/'+me.code+'?level='+L.id+'&sid='+me.sid).then(r=>r.json()).catch(()=>({}));
 $('#rk').innerHTML=(r.myScore?'🏆 Skor total: peringkat <b>#'+r.myScore+'</b> dari '+r.nScore:'')+(r.myFast?' · ⚡ Tercepat: <b>#'+r.myFast+'</b>':'')}
