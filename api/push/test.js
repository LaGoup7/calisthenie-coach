const { json,readJson,safeId,getDevice,putDevice,deleteDevice,deleteSchedule,cancelMessage,authDevice,withHealth,healthSnapshot,deliveryErrorCode }=require('../_lib/push-core');
const { send }=require('../_lib/web-push-sender');
module.exports=async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{ok:false,error:'method_not_allowed'});
  let device=null,id=null;
  try{
    const body=await readJson(req);id=safeId(body.installationId);if(!id)return json(res,400,{ok:false,error:'invalid_device'});
    device=await getDevice(id);if(!device||!authDevice(device,body.deviceSecret))return json(res,403,{ok:false,error:'device_auth_failed'});
    await send(device.subscription,{title:'KINETIK · Web Push actif',body:'Cette notification vient du serveur et fonctionne même lorsque la PWA est fermée.',tag:`kinetik-test-${Date.now()}`,data:{reason:'test',source:'web-push'},actions:[{action:'open',title:'Ouvrir'}]});
    device=withHealth(device,{lastTestAcceptedAt:new Date().toISOString(),lastDeliveryErrorAt:null,lastDeliveryError:null,consecutiveFailures:0});await putDevice(device);
    return json(res,200,{ok:true,sent:true,health:healthSnapshot(device)});
  }catch(error){
    const status=Number(error.statusCode||error.status||0),code=deliveryErrorCode(error);
    if(device&&id&&(status===404||status===410)){await Promise.allSettled([deleteSchedule(device.schedules?.primaryId),deleteSchedule(device.schedules?.followupId),cancelMessage(device.snooze?.messageId)]);await deleteDevice(id);return json(res,200,{ok:true,expired:true});}
    if(device){try{device=withHealth(device,{lastDeliveryErrorAt:new Date().toISOString(),lastDeliveryError:code,consecutiveFailures:Number(device.health?.consecutiveFailures||0)+1});await putDevice(device);}catch(_){} }
    console.error('[KINETIK push test]',error);return json(res,500,{ok:false,error:code});
  }
};
