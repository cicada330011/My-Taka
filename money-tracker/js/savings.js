// Savings leave the wallets (type 'save') so they cannot be spent. Only 'unlock' returns them, and only while unlocked.
const Savings={
saved(){return Store.s.tx.reduce((a,t)=>t.type=='save'?a+t.amt:t.type=='unlock'?a-t.amt:a,0)},
month(){const m=UI.today().slice(0,7);return Store.s.tx.filter(t=>t.type=='save'&&t.date.slice(0,7)==m).reduce((a,t)=>a+t.amt,0)},
allocate(){UI.modal('Add to savings',[{k:'amt',l:'Amount (৳)',t:'number'},{k:'wallet',l:'From wallet',o:Wallets.opts()},{k:'date',l:'Date',t:'date',v:UI.today()}],v=>Tx.add({...v,type:'save',cat:'Savings',note:'Monthly savings'}))},
withdraw(){if(Store.s.locked)return alert('Savings are locked. Unlock first.');
 UI.modal('Withdraw savings',[{k:'amt',l:'Amount (৳)',t:'number'},{k:'wallet',l:'To wallet',o:Wallets.opts()},{k:'date',l:'Date',t:'date',v:UI.today()}],
 v=>{Tx.add({...v,type:'unlock',cat:'Savings',note:'Savings withdrawal'});Store.s.locked=true;Store.save()})},
toggle(){if(Store.s.locked){if(prompt('Type UNLOCK to unlock your savings')!=='UNLOCK')return;Store.s.locked=false}else Store.s.locked=true;Store.save()},
goal(){UI.modal('Monthly savings goal',[{k:'g',l:'Goal (৳)',t:'number',v:Store.s.goal}],v=>{Store.s.goal=+v.g;Store.save()})},
view(){const L=Store.s.locked,m=this.month(),g=Store.s.goal,p=g?Math.min(100,m/g*100):0;
 return`<div class=card><small class=mu>${L?'🔒 Locked':'🔓 Unlocked'}</small><h1>${UI.fmt(this.saved())}</h1>
 <div class=row style="margin:10px 0"><button class=pri onclick="Savings.allocate()">+ Save</button><button onclick="Savings.withdraw()">Withdraw</button><button onclick="Savings.toggle()">${L?'Unlock':'Lock'}</button></div></div>
 <div class=card><div class=row><span>This month: ${UI.fmt(m)} / ${UI.fmt(g)}</span><button class=sm onclick="Savings.goal()">Set goal</button></div><div class=bar style="width:${p}%;background:var(--ac)"></div></div>
 <p class=mu style="padding:0 6px">Saved money is removed from your wallet balances and can’t be used for expenses. Withdrawing requires unlocking, and it re-locks afterwards.</p>`}};
