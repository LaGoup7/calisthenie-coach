const fs=require('fs');
const vm=require('vm');
const {APP_SOURCE_FILES}=require('./test-app-source');

const failures=[];let checks=0;const ok=(cond,msg)=>{checks++;if(!cond)failures.push(msg);};
const store=new Map(),sessionStore=new Map();
const localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear()};
const sessionStorage={getItem:k=>sessionStore.has(k)?sessionStore.get(k):null,setItem:(k,v)=>sessionStore.set(k,String(v)),removeItem:k=>sessionStore.delete(k),clear:()=>sessionStore.clear()};
const appNode={innerHTML:'',dataset:{},classList:{add(){},remove(){},toggle(){}},querySelectorAll(){return[]}};
const document={visibilityState:'hidden',hasFocus:()=>false,getElementById:id=>id==='app'?appNode:null,querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){},removeEventListener(){},documentElement:{style:{setProperty(){}},dataset:{},classList:{add(){},remove(){},toggle(){}}},body:{appendChild(){},classList:{add(){},remove(){},toggle(){}}},createElement:tag=>({tagName:String(tag).toUpperCase(),style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},appendChild(){},remove(){},click(){},setAttribute(){},getContext(){return null}})};
const sandbox={console,localStorage,sessionStorage,document,navigator:{serviceWorker:undefined,userAgent:'Node'},location:{origin:'https://kinetik.example',pathname:'/',search:'',href:'https://kinetik.example/'},history:{replaceState(){}},URL,URLSearchParams,Blob,FileReader:function(){},setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame:fn=>setTimeout(fn,0),cancelAnimationFrame:clearTimeout,confirm:()=>true,prompt:()=>null,alert(){},fetch:async()=>({ok:false,status:503,json:async()=>({})}),performance:{now:()=>Date.now()},indexedDB:undefined,crypto:global.crypto,queueMicrotask:fn=>fn(),Intl,atob,btoa,Uint8Array};
sandbox.window=sandbox;sandbox.self=sandbox;sandbox.window.addEventListener=()=>{};sandbox.window.removeEventListener=()=>{};sandbox.window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
vm.createContext(sandbox);

for(const file of APP_SOURCE_FILES){
  const source=fs.readFileSync(__dirname+'/'+file,'utf8');
  ok(source.length>100,`${file} is unexpectedly empty`);
  try{vm.runInContext(source,sandbox,{filename:file});ok(true,`${file} executed`);}catch(error){ok(false,`${file} failed as separate classic script: ${error.message}`);break;}
}
try{vm.runInContext(fs.readFileSync(__dirname+'/daily-tasks.js','utf8'),sandbox,{filename:'daily-tasks.js'});ok(true,'daily-tasks.js executed after modular app');}catch(error){ok(false,'daily-tasks.js failed after modular app: '+error.message);}

const coreLines=fs.readFileSync(__dirname+'/app.js','utf8').split(/\r?\n/).length;
ok(coreLines<5000,`app.js is still too large (${coreLines} lines)`);

for(const file of APP_SOURCE_FILES){
  const source=fs.readFileSync(__dirname+'/'+file,'utf8');
  const names=new Map();
  const re=/^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/gm;let m;
  while((m=re.exec(source)))names.set(m[1],(names.get(m[1])||0)+1);
  const duplicates=[...names.entries()].filter(([,count])=>count>1);
  ok(duplicates.length===0,`${file} contains duplicate function declarations: ${duplicates.map(x=>x[0]).join(', ')}`);
}

try{
  const result=vm.runInContext(`(()=>{
    state.view='today';const today=renderToday();
    state.view='measurements';const measurements=renderMeasurements();
    state.view='profile';const profile=renderProfile();const push=renderWebPushSettings();
    state.view='today';render();
    return {today,measurements,profile,push,painted:document.getElementById('app')?.innerHTML?.length||0};
  })()`,sandbox,{filename:'step14-render-smoke.js'});
  ok(/À faire aujourd’hui|Parcours du jour/.test(result.today),'final Today renderer unavailable after module split');
  ok(result.measurements.includes('openBodySettings'),'Measurements renderer unavailable after module split');
  ok(/Rappels|Profil|Réglages/.test(result.profile),'Profile/settings renderer unavailable after module split');
  ok(typeof result.push==='string','Web Push settings renderer unavailable after module split');
  ok(result.painted>100,'top-level render no longer paints app after module split');
}catch(error){ok(false,'final render smoke test crashed: '+error.message);}

const html=fs.readFileSync(__dirname+'/index.html','utf8');
let last=-1;
for(const file of APP_SOURCE_FILES){const pos=html.indexOf(`${file}?v=10.143`);ok(pos>=0,`${file} missing from index.html`);ok(pos>last,`${file} is out of load order`);last=pos;}
const sw=fs.readFileSync(__dirname+'/sw.js','utf8');
for(const file of APP_SOURCE_FILES)ok(sw.includes(`./${file}?v=10.143`),`${file} missing from service-worker precache`);
ok(sw.includes("kinetik-v10-143-planning-final"),'v10.132 modularization cache missing');
const pkg=JSON.parse(fs.readFileSync(__dirname+'/package.json','utf8'));ok(pkg.version==='10.143.0','package version is not 10.143.0');

if(failures.length){console.error(`STEP14_RUNTIME_FAIL ${failures.length}/${checks}`);failures.forEach(x=>console.error('-',x));process.exit(1);}else console.log(`STEP14_RUNTIME_OK ${checks} checks`);
