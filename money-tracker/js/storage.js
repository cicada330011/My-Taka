// Central state + persistence. All modules read/write Store.s then call Store.save().
const Store={key:'moneytracker.v1',s:null,
def(){const c=(t,n)=>n.map(x=>({id:Store.id(),name:x,type:t}));
 return{wallets:[{id:'cash',name:'Cash',type:'cash',open:0},{id:'bkash',name:'bKash',type:'mfs',open:0}],
 cats:[...c('income',['Salary','Business','Gift']),...c('expense',['Food','Transport','Bills','Shopping','Health','Rent'])],
 tx:[],debts:[],goal:0,locked:true,sheetUrl:'',auto:false}},
id(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6)},
load(){try{this.s=JSON.parse(localStorage.getItem(this.key))}catch(e){}this.s=this.s||this.def()},
save(){localStorage.setItem(this.key,JSON.stringify(this.s));window.UI&&UI.render();window.Sync&&Sync.auto()},
download(name,text,mime){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:mime}));a.download=name;a.click()},
exportJSON(){this.download('backup-'+UI.today()+'.json',JSON.stringify(this.s,null,2),'application/json')},
importJSON(file){if(!file)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.wallets||!d.tx)throw 0;this.s=d;this.save()}catch(e){alert('Invalid backup file')}};r.readAsText(file)}};
