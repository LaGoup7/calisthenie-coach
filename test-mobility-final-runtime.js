const fs=require('fs'),vm=require('vm');const {APP_SOURCE_FILES}=require('./test-app-source');
const failures=[];let checks=0;const ok=(v,m)=>{checks++;if(!v)failures.push(m)};
const store=new Map(),sessionStore=new Map();
const localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear()};
const sessionStorage={getItem:k=>sessionStore.has(k)?sessionStore.get(k):null,setItem:(k,v)=>sessionStore.set(k,String(v)),removeItem:k=>sessionStore.delete(k),clear:()=>sessionStore.clear()};
const appNode={innerHTML:'',dataset:{},classList:{add(){},remove(){},toggle(){}},querySelectorAll(){return[]}};
const document={visibilityState:'hidden',hasFocus:()=>false,getElementById:id=>id==='app'?appNode:null,querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){},removeEventListener(){},documentElement:{style:{setProperty(){}},dataset:{},classList:{add(){},remove(){},toggle(){}}},body:{appendChild(){},classList:{add(){},remove(){},toggle(){}}},createElement:tag=>({tagName:String(tag).toUpperCase(),style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},appendChild(){},remove(){},click(){},setAttribute(){},getContext(){return null}})};
const sandbox={console,localStorage,sessionStorage,document,navigator:{serviceWorker:undefined,userAgent:'Node'},location:{origin:'https://kinetik.example',pathname:'/',search:'',href:'https://kinetik.example/'},history:{replaceState(){}},URL,URLSearchParams,Blob,FileReader:function(){},setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame:fn=>setTimeout(fn,0),cancelAnimationFrame:clearTimeout,confirm:()=>true,prompt:()=>null,alert(){},fetch:async()=>({ok:false,status:503,json:async()=>({})}),performance:{now:()=>Date.now()},indexedDB:undefined,crypto:global.crypto,queueMicrotask:fn=>fn(),Intl,atob,btoa,Uint8Array};sandbox.window=sandbox;sandbox.self=sandbox;sandbox.window.addEventListener=()=>{};sandbox.window.removeEventListener=()=>{};sandbox.window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});vm.createContext(sandbox);
for(const file of APP_SOURCE_FILES)vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),sandbox,{filename:file});
const result=vm.runInContext(`(()=>{
  const day=(offset)=>{const d=new Date();d.setDate(d.getDate()+offset);d.setHours(12,0,0,0);return d.toISOString()};
  state.view='flexibility';state.mobilityChartZone='ankles';setMobilityTests([]);setFlexLogs([]);
  const empty=renderFlexibility();
  setMobilityTests([{id:1,date:day(0),testId:'ankle_left',value:9},{id:2,date:day(0),testId:'ankle_right',value:10}]);
  const baseline=renderFlexibility();
  setMobilityTests([{id:1,date:day(-35),testId:'ankle_left',value:7},{id:2,date:day(-35),testId:'ankle_right',value:7.5}]);
  const stale=renderFlexibility();
  setMobilityTests([
    {id:1,date:day(-35),testId:'ankle_left',value:7},{id:2,date:day(-35),testId:'ankle_right',value:7.5},
    {id:3,date:day(0),testId:'ankle_left',value:10},{id:4,date:day(0),testId:'ankle_right',value:10}
  ]);
  const evolved=renderFlexibility();
  setFlexLogs([{id:88,date:day(0),name:'Routine ciblée',durationMinutes:12,comfort:4,entries:[]}]);
  const done=renderFlexibility();
  return {empty,baseline,stale,evolved,done,levels:[v10145MobilityLevel(40).label,v10145MobilityLevel(55).label,v10145MobilityLevel(70).label,v10145MobilityLevel(85).label,v10145MobilityLevel(95).label]};
})()`,sandbox);
ok(result.empty.includes('Ton bilan mobilité')&&result.empty.includes('6 zones · une lecture simple'),'merged mobility balance missing');
ok(result.empty.includes('id="mobilityAssessment"'),'daily-task mobility assessment anchor missing');
ok(result.empty.includes('mob-test-group')&&result.empty.includes('id="mob_ankle_left"'),'zone assessment inputs are not integrated into balance');
ok(!result.empty.includes('mob79-assessment'),'old separate assessment block still rendered');
ok(result.empty.includes('Récupération')&&!result.empty.includes('>Recovery<'),'user-facing Recovery vocabulary not translated');
ok(result.empty.includes('Zone à travailler'),'zone vocabulary missing');
ok(result.empty.includes('Comprendre')&&result.empty.includes('Comment KINETIK choisit les recommandations'),'methodology was not moved to secondary level');
ok(result.empty.includes('Préférences mobilité')&&result.empty.includes('Ne force jamais une amplitude douloureuse'),'settings/safety secondary content missing');
ok(result.baseline.includes('Première référence')&&result.baseline.includes('Une seule date de mesure'),'single-measure progression state missing');
ok(!result.baseline.includes('<svg viewBox="0 0 760 230"'),'single-measure state should not render a misleading chart');
ok(result.stale.includes('À actualiser')&&result.stale.includes('35 j'),'stale mobility freshness missing');
ok(result.evolved.includes('Depuis la première référence')&&result.evolved.includes('mob-chart'),'multi-measure progression summary/chart missing');
ok(result.done.includes('Routine terminée aujourd’hui')&&result.done.includes('confort 4/5'),'today mobility completion state missing');
ok(result.levels.join('|')==='À travailler|À améliorer|Correcte|Bonne|Excellente','mobility score vocabulary thresholds incorrect');
const progress=fs.readFileSync(__dirname+'/app-progress.js','utf8'),styles=fs.readFileSync(__dirname+'/styles.css','utf8');
ok(progress.includes('V10.145 · Mobility finalisation'),'v10.146 mobility runtime marker missing');
ok(styles.includes('KINETIK v10.145 · Mobility finalisation'),'v10.146 mobility CSS marker missing');
if(failures.length){console.error(`MOBILITY_FINAL_FAIL ${failures.length}/${checks}`);failures.forEach(x=>console.error('-',x));process.exit(1)}console.log(`MOBILITY_FINAL_OK ${checks} checks`);
