const fs=require('fs');
const {loadAppSource}=require('./test-app-source');
const vm=require('vm');
const source=loadAppSource(__dirname);
const dailySource=fs.readFileSync(__dirname+'/daily-tasks.js','utf8');
const store=new Map();
const localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear()};
const appNode={innerHTML:'',dataset:{},classList:{add(){},remove(){},toggle(){}},querySelectorAll(){return[]}};
const document={
  getElementById:id=>id==='app'?appNode:null,
  querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){},removeEventListener(){},
  documentElement:{style:{setProperty(){}},dataset:{},classList:{add(){},remove(){},toggle(){}}},
  body:{classList:{add(){},remove(){},toggle(){}}},
  createElement:tag=>({tagName:tag.toUpperCase(),style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},appendChild(){},remove(){},click(){},setAttribute(){},getContext(){return null}})
};
const sessionStore=new Map();
const sessionStorage={getItem:k=>sessionStore.has(k)?sessionStore.get(k):null,setItem:(k,v)=>sessionStore.set(k,String(v)),removeItem:k=>sessionStore.delete(k),clear:()=>sessionStore.clear()};
const sandbox={console,localStorage,sessionStorage,document,navigator:{},location:{origin:'http://localhost',pathname:'/',search:''},history:{replaceState(){}},URL:global.URL,URLSearchParams:global.URLSearchParams,Blob:global.Blob,FileReader:function(){},setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame:fn=>setTimeout(fn,0),cancelAnimationFrame:clearTimeout,confirm:()=>true,prompt:()=>null,fetch:async()=>({ok:false,json:async()=>({})}),performance:{now:()=>Date.now()},indexedDB:undefined,crypto:global.crypto};
sandbox.window=sandbox;sandbox.window.addEventListener=()=>{};sandbox.window.removeEventListener=()=>{};sandbox.window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});sandbox.self=sandbox.window;
vm.createContext(sandbox);
const tests=`
(function(){
  const failures=[];let checks=0;const ok=(cond,msg)=>{checks++;if(!cond)failures.push(msg);};
  localStorage.clear();
  let p=getReminderPrefs();
  ok(p.version===3,'reminder prefs schema is not v3 after local notification upgrade');
  ok(p.enabled&&p.workout&&p.activities&&p.measurements&&p.tests&&p.mobility&&p.recovery,'default categories are not enabled');
  ok(p.visibility==='due-only'&&p.upcomingDays===3,'default reminder visibility is wrong');
  ok(p.preferredMoment==='morning'&&p.preferredTime==='08:00','default reminder moment is wrong');

  localStorage.setItem(STORAGE.reminders,JSON.stringify({enabled:true,workout:false,measurements:false,tests:true}));
  p=getReminderPrefs();
  ok(p.workout===false&&p.measurements===false&&p.tests===true,'legacy reminder toggles were not migrated');
  ok(p.activities===true&&p.mobility===true&&p.recovery===true,'new reminder categories did not get safe migration defaults');

  setReminderPrefs({...p,upcomingDays:99,preferredMoment:'custom',preferredTime:'25:80',visibility:'bad-value'});
  p=getReminderPrefs();
  ok(p.upcomingDays===14,'upcoming horizon is not clamped to 14 days');
  ok(p.preferredTime==='08:00','invalid preferred time was not normalized');
  ok(p.visibility==='due-only','invalid visibility was not normalized');

  setReminderPrefs({...p,enabled:true,workout:true,activities:true,measurements:true,tests:true,mobility:true,recovery:true,visibility:'due-and-soon',upcomingDays:3,preferredMoment:'evening',preferredTime:'19:00'});
  const settings=renderReminderSettings();
  ok(settings.includes('Rappels & priorités'),'modern reminder settings heading missing');
  ok(settings.includes('data-reminder="activities"')&&settings.includes('data-reminder="mobility"')&&settings.includes('data-reminder="recovery"'),'new reminder category controls missing');
  ok(settings.includes('id="reminderVisibility"')&&settings.includes('id="reminderUpcomingDays"'),'visibility/horizon controls missing');
  ok(settings.includes('id="reminderPreferredMoment"')&&settings.includes('id="reminderPreferredTime"'),'preferred moment controls missing');
  const profile=renderProfile();
  ok(profile.includes('Rappels & priorités'),'reminder settings are not present in the final V10.88 settings renderer');

  const oldGet=document.getElementById,oldQuery=document.querySelectorAll;
  const controls={
    remindersEnabled:{checked:true},
    reminderVisibility:{value:'due-only'},
    reminderUpcomingDays:{value:'3'},
    reminderPreferredMoment:{value:'morning'},
    reminderPreferredTime:{value:'08:00'}
  };
  const categoryToggle={dataset:{reminder:'activities'},checked:true};
  document.getElementById=id=>controls[id]||oldGet(id);
  document.querySelectorAll=sel=>sel==='.reminder-toggle'?[categoryToggle]:[];
  bindEvents();
  ok(typeof controls.remindersEnabled.onchange==='function','master reminder control is not bound by final bindEvents chain');
  ok(typeof categoryToggle.onchange==='function','category reminder controls are not bound by final bindEvents chain');
  ok(typeof controls.reminderVisibility.onchange==='function','visibility control is not bound by final bindEvents chain');
  ok(typeof controls.reminderUpcomingDays.onchange==='function','upcoming horizon control is not bound by final bindEvents chain');
  ok(typeof controls.reminderPreferredMoment.onchange==='function'&&typeof controls.reminderPreferredTime.onchange==='function','preferred moment controls are not bound by final bindEvents chain');
  document.getElementById=oldGet;document.querySelectorAll=oldQuery;

  window.KinetikDailyTasks.registerProvider({id:'step4-test-activity',order:1,getTasks(ctx){return [{id:'step4-activity',kind:'activity',title:'Activité test',detail:'test',status:'pending',priority:80,dueKey:ctx.dateKey}]}});
  window.KinetikDailyTasks.registerProvider({id:'step4-test-upcoming',order:2,getTasks(ctx){return [{id:'step4-upcoming',kind:'measurement',title:'Mesure proche test',detail:'dans 2 j',status:'upcoming',priority:20,dueKey:ctx.dateKey,metadata:{remainingDays:2}}]}});
  let items=window.KinetikDailyTasks.toLegacyReminderItems();
  ok(items.some(x=>x.label==='Activité test'),'enabled activity reminder is unexpectedly filtered');
  ok(items.some(x=>x.label.includes('Mesure proche test')),'upcoming reminder inside configured horizon is missing');

  setReminderPrefs({...getReminderPrefs(),activities:false});
  items=window.KinetikDailyTasks.toLegacyReminderItems();
  ok(!items.some(x=>x.label==='Activité test'),'activity category preference does not filter Daily Tasks reminders');

  setReminderPrefs({...getReminderPrefs(),activities:true,visibility:'due-only'});
  items=window.KinetikDailyTasks.toLegacyReminderItems();
  ok(!items.some(x=>x.label.includes('Mesure proche test')),'due-only mode still exposes upcoming reminders');

  setReminderPrefs({...getReminderPrefs(),visibility:'due-and-soon',upcomingDays:1});
  items=window.KinetikDailyTasks.toLegacyReminderItems();
  ok(!items.some(x=>x.label.includes('Mesure proche test')),'upcoming horizon does not filter reminders beyond configured days');

  setReminderPrefs({...getReminderPrefs(),enabled:false,upcomingDays:3});
  ok(window.KinetikDailyTasks.toLegacyReminderItems().length===0,'master reminder switch does not suppress reminder output');
  ok(renderReminderSettings().includes('désactivés'),'disabled visual state is not rendered');

  if(failures.length){console.error('STEP4_RUNTIME_FAIL',failures);process.exitCode=1;}else console.log('STEP4_RUNTIME_OK '+checks+' checks');
})();
`;
try{vm.runInContext(source+'\n'+dailySource+'\n'+tests,sandbox,{filename:'app-step4.js'});}catch(e){console.error('STEP4_RUNTIME_CRASH',e);process.exitCode=1;}
