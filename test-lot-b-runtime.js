const fs=require('fs');
const vm=require('vm');
const path=require('path');
const {APP_SOURCE_FILES}=require('./test-app-source');
const failures=[];let checks=0;const ok=(cond,msg)=>{checks++;if(!cond)failures.push(msg);};
const store=new Map(),sessionStore=new Map();
const localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear()};
const sessionStorage={getItem:k=>sessionStore.has(k)?sessionStore.get(k):null,setItem:(k,v)=>sessionStore.set(k,String(v)),removeItem:k=>sessionStore.delete(k),clear:()=>sessionStore.clear()};
const appNode={innerHTML:'',dataset:{},classList:{add(){},remove(){},toggle(){}},querySelectorAll(){return[]}};
const document={visibilityState:'visible',hasFocus:()=>true,getElementById:id=>id==='app'?appNode:null,querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){},removeEventListener(){},documentElement:{style:{setProperty(){}},dataset:{},classList:{add(){},remove(){},toggle(){}}},body:{appendChild(){},classList:{add(){},remove(){},toggle(){}}},createElement:tag=>({tagName:String(tag).toUpperCase(),style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},appendChild(){},remove(){},click(){},setAttribute(){},getContext(){return null}})};
const sandbox={console,localStorage,sessionStorage,document,navigator:{serviceWorker:undefined,userAgent:'Node'},location:{origin:'https://kinetik.example',pathname:'/',search:'',href:'https://kinetik.example/'},history:{replaceState(){}},URL,URLSearchParams,Blob,FileReader:function(){},setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame:fn=>setTimeout(fn,0),cancelAnimationFrame:clearTimeout,confirm:()=>true,prompt:()=>null,alert(){},fetch:async()=>({ok:false,status:503,json:async()=>({})}),performance:{now:()=>Date.now()},indexedDB:undefined,crypto:global.crypto,queueMicrotask:fn=>fn(),Intl,atob,btoa,Uint8Array};
sandbox.window=sandbox;sandbox.self=sandbox;sandbox.window.addEventListener=()=>{};sandbox.window.removeEventListener=()=>{};sandbox.window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
vm.createContext(sandbox);
for(const file of APP_SOURCE_FILES)vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8'),sandbox,{filename:file});

const ui=vm.runInContext(`(()=>{
  state.stravaStatus={checked:true,loading:false,connected:false,athlete:null,scope:''};
  const today=renderToday();
  const reminders=renderReminderSettings();
  const settings=renderSettings();
  const profile=renderMore();
  return {today,reminders,settings,profile,workoutAction:todayAgendaAction({kind:'workout',action:{type:'workout-start',label:'Démarrer'}})};
})()`,sandbox);

// Today: one intent = one action surface.
ok(ui.today.includes('today-primary-shortcuts'),'Today shortcuts container missing');
ok(ui.today.includes('core-cockpit')&&ui.today.includes('today-add-session-card'),'Rank/Gainage/Session shortcut row is incomplete');
ok(ui.today.includes('id="openAddHub"'),'global Add hub FAB missing from Today');
ok((ui.today.match(/today-add-session-card/g)||[]).length===1,'Today session shortcut is duplicated');
ok(ui.workoutAction==='','workout agenda still duplicates the workout hero CTA');
ok(ui.today.includes('id="startWorkout"'),'workout hero lost its primary start action');

// Notifications: simple primary controls, progressive technical detail.
ok(ui.reminders.includes('<h2>Rappels</h2>'),'simplified Rappels heading missing');
ok(ui.reminders.includes('id="reminderPreferredTime"')&&ui.reminders.includes('id="localReminderSnooze"')&&ui.reminders.includes('id="localWorkoutFollowup"'),'primary notification controls missing');
ok(ui.reminders.includes('Détails appareil')&&ui.reminders.includes('Avancé & support'),'technical notification detail is not progressively disclosed');
ok(!ui.reminders.includes('Historique des décisions'),'decision history still pollutes notification settings');
ok(ui.settings.includes('Journal du parcours'),'decision history journal was not moved to the Data section');

// Profile and integrations.
ok(!ui.profile.includes('Apple Santé'),'inactive Apple Health integration is still shown in Profile');
ok(ui.profile.includes('Strava'),'Strava connection surface disappeared while removing Apple Health');

// Routing contract: only Profile and Settings are primary profile routes.
const appSource=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');
ok(appSource.includes('state.view === "settings") app.innerHTML = renderSettings()'),'Settings route does not use renderSettings');
ok(!appSource.includes('state.view === "profile"')&&!appSource.includes('state.view === "more"'),'retired profile/more route aliases still exist');
ok(appSource.includes("state.view='athlete';render();alert('Sauvegarde restaurée avec succès.')"),'backup import still routes to a retired profile alias');
const bodySource=fs.readFileSync(path.join(__dirname,'app-body.js'),'utf8');
ok(bodySource.includes("state.view==='settings'"),'install prompt does not target the Settings route');

// PWA/version and Vercel Hobby invariant.
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8'),sw=fs.readFileSync(path.join(__dirname,'sw.js'),'utf8'),pkg=JSON.parse(fs.readFileSync(path.join(__dirname,'package.json'),'utf8'));
ok(html.includes('app.js?v=10.137')&&html.includes('account-manager.js?v=10.137'),'v10.137 asset chain missing');
ok(sw.includes('kinetik-v10-137-quick-log-journal')&&sw.includes('app-journey.js?v=10.137'),'v10.137 PWA cache missing');
ok(pkg.version==='10.137.0','package version is not 10.137.0');
ok(fs.readFileSync(path.join(__dirname,'styles.css'),'utf8').includes('v10.132 · Lot B'),'Lot B styles missing');
const apiFiles=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,e.name);if(e.isDirectory())walk(full);else if(e.isFile()&&e.name.endsWith('.js'))apiFiles.push(full);}}walk(path.join(__dirname,'api'));
ok(apiFiles.length===12,`Vercel Hobby function count changed: ${apiFiles.length}`);

if(failures.length){console.error(`LOT_B_RUNTIME_FAIL ${failures.length}/${checks}`);failures.forEach(x=>console.error('-',x));process.exit(1);}else console.log(`LOT_B_RUNTIME_OK ${checks} checks`);
