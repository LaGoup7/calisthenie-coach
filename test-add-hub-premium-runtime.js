const fs=require('fs');
const vm=require('vm');
const path=require('path');
const {APP_SOURCE_FILES}=require('./test-app-source');
const failures=[];let checks=0;const ok=(c,m)=>{checks++;if(!c)failures.push(m);};
const store=new Map(),sessionStore=new Map();
const localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear()};
const sessionStorage={getItem:k=>sessionStore.has(k)?sessionStore.get(k):null,setItem:(k,v)=>sessionStore.set(k,String(v)),removeItem:k=>sessionStore.delete(k),clear:()=>sessionStore.clear()};
const appNode={innerHTML:'',dataset:{},classList:{add(){},remove(){},toggle(){}},querySelectorAll(){return[]}};
const document={visibilityState:'visible',hasFocus:()=>true,getElementById:id=>id==='app'?appNode:null,querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){},removeEventListener(){},documentElement:{style:{setProperty(){}},dataset:{},classList:{add(){},remove(){},toggle(){}}},body:{appendChild(){},classList:{add(){},remove(){},toggle(){}}},createElement:tag=>({tagName:String(tag).toUpperCase(),style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},appendChild(){},remove(){},click(){},setAttribute(){},getContext(){return null}})};
const sandbox={console,localStorage,sessionStorage,document,navigator:{serviceWorker:undefined,userAgent:'Node'},location:{origin:'https://kinetik.example',pathname:'/',search:'',href:'https://kinetik.example/'},history:{replaceState(){}},URL,URLSearchParams,Blob,FileReader:function(){},setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame:fn=>setTimeout(fn,0),cancelAnimationFrame:clearTimeout,confirm:()=>true,prompt:()=>null,alert(){},fetch:async()=>({ok:false,status:503,json:async()=>({})}),performance:{now:()=>Date.now()},indexedDB:undefined,crypto:global.crypto,queueMicrotask:fn=>fn(),Intl,atob,btoa,Uint8Array};
sandbox.window=sandbox;sandbox.self=sandbox;sandbox.window.addEventListener=()=>{};sandbox.window.removeEventListener=()=>{};sandbox.window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
vm.createContext(sandbox);
for(const file of APP_SOURCE_FILES)vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8'),sandbox,{filename:file});

const result=vm.runInContext(`(()=>{
  const now=Date.now();
  setActivities([
    {id:'last-run',date:new Date(now-3600000).toISOString(),type:'running',duration:42,distance:7.2,rpe:6,load:252},
    {id:'run-2',date:new Date(now-86400000).toISOString(),type:'running',duration:35,distance:6,rpe:5,load:175},
    {id:'swim-1',date:new Date(now-2*86400000).toISOString(),type:'swimming',duration:45,distance:1600,rpe:6,load:270},
    {id:'bike-1',date:new Date(now-3*86400000).toISOString(),type:'cycling',duration:60,distance:24,rpe:5,load:300}
  ]);
  state.addHubOpen=true;
  const hub=renderAddHubModal();
  const fav=addHubPreferredActivityIds(5);
  const before=JSON.stringify(getActivities()[0]);
  state.activityPresetType='running';
  state.activityPresetData={type:'running',duration:42,distance:7.2,rpe:6};
  const editor=renderActivityEditor();
  const after=JSON.stringify(getActivities()[0]);
  state.view='today';state.addHubOpen=false;state.activityPresetData=null;
  const today=renderToday();
  return {hub,fav,editor,before,after,today};
})()`,sandbox);

ok(result.hub.includes('Enregistrer quelque chose'),'premium hub heading missing');
ok(result.hub.includes('Reprendre la dernière activité'),'resume card missing');
ok(result.hub.includes('42 min · 7.2 km · RPE 6'),'resume summary missing');
ok(result.hub.includes('data-add-action="activity"'),'activity primary action missing');
ok(result.hub.includes('data-add-action="quick"'),'quick-log primary action missing');
ok(result.hub.includes('data-add-action="core"'),'core primary action missing');
ok(result.hub.includes('data-add-action="measure"'),'measurement primary action missing');
ok(result.hub.includes('data-add-action="plan"'),'planning secondary action missing');
ok(result.hub.includes('Plus d’activités'),'secondary activity disclosure missing');
ok(result.fav[0]==='running','most frequent activity is not ranked first');
ok(result.fav.includes('swimming')&&result.fav.includes('cycling'),'used sports are missing from quick sports');
ok(result.editor.includes('Reprendre une activité'),'repeat editor context missing');
ok(result.editor.includes('value="42"')&&result.editor.includes('value="7.2"')&&result.editor.includes('value="6"'),'repeat values are not prefilled');
ok(result.before===result.after,'repeat prefill mutated the previous activity');
ok(result.today.includes('id="openAddHub"'),'Today FAB does not open Add hub');
ok(!result.today.includes('core-cockpit')&&!result.today.includes('today-add-session-card'),'Today still exposes redundant Gainage or Add session shortcuts');
ok(result.hub.includes('data-add-action="core"')&&result.hub.includes('data-add-action="activity"'),'Add hub lost Gainage or Activity access');
const source=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');
ok(source.includes("if(e.target===addHubOverlay)"),'backdrop close behavior missing');
ok(source.includes("state.planningEditor=true"),'planning route is not wired');
const styles=fs.readFileSync(path.join(__dirname,'styles.css'),'utf8');
ok(styles.includes('v10.137 · Premium Add Hub'),'premium hub styles missing');
const pkg=JSON.parse(fs.readFileSync(path.join(__dirname,'package.json'),'utf8'));
ok(pkg.version==='10.144.0','package version mismatch');
if(failures.length){console.error(`ADD_HUB_PREMIUM_FAIL ${failures.length}/${checks}`);failures.forEach(x=>console.error('-',x));process.exit(1);}else console.log(`ADD_HUB_PREMIUM_OK ${checks} checks`);
