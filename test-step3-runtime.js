const fs=require('fs');
const {loadAppSource}=require('./test-app-source');
const vm=require('vm');
const source=loadAppSource(__dirname);
const dailySource=fs.readFileSync(__dirname+'/daily-tasks.js','utf8');
const store=new Map();
const localStorage={
  getItem:k=>store.has(k)?store.get(k):null,
  setItem:(k,v)=>store.set(k,String(v)),
  removeItem:k=>store.delete(k),
  clear:()=>store.clear()
};
const appNode={innerHTML:'',dataset:{},classList:{add(){},remove(){},toggle(){}},querySelectorAll(){return[]}};
const document={
  getElementById:id=>id==='app'?appNode:null,
  querySelectorAll:()=>[], querySelector:()=>null,
  addEventListener(){}, removeEventListener(){},
  documentElement:{style:{setProperty(){}},dataset:{},classList:{add(){},remove(){},toggle(){}}},
  body:{classList:{add(){},remove(){},toggle(){}}},
  createElement:tag=>({tagName:tag.toUpperCase(),style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},appendChild(){},remove(){},click(){},setAttribute(){},getContext(){return null}})
};
const sessionStore=new Map();
const sessionStorage={getItem:k=>sessionStore.has(k)?sessionStore.get(k):null,setItem:(k,v)=>sessionStore.set(k,String(v)),removeItem:k=>sessionStore.delete(k),clear:()=>sessionStore.clear()};
const sandbox={
  console,localStorage,sessionStorage,document,navigator:{},location:{origin:'http://localhost',pathname:'/',search:''},history:{replaceState(){}},
  URL:global.URL,URLSearchParams:global.URLSearchParams, Blob:global.Blob, FileReader:function(){},
  setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame:fn=>setTimeout(fn,0),cancelAnimationFrame:clearTimeout,
  confirm:()=>true,prompt:()=>null,fetch:async()=>({ok:false,json:async()=>({})}),
  performance:{now:()=>Date.now()},indexedDB:undefined,crypto:global.crypto,
};
sandbox.window=sandbox;
sandbox.window.addEventListener=()=>{};
sandbox.window.removeEventListener=()=>{};
sandbox.window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
sandbox.self=sandbox.window;
vm.createContext(sandbox);
const tests=`
(function(){
  const failures=[]; const ok=(cond,msg)=>{if(!cond)failures.push(msg);};
  localStorage.clear();
  state.view='measurements'; state.bodyEditor=false; state.bodySettingsOpen=false;
  const empty=renderMeasurements();
  ok(empty.includes('id="bodySettings"'),'settings panel missing from empty Measurements state');
  ok(empty.includes('id="openBodySettings"'),'settings shortcut missing from header');
  ok(empty.includes('Fréquences · objectifs · champs suivis'),'settings summary missing');

  const oldGet=document.getElementById,oldQuery=document.querySelectorAll;
  document.getElementById=id=>({bodyFatFormula:{value:'off'},bodyFatSource:{value:'scale'}}[id]||oldGet(id));
  document.querySelectorAll=sel=>sel==='.body-freq'?[{dataset:{freq:'weightDays'},value:'999'},{dataset:{freq:'waistDays'},value:'8'}]:sel==='.body-goal-input'?[{dataset:{bodyGoal:'weight'},value:'82'}]:sel==='.body-track-input'?[{dataset:{bodyTrack:'neck'},checked:false}]:[];
  saveBodyConfigFromDom();
  const savedViaDom=getBodyConfig();
  ok(savedViaDom.frequencies.weightDays===365,'frequency validation/clamping failed');
  ok(savedViaDom.bodyFatFormula==='off'&&savedViaDom.bodyFatSource==='scale','body-fat settings not persisted from DOM');
  ok(savedViaDom.goals.weight===82,'goal not persisted from DOM');
  ok(savedViaDom.tracked.neck===false,'tracked field visibility not persisted from DOM');
  document.getElementById=oldGet;document.querySelectorAll=oldQuery;
  localStorage.removeItem(STORAGE.bodyConfig);

  const cfg=getBodyConfig();
  cfg.frequencies.weightDays=3; cfg.frequencies.waistDays=8;
  cfg.goals.weight=82; cfg.goals.waist=90;
  cfg.tracked.neck=false;
  cfg.customFields=[{key:'custom_navel',label:'Ventre nombril',unit:'cm',visible:true}];
  setBodyConfig(cfg);
  setCanonicalHeight(175);
  setBodyLogs([
    {id:2,date:new Date().toISOString(),weight:90,waist:96,neck:41,custom:{custom_navel:99},measurementMode:'full'},
    {id:1,date:new Date(Date.now()-7*86400000).toISOString(),weight:91,waist:98,neck:41.5,custom:{custom_navel:101},measurementMode:'full'}
  ]);
  const full=renderMeasurements();
  ok(full.includes('Cap actuel'),'configured goals not rendered');
  ok(full.includes('cible 82 kg'),'weight goal not connected to UI');
  ok(full.includes('Champs personnalisés'),'custom values not rendered in detail');
  ok(full.includes('Ventre nombril'),'custom field label missing');
  ok(!renderBodyEditor().includes('Tour de cou (cm)'),'hidden tracked field still present in editor');
  const schedule=bodyTrackingSchedule();
  ok(schedule.find(x=>x.label==='Poids')?.every===3,'weight frequency not consumed by schedule');
  ok(schedule.find(x=>x.label==='Tour de taille')?.every===8,'waist frequency not consumed by schedule');
  const derived=bodyDerived(getBodyLogs()[0]);
  ok(derived.bmi>29&&derived.bmi<30,'canonical height no longer used by body calculations');
  setBodyLogs([{id:3,date:new Date(Date.now()-4*86400000).toISOString(),weight:90,waist:96,neck:41,measurementMode:'quick'}]);
  const tasks=window.KinetikDailyTasks.getTodayTasks({includeUpcoming:true});
  const weightTask=tasks.find(x=>x.kind==='measurement'&&x.title==='Poids');
  ok(weightTask?.status==='pending','Daily Tasks does not react to restored measurement frequency');
  ok(weightTask?.metadata?.everyDays===3,'Daily Tasks receives wrong configured frequency');
  const cfgComplete=getBodyConfig();cfgComplete.frequencies.completeDays=14;setBodyConfig(cfgComplete);
  setBodyLogs([{id:4,date:new Date().toISOString(),weight:90,waist:96,neck:41,chest:105,measurementMode:'full'}]);
  ok(bodyTrackingSchedule().find(x=>x.label==='Bilan complet')?.due===true,'a full-mode log with only one detailed field incorrectly clears complete-assessment reminder');
  if(failures.length){console.error('STEP3_RUNTIME_FAIL', failures);process.exitCode=1;}else console.log('STEP3_RUNTIME_OK 17 checks');
})();
`;
try{vm.runInContext(source+'\n'+dailySource+'\n'+tests,sandbox,{filename:'app.js'});}catch(e){console.error('STEP3_RUNTIME_CRASH',e);process.exitCode=1;}
