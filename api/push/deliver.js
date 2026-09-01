const crypto=require('crypto');
const { json,readJson,safeId,dateKeyInTimezone,getDevice,putDevice,deleteDevice,claimDelivery,releaseDelivery,deleteSchedule,cancelMessage,deterministicScheduleId,withHealth,deliveryErrorCode,applyDeliveryFailure,clearDeliveryFailure,isBackoffActive,createReceiptToken }=require('../../lib/push-core');
const { send }=require('../../lib/web-push-sender');

module.exports=async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{ok:false,error:'method_not_allowed'});
  if(!process.env.PUSH_DELIVERY_SECRET)return json(res,503,{ok:false,error:'push_backend_not_configured'});
  if(String(req.headers.authorization||'')!==`Bearer ${process.env.PUSH_DELIVERY_SECRET}`)return json(res,401,{ok:false,error:'unauthorized'});
  let claimed=false,id,dateKey,reason,claimReason,device=null;
  try{
    const body=await readJson(req),installationId=safeId(body.installationId);reason=['primary','workout-followup','snooze'].includes(body.reason)?body.reason:null;
    if(!installationId||!reason)return json(res,400,{ok:false,error:'invalid_delivery'});
    id=installationId;device=await getDevice(id);if(!device){await Promise.allSettled([deleteSchedule(deterministicScheduleId(id,'primary')),deleteSchedule(deterministicScheduleId(id,'followup'))]);return json(res,200,{ok:true,skipped:'device_missing',schedulesCleaned:true});}
    if(isBackoffActive(device)){return json(res,200,{ok:true,skipped:'backoff_active',retryAt:device.health?.backoffUntil||null});}
    dateKey=(reason==='snooze'&&/^\d{4}-\d{2}-\d{2}$/.test(String(body.date||'')))?String(body.date):dateKeyInTimezone(new Date(),device.timezone);
    const sourceReason=reason==='snooze'?'primary':reason,item=device.manifest?.days?.[dateKey]?.[sourceReason];
    if(!item)return json(res,200,{ok:true,skipped:'no_due_task'});
    const dedupReason=reason==='snooze'?`snooze-${device.snooze?.at||dateKey}`:reason;claimReason=dedupReason;
    claimed=await claimDelivery(id,dateKey,dedupReason);if(!claimed)return json(res,200,{ok:true,skipped:'duplicate'});
    const deliveryId=crypto.randomBytes(18).toString('base64url'),issuedAt=Date.now(),receiptToken=createReceiptToken({installationId:id,deliveryId,reason,issuedAt});
    const payload={title:item.title||'KINETIK',body:item.body||'Une priorité t’attend dans KINETIK.',tag:`kinetik-${reason}-${dateKey}`,data:{taskId:item.taskId||null,reason,source:'web-push',receiptToken,deliveryId},actions:[{action:'open',title:'Ouvrir'},{action:'snooze',title:'Plus tard'}]};
    await send(device.subscription,payload);
    device=clearDeliveryFailure(withHealth(device,{lastDeliveryAcceptedAt:new Date().toISOString(),lastDeliveryReason:reason,lastDeliveryDate:dateKey}));
    if(reason==='snooze')device.snooze=null;
    await putDevice(device);
    return json(res,200,{ok:true,sent:true,reason,dateKey});
  }catch(error){
    const status=Number(error.statusCode||error.status||0),code=deliveryErrorCode(error);
    if((status===404||status===410)&&id){
      try{if(device)await Promise.allSettled([deleteSchedule(device.schedules?.primaryId),deleteSchedule(device.schedules?.followupId),cancelMessage(device.snooze?.messageId)]);await deleteDevice(id);}catch(_){}
      return json(res,200,{ok:true,expired:true});
    }
    if(device){try{device=applyDeliveryFailure(device,code);await putDevice(device);}catch(_){} }
    if(claimed&&id&&dateKey&&claimReason)try{await releaseDelivery(id,dateKey,claimReason);}catch(_){}
    console.error('[KINETIK push deliver]',error);return json(res,500,{ok:false,error:code});
  }
};
