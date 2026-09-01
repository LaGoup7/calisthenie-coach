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
 const DAY=86400000,now=new Date(2026,8,1,10,0,0),key=localDateKey(now),ago=n=>new Date(now.getTime()-n*DAY).toISOString(),ahead=n=>new Date(now.getTime()+n*DAY);
 localStorage.clear();setAssessments([]);setTests([]);setBodyLogs([]);setPlannedEvents([]);setActivities([]);setFlexLogs([]);setMobilityTests([]);
 setReminderPrefs({...getReminderPrefs(),enabled:true,workout:false,activities:false,measurements:false,tests:true,mobility:false,recovery:false,visibility:'due-only',upcomingDays:3});
 ok(window.KinetikDailyTasks.version==='1.6.0','Daily Tasks engine is not v1.6.0');
 ok(typeof assessmentProtocolStatuses==='function'&&typeof protocolFreshness==='function','protocol freshness API missing');
 const initial=assessmentProtocolStatuses(now);
 ok(initial.length===15,'all 15 assessment protocols are not tracked independently');
 ok(initial.every(x=>x.freshness.state==='never'&&x.freshness.due),'never-tested protocols are not individually due');
 ok(protocolFreshnessDays(assessmentProtocol('pullups'))===42,'pullups freshness cadence should be 42 days');
 ok(protocolFreshnessDays(assessmentProtocol('muscle_up'))===56,'muscle-up freshness cadence should be 56 days');
 ok(protocolFreshnessDays(assessmentProtocol('cooper12'))===56&&protocolFreshnessDays(assessmentProtocol('run5k'))===56,'cardio freshness cadence should be 56 days');

 let tasks=window.KinetikDailyTasks.getAgendaTasks({now,includeDone:true});
 let active=tasks.filter(x=>x.kind==='test'&&(x.status==='pending'||x.status==='upcoming'));
 ok(active.length===1,'Today must expose only one active assessment even when many are due');
 ok(active[0].id.startsWith('test:')&&!active[0].id.includes('periodic'),'global periodic test task still exists');
 ok(active[0].action?.type==='assessment-start'&&active[0].action?.payload?.protocolId,'assessment task does not target an exact protocol');
 ok(active[0].metadata?.freshnessDays>=42,'assessment task does not expose protocol freshness metadata');

 // Make every protocol fresh except dips, which is stale.
 const freshRows=ASSESSMENT_PROTOCOLS.map((p,i)=>({id:'fresh-'+i,date:ago(1),protocolId:p.id,category:p.category,kind:p.kind,testId:p.testId||null,exercise:p.exercise||null,value:1,unit:p.unit,evidenceLevel:3,source:'kinetik'}));
 const dipsIndex=freshRows.findIndex(x=>x.protocolId==='dips');freshRows[dipsIndex].date=ago(50);
 setAssessments(freshRows);setTests([]);
 let statuses=assessmentProtocolStatuses(now),dips=statuses.find(x=>x.id==='dips'),pull=statuses.find(x=>x.id==='pullups');
 ok(dips.freshness.due&&dips.freshness.overdueDays>0,'stale dips protocol is not due independently');
 ok(!pull.freshness.due&&pull.freshness.daysUntil>=40,'fresh pullups protocol was incorrectly refreshed/staled by another protocol');
 tasks=window.KinetikDailyTasks.getAgendaTasks({now,includeDone:true});active=tasks.filter(x=>x.kind==='test'&&x.status==='pending');
 ok(active.length===1&&active[0].metadata.protocolId==='dips','Daily Tasks does not select the only stale protocol');
 ok(active[0].title.includes('Dips stricts'),'protocol-specific task title is missing');
 const dueSummary=testDueSummary(now);ok(dueSummary.protocolId==='dips'&&dueSummary.label.includes('Dips stricts'),'summary still behaves like a global battery due date');

 // Completing pullups today must not refresh dips and must suppress a second max test today.
 freshRows.push({id:'pull-today',date:now.toISOString(),protocolId:'pullups',category:'force',kind:'test',testId:'pullups',value:8,unit:'reps',evidenceLevel:3,source:'kinetik'});setAssessments(freshRows);
 statuses=assessmentProtocolStatuses(now);dips=statuses.find(x=>x.id==='dips');pull=statuses.find(x=>x.id==='pullups');
 ok(pull.freshness.validatedToday===true,'validated protocol today is not detected');
 ok(dips.freshness.due===true,'completing pullups incorrectly refreshed dips');
 tasks=window.KinetikDailyTasks.getAgendaTasks({now,includeDone:true});
 ok(tasks.some(x=>x.kind==='test'&&x.status==='done'&&x.metadata.protocolId==='pullups'),'completed protocol is not represented as done today');
 ok(!tasks.some(x=>x.kind==='test'&&x.status==='pending'),'a second max assessment is proposed immediately after a validated test');
 const tomorrow=ahead(1);tasks=window.KinetikDailyTasks.getAgendaTasks({now:tomorrow,includeDone:true});
 ok(tasks.some(x=>x.kind==='test'&&x.status==='pending'&&x.metadata.protocolId==='dips'),'stale dips protocol does not return on the following day');

 // Upcoming is individual and obeys reminder horizon.
 const allFresh=ASSESSMENT_PROTOCOLS.map((p,i)=>({id:'u-'+i,date:ago(1),protocolId:p.id,category:p.category,kind:p.kind,testId:p.testId||null,exercise:p.exercise||null,value:1,unit:p.unit,evidenceLevel:3,source:'kinetik'}));
 const pullUpcoming=allFresh.find(x=>x.protocolId==='pullups');pullUpcoming.date=ago(39);setAssessments(allFresh);
 setReminderPrefs({...getReminderPrefs(),tests:true,visibility:'due-and-soon',upcomingDays:3});
 tasks=window.KinetikDailyTasks.getAgendaTasks({now,includeDone:true});active=tasks.filter(x=>x.kind==='test'&&x.status==='upcoming');
 ok(active.length===1&&active[0].metadata.protocolId==='pullups'&&active[0].metadata.daysUntil<=3,'individual upcoming protocol is not surfaced inside the horizon');
 setReminderPrefs({...getReminderPrefs(),visibility:'due-only'});tasks=window.KinetikDailyTasks.getAgendaTasks({now,includeDone:true});
 ok(!tasks.some(x=>x.kind==='test'&&x.status==='upcoming'),'due-only mode still shows upcoming assessment');

 // A deferred assessment has precedence over another natural stale test on the target date.
 setReminderPrefs({...getReminderPrefs(),visibility:'due-only'});
 const stale=ASSESSMENT_PROTOCOLS.map((p,i)=>({id:'s-'+i,date:ago(1),protocolId:p.id,category:p.category,kind:p.kind,testId:p.testId||null,exercise:p.exercise||null,value:1,unit:p.unit,evidenceLevel:3,source:'kinetik'}));
 stale.find(x=>x.protocolId==='dips').date=ago(50);setAssessments(stale);
 tasks=window.KinetikDailyTasks.getAgendaTasks({now,includeDone:true});const dipsTask=tasks.find(x=>x.kind==='test'&&x.status==='pending');
 ok(dipsTask?.metadata?.protocolId==='dips','dips task unavailable for defer test');
 window.KinetikDailyTasks.setTaskDecision(dipsTask.id,'postponed',{now,deferTo:localDateKey(tomorrow)});
 stale.find(x=>x.protocolId==='chest_to_bar').date=ago(50);setAssessments(stale);
 const deferredTomorrow=window.KinetikDailyTasks.getAgendaTasks({now:tomorrow,includeDone:true}).filter(x=>x.kind==='test'&&(x.status==='pending'||x.status==='upcoming'));
 ok(deferredTomorrow.length===1,'a deferred protocol and another stale protocol create two active tests on the same day');
 ok(deferredTomorrow[0].metadata?.protocolId==='dips'&&deferredTomorrow[0].metadata?.deferredFrom===key,'deferred exact protocol does not keep precedence');
 // If the postponed protocol is validated before its target date, it must not come back as pending.
 setAssessments([...stale,{id:'dips-early',date:new Date(now.getTime()+6*3600000).toISOString(),protocolId:'dips',category:'force',kind:'test',testId:'dips',value:9,unit:'reps',evidenceLevel:3,source:'kinetik'}]);
 const afterEarlyCompletion=window.KinetikDailyTasks.getAgendaTasks({now:tomorrow,includeDone:true});
 ok(!afterEarlyCompletion.some(x=>x.kind==='test'&&x.status==='pending'&&x.metadata?.protocolId==='dips'),'postponed protocol remains pending after being validated before the target date');

 // Legacy periodic records count as a reference, declarations do not.
 window.KinetikDailyTasks.clearTaskDecision(dipsTask.id);setAssessments([]);setTests([{id:1,date:ago(10),testId:'pullups',value:7,note:''}]);
 ok(protocolFreshness(assessmentProtocol('pullups'),now).due===false,'legacy periodic test was not migrated into freshness');
 setTests([]);setAssessments([{id:'decl',date:ago(2),protocolId:'pullups',category:'force',kind:'test',testId:'pullups',value:9,unit:'reps',evidenceLevel:1,source:'declared'}]);
 ok(protocolFreshness(assessmentProtocol('pullups'),now).state==='never','declared-only result incorrectly refreshes standardized protocol');

 // Library shows its own freshness and direct action opens exact protocol.
 setAssessments(stale);const rowHtml=renderAssessmentProtocolRow(assessmentProtocol('dips'));
 ok(rowHtml.includes('assessment123-freshness')&&rowHtml.includes('À re-tester'),'assessment library does not expose individual freshness');
 setReminderPrefs({...getReminderPrefs(),tests:true,visibility:'due-only'});tasks=window.KinetikDailyTasks.getAgendaTasks({now,includeDone:true});active=tasks.filter(x=>x.kind==='test'&&x.status==='pending');
 if(active[0]){executeTodayAgendaTask(active[0]);ok(state.assessmentEditor===active[0].metadata.protocolId,'direct assessment CTA does not open its exact protocol');}else ok(false,'no active task for direct action test');

 if(failures.length)throw new Error('STEP9_RUNTIME_FAIL '+JSON.stringify(failures));
 console.log('STEP9_RUNTIME_OK '+checks+' checks');
})();`;
try{vm.runInContext(source+'\n'+dailySource+'\n'+tests,sandbox,{filename:'app-step9.js'});}catch(e){console.error(e.message||e);process.exitCode=1;}
