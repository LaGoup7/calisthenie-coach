const { json,readJson,safeId,safeSecret,getDevice,authDevice,healthSnapshot,hash }=require('../_lib/push-core');
module.exports=async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{ok:false,error:'method_not_allowed'});
  try{
    const body=await readJson(req),id=safeId(body.installationId),secret=safeSecret(body.deviceSecret);if(!id||!secret)return json(res,400,{ok:false,error:'invalid_device'});
    const device=await getDevice(id);
    if(!device)return json(res,200,{ok:true,exists:false,serverNow:new Date().toISOString()});
    if(!authDevice(device,secret))return json(res,403,{ok:false,error:'device_auth_failed'});
    return json(res,200,{ok:true,exists:true,serverNow:new Date().toISOString(),device:{label:device.device?.label||'Cet appareil',platform:device.device?.platform||'other',standalone:!!device.device?.standalone,appVersion:device.device?.appVersion||null},subscription:{fingerprint:hash(device.subscription?.endpoint||'').slice(0,16)},timezone:device.timezone||'UTC',preferredTime:device.prefs?.preferredTime||'08:00',manifestDays:Object.keys(device.manifest?.days||{}).length,schedules:{primary:!!device.schedules?.primaryId,followup:!!device.schedules?.followupId,snooze:!!device.snooze?.messageId},health:healthSnapshot(device)});
  }catch(error){console.error('[KINETIK push status]',error);return json(res,500,{ok:false,error:error.message||'status_failed'});}
};
