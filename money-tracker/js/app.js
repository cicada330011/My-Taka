// UI shell: tabs, modal form helper, formatting, render loop.
const UI={tab:'home',ym:null,
today(){return new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10)},
fmt(n){return(n<0?'-':'')+'৳'+new Intl.NumberFormat('en-IN',{maximumFractionDigits:2}).format(Math.abs(n))},
mo(d){const[y,m]=this.ym.split('-');const x=new Date(y,m-1+d,1);this.ym=x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0');this.render()},
go(t){this.tab=t;this.render()},
modal(title,fields,ok){const d=document.getElementById('modal');
 d.innerHTML=`<form class=card><h3>${title}</h3>${fields.map(f=>`<label>${f.l}${f.o?`<select name=${f.k}>${f.o.map(o=>`<option value="${o[0]}" ${o[0]==f.v?'selected':''}>${o[1]}</option>`).join('')}</select>`:`<input name=${f.k} type=${f.t||'text'} value="${f.v==null?'':f.v}" step=any ${f.r===false?'':'required'}>`}</label>`).join('')}
 <div class=row><button type=button onclick="modal.close()">Cancel</button><button class=pri>Save</button></div></form>`;
 d.querySelector('form').onsubmit=e=>{e.preventDefault();try{ok(Object.fromEntries(new FormData(e.target)));d.close()}catch(x){alert(x.message)}};d.showModal()},
home(){const m=Tx.month(this.ym);
 return`<div class=card><div class=row><button class=sm onclick="UI.mo(-1)">‹</button><b>${this.ym}</b><button class=sm onclick="UI.mo(1)">›</button></div><div class=grid style="margin-top:10px">
 <div><small>Opening</small><b>${UI.fmt(m.open)}</b></div><div><small>Income</small><b class=in>${UI.fmt(m.inc)}</b></div><div><small>Expense</small><b class=out>${UI.fmt(m.exp)}</b></div><div><small>Closing (rolls over)</small><b>${UI.fmt(m.close)}</b></div></div></div>
 <div class="card row"><button class=pri onclick="Tx.form('income')">+ Income</button><button class=pri onclick="Tx.form('expense')">+ Expense</button><button onclick="Wallets.transfer()">Transfer</button></div>`+Wallets.view()},
render(){const t=document.getElementById('total');if(!t)return;t.textContent=this.fmt(Wallets.total());
 const v={home:()=>this.home(),ledger:()=>Tx.view(),debts:()=>Debts.view(),savings:()=>Savings.view(),more:()=>Cats.view()+Sync.view()};
 document.getElementById('view').innerHTML=v[this.tab]();
 document.getElementById('nav').innerHTML=[['home','Home'],['ledger','Ledger'],['debts','Debts'],['savings','Savings'],['more','More']].map(x=>`<button class="${x[0]==this.tab?'on':''}" onclick="UI.go('${x[0]}')">${x[1]}</button>`).join('')}};
Store.load();UI.ym=UI.today().slice(0,7);UI.render();
