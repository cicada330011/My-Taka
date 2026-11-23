// Balance = opening balance + effect of every transaction (computed, never drifts).
const Wallets={
get(id){return Store.s.wallets.find(w=>w.id==id)},
name(id){return(this.get(id)||{}).name||'?'},
bal(id){return Store.s.tx.reduce((a,t)=>a+Tx.eff(t,id),this.get(id).open)},
total(){return Store.s.wallets.reduce((a,w)=>a+this.bal(w.id),0)},
opts(){return Store.s.wallets.map(w=>[w.id,w.name])},
form(id){const w=id?this.get(id):{name:'',type:'cash',open:0};
 UI.modal(id?'Edit wallet':'Add wallet',[{k:'name',l:'Name',v:w.name},
 {k:'type',l:'Type',o:[['cash','Cash'],['mfs','Mobile banking (bKash…)'],['bank','Bank'],['credit','Credit card']],v:w.type},
 {k:'open',l:'Opening balance (credit card: negative = owed)',t:'number',v:w.open}],
 v=>{v.open=+v.open;if(id)Object.assign(w,v);else Store.s.wallets.push({id:Store.id(),...v});Store.save()})},
transfer(){UI.modal('Transfer',[{k:'amt',l:'Amount',t:'number'},{k:'wallet',l:'From',o:this.opts()},{k:'to',l:'To',o:this.opts()},{k:'date',l:'Date',t:'date',v:UI.today()}],
 v=>Tx.add({...v,type:'transfer',note:'Transfer'}))},
remove(id){if(Store.s.tx.some(t=>t.wallet==id||t.to==id))return alert('This wallet has transactions and cannot be deleted.');
 if(confirm('Delete wallet?')){Store.s.wallets=Store.s.wallets.filter(w=>w.id!=id);Store.save()}},
view(){return`<div class=card><div class=row><h3>Wallets</h3><button class="sm pri" onclick="Wallets.form()">+ Add</button></div>`+
 Store.s.wallets.map(w=>{const b=this.bal(w.id);return`<div class=row style="padding:8px 0;border-top:1px solid var(--line)"><div>${w.name}<br><small class=mu>${w.type}</small></div>
 <div style="text-align:right"><b class="${b<0?'out':''}">${UI.fmt(b)}</b><br><button class=sm onclick="Wallets.form('${w.id}')">Edit</button> <button class=sm onclick="Wallets.remove('${w.id}')">✕</button></div></div>`}).join('')+`</div>`}};
