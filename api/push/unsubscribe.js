const { json,readJson,safeId,getDevice,deleteDevice,deleteSchedule,cancelMessage,authDevice }=require('../_lib/push-core');
module.exports=async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{ok:false,error:'method_not_allowed'});
  try{
    const body=await readJson(req),id=safeId(body.installationId);if(!id)return json(res,400,{ok:false,error:'invalid_device'});
    const device=await getDevice(id);if(!device)return json(res,200,{ok:true,removed:false});
    if(!authDevice(device,body.deviceSecret))return json(res,403,{ok:false,error:'device_auth_failed'});
    await Promise.allSettled([deleteSchedule(device.schedules?.primaryId),deleteSchedule(device.schedules?.followupId),cancelMessage(device.snooze?.messageId)]);
    await deleteDevice(id);return json(res,200,{ok:true,removed:true});
  }catch(error){console.error('[KINETIK push unsubscribe]',error);return json(res,500,{ok:false,error:error.message||'unsubscribe_failed'});}
};
