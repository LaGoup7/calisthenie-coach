const fs=require('fs');
const vm=require('vm');
const source=fs.readFileSync(__dirname+'/app.js','utf8');
const dailySource=fs.readFileSync(__dirname+'/daily-tasks.js','utf8');
const store=new Map();
const localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k),clear:()=>store.clear()};
const appNode={innerHTML:'',dataset:{},classList:{add(){},remove(){},toggle(){}},querySelectorAll(){return[]}};
const document={getElementById:id=>id==='app'?appNode:null,querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){},removeEventListener(){},documentElement:{style:{setProperty(){}},dataset:{},classList:{add(){},remove(){},toggle(){}}},body:{classList:{add(){},remove(){},toggle(){}}},createElement:tag=>({tagName:tag.toUpperCase(),style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},appendChild(){},remove(){},click(){},setAttribute(){},getContext(){return null}})};
const sessionStore=new Map();
const sessionStorage={getItem:k=>sessionStore.has(k)?sessionStore.get(k):null,setItem:(k,v)=>sessionStore.set(k,String(v)),removeItem:k=>sessionStore.delete(k),clear:()=>sessionStore.clear()};
const sandbox={console,localStorage,sessionStorage,document,navigator:{},location:{origin:'http://localhost',pathname:'/',search:''},history:{replaceState(){}},URL:global.URL,URLSearchParams:global.URLSearchParams,Blob:global.Blob,FileReader:function(){},setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame:fn=>fn(),cancelAnimationFrame(){},confirm:()=>true,prompt:()=>null,fetch:async()=>({ok:false,json:async()=>({})}),performance:{now:()=>Date.now()},indexedDB:undefined,crypto:global.crypto};
sandbox.window=sandbox;sandbox.window.addEventListener=()=>{};sandbox.window.removeEventListener=()=>{};sandbox.window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});sandbox.self=sandbox.window;
vm.createContext(sandbox);
const tests=`
(function(){
 const failures=[];let checks=0;const ok=(cond,msg)=>{checks++;if(!cond)failures.push(msg);};
 localStorage.clear();
 const now=new Date(),key=localDateKey(now),tomorrow=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,12),tomorrowKey=localDateKey(tomorrow);
 setBodyLogs([]);setPlannedEvents([]);setActivities([]);setFlexLogs([]);setMobilityTests([]);setTests([]);
 setReminderPrefs({...getReminderPrefs(),enabled:true,workout:false,activities:false,measurements:true,tests:false,mobility:false,recovery:false,visibility:'due-only'});
 ok(window.KinetikDailyTasks.version==='1.5.0','Daily Tasks engine is not v1.5.0');
 ok(typeof window.KinetikDailyTasks.setTaskDecision==='function','setTaskDecision API missing');
 ok(typeof window.KinetikDailyTasks.clearTaskDecision==='function','clearTaskDecision API missing');
 ok(typeof window.KinetikDailyTasks.getTaskDecisions==='function','getTaskDecisions API missing');
 ok(STORAGE.dailyTaskDecisions==='cc_daily_task_decisions_v1','decision journal is not included in backup/reset storage registry');

 let tasks=window.KinetikDailyTasks.getAgendaTasks({now,includeDone:true});
 const weight=tasks.find(x=>x.kind==='measurement'&&x.action?.payload?.metric==='weight');
 ok(!!weight&&weight.status==='pending','weight task missing for decision test');
 const bodyBefore=getBodyLogs().length;
 let decision=window.KinetikDailyTasks.setTaskDecision(weight.id,'done',{now});
 ok(decision?.state==='done','manual done decision was not stored');
 tasks=window.KinetikDailyTasks.getAgendaTasks({now,includeDone:true});
 let decidedWeight=tasks.find(x=>x.id===weight.id);
 ok(decidedWeight?.status==='done'&&decidedWeight.metadata?.manualCompletion===true,'manual done is not reflected in agenda');
 ok(getBodyLogs().length===bodyBefore,'manual done falsified body history');
 let summary=window.KinetikDailyTasks.agendaSummary(tasks);
 ok(summary.done>=1,'manual done does not contribute to daily completion');
 let html=renderTodayAgenda();
 ok(html.includes('manuel'),'manual completion is not disclosed in Today completed summary');

 ok(window.KinetikDailyTasks.clearTaskDecision(weight.id)===true,'manual decision cannot be cleared');
 tasks=window.KinetikDailyTasks.getAgendaTasks({now,includeDone:true});
 ok(tasks.find(x=>x.id===weight.id)?.status==='pending','cleared decision does not restore pending task');

 decision=window.KinetikDailyTasks.setTaskDecision(weight.id,'ignored',{now});
 tasks=window.KinetikDailyTasks.getAgendaTasks({now,includeDone:true});
 decidedWeight=tasks.find(x=>x.id===weight.id);summary=window.KinetikDailyTasks.agendaSummary(tasks);
 ok(decidedWeight?.status==='ignored','ignored decision not applied');
 ok(summary.ignored===1&&summary.adjusted>=1,'ignored task not counted as adjusted');
 ok(!tasks.filter(x=>x.status==='pending').some(x=>x.id===weight.id),'ignored task remains active');
 html=renderTodayAgenda();
 ok(html.includes('Ignoré aujourd’hui')&&html.includes('Annuler'),'ignored occurrence has no reversible UI');
 window.KinetikDailyTasks.clearTaskDecision(weight.id);

 decision=window.KinetikDailyTasks.setTaskDecision(weight.id,'postponed',{now,deferTo:tomorrowKey});
 ok(decision?.deferTo===tomorrowKey,'postpone date was not stored');
 tasks=window.KinetikDailyTasks.getAgendaTasks({now,includeDone:true});
 decidedWeight=tasks.find(x=>x.id===weight.id);summary=window.KinetikDailyTasks.agendaSummary(tasks);
 ok(decidedWeight?.status==='postponed'&&decidedWeight.metadata?.deferTo===tomorrowKey,'postponed status not applied today');
 ok(summary.postponed===1,'postponed task not counted as adjusted');

 const tomorrowTasks=window.KinetikDailyTasks.getAgendaTasks({now:tomorrow,includeDone:true});
 const weightTomorrow=tomorrowTasks.filter(x=>x.kind==='measurement'&&x.action?.payload?.metric==='weight');
 ok(weightTomorrow.length===1,'postponed weight duplicates natural due task tomorrow');
 ok(weightTomorrow[0].status==='pending'&&weightTomorrow[0].metadata?.deferredFrom===key,'postponed task is not carried into tomorrow');

 setBodyLogs([{id:77,date:tomorrow.toISOString(),weight:88.8,custom:{},measurementMode:'quick'}]);
 const tomorrowDone=window.KinetikDailyTasks.getAgendaTasks({now:tomorrow,includeDone:true}).filter(x=>x.kind==='measurement'&&x.action?.payload?.metric==='weight');
 ok(tomorrowDone.length===1&&tomorrowDone[0].status==='done','real data tomorrow does not complete carried measurement');

 const decisions=window.KinetikDailyTasks.getTaskDecisions({now});
 ok(decisions.some(x=>x.taskId===weight.id&&x.state==='postponed'),'decision history is not readable');
 ok(localStorage.getItem('cc_daily_task_decisions_v1')!==null,'decision journal is not persisted separately');
 ok(renderReminderSettings().includes('Historique des décisions')&&renderReminderSettings().includes('Conservé 180 jours'),'decision history is not exposed in reminder settings');

 // A specific postponed workout must survive even when the next day has a different natural workout.
 window.KinetikDailyTasks.clearTaskDecision(weight.id);setBodyLogs([]);
 setReminderPrefs({...getReminderPrefs(),workout:true,measurements:false});
 tasks=window.KinetikDailyTasks.getAgendaTasks({now,includeDone:true});
 const workout=tasks.find(x=>x.kind==='workout'&&x.status==='pending');
 if(workout){
   window.KinetikDailyTasks.setTaskDecision(workout.id,'postponed',{now,deferTo:tomorrowKey});
   const t2=window.KinetikDailyTasks.getAgendaTasks({now:tomorrow,includeDone:true});
   ok(t2.some(x=>x.metadata?.deferredFrom===key&&x.kind==='workout'),'specific postponed workout is lost on carry-forward');
 }else ok(true,'no workout scheduled today');

 // UI must expose all three explicit decisions only on active tasks.
 setReminderPrefs({...getReminderPrefs(),workout:false,measurements:true});setBodyLogs([]);
 tasks=window.KinetikDailyTasks.getAgendaTasks({now,includeDone:true});
 const active=tasks.find(x=>x.kind==='measurement'&&x.status==='pending');
 const taskHtml=renderTodayAgendaTask(active);
 ok(taskHtml.includes('Marquer fait')&&taskHtml.includes('Reporter à demain')&&taskHtml.includes('Ignorer aujourd’hui'),'task decision menu is incomplete');
 ok(taskHtml.includes('data-daily-task-postpone-date'),'custom postpone date control missing');
 ok(typeof window.setTodayTaskDecision==='function'&&typeof window.clearTodayTaskDecision==='function','Today decision bridge is not exposed');

 if(failures.length)throw new Error('STEP8_RUNTIME_FAIL '+JSON.stringify(failures));
 console.log('STEP8_RUNTIME_OK '+checks+' checks');
})();`;
try{vm.runInContext(source+'\n'+dailySource+'\n'+tests,sandbox,{filename:'app-step8.js'});}catch(e){console.error(e.message||e);process.exitCode=1;}
