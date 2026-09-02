const fs=require('fs');
const vm=require('vm');
const path=require('path');
const {APP_SOURCE_FILES}=require('./test-app-source');
const failures=[];let checks=0;const ok=(c,m)=>{checks++;if(!c)failures.push(m);};
const store=new Map(),sessionStore=new Map();
const localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear()};
const sessionStorage={getItem:k=>sessionStore.has(k)?sessionStore.get(k):null,setItem:(k,v)=>sessionStore.set(k,String(v)),removeItem:k=>sessionStore.delete(k),clear:()=>sessionStore.clear()};
const cls=active=>({active:!!active,toggle(n,v){if(n==='active')this.active=!!v;},add(n){if(n==='active')this.active=true;},remove(n){if(n==='active')this.active=false;},contains(n){return n==='active'&&this.active;}});
const appNode={innerHTML:'',dataset:{},classList:cls(false),querySelectorAll(){return[]}};
const document={visibilityState:'visible',hasFocus:()=>true,getElementById:id=>id==='app'?appNode:null,querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){},removeEventListener(){},documentElement:{style:{setProperty(){}},dataset:{},classList:cls(false)},body:{appendChild(){},classList:cls(false)},createElement:tag=>({tagName:String(tag).toUpperCase(),style:{},dataset:{},classList:cls(false),appendChild(){},remove(){},click(){},setAttribute(){},getContext(){return null}})};
const sandbox={console,localStorage,sessionStorage,document,navigator:{serviceWorker:undefined,userAgent:'Node'},location:{origin:'https://kinetik.example',pathname:'/',search:'',href:'https://kinetik.example/'},history:{replaceState(){}},URL,URLSearchParams,Blob,FileReader:function(){},setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame:fn=>setTimeout(fn,0),cancelAnimationFrame:clearTimeout,confirm:()=>true,prompt:()=>null,alert(){},fetch:async()=>({ok:false,status:503,json:async()=>({})}),performance:{now:()=>Date.now()},indexedDB:undefined,crypto:global.crypto,queueMicrotask:fn=>fn(),Intl,atob,btoa,Uint8Array};
sandbox.window=sandbox;sandbox.self=sandbox;sandbox.window.addEventListener=()=>{};sandbox.window.removeEventListener=()=>{};sandbox.window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
vm.createContext(sandbox);
for(const file of APP_SOURCE_FILES)vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8'),sandbox,{filename:file});

const result=vm.runInContext(`(()=>{
  const name='Pompes',type=exerciseInfo(name)?.prescription?.type||'reps';
  setQuickFavoritePresetValues(name,[10,20,25]);
  const first=quickFavoriteAddValues(name,type);
  const card=renderQuickFavoritePreset(name,0);
  setQuickFavoritePresetValues(name,[12,18,30]);
  const second=quickFavoriteAddValues(name,type);
  const map=getQuickFavoritePresetMap();
  const backupNames=backupStorageEntries().map(x=>x[0]);
  const normalized=normalizeQuickSearchText('Épaules / DÉVELOPPÉ');
  state.quickFavoritesEditor=true;setQuickFavorites([name]);
  const manager=renderQuickFavoritesManager();
  return {first,second,card,map,backupNames,normalized,manager};
})()`,sandbox);

ok(JSON.stringify(result.first)==='[10,20,25]','custom 3-value preset did not persist');
ok(result.card.includes('data-quick-value="10"')&&result.card.includes('data-quick-value="20"')&&result.card.includes('data-quick-value="25"'),'favorite card does not render all three custom values');
ok(result.card.includes('Valeur exacte'),'exact value entry disappeared');
ok(JSON.stringify(result.second)==='[12,18,30]','favorite preset values cannot be changed');
ok(Array.isArray(result.map.Pompes)&&result.map.Pompes.length===3,'preset map storage malformed');
ok(result.backupNames.includes('quickFavoritePresets'),'favorite presets missing from backup storage set');
ok(result.normalized==='epaules / developpe','accent-insensitive search normalization failed');
ok(result.manager.includes('Valeurs rapides'),'favorite manager lacks preset editor');
ok((result.manager.match(/data-quick-favorite-preset-name=/g)||[]).length===3,'manager does not expose exactly three preset inputs for one favorite');

// Favorite manager search: a typed query must ignore the previous category and accents.
const favInput={value:'epaules'};
const favEmpty={hidden:true};
const favTabs=[{dataset:{quickFavoriteCategory:'Tous'},classList:cls(false)},{dataset:{quickFavoriteCategory:'Push'},classList:cls(true)}];
const favCards=[
  {dataset:{quickFavoriteCategoryName:'Skill',quickFavoriteSearch:'Épaules handstand'},hidden:false},
  {dataset:{quickFavoriteCategoryName:'Push',quickFavoriteSearch:'Pompes pectoraux'},hidden:false}
];
sandbox.document.getElementById=id=>id==='quickFavoriteSearch'?favInput:id==='quickFavoriteEmpty'?favEmpty:id==='app'?appNode:null;
sandbox.document.querySelectorAll=sel=>sel==='[data-quick-favorite-category]'?favTabs:sel==='.quick-favorite-option'?favCards:[];
vm.runInContext(`state.quickFavoriteCategory='Push';filterQuickFavoritePicker();`,sandbox);
ok(favCards[0].hidden===false&&favCards[1].hidden===true,'favorite search does not search across categories');
ok(favTabs[0].classList.active===true&&favTabs[1].classList.active===false,'favorite search did not reset category to Tous');

// General exercise search: same behavior, while avoiding auto-selection side effects.
const qInput={value:'epaules'};
const qEmpty={hidden:true};
const qTabs=[{dataset:{quickCategory:'Tous'},classList:cls(false)},{dataset:{quickCategory:'Push'},classList:cls(true)}];
const qCards=[
  {dataset:{quickExerciseCategory:'Skill',quickExerciseSearch:'Épaules handstand'},hidden:false,classList:cls(false)},
  {dataset:{quickExerciseCategory:'Push',quickExerciseSearch:'Pompes pectoraux'},hidden:false,classList:cls(false)}
];
sandbox.document.getElementById=id=>id==='quickExerciseSearch'?qInput:id==='quickExerciseEmpty'?qEmpty:id==='app'?appNode:null;
sandbox.document.querySelectorAll=sel=>sel==='.quick-category'?qTabs:sel==='.quick-exercise-card'?qCards:[];
sandbox.document.querySelector=sel=>sel==='.quick-exercise-card.selected:not([hidden])'?{}:null;
vm.runInContext('filterQuickExercisePicker();',sandbox);
ok(qCards[0].hidden===false&&qCards[1].hidden===true,'exercise search does not find accent-normalized result across categories');
ok(qTabs[0].classList.active===true&&qTabs[1].classList.active===false,'exercise search did not reset category to Tous');

const source=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');
ok(source.includes('quickFavoritePresets: "cc_quick_favorite_presets_v1"'),'preset storage key missing');
ok(source.includes('normalizeQuickSearchText'),'search normalization helper missing');
const styles=fs.readFileSync(path.join(__dirname,'styles.css'),'utf8');
ok(styles.includes('v10.139 · Quick favorite custom presets + search repair'),'v10.145 preset styles missing');
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8'),sw=fs.readFileSync(path.join(__dirname,'sw.js'),'utf8'),pkg=JSON.parse(fs.readFileSync(path.join(__dirname,'package.json'),'utf8'));
ok(html.includes('app.js?v=10.145')&&sw.includes('kinetik-v10-145-mobility-final'),'v10.145 PWA chain missing');
ok(pkg.version==='10.145.0','package version mismatch');
if(failures.length){console.error(`QUICK_FAVORITE_PRESETS_FAIL ${failures.length}/${checks}`);failures.forEach(x=>console.error('-',x));process.exit(1);}else console.log(`QUICK_FAVORITE_PRESETS_OK ${checks} checks`);
