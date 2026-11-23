// Every money movement is one record in Store.s.tx. SIGN = effect on the wallet.
const SIGN={income:1,expense:-1,lend:-1,borrow:1,collect:1,payback:-1,save:-1,unlock:1};
const Tx={f:{from:'',to:'',wallet:'',cat:''},
eff(t,w){if(t.type=='transfer')return t.wallet==w?-t.amt:t.to==w?t.amt:0;return t.wallet==w?SIGN[t.type]*t.amt:0},
add(t){t.amt=+t.amt;if(!(t.amt>0))throw Error('Enter an amount above 0');
 const w=Wallets.get(t.wallet);
 if(t.type=='transfer'&&t.wallet==t.to)throw Error('Pick two different wallets');
 if(t.type=='unlock'){if(Store.s.locked)throw Error('Savings are locked');if(t.amt>Savings.saved())throw Error('More than saved amount')}
 if((t.type=='transfer'||SIGN[t.type]<0)&&w.type!='credit'&&Wallets.bal(w.id)<t.amt)throw Error('Insufficient balance in '+w.name);
 Store.s.tx.push({id:Store.id(),date:UI.today(),note:'',...t});Store.save()},
del(id){if(confirm('Delete entry?')){Store.s.tx=Store.s.tx.filter(t=>t.id!=id);Store.save()}},
form(type){const cats=Store.s.cats.filter(c=>c.type==type).map(c=>[c.name,c.name]);
 UI.modal(type=='income'?'Add income':'Add expense',[{k:'amt',l:'Amount (৳)',t:'number'},{k:'wallet',l:'Wallet',o:Wallets.opts()},{k:'cat',l:'Category',o:cats},{k:'date',l:'Date',t:'date',v:UI.today()},{k:'note',l:'Note',r:false}],v=>Tx.add({...v,type}))},
// Monthly rollover: opening = opening balances + all non-transfer flow before the month.
month(ym){const S=Store.s,st=ym+'-01';let open=S.wallets.reduce((a,w)=>a+w.open,0),inc=0,exp=0,oth=0;
 S.tx.filter(t=>t.type!='transfer').forEach(t=>{const e=SIGN[t.type]*t.amt;if(t.date<st)open+=e;else if(t.date.slice(0,7)==ym){t.type=='income'?inc+=e:t.type=='expense'?exp-=e:oth+=e}});
 return{open,inc,exp,oth,close:open+inc-exp+oth}},
rows(){const f=this.f;return Store.s.tx.filter(t=>(!f.from||t.date>=f.from)&&(!f.to||t.date<=f.to)&&(!f.wallet||t.wallet==f.wallet||t.to==f.wallet)&&(!f.cat||t.cat==f.cat)).sort((a,b)=>b.date.localeCompare(a.date))},
set(k,v){this.f[k]=v;UI.render()},
view(){const f=this.f,rows=this.rows(),W=f.wallet?[f.wallet]:Store.s.wallets.map(w=>w.id),days={};
 const base=W.reduce((a,id)=>a+Wallets.get(id).open,0);
 rows.forEach(t=>{const d=days[t.date]=days[t.date]||{i:0,o:0},e=W.reduce((a,w)=>a+Tx.eff(t,w),0);e>0?d.i+=e:d.o-=e});
 const run=dt=>Store.s.tx.filter(t=>t.date<=dt).reduce((a,t)=>a+W.reduce((x,w)=>x+Tx.eff(t,w),0),base);
 const sel=(k,o,ph)=>`<select onchange="Tx.set('${k}',this.value)"><option value="">${ph}</option>${o.map(x=>`<option value="${x[0]}" ${f[k]==x[0]?'selected':''}>${x[1]}</option>`).join('')}</select>`;
 return`<div class=card><h3>Daily cash flow</h3><div class=filters><input type=date value="${f.from}" onchange="Tx.set('from',this.value)"><input type=date value="${f.to}" onchange="Tx.set('to',this.value)">
 ${sel('wallet',Wallets.opts(),'All wallets')}${sel('cat',[...new Set(Store.s.cats.map(c=>c.name))].map(x=>[x,x]),'All categories')}</div></div>
 <div class="card scroll"><table><tr><th>Date</th><th>In</th><th>Out</th><th>Balance</th></tr>${Object.keys(days).sort().reverse().map(d=>`<tr><td>${d}</td><td class=in>${UI.fmt(days[d].i)}</td><td class=out>${UI.fmt(days[d].o)}</td><td>${UI.fmt(run(d))}</td></tr>`).join('')||'<tr><td>No entries yet</td></tr>'}</table></div>
 <div class=card>${rows.map(t=>{const e=W.reduce((a,w)=>a+Tx.eff(t,w),0),del=['income','expense','transfer'].includes(t.type);
 return`<div class=row style="padding:6px 0;border-bottom:1px solid var(--line)"><div>${t.cat||t.type}<br><small class=mu>${t.date} · ${Wallets.name(t.wallet)}${t.to?' → '+Wallets.name(t.to):''} ${t.note||''}</small></div><div><b class="${e>=0?'in':'out'}">${t.type=='transfer'&&W.length>1?UI.fmt(t.amt):UI.fmt(e)}</b> ${del?`<button class=sm onclick="Tx.del('${t.id}')">✕</button>`:''}</div></div>`}).join('')||'<p class=mu>Nothing matches these filters.</p>'}</div>`}};
