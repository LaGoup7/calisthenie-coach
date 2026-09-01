const { isPushRevoked }=require('../../lib/account-core');
const {
  envReady,json,readJson,safeId,safeSecret,hash,validateTimezone,normalizeTime,followupTime,cronAt,
  deterministicScheduleId,validateSubscription,sanitizeManifest,canonicalOrigin,getDevice,putDevice,
  upsertSchedule,deleteSchedule,publishOneOff,cancelMessage,allowNewDevice,authDevice,sanitizeDeviceMeta,healthSnapshot
}=require('../../lib/push-core');

module.exports = async function handler(req,res){
  if(req.method!=='POST') return json(res,405,{ok:false,error:'method_not_allowed'});
  const config=envReady(); if(!config.ready) return json(res,503,{ok:false,error:'push_backend_not_configured'});
  try{
    const body=await readJson(req),installationId=safeId(body.installationId),secret=safeSecret(body.deviceSecret),subscription=validateSubscription(body.subscription);
    if(!installationId||!secret||!subscription) return json(res,400,{ok:false,error:'invalid_device_or_subscription'});
    if(await isPushRevoked(installationId)) return json(res,403,{ok:false,error:'account_device_revoked'});
    const existing=await getDevice(installationId);
    if(existing&&!authDevice(existing,secret)) return json(res,403,{ok:false,error:'device_auth_failed'});
    if(!existing&&!(await allowNewDevice(req))) return json(res,429,{ok:false,error:'registration_rate_limited'});
    const timezone=validateTimezone(body.timezone),deviceMeta=sanitizeDeviceMeta(body.device),prefs={
      preferredTime:normalizeTime(body.prefs?.preferredTime,'08:00'),
      notificationDetail:body.prefs?.notificationDetail==='detailed'?'detailed':'discreet',
      workoutFollowup:body.prefs?.workoutFollowup!==false,
      workoutFollowupDelay:[60,120,180,240].includes(Number(body.prefs?.workoutFollowupDelay))?Number(body.prefs.workoutFollowupDelay):120,
    };
    const manifest=sanitizeManifest(body.manifest),origin=canonicalOrigin(req);
    if(!origin) return json(res,503,{ok:false,error:'public_app_url_required'});
    const destination=`${origin}/api/push/deliver`;
    const primaryId=deterministicScheduleId(installationId,'primary');
    const followupId=deterministicScheduleId(installationId,'followup');
    const followTime=followupTime(prefs),hasReminders=Object.keys(manifest.days).length>0;
    const nowIso=new Date().toISOString(),subscriptionChanged=!!(existing?.subscription?.endpoint&&existing.subscription.endpoint!==subscription.endpoint),health={...healthSnapshot(existing),lastClientSyncAt:nowIso,...(subscriptionChanged?{lastDeliveryErrorAt:null,lastDeliveryError:null,consecutiveFailures:0,backoffUntil:null,backoffReason:null}:{})};
    const prelim={version:2,installationId,secretHash:existing?.secretHash||hash(secret),device:deviceMeta,subscription,timezone,prefs,manifest,schedules:{primaryId:hasReminders?primaryId:null,followupId:hasReminders&&followTime?followupId:null},snooze:existing?.snooze||null,health,createdAt:existing?.createdAt||nowIso,updatedAt:nowIso};
    await putDevice(prelim);
    if(hasReminders){
      await upsertSchedule({scheduleId:primaryId,destination,cron:cronAt(prefs.preferredTime,timezone),body:{installationId,reason:'primary'}});
      if(followTime) await upsertSchedule({scheduleId:followupId,destination,cron:cronAt(followTime,timezone),body:{installationId,reason:'workout-followup'}});
      else await deleteSchedule(followupId);
    }else await Promise.allSettled([deleteSchedule(primaryId),deleteSchedule(followupId)]);

    let snooze=null;
    const snoozeAt=body.snoozeAt?new Date(body.snoozeAt):null,snoozeDate=/^\d{4}-\d{2}-\d{2}$/.test(String(body.snoozeDate||''))?String(body.snoozeDate):null;
    if(existing?.snooze?.messageId && (!snoozeAt || !Number.isFinite(snoozeAt.getTime()) || existing.snooze.at!==snoozeAt.toISOString())) await cancelMessage(existing.snooze.messageId);
    if(snoozeAt&&Number.isFinite(snoozeAt.getTime())&&snoozeAt.getTime()>Date.now()+5000&&snoozeAt.getTime()<Date.now()+24*60*60*1000){
      if(existing?.snooze?.at===snoozeAt.toISOString()&&existing.snooze.messageId) snooze=existing.snooze;
      else {
        const one=await publishOneOff({destination,notBefore:snoozeAt,body:{installationId,reason:'snooze',date:snoozeDate},dedupId:`kinetik-${hash(installationId).slice(0,20)}-snooze-${Math.floor(snoozeAt.getTime()/60000)}`,label:'kinetik-snooze'});
        snooze={at:snoozeAt.toISOString(),date:snoozeDate,messageId:one.messageId||null};
      }
    }
    const device={...prelim,schedules:{primaryId:hasReminders?primaryId:null,followupId:hasReminders&&followTime?followupId:null},snooze,updatedAt:new Date().toISOString()};
    await putDevice(device);
    return json(res,200,{ok:true,active:true,syncedAt:device.updatedAt,timezone,preferredTime:prefs.preferredTime,followupTime:followTime,manifestDays:Object.keys(manifest.days).length,device:device.device,health:healthSnapshot(device)});
  }catch(error){console.error('[KINETIK push sync]',error);return json(res,error.statusCode||500,{ok:false,error:error.message||'sync_failed'});}
};
