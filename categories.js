// Category CRUD, monthly report and exports.
const Cats={
form(id,type){const c=id?Store.s.cats.find(x=>x.id==id):{name:'',type:type||'expense'};
 UI.modal(id?'Edit category':'Add category',[{k:'name',l:'Name',v:c.name},{k:'type',l:'Type',o:[['income','Income'],['expense','Expense']],v:c.type}],
 v=>{if(id){Store.s.tx.forEach(t=>{if(t.cat==c.name)t.cat=v.name});Object.assign(c,v)}else Store.s.cats.push({id:Store.id(),...v});Store.save()})},
del(id){const c=Store.s.cats.find(x=>x.id==id);if(Store.s.tx.some(t=>t.cat==c.name))return alert('Category is used by transactions. Rename it instead.');Store.s.cats=Store.s.cats.filter(x=>x.id!=id);Store.save()},
csv(){const q=x=>'"'+String(x==null?'':x).replace(/"/g,'""')+'"';
 Store.download('transactions.csv',['Date,Type,Wallet,To,Category,Amount,Note',...Store.s.tx.map(t=>[t.date,t.type,Wallets.name(t.wallet),t.to?Wallets.name(t.to):'',t.cat,t.amt,t.note].map(q).join(','))].join('\n'),'text/csv')},
summary(){const m=Tx.month(UI.ym);Store.download('summary-'+UI.ym+'.txt',`Money summary ${UI.ym}\nOpening: ${m.open}\nIncome: ${m.inc}\nExpense: ${m.exp}\nOther (debt/savings): ${m.oth}\nClosing: ${m.close}\nNet balance now: ${Wallets.total()}\nSavings: ${Savings.saved()}`,'text/plain')},
view(){const by={};Store.s.tx.filter(t=>t.type=='expense'&&t.date.slice(0,7)==UI.ym).forEach(t=>by[t.cat]=(by[t.cat]||0)+t.amt);const mx=Math.max(1,...Object.values(by));
 const list=ty=>Store.s.cats.filter(c=>c.type==ty).map(c=>`<span class=tag>${c.name} <a onclick="Cats.form('${c.id}')">✎</a> <a onclick="Cats.del('${c.id}')">✕</a></span>`).join(' ');
 return`<div class=card><h3>Spending by category · ${UI.ym}</h3>${Object.entries(by).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class=row><span>${k}</span><b>${UI.fmt(v)}</b></div><div class=bar style="width:${v/mx*100}%"></div>`).join('')||'<p class=mu>No expenses this month.</p>'}</div>
 <div class=card><div class=row><h3>Categories</h3><button class="sm pri" onclick="Cats.form()">+ Add</button></div><p class=mu>Income</p>${list('income')}<p class=mu>Expense</p>${list('expense')}</div>
 <div class="card row"><button onclick="Cats.csv()">Export CSV</button><button onclick="Cats.summary()">Summary report</button></div>`}};
