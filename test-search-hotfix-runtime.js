const fs=require('fs');
const vm=require('vm');
const path=require('path');
const {APP_SOURCE_FILES}=require('./test-app-source');
const failures=[];let checks=0;const ok=(c,m)=>{checks++;if(!c)failures.push(m);};
const store=new Map(),sessionStore=new Map();
const localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear()};
const sessionStorage={getItem:k=>sessionStore.has(k)?sessionStore.get(k):null,setItem:(k,v)=>sessionStore.set(k,String(v)),removeItem:k=>sessionStore.delete(k),clear:()=>sessionStore.clear()};
function classList(initial=[]){const s=new Set(initial);return{toggle(n,v){if(v===undefined){if(s.has(n))s.delete(n);else s.add(n);}else if(v)s.add(n);else s.delete(n);},add(n){s.add(n)},remove(n){s.delete(n)},contains(n){return s.has(n)}};}
const appNode={innerHTML:'',dataset:{},classList:classList(),querySelectorAll(){return[]}};
const document={visibilityState:'visible',hasFocus:()=>true,getElementById:id=>id==='app'?appNode:null,querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){},removeEventListener(){},documentElement:{style:{setProperty(){}},dataset:{},classList:classList()},body:{appendChild(){},classList:classList()},createElement:tag=>({tagName:String(tag).toUpperCase(),style:{},dataset:{},classList:classList(),appendChild(){},remove(){},click(){},setAttribute(){},getContext(){return null}})};
const sandbox={console,localStorage,sessionStorage,document,navigator:{serviceWorker:undefined,userAgent:'Node'},location:{origin:'https://kinetik.example',pathname:'/',search:'',href:'https://kinetik.example/'},history:{replaceState(){}},URL,URLSearchParams,Blob,FileReader:function(){},setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame:fn=>setTimeout(fn,0),cancelAnimationFrame:clearTimeout,confirm:()=>true,prompt:()=>null,alert(){},fetch:async()=>({ok:false,status:503,json:async()=>({})}),performance:{now:()=>Date.now()},indexedDB:undefined,crypto:global.crypto,queueMicrotask:fn=>fn(),Intl,atob,btoa,Uint8Array};
sandbox.window=sandbox;sandbox.self=sandbox;sandbox.window.addEventListener=()=>{};sandbox.window.removeEventListener=()=>{};sandbox.window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
vm.createContext(sandbox);for(const file of APP_SOURCE_FILES)vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8'),sandbox,{filename:file});

const favInput={value:'epaules'};const favEmpty={hidden:true,style:{},classList:classList(['quick-search-hidden'])};
const favTabs=[{dataset:{quickFavoriteCategory:'Tous'},classList:classList()},{dataset:{quickFavoriteCategory:'Push'},classList:classList(['active'])}];
const favCards=[
 {dataset:{quickFavoriteCategoryName:'Skill',quickFavoriteSearch:'Épaules handstand'},hidden:false,style:{display:'grid'},classList:classList()},
 {dataset:{quickFavoriteCategoryName:'Push',quickFavoriteSearch:'Pompes pectoraux'},hidden:false,style:{display:'grid'},classList:classList()}
];
document.getElementById=id=>id==='quickFavoriteSearch'?favInput:id==='quickFavoriteEmpty'?favEmpty:id==='app'?appNode:null;
document.querySelectorAll=sel=>sel==='[data-quick-favorite-category]'?favTabs:sel==='.quick-favorite-option'?favCards:[];
vm.runInContext(`state.quickFavoriteCategory='Push';filterQuickFavoritePicker();`,sandbox);
ok(favCards[0].style.display==='', 'matching favorite remains forcibly displayed');
ok(favCards[1].style.display==='none','non-matching favorite is not display:none');
ok(favCards[1].classList.contains('quick-search-hidden'),'favorite hidden class missing');
ok(!favCards[0].classList.contains('quick-search-hidden'),'matching favorite incorrectly hidden');
ok(favTabs[0].classList.contains('active')&&!favTabs[1].classList.contains('active'),'favorite search does not reset category');

const qInput={value:'epaules'};const qEmpty={hidden:true,style:{},classList:classList(['quick-search-hidden'])};
const qTabs=[{dataset:{quickCategory:'Tous'},classList:classList()},{dataset:{quickCategory:'Push'},classList:classList(['active'])}];
const qCards=[
 {dataset:{quickExerciseCategory:'Skill',quickExerciseSearch:'Épaules handstand'},hidden:false,style:{display:'grid'},classList:classList()},
 {dataset:{quickExerciseCategory:'Push',quickExerciseSearch:'Pompes pectoraux'},hidden:false,style:{display:'grid'},classList:classList()}
];
document.getElementById=id=>id==='quickExerciseSearch'?qInput:id==='quickExerciseEmpty'?qEmpty:id==='app'?appNode:null;
document.querySelectorAll=sel=>sel==='.quick-category'?qTabs:sel==='.quick-exercise-card'?qCards:[];
document.querySelector=sel=>sel==='.quick-exercise-card.selected:not(.quick-search-hidden)'?{}:null;
vm.runInContext('filterQuickExercisePicker();',sandbox);
ok(qCards[0].style.display==='', 'matching exercise remains forcibly displayed');
ok(qCards[1].style.display==='none','non-matching exercise is not display:none');
ok(qCards[1].classList.contains('quick-search-hidden'),'exercise hidden class missing');
ok(qTabs[0].classList.contains('active')&&!qTabs[1].classList.contains('active'),'exercise search does not reset category');

const source=fs.readFileSync(path.join(__dirname,'app.js'),'utf8'),css=fs.readFileSync(path.join(__dirname,'styles.css'),'utf8');
ok(source.includes("card.style.display=show?'':'none'"),'explicit display filtering missing');
ok(css.includes('.quick-search-hidden{display:none!important}'),'CSS hard-hide guard missing');

if(failures.length){console.error(`SEARCH_HOTFIX_FAIL ${failures.length}/${checks}`);failures.forEach(x=>console.error('-',x));process.exit(1);}else console.log(`SEARCH_HOTFIX_OK ${checks} checks`);
