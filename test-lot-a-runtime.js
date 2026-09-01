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
for(const file of APP_SOURCE_FILES){vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),sandbox,{filename:file});}

// Final active UI surfaces.
const ui=vm.runInContext(`(()=>{
 state.stravaStatus={checked:true,loading:false,connected:true,athlete:{firstname:'Test',lastname:'Runner'},scope:''};
 const settings=renderProfile();
 const progress=renderProgressPerformance();
 const connections=v1088ConnectionSection();
 return {settings,progress,connections};
})()`,sandbox);
ok(ui.settings.includes('Zones à ménager'),'Restrictions are not visible in final Settings');
ok(ui.settings.includes('Apparence & accessibilité'),'Appearance is not visible in final Settings');
ok(ui.settings.includes('id="appTheme"'),'Theme selector missing from final Settings');
ok(ui.connections.includes('id="disconnectStrava"'),'Strava disconnect missing from final profile');
ok(!ui.progress.includes('edit-test'),'Legacy editable test tiles are still in active Performance UI');
ok(ui.progress.includes('Centre d’évaluation'),'Performance no longer routes standardized validation to Assessment Center');
ok(ui.progress.includes('seule une validation guidée KINETIK'),'Evidence distinction copy missing');

// Backup photo contract.
const photoIds=vm.runInContext(`bodyPhotoIdsForBackup({photoId:'front-old',photoIds:{front:'front-new',side:'side-1',back:'back-1'}})`,sandbox);
ok(JSON.stringify(Array.from(photoIds))===JSON.stringify(['front-new','side-1','back-1']),'Backup does not collect front/side/back photos');
const backupNames=vm.runInContext(`backupStorageEntries().map(x=>x[0])`,sandbox);
ok(!backupNames.includes('localNotificationState')&&!backupNames.includes('webPushDeviceState'),'Device-local notification state is exportable');
ok(!backupNames.includes('skillPriorities'),'Retired skill priorities are still exported');

// Legacy periodic test editor is removed from the active runtime; legacy getTests data stays read-compatible.
const appSource=fs.readFileSync(__dirname+'/app.js','utf8');
ok(!appSource.includes('function renderTestEditor(')&&!appSource.includes('function saveTest(')&&!appSource.includes('state.testEditor'),'Legacy periodic test editor still exists in core runtime');

// Legacy skill priority migration: generic profile inherits goal once, then key is retired.
vm.runInContext(`localStorage.setItem(STORAGE.athleteProfile,JSON.stringify({primaryGoal:'Progression générale',secondaryGoal:''}));localStorage.setItem(STORAGE.skillPriorities,JSON.stringify({muscleup:'high',pull:'medium'}));migrateLegacySkillPriorities();`,sandbox);
const migrated=vm.runInContext(`({p:getAthleteProfile(),legacy:localStorage.getItem(STORAGE.skillPriorities),priorities:getSkillPriorities()})`,sandbox);
ok(migrated.p.primaryGoal==='Muscle-up','High legacy skill priority did not migrate to primary goal');
ok(migrated.p.secondaryGoal==='Tractions strictes','Second legacy skill priority did not migrate to secondary goal');
ok(migrated.legacy===null,'Legacy skill priority storage was not removed');
ok(Object.values(migrated.priorities).every(v=>v==='off'),'Legacy skill priority engine is not neutralized');
const base=vm.runInContext(`({name:'Skills + Mobilité',sessionLength:'full',exercises:[{name:'Handstand au mur',phase:'main',sets:3}]})`,sandbox);
sandbox.__base=base;
const adapted=vm.runInContext(`applySkillPrioritiesToBase(__base)`,sandbox);
ok(adapted.exercises.length===1&&adapted.exercises[0].sets===3&&!adapted.exercises[0].skillPriority,'Retired skill priorities still mutate workouts');

// Import must replace all exportable app/sport data, while preserving account identity outside STORAGE.
(async()=>{
  try{
    vm.runInContext(`render=()=>{};clearPhotos=async()=>{};putPhoto=async()=>{};window.KinetikWebPush={disable:async()=>true};`,sandbox);
    const histKey=vm.runInContext('STORAGE.history',sandbox),prefsKey=vm.runInContext('STORAGE.prefs',sandbox),restrKey=vm.runInContext('STORAGE.restrictions',sandbox),localKey=vm.runInContext('STORAGE.localNotificationState',sandbox);
    localStorage.setItem(histKey,JSON.stringify([{id:'new'}]));localStorage.setItem(prefsKey,JSON.stringify({sound:true}));localStorage.setItem(restrKey,JSON.stringify({knees:true}));localStorage.setItem(localKey,JSON.stringify({sent:true}));localStorage.setItem('cc_kinetik_account_v1','preserve-me');
    sandbox.__backupFile={text:async()=>JSON.stringify({app:'KINETIK',schema:1,data:{history:[{id:'old'}]},photos:{}})};
    await vm.runInContext(`importBackupFile(__backupFile)`,sandbox);
    ok(JSON.parse(localStorage.getItem(histKey))[0].id==='old','Import did not replace existing history');
    ok(localStorage.getItem(prefsKey)===null,'Import retained prefs absent from backup instead of replacing dataset');
    ok(localStorage.getItem(restrKey)===null,'Import retained restrictions absent from backup');
    ok(localStorage.getItem(localKey)===null,'Import retained stale local notification state');
    ok(localStorage.getItem('cc_kinetik_account_v1')==='preserve-me','Sporting backup import unexpectedly removed account identity');
  }catch(e){ok(false,'Import replacement test crashed: '+e.message);}

  const source=APP_SOURCE_FILES.map(f=>fs.readFileSync(__dirname+'/'+f,'utf8')).join('\n');
  ok(source.includes('Tour de taille'),'Tour de taille label is missing');
  ok(!source.includes('<span>Taille</span><strong>${deltaText(r.waist'),'Adaptive report still labels waist as Taille');
  const html=fs.readFileSync(__dirname+'/index.html','utf8'),sw=fs.readFileSync(__dirname+'/sw.js','utf8'),pkg=JSON.parse(fs.readFileSync(__dirname+'/package.json','utf8'));
  ok(html.includes('app.js?v=10.133')&&html.includes('account-manager.js?v=10.133'),'v10.133 assets missing from index');
  ok(sw.includes('kinetik-v10-133-today-hotfix')&&sw.includes('app-progress.js?v=10.133'),'v10.133 service-worker cache missing');
  ok(pkg.version==='10.133.0','package version is not 10.133.0');
  ok(fs.readFileSync(__dirname+'/styles.css','utf8').includes('Lot A — intégrité fonctionnelle'),'Lot A styles missing');

  if(failures.length){console.error(`LOT_A_RUNTIME_FAIL ${failures.length}/${checks}`);failures.forEach(x=>console.error('-',x));process.exit(1);}else console.log(`LOT_A_RUNTIME_OK ${checks} checks`);
})();
