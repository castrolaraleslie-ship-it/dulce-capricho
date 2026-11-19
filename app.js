const $=s=>document.querySelector(s),K='dulce-capricho-v2';
let S={v:2,updatedAt:0,d:[['Tres leches tradicional',1500],['Tres leches churchill',1800],['Cheesecake de oreo',1700],['Cheesecake de maracuyá',1800],['Pie de limón',1700]].map((x,i)=>({id:i+1,name:x[0],price:x[1],made:10})),c:[],o:[],n:{}},tab=0,mem=null,tt,ct,Cloud=null;
/* Capa de datos: para cambiar de base de datos solo hay que escribir otro adaptador {load,save} y asignarlo a Cloud (ver boot) */
const Local={load(){try{return JSON.parse(localStorage.getItem(K)||localStorage.getItem('postres-v1'))}catch(e){return null}},save(s){try{localStorage.setItem(K,JSON.stringify(s))}catch(e){}}};
const norm=s=>Object.assign({v:2,updatedAt:0,d:[],c:[],o:[],n:{}},s);
{const r=Local.load();if(r&&r.d)S=norm(r)}
const save=()=>{S.updatedAt=Date.now();Local.save(S);clearTimeout(ct);ct=setTimeout(()=>Cloud&&Cloud.save(S).catch(()=>{}),800)};
async function boot(){}
const uid=()=>Date.now()+Math.floor(Math.random()*999);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const money=n=>'₡'+Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,'.');
const sold=id=>S.o.reduce((a,o)=>a+o.items.filter(i=>i.d==id).reduce((b,i)=>b+i.q,0),0);
const left=d=>d.made-sold(d.id),paid=o=>o.pays.reduce((a,p)=>a+p.a,0),bal=o=>o.total-paid(o);
const days=o=>Math.floor((Date.now()-new Date(o.date))/864e5);
const cname=id=>(S.c.find(c=>c.id==id)||{name:'Cliente'}).name,dn=id=>(S.d.find(d=>d.id==id)||{name:'Postre'}).name;
const fd=d=>new Date(d).toLocaleDateString('es-CR',{day:'numeric',month:'short'}),fl=d=>new Date(d).toLocaleDateString('es-CR');
const val=id=>$('#'+id).value,go=i=>{tab=i;render();scrollTo(0,0)};
function toast(t){const e=$('#t');e.textContent=t;e.style.display='block';clearTimeout(tt);tt=setTimeout(()=>e.style.display='none',2800)}
function modal(t,h,btns){mem=btns;$('#m').innerHTML=`<div class="bd" onclick="if(event.target==this)closeM()"><div class="sh"><h2>${t}</h2>${h}<div class="row">${btns.map((b,i)=>`<button class="b ${b.c||''}" onclick="mem[${i}].f()">${b.t}</button>`).join('')}</div></div></div>`}
const closeM=()=>{$('#m').innerHTML=''},done=()=>{save();closeM();render()};

const vD=()=>`<h2 class="t">Mis postres</h2>`+S.d.map(d=>{const l=left(d),p=d.made?Math.max(0,l/d.made*100):0;return `<div class="cd d" onclick="editD(${d.id})"><div><b>${esc(d.name)}</b><small>${money(d.price)} · vendidos ${sold(d.id)} de ${d.made}</small><div class="bar"><i style="width:${p}%"></i></div></div><div class="badge ${l<=0?'zero':l<=2?'low':''}">${l}<small>${l<=0?'agotado':'quedan'}</small></div></div>`}).join('')+`<button class="b w" onclick="editD()">+ Agregar postre</button><p class="hint">Toca un postre para cambiar el precio o cuántos preparaste.</p>`;
const oc=o=>{const b=bal(o);return `<div class="cd"><div class="top"><b>${esc(cname(o.c))}</b><span class="ch ${b>0?'pe':'ok'}">${b>0?'Debe '+money(b):'Pagado'}</span></div>${o.items.map(i=>`<div>${i.q}× ${esc(dn(i.d))}</div>`).join('')}<small>${fd(o.date)} · Total ${money(o.total)}${o.pays.length?' · '+o.pays.map(p=>(p.m=='sinpe'?'SINPE ':'Efectivo ')+money(p.a)).join(', '):''}</small><div class="row"><button class="b g s" onclick="anular(${o.id})">Anular pedido</button></div></div>`};
const vO=()=>`<h2 class="t">Pedidos</h2><button class="b w" onclick="newOrder()">+ Nuevo pedido</button>`+(S.o.length?[...S.o].reverse().map(oc).join(''):`<p class="hint">Aún no hay pedidos. Crea el primero.</p>`);
const vC=()=>`<h2 class="t">Clientes</h2><button class="b w" onclick="addC()">+ Agregar cliente</button>`+(S.c.map(c=>{const os=S.o.filter(o=>o.c==c.id),pe=os.reduce((a,o)=>a+bal(o),0);return `<div class="cd d"><div><b>${esc(c.name)}</b><small>${c.phone?esc(c.phone)+' · ':''}${os.length} pedido${os.length==1?'':'s'}</small></div>${pe>0?`<span class="ch pe">Debe ${money(pe)}</span>`:`<span class="ch ok">Al día</span>`}</div>`}).join('')||`<p class="hint">Aún no hay clientes. Se crean al hacer un pedido o con el botón de arriba.</p>`);
const vP=()=>{const l=S.o.filter(o=>bal(o)>0).sort((a,b)=>a.date.localeCompare(b.date));return `<h2 class="t">Cobros</h2>${resumen()}<div class="tot">Por cobrar<b>${money(l.reduce((a,o)=>a+bal(o),0))}</b></div>`+(l.map(o=>{const n=days(o);return `<div class="cd"><div class="top"><b>${esc(cname(o.c))}</b><span class="ch ${n>=15?'bad':n>=14?'pe':''}">${n>=15?'Vencida · ':''}${n} días</span></div><div class="big2">${money(bal(o))}</div><small>de ${money(o.total)} · pedido del ${fd(o.date)}</small><div class="row"><button class="b" onclick="pay(${o.id})">Abonar o cancelar cuenta</button></div></div>`}).join('')||`<p class="hint">Nadie debe nada.</p>`)};

function render(){
 const od=S.o.filter(o=>bal(o)>0&&days(o)>=15);
 $('#v').innerHTML=(od.length?`<div class="al">${od.length} cuenta${od.length>1?'s':''} con más de 15 días sin pagar (${money(od.reduce((a,o)=>a+bal(o),0))})</div>`:'')+[vD,vO,vC,vP][tab]();
 document.querySelectorAll('nav button').forEach((b,i)=>b.classList.toggle('on',i==tab));
 try{const ok='Notification' in window&&Notification.permission=='granted';$('#nb').style.display=ok?'none':'inline-block';
 if(ok){const t=new Date().toDateString();od.forEach(o=>{if(S.n[o.id]!=t){S.n[o.id]=t;save();new Notification('Cuenta vencida: '+cname(o.c),{body:'Debe '+money(bal(o))+' desde hace '+days(o)+' días'})}})}}catch(e){}
}
function askN(){try{Notification.requestPermission().then(render)}catch(e){toast('Este navegador no permite avisos')}}

function editD(id){const d=S.d.find(x=>x.id==id)||{name:'',price:'',made:10};
 modal(id?'Editar postre':'Nuevo postre',`<label>Nombre</label><input id="n" value="${esc(d.name)}"><label>Precio (₡)</label><input id="p" type="number" inputmode="numeric" value="${d.price}"><label>Costo de hacerlo (₡, opcional)</label><input id="co" type="number" inputmode="numeric" value="${d.cost||''}">${id?`<small>Preparados hasta ahora: ${d.made} · vendidos ${sold(id)} · quedan ${left(d)}</small><label>Preparé más (se suman a los que ya hay)</label><input id="ad" type="number" min="0" inputmode="numeric" value="0">`:''}<label>${id?'Corregir total preparado (solo si te equivocaste)':'Cantidad preparada'}</label><input id="k" type="number" inputmode="numeric" value="${d.made}">`,
 [{t:'Cerrar',f:closeM,c:'g'},{t:'Guardar postre',f:()=>{const n=val('n').trim(),p=+val('p'),ad=id?Math.max(0,Math.floor(+val('ad')||0)):0,k=(+val('k')||0)+ad,s=id?sold(id):0;if(!n||!(p>0))return toast('Completa nombre y precio');if(k<s)return toast('Ya vendiste '+s+', no puede ser menos');
 const co=Math.max(0,+val('co')||0);if(id)Object.assign(d,{name:n,price:p,made:k,cost:co});else S.d.push({id:uid(),name:n,price:p,made:k,cost:co});done()}}])}
function addC(){modal('Nuevo cliente',`<label>Nombre</label><input id="n"><label>Teléfono (opcional)</label><input id="p" inputmode="tel">`,
 [{t:'Cerrar',f:closeM,c:'g'},{t:'Guardar cliente',f:()=>{const n=val('n').trim();if(!n)return toast('Escribe el nombre');S.c.push({id:uid(),name:n,phone:val('p').trim()});done()}}])}
function newOrder(){
 modal('Nuevo pedido',`<label>Cliente</label><select id="cl" onchange="$('#nc').style.display=this.value=='n'?'block':'none'">${S.c.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}<option value="n">+ Cliente nuevo</option></select><input id="nc" placeholder="Nombre del cliente" style="display:${S.c.length?'none':'block'}">
 <label>Postres</label>${S.d.map(d=>`<div class="li"><span>${esc(d.name)}<small>${money(d.price)} · quedan ${left(d)}</small></span><input id="q${d.id}" type="number" min="0" max="${left(d)}" value="0" inputmode="numeric"></div>`).join('')}
 <label>Pago</label><select id="pg" onchange="$('#ab').style.display=this.value=='p'?'block':'none'"><option value="sinpe">Pagó todo por SINPE</option><option value="efectivo">Pagó todo en efectivo</option><option value="p">Queda pendiente</option></select>
 <div id="ab" style="display:none"><input id="am" type="number" inputmode="numeric" placeholder="Abono inicial (opcional)"><select id="mt"><option value="sinpe">Abono por SINPE</option><option value="efectivo">Abono en efectivo</option></select></div>`,
 [{t:'Cerrar',f:closeM,c:'g'},{t:'Guardar pedido',f:saveOrder}])}
function saveOrder(){
 const items=S.d.map(d=>({d:d.id,q:Math.floor(+val('q'+d.id))||0,p:d.price,c:d.cost||0})).filter(i=>i.q>0);
 if(!items.length)return toast('Elige al menos un postre');
 for(const i of items){const d=S.d.find(x=>x.id==i.d);if(i.q>left(d))return toast('Solo quedan '+left(d)+' de '+d.name)}
 let cid=val('cl');
 if(cid=='n'){const n=val('nc').trim();if(!n)return toast('Escribe el nombre del cliente');cid=uid();S.c.push({id:cid,name:n,phone:''})}else cid=+cid;
 const total=items.reduce((a,i)=>a+i.q*i.p,0),pg=val('pg'),now=new Date().toISOString();let pays=[];
 if(pg!='p')pays=[{a:total,m:pg,t:now}];else{const a=Math.min(+val('am')||0,total);if(a>0)pays=[{a,m:val('mt'),t:now}]}
 S.o.push({id:uid(),c:cid,date:now,items,total,pays});done()}
function anular(id){modal('Anular pedido','<p>Se borra el pedido y los postres vuelven al inventario.</p>',[{t:'Cerrar',f:closeM,c:'g'},{t:'Anular pedido',f:()=>{S.o=S.o.filter(o=>o.id!=id);done()},c:'ok'}])}
function pay(id){const o=S.o.find(x=>x.id==id),b=bal(o);
 modal(esc(cname(o.c))+' debe '+money(b),`<label>Monto del abono (₡)</label><input id="am" type="number" inputmode="numeric" value="${b}"><label>Método</label><select id="mt"><option value="sinpe">SINPE</option><option value="efectivo">Efectivo</option></select>`,
 [{t:'Cerrar',f:closeM,c:'g'},{t:'Abonar',f:()=>doPay(id,0)},{t:'Cancelar cuenta',f:()=>doPay(id,1),c:'ok'}])}
function doPay(id,all){const o=S.o.find(x=>x.id==id),a=all?bal(o):Math.min(+val('am')||0,bal(o));if(a<=0)return toast('Escribe un monto');o.pays.push({a,m:val('mt'),t:new Date().toISOString()});done()}

/* Respaldo y exportación */
const today=()=>new Date().toISOString().slice(0,10),mth=m=>m=='sinpe'?'SINPE':'Efectivo';
function report(){const L=[],h=t=>L.push(['',0],[t,1]),pe=S.o.filter(o=>bal(o)>0);
 L.push(['DULCE CAPRICHO · Respaldo del '+fl(Date.now()),1]);
 h('INVENTARIO');S.d.forEach(d=>L.push([`${d.name} - ${money(d.price)} | preparados ${d.made} | vendidos ${sold(d.id)} | quedan ${left(d)}`,0]));
 h('POR COBRAR (total '+money(pe.reduce((a,o)=>a+bal(o),0))+')');pe.forEach(o=>L.push([`${cname(o.c)}: debe ${money(bal(o))} de ${money(o.total)} (${days(o)} días, pedido del ${fl(o.date)})`,0]));
 h('PEDIDOS');S.o.forEach(o=>L.push([`${fl(o.date)} ${cname(o.c)}: ${o.items.map(i=>i.q+' '+dn(i.d)).join(', ')} - ${money(o.total)} - ${bal(o)>0?'debe '+money(bal(o)):'pagado'}`,0]));
 h('PAGOS');S.o.forEach(o=>o.pays.forEach(p=>L.push([`${fl(p.t)} ${cname(o.c)}: ${money(p.a)} (${mth(p.m)})`,0])));
 h('CLIENTES');S.c.forEach(c=>L.push([c.name+(c.phone?' - '+c.phone:''),0]));return L}
function save2(ext,data){return dl2('dulce-capricho-'+today()+'.'+ext,data)}
async function dl2(filename,data){try{const type={txt:'text/plain',pdf:'application/pdf',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',json:'application/json'}[filename.split('.').pop()]||'application/octet-stream';const blob=new Blob([data],{type}),file=new File([blob],filename,{type});
 if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:filename});closeM();return}catch(e){if(e&&e.name=='AbortError')return}}
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);closeM()}catch(e){toast('No se pudo guardar el archivo')}}
const eTxt=()=>save2('txt',report().map(l=>l[0]).join('\n'));
function ePdf(){if(!window.jspdf)return toast('No cargó el generador de PDF. Revisa tu conexión');const doc=new jspdf.jsPDF();let y=16;
 report().forEach(([t,b])=>{doc.setFont('helvetica',b?'bold':'normal');doc.setFontSize(b?13:10);doc.splitTextToSize(t.replace(/₡/g,'CRC ').replace(/×/g,'x'),180).forEach(s=>{if(y>282){doc.addPage();y=16}doc.text(s,14,y);y+=b?7:5.5})});save2('pdf',doc.output('arraybuffer'))}
function eXls(){if(!window.XLSX)return toast('No cargó el generador de Excel. Revisa tu conexión');const wb=XLSX.utils.book_new(),add=(n,h,r)=>XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([h,...r]),n);
 add('Inventario',['Postre','Precio','Preparados','Vendidos','Quedan'],S.d.map(d=>[d.name,d.price,d.made,sold(d.id),left(d)]));
 add('Pedidos',['Fecha','Cliente','Detalle','Total','Pagado','Saldo','Días','Estado'],S.o.map(o=>[fl(o.date),cname(o.c),o.items.map(i=>i.q+' x '+dn(i.d)).join(', '),o.total,paid(o),bal(o),bal(o)>0?days(o):'',bal(o)>0?(days(o)>=15?'Vencida':'Pendiente'):'Pagado']));
 add('Pagos',['Fecha','Cliente','Monto','Método'],S.o.flatMap(o=>o.pays.map(p=>[fl(p.t),cname(o.c),p.a,mth(p.m)])));
 add('Clientes',['Nombre','Teléfono','Saldo pendiente'],S.c.map(c=>[c.name,c.phone||'',S.o.filter(o=>o.c==c.id).reduce((a,o)=>a+bal(o),0)]));
 save2('xlsx',XLSX.write(wb,{bookType:'xlsx',type:'array'}))}
const eJson=()=>save2('json',JSON.stringify(S));
function backup(){modal('Respaldo de datos',`<small>Tus datos están guardados solo en este teléfono. Haz respaldos seguido.</small><div class="row"><button class="b" onclick="eTxt()">Notas (TXT)</button><button class="b" onclick="ePdf()">PDF</button><button class="b" onclick="eXls()">Excel</button></div><label>Copia para restaurar</label><div class="row"><button class="b g" onclick="eJson()">Guardar copia (.json)</button></div><label>Restaurar desde una copia</label><input type="file" accept=".json" onchange="restore(this)">`,[{t:'Cerrar',f:closeM,c:'g'}])}
function restore(el){const f=el.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const o=JSON.parse(r.result);if(!Array.isArray(o.d)||!Array.isArray(o.o)||!Array.isArray(o.c))throw 0;S=norm(o);done();toast('Copia restaurada')}catch(e){toast('Ese archivo no es una copia válida')}};r.readAsText(f)}
const AU='leslie',AP='ginger',AK='dc-auth';
function chkAuth(){let ok=false;try{ok=localStorage.getItem(AK)=='1'}catch(e){}$('#lg').style.display=ok?'none':'flex'}
function login(){if(val('lu').trim().toLowerCase()==AU&&val('lp')==AP){try{localStorage.setItem(AK,'1')}catch(e){}$('#le').textContent='';$('#lu').value=$('#lp').value='';chkAuth()}else{$('#le').textContent='Usuario o contraseña incorrectos';$('#lp').value=''}}
function logout(){try{localStorage.removeItem(AK)}catch(e){}closeM();$('#lg').style.display='flex';scrollTo(0,0)}
let per='all';
const inPer=o=>{const t=new Date(o.date),n=new Date();if(per=='day')return t.toDateString()==n.toDateString();if(per=='week')return n-t<7*864e5;if(per=='month')return t.getMonth()==n.getMonth()&&t.getFullYear()==n.getFullYear();return true};
const icost=i=>i.c!=null?i.c:((S.d.find(x=>x.id==i.d)||{}).cost||0);
function resumen(){const os=S.o.filter(inPer),vend=os.reduce((a,o)=>a+o.total,0),cob=os.reduce((a,o)=>a+paid(o),0),cost=os.reduce((a,o)=>a+o.items.reduce((b,i)=>b+i.q*icost(i),0),0),hasC=S.d.some(d=>d.cost>0);
 const rows=S.d.map(d=>{const its=os.flatMap(o=>o.items.filter(i=>i.d==d.id));return{d,q:its.reduce((a,i)=>a+i.q,0),v:its.reduce((a,i)=>a+i.q*i.p,0),g:its.reduce((a,i)=>a+i.q*(i.p-icost(i)),0)}}).filter(r=>r.q>0);
 const opts=[['all','Todo'],['day','Hoy'],['week','7 días'],['month','Este mes']].map(x=>`<option value="${x[0]}"${per==x[0]?' selected':''}>${x[1]}</option>`).join('');
 return `<div class="cd"><div class="top"><b>Ventas y ganancias</b><select aria-label="Periodo" onchange="per=this.value;render()" style="width:auto;margin:0">${opts}</select></div><div class="sts"><div class="st"><small>Vendido</small><b>${money(vend)}</b></div><div class="st"><small>Cobrado</small><b>${money(cob)}</b></div><div class="st"><small>Ganancia</small><b>${hasC?money(vend-cost):'—'}</b></div></div>${hasC?'':'<small>Para ver la ganancia, toca cada postre y escribe cuánto cuesta hacerlo.</small>'}${rows.map(r=>`<div class="rs"><div class="top"><span><b>${r.q}</b> ${esc(r.d.name)}</span><span>${money(r.v)}</span></div>${hasC?`<small>Ganancia ${money(r.g)}</small>`:''}</div>`).join('')||'<p class="hint">Aún no hay ventas en este periodo.</p>'}</div>`}
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
chkAuth();render();boot();setInterval(render,60000);
