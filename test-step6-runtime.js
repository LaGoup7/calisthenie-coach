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
  setPlannedEvents([]);setActivities([]);setFlexLogs([]);setMobilityTests([]);setTests([]);setBodyLogs([]);
  setReminderPrefs({...getReminderPrefs(),enabled:true,workout:false,activities:false,measurements:true,tests:false,mobility:false,recovery:false,visibility:'due-only'});
  ok(window.KinetikDailyTasks.version==='1.6.0','Daily Tasks engine is not v1.6.0');
  ok(typeof window.KinetikDailyTasks.getAgendaTasks==='function','getAgendaTasks API missing');
  ok(typeof window.KinetikDailyTasks.agendaSummary==='function','agendaSummary API missing');

  let tasks=window.KinetikDailyTasks.getAgendaTasks({now,includeDone:true});
  let summary=window.KinetikDailyTasks.agendaSummary(tasks);
  ok(tasks.filter(x=>x.kind==='measurement'&&x.status==='pending').length===4,'initial measurement agenda does not expose four due tracking tasks');
  ok(summary.pending===4&&summary.done===0&&summary.percent===0,'initial agenda progress is incorrect');
  let html=renderTodayAgenda();
  ok(html.includes('À faire aujourd’hui')&&html.includes('role="progressbar"'),'Today agenda primary UI missing');
  ok(html.includes('Poids')&&html.includes('Tour de taille'),'Today agenda does not render pending measurements');

  // A complete measurement today must validate all four tracking tasks and remove them from the active list.
  setBodyLogs([{id:1,date:new Date().toISOString(),weight:89.4,waist:96,shoulders:118,chest:108,hips:101,thighLeft:61,photoIds:{front:'f1'},measurementMode:'full',custom:{}}]);
  tasks=window.KinetikDailyTasks.getAgendaTasks({now,includeDone:true});
  summary=window.KinetikDailyTasks.agendaSummary(tasks);
  ok(tasks.filter(x=>x.kind==='measurement'&&x.status==='done').length===4,'today body log does not convert tracking tasks to done');
  ok(summary.done===4&&summary.pending===0&&summary.percent===100&&summary.complete,'completed measurement agenda does not reach 100%');
  html=renderTodayAgenda();
  ok(html.includes('Journée validée')&&html.includes('Tout est fait pour aujourd’hui'),'complete-day UI is missing');
  ok(!html.includes('today-agenda-list'),'completed tasks remain in the active agenda list');
  ok(html.includes('4 terminées aujourd’hui'),'completed task counter is missing');

  // Upcoming tasks are secondary and never count in the daily percentage.
  const yesterday=new Date(now.getTime()-86400000);
  setBodyConfig({...getBodyConfig(),frequencies:{...getBodyConfig().frequencies,weightDays:3,waistDays:7,completeDays:14,photoDays:28}});
  setBodyLogs([{id:2,date:yesterday.toISOString(),weight:89.7,waist:96,shoulders:118,chest:108,hips:101,thighLeft:61,photoIds:{front:'f2'},measurementMode:'full',custom:{}}]);
  setReminderPrefs({...getReminderPrefs(),visibility:'due-and-soon',upcomingDays:3});
  tasks=window.KinetikDailyTasks.getAgendaTasks({now,includeDone:true});
  summary=window.KinetikDailyTasks.agendaSummary(tasks);
  ok(tasks.some(x=>x.kind==='measurement'&&x.status==='upcoming'),'soon measurement task is not exposed in due-and-soon mode');
  ok(summary.total===0&&summary.percent===100&&summary.upcoming>0,'upcoming tasks incorrectly affect daily completion');
  html=renderTodayAgenda();
  ok(html.includes('Bientôt')&&html.includes('Ne compte pas dans la progression du jour'),'upcoming secondary UI is missing');

  // A mobility assessment completed today must be represented as done, without immediately surfacing the next zone.
  setReminderPrefs({...getReminderPrefs(),measurements:false,mobility:true,visibility:'due-only'});
  const mobDef=MOBILITY_TESTS[0];
  setMobilityTests([{id:10,date:new Date().toISOString(),testId:mobDef.id,value:mobDef.target||10}]);
  tasks=window.KinetikDailyTasks.getAgendaTasks({now,includeDone:true});
  const mobDone=tasks.find(x=>x.source==='mobility-tests-completed');
  ok(!!mobDone&&mobDone.status==='done','mobility test completed today is not represented as done');
  ok(!tasks.some(x=>x.source==='mobility-tests'&&x.status==='pending'),'next mobility zone is surfaced immediately after a test today');

  // Reminder master toggle must also hide the Today agenda priorities.
  setReminderPrefs({...getReminderPrefs(),enabled:false});
  tasks=window.KinetikDailyTasks.getAgendaTasks({now,includeDone:true});
  ok(tasks.length===0,'disabled reminders still expose agenda tasks');
  html=renderTodayAgenda();
  ok(html.includes('Priorités masquées')&&html.includes('Réactiver'),'disabled agenda state missing');

  // Step 6 must consolidate old Today reminder surfaces.
  ok(renderTodayMobilityPrompt()==='', 'legacy mobility prompt is still rendered');
  ok(renderTodayPlannedEvents()==='', 'legacy planned-event prompt is still rendered');
  const useful=renderTodayUsefulActions();
  ok(!useful.includes('Tests périodiques'),'periodic tests are duplicated in legacy Today useful actions');

  // Final Today renderer must contain one central agenda and no legacy duplicate surfaces.
  setReminderPrefs({...getReminderPrefs(),enabled:true,workout:true,activities:true,measurements:true,tests:true,mobility:true,recovery:true,visibility:'due-only'});
  const todayHtml=renderToday();
  ok((todayHtml.match(/<section class=\"card today-agenda(?: |\")/g)||[]).length===1,'final Today renderer does not contain exactly one central agenda');
  ok(todayHtml.includes('id=\"todayWorkoutHero\"'),'Today workout/rest hero has no agenda anchor');
  ok(!todayHtml.includes('today-mobility-prompt')&&!todayHtml.includes('today-planned-events'),'legacy Today task surfaces remain duplicated in final render');

  if(failures.length)throw new Error('STEP6_RUNTIME_FAIL '+JSON.stringify(failures));
  console.log('STEP6_RUNTIME_OK '+checks+' checks');
})();
`;
try{vm.runInContext(source+'\n'+dailySource+'\n'+tests,sandbox,{filename:'app-step6.js'});}catch(e){console.error(e.message||e);process.exitCode=1;}
