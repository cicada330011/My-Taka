// Google Sheets sync (Apps Script Web App) + offline JSON backup/restore.
const Sync={t:0,
rows(){return Store.s.tx.map(t=>[t.id,t.date,t.type,Wallets.name(t.wallet),t.to?Wallets.name(t.to):'',t.cat||'',t.amt,t.note||''])},
async push(silent){const u=Store.s.sheetUrl;if(!u)return alert('Paste your Apps Script Web App URL first.');
 try{await fetch(u,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify({header:['ID','Date','Type','Wallet','To','Category','Amount','Note'],rows:this.rows()})});
  localStorage.setItem('mt_last',new Date().toLocaleString());if(!silent){alert('Sent to Google Sheets');UI.render()}}catch(e){if(!silent)alert('Sync failed: '+e.message)}},
auto(){if(!Store.s.auto||!Store.s.sheetUrl)return;clearTimeout(this.t);this.t=setTimeout(()=>this.push(true),3000)},
setUrl(v){Store.s.sheetUrl=v.trim();localStorage.setItem(Store.key,JSON.stringify(Store.s))},
setAuto(v){Store.s.auto=v;Store.save()},
script:'function doPost(e){var d=JSON.parse(e.postData.contents),s=SpreadsheetApp.getActiveSheet();s.clear();s.appendRow(d.header);if(d.rows.length)s.getRange(2,1,d.rows.length,d.header.length).setValues(d.rows);return ContentService.createTextOutput("ok")}',
view(){return`<div class=card><h3>Google Sheets sync</h3><label>Apps Script Web App URL</label><input value="${Store.s.sheetUrl}" onchange="Sync.setUrl(this.value)" placeholder="https://script.google.com/macros/s/…/exec">
 <label><input type=checkbox style="width:auto" ${Store.s.auto?'checked':''} onchange="Sync.setAuto(this.checked)"> Auto-sync after each change</label>
 <div class=row><button class=pri onclick="Sync.push()">Sync now</button><small class=mu>Last: ${localStorage.getItem('mt_last')||'never'}</small></div>
 <details><summary class=mu>Setup script</summary><pre>${Sync.script}</pre><small class=mu>Sheet → Extensions → Apps Script → paste → Deploy → Web app (access: Anyone) → copy URL.</small></details></div>
 <div class="card"><h3>Backup</h3><div class=row><button onclick="Store.exportJSON()">Export JSON</button><button onclick="document.getElementById('imp').click()">Import JSON</button></div><input id=imp type=file accept=.json hidden onchange="if(confirm('Replace all current data?'))Store.importJSON(this.files[0])"></div>`}};
