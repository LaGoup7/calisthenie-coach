const fs=require('fs');
const vm=require('vm');
const source=fs.readFileSync(__dirname+'/app.js','utf8');
const dailySource=fs.readFileSync(__dirname+'/daily-tasks.js','utf8');
const store=new Map();
const localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear()};
const appNode={innerHTML:'',dataset:{},classList:{add(){},remove(){},toggle(){}},querySelectorAll(){return[]}};
const document={
  getElementById:id=>id==='app'?appNode:null,querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){},removeEventListener(){},
  documentElement:{style:{setProperty(){}},dataset:{},classList:{add(){},remove(){},toggle(){}}},body:{classList:{add(){},remove(){},toggle(){}}},
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
  const now=new Date(),key=localDateKey(now),today=now.getDay();
  setAthleteProfile({...getAthleteProfile(),restDays:[today]});
  setFlexConfig({...getFlexConfig(),weeklyMinutesTarget:30,sessionsTarget:3});
  setFlexLogs([]);setActivities([]);setMobilityTests([]);setPlannedEvents([]);
  setReminderPrefs({...getReminderPrefs(),enabled:true,mobility:true,recovery:true,visibility:'due-only'});

  const providerIds=window.KinetikDailyTasks.listProviders().map(x=>x.id);
  ok(window.KinetikDailyTasks.version==='1.3.0','Daily Tasks engine is not v1.3.0');
  ok(providerIds.includes('mobility-assessment'),'mobility assessment provider missing');
  ok(providerIds.includes('mobility-coaching'),'mobility coaching provider missing');

  let tasks=window.KinetikDailyTasks.getTodayTasks({now,includeDone:true,includeUpcoming:true});
  let assessment=tasks.find(x=>x.source==='mobility-tests');
  let coaching=tasks.find(x=>x.source==='mobility-coach');
  ok(!!assessment&&assessment.kind==='mobility'&&assessment.status==='pending','missing mobility baseline does not create an assessment task');
  ok(assessment.metadata.assessment===true&&assessment.metadata.missingTests.length>0,'assessment task does not expose missing test metadata');
  ok(!!coaching&&coaching.kind==='recovery','rest day does not create a recovery mobility task');
  ok(coaching.metadata.mode==='Recovery'&&!!coaching.metadata.routineId,'recovery task does not expose routine metadata');

  setPlannedEvents([{id:'mob-plan',date:key,time:'18:00',type:'mobility',duration:15,rpe:3}]);
  tasks=window.KinetikDailyTasks.getTodayTasks({now,includeDone:true,includeUpcoming:true});
  ok(!tasks.some(x=>x.source==='mobility-coach'),'automatic mobility task duplicates a manually planned mobility event');
  ok(tasks.some(x=>x.source==='planning'&&x.kind==='mobility'),'planned mobility event is not preserved as the canonical task');

  setPlannedEvents([]);
  setActivities([{id:'manual-mob',date:now.toISOString(),type:'mobility',duration:12,rpe:3}]);
  const balance=weeklyFlexBalance();
  ok(balance.dedicatedSessions===1&&balance.dedicatedMinutes===12,'manual mobility activity is not counted in weekly mobility balance');
  tasks=window.KinetikDailyTasks.getTodayTasks({now,includeDone:true,includeUpcoming:true});
  coaching=tasks.find(x=>x.source==='flexibility');
  ok(!!coaching&&coaching.status==='done','manual mobility activity does not complete the automatic mobility/recovery task');
  ok(!window.KinetikDailyTasks.getTodayTasks({now}).some(x=>x.source==='mobility-coach'),'completed mobility is still shown as a pending automatic task');

  // External sport means the day is not treated as a pure recovery day.
  setActivities([]);setFlexLogs([]);setPlannedEvents([{id:'run-plan',date:key,time:'17:00',type:'running',duration:45,rpe:6}]);
  tasks=window.KinetikDailyTasks.getTodayTasks({now,includeDone:true,includeUpcoming:true});
  coaching=tasks.find(x=>x.source==='mobility-coach');
  ok(!!coaching&&coaching.kind==='mobility'&&coaching.metadata.mode==='Progression','external sport day is incorrectly classified as recovery');

  // Fresh mobility tests suppress reassessment; old tests make exactly one zone due.
  setPlannedEvents([]);
  const makeTests=(daysAgo)=>MOBILITY_TESTS.map((d,i)=>({id:1000+i,date:new Date(now.getTime()-daysAgo*86400000).toISOString(),testId:d.id,value:d.target||10}));
  setMobilityTests(makeTests(0));
  tasks=window.KinetikDailyTasks.getTodayTasks({now,includeDone:true,includeUpcoming:true});
  ok(!tasks.some(x=>x.source==='mobility-tests'),'fresh mobility tests still create a reassessment task');

  setMobilityTests(makeTests(30));
  tasks=window.KinetikDailyTasks.getTodayTasks({now,includeDone:true,includeUpcoming:true});
  assessment=tasks.find(x=>x.source==='mobility-tests');
  ok(!!assessment&&assessment.status==='pending'&&assessment.metadata.ageDays>=28,'stale mobility tests are not detected after 28 days');
  ok(tasks.filter(x=>x.source==='mobility-tests').length===1,'more than one automatic mobility assessment is proposed at once');

  setMobilityTests(makeTests(26));
  tasks=window.KinetikDailyTasks.getTodayTasks({now,includeDone:true,includeUpcoming:true});
  assessment=tasks.find(x=>x.source==='mobility-tests');
  ok(!!assessment&&assessment.status==='upcoming'&&assessment.metadata.remainingDays===2,'mobility reassessment does not become upcoming before 28 days');
  setReminderPrefs({...getReminderPrefs(),visibility:'due-and-soon',upcomingDays:3,mobility:true,recovery:true});
  let items=window.KinetikDailyTasks.toLegacyReminderItems();
  ok(items.some(x=>x.taskId===assessment.id),'upcoming mobility assessment inside reminder horizon is filtered out');
  setReminderPrefs({...getReminderPrefs(),visibility:'due-only'});
  items=window.KinetikDailyTasks.toLegacyReminderItems();
  ok(!items.some(x=>x.taskId===assessment.id),'due-only mode exposes an upcoming mobility assessment');

  // Recovery and mobility toggles are independent.
  setMobilityTests(makeTests(0));setFlexLogs([]);setActivities([]);setPlannedEvents([]);
  setReminderPrefs({...getReminderPrefs(),visibility:'due-only',mobility:true,recovery:false});
  items=window.KinetikDailyTasks.toLegacyReminderItems();
  ok(!items.some(x=>x.type==='recovery'),'recovery preference does not filter recovery task');

  // Hitting weekly dedicated targets suppresses a new automatic routine on the following day in the same week.
  const monday=mondayDate(now);monday.setHours(12,0,0,0);
  setActivities([{id:'week-mob',date:monday.toISOString(),type:'mobility',duration:35,rpe:3}]);
  setFlexConfig({...getFlexConfig(),weeklyMinutesTarget:30,sessionsTarget:1});
  tasks=window.KinetikDailyTasks.getTodayTasks({now,includeDone:false,includeUpcoming:false});
  ok(!tasks.some(x=>x.source==='mobility-coach'),'automatic mobility routine remains due after weekly targets are already met');

  const settings=renderReminderSettings();
  ok(settings.includes('Jours de repos et routines douces'),'recovery settings copy was not updated for step 5');

  if(failures.length){console.error('STEP5_RUNTIME_FAIL',failures);process.exitCode=1;}else console.log('STEP5_RUNTIME_OK '+checks+' checks');
})();
`;
try{vm.runInContext(source+'\n'+dailySource+'\n'+tests,sandbox,{filename:'app-step5.js'});}catch(e){console.error('STEP5_RUNTIME_CRASH',e);process.exitCode=1;}
