const { json,readJson,safeId,dateKeyInTimezone,getDevice,deleteDevice,claimDelivery,releaseDelivery,deleteSchedule,cancelMessage,deterministicScheduleId }=require('../_lib/push-core');
const { send }=require('../_lib/web-push-sender');

module.exports=async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{ok:false,error:'method_not_allowed'});
  if(String(req.headers.authorization||'')!==`Bearer ${process.env.PUSH_DELIVERY_SECRET}`)return json(res,401,{ok:false,error:'unauthorized'});
  let claimed=false,id,dateKey,reason,claimReason;
  try{
    const body=await readJson(req),installationId=safeId(body.installationId);reason=['primary','workout-followup','snooze'].includes(body.reason)?body.reason:null;
    if(!installationId||!reason)return json(res,400,{ok:false,error:'invalid_delivery'});
    id=installationId;const device=await getDevice(id);if(!device){await Promise.allSettled([deleteSchedule(deterministicScheduleId(id,'primary')),deleteSchedule(deterministicScheduleId(id,'followup'))]);return json(res,200,{ok:true,skipped:'device_missing',schedulesCleaned:true});}
    dateKey=(reason==='snooze'&&/^\d{4}-\d{2}-\d{2}$/.test(String(body.date||'')))?String(body.date):dateKeyInTimezone(new Date(),device.timezone);
    const sourceReason=reason==='snooze'?'primary':reason,item=device.manifest?.days?.[dateKey]?.[sourceReason];
    if(!item)return json(res,200,{ok:true,skipped:'no_due_task'});
    const dedupReason=reason==='snooze'?`snooze-${device.snooze?.at||dateKey}`:reason;claimReason=dedupReason;
    claimed=await claimDelivery(id,dateKey,dedupReason);if(!claimed)return json(res,200,{ok:true,skipped:'duplicate'});
    const payload={title:item.title||'KINETIK',body:item.body||'Une priorité t’attend dans KINETIK.',tag:`kinetik-${reason}-${dateKey}`,data:{taskId:item.taskId||null,reason,source:'web-push'},actions:[{action:'open',title:'Ouvrir'},{action:'snooze',title:'Plus tard'}]};
    await send(device.subscription,payload);
    if(reason==='snooze'){device.snooze=null;device.updatedAt=new Date().toISOString();const {putDevice}=require('../_lib/push-core');await putDevice(device);}
    return json(res,200,{ok:true,sent:true,reason,dateKey});
  }catch(error){
    const status=Number(error.statusCode||error.status||0);
    if((status===404||status===410)&&id){
      try{const device=await getDevice(id);if(device)await Promise.allSettled([deleteSchedule(device.schedules?.primaryId),deleteSchedule(device.schedules?.followupId),cancelMessage(device.snooze?.messageId)]);await deleteDevice(id);}catch(_){}
      return json(res,200,{ok:true,expired:true});
    }
    if(claimed&&id&&dateKey&&claimReason)try{await releaseDelivery(id,dateKey,claimReason);}catch(_){}
    console.error('[KINETIK push deliver]',error);return json(res,500,{ok:false,error:error.message||'delivery_failed'});
  }
};
