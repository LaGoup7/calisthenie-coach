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
  documentElement:{style:{setProperty(){}},dataset:{},classList:{add(){},remove(){},toggle(){}}},body:{classList:{add(){},remove(){},toggle(){}}},
  createElement:tag=>({tagName:tag.toUpperCase(),style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},appendChild(){},remove(){},click(){},setAttribute(){},getContext(){return null}})
};
const sessionStore=new Map();
const sessionStorage={getItem:k=>sessionStore.has(k)?sessionStore.get(k):null,setItem:(k,v)=>sessionStore.set(k,String(v)),removeItem:k=>sessionStore.delete(k),clear:()=>sessionStore.clear()};
const sandbox={console,localStorage,sessionStorage,document,navigator:{},location:{origin:'http://localhost',pathname:'/',search:''},history:{replaceState(){}},URL:global.URL,URLSearchParams:global.URLSearchParams,Blob:global.Blob,FileReader:function(){},setTimeout,clearTimeout,setInterval,clearInterval,requestAnimationFrame:fn=>fn(),cancelAnimationFrame(){},confirm:()=>true,prompt:()=>null,fetch:async()=>({ok:false,json:async()=>({})}),performance:{now:()=>Date.now()},indexedDB:undefined,crypto:global.crypto};
sandbox.window=sandbox;sandbox.window.addEventListener=()=>{};sandbox.window.removeEventListener=()=>{};sandbox.window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});sandbox.self=sandbox.window;
vm.createContext(sandbox);
const tests=`
(function(){
  const failures=[];let checks=0;const ok=(cond,msg)=>{checks++;if(!cond)failures.push(msg);};
  localStorage.clear();
  const now=new Date(),key=localDateKey(now),today=now.getDay();
  setBodyLogs([]);setPlannedEvents([]);setActivities([]);setFlexLogs([]);setMobilityTests([]);setTests([]);
  setReminderPrefs({...getReminderPrefs(),enabled:true,workout:false,activities:false,measurements:true,tests:false,mobility:false,recovery:false,visibility:'due-only'});
  ok(window.KinetikDailyTasks.version==='1.6.0','Daily Tasks engine is not v1.6.0');

  let tasks=window.KinetikDailyTasks.getAgendaTasks({now,includeDone:true});
  const weight=tasks.find(x=>x.kind==='measurement'&&x.title==='Poids');
  const waist=tasks.find(x=>x.kind==='measurement'&&x.title==='Tour de taille');
  const full=tasks.find(x=>x.kind==='measurement'&&x.title==='Bilan complet');
  const photos=tasks.find(x=>x.kind==='measurement'&&x.title==='Photos');
  ok(weight?.action?.type==='measurement-entry'&&weight.action.payload?.metric==='weight'&&weight.action.payload?.mode==='quick','weight direct action is incorrect');
  ok(waist?.action?.type==='measurement-entry'&&waist.action.payload?.metric==='waist','waist direct action is incorrect');
  ok(full?.action?.type==='measurement-entry'&&full.action.payload?.metric==='full'&&full.action.payload?.mode==='full','full measurement direct action is incorrect');
  ok(photos?.action?.type==='measurement-entry'&&photos.action.payload?.metric==='photos'&&photos.action.payload?.mode==='full','photo direct action is incorrect');
  ok(todayAgendaAction(weight).includes('data-daily-task-action')&&!todayAgendaAction(weight).includes('data-view='),'agenda measurement still uses generic page navigation');

  const originalRender=render;render=function(){};
  executeTodayAgendaTask(weight);
  ok(state.bodyEditor===true&&state.bodyEditorMode==='quick'&&state.bodyDirectTarget==='weight','executing weight task does not open targeted quick measurement');
  state.bodyEditor=false;state.bodyDirectTarget=null;
  executeTodayAgendaTask(photos);
  ok(state.bodyEditor===true&&state.bodyEditorMode==='full'&&state.bodyDirectTarget==='photos','executing photo task does not open full photo flow');
  state.bodyEditor=false;state.bodyDirectTarget=null;

  const plan={id:'plan-step7',date:key,time:'18:00',type:'running',duration:45,rpe:6,note:''};setPlannedEvents([plan]);
  setReminderPrefs({...getReminderPrefs(),workout:false,activities:true,measurements:false,tests:false,mobility:false,recovery:false});
  tasks=window.KinetikDailyTasks.getAgendaTasks({now,includeDone:true});
  const activity=tasks.find(x=>x.source==='planning');
  ok(activity?.action?.type==='planned-event'&&activity.action.id==='plan-step7','planned activity direct action is incorrect');
  executeTodayAgendaTask(activity);
  ok(state.activityEditor===true&&state.activityDraftPlanId==='plan-step7','planned activity does not open the planned-vs-actual editor');
  state.activityEditor=false;state.activityDraftPlanId=null;

  const assessmentTask={action:{type:'assessment-start',payload:{protocolId:'pullups'}}};
  executeTodayAgendaTask(assessmentTask);
  ok(state.view==='assessment'&&state.assessmentEditor==='pullups','assessment task does not open the exact protocol');
  state.assessmentEditor=null;

  const routineId=FLEX_ROUTINES[0]?.id;
  const routineTask={action:{type:'mobility-routine',payload:{routineId}}};
  executeTodayAgendaTask(routineTask);
  ok(state.active?.kind==='flexibility'&&state.active?.workout?.id===routineId,'mobility task does not start the exact recommended routine');
  state.active=null;

  const zoneId=MOBILITY_ZONES[0]?.id,testId=MOBILITY_ZONES[0]?.tests?.[0];
  const mobilityAssessmentTask={action:{type:'mobility-assessment',payload:{zoneId,testId}}};
  executeTodayAgendaTask(mobilityAssessmentTask);
  ok(state.view==='flexibility'&&state.mobilityChartZone===zoneId,'mobility assessment does not target the requested zone');

  const viewTask={action:{type:'view',view:'measurements'}};
  executeTodayAgendaTask(viewTask);
  ok(state.view==='measurements','generic view fallback no longer works');

  render=originalRender;
  setReminderPrefs({...getReminderPrefs(),enabled:true,workout:true,activities:false,measurements:false,tests:false,mobility:false,recovery:false});
  tasks=window.KinetikDailyTasks.getAgendaTasks({now,includeDone:true});
  const workout=tasks.find(x=>x.kind==='workout'&&x.status==='pending');
  if(workout){
    ok(workout.action?.type==='workout-start','workout task does not expose workout-start action');
    render=function(){};executeTodayAgendaTask(workout);ok(!!state.sessionModeEditor,'workout direct action does not open the format picker');render=originalRender;state.sessionModeEditor=null;
  }else{ok(true,'no workout scheduled today');ok(true,'no workout scheduled today');}

  ok(todayAgendaAction({id:'u',status:'upcoming',action:{type:'view',label:'Voir'}})==='','upcoming task exposes an action button');
  ok(todayAgendaAction({id:'d',status:'done',action:{type:'view',label:'Voir'}})==='','done task exposes an action button');
  ok(typeof window.executeTodayAgendaTaskById==='function','direct task execution API is not exposed');

  if(failures.length)throw new Error('STEP7_RUNTIME_FAIL '+JSON.stringify(failures));
  console.log('STEP7_RUNTIME_OK '+checks+' checks');
})();
`;
try{vm.runInContext(source+'\n'+dailySource+'\n'+tests,sandbox,{filename:'app-step7.js'});}catch(e){console.error(e.message||e);process.exitCode=1;}
