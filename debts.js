// Debt status is derived from linked transactions (ref = debt id), so wallets always match.
const Debts={
paid(d){return Store.s.tx.filter(t=>t.ref==d.id&&(t.type=='collect'||t.type=='payback')).reduce((a,t)=>a+t.amt,0)},
status(d){const p=this.paid(d);return p>=d.amt?'settled':p>0?'partial':'pending'},
add(kind){UI.modal(kind=='lend'?'Lend money':'Borrow money',[{k:'who',l:'Person'},{k:'amt',l:'Amount (৳)',t:'number'},{k:'wallet',l:kind=='lend'?'Paid from':'Received into',o:Wallets.opts()},{k:'date',l:'Date',t:'date',v:UI.today()}],
 v=>{const id=Store.id();Tx.add({type:kind,wallet:v.wallet,amt:v.amt,date:v.date,note:v.who,ref:id,cat:kind=='lend'?'Lent':'Borrowed'});Store.s.debts.push({id,kind,who:v.who,amt:+v.amt,date:v.date});Store.save()})},
settle(id){const d=Store.s.debts.find(x=>x.id==id),rem=d.amt-this.paid(d);
 UI.modal(d.kind=='lend'?'Receive repayment':'Repay loan',[{k:'amt',l:'Amount (max '+rem+')',t:'number',v:rem},{k:'wallet',l:'Wallet',o:Wallets.opts()},{k:'date',l:'Date',t:'date',v:UI.today()}],
 v=>{if(+v.amt>rem)throw Error('More than the remaining '+UI.fmt(rem));Tx.add({type:d.kind=='lend'?'collect':'payback',wallet:v.wallet,amt:v.amt,date:v.date,note:d.who,ref:id,cat:'Settlement'})})},
view(){const S=Store.s.debts,sum=k=>S.filter(d=>d.kind==k).reduce((a,d)=>a+d.amt-this.paid(d),0);
 return`<div class=card><div class=grid><div><small>To receive</small><b class=in>${UI.fmt(sum('lend'))}</b></div><div><small>To pay back</small><b class=out>${UI.fmt(sum('borrow'))}</b></div></div>
 <div class=row style="margin-top:10px"><button class=pri onclick="Debts.add('lend')">+ Lend</button><button onclick="Debts.add('borrow')">+ Borrow</button></div></div>`+
 S.map(d=>{const s=this.status(d);return`<div class="card row"><div>${d.who} <span class="tag ${s}">${s}</span><br><small class=mu>${d.kind=='lend'?'You lent':'You borrowed'} ${UI.fmt(d.amt)} · paid ${UI.fmt(this.paid(d))} · ${d.date}</small></div>${s=='settled'?'':`<button class=sm onclick="Debts.settle('${d.id}')">${d.kind=='lend'?'Collect':'Repay'}</button>`}</div>`}).join('')}};
