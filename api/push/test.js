const crypto=require('crypto');
const { json,readJson,safeId,getDevice,putDevice,deleteDevice,deleteSchedule,cancelMessage,authDevice,withHealth,healthSnapshot,deliveryErrorCode,applyDeliveryFailure,clearDeliveryFailure,createReceiptToken }=require('../../lib/push-core');
const { send }=require('../../lib/web-push-sender');
module.exports=async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{ok:false,error:'method_not_allowed'});
  let device=null,id=null;
  try{
    const body=await readJson(req);id=safeId(body.installationId);if(!id)return json(res,400,{ok:false,error:'invalid_device'});
    device=await getDevice(id);if(!device||!authDevice(device,body.deviceSecret))return json(res,403,{ok:false,error:'device_auth_failed'});
    const deliveryId=crypto.randomBytes(18).toString('base64url'),issuedAt=Date.now(),receiptToken=createReceiptToken({installationId:id,deliveryId,reason:'test',issuedAt});
    await send(device.subscription,{title:'KINETIK · Web Push actif',body:'Cette notification vient du serveur et fonctionne même lorsque la PWA est fermée.',tag:`kinetik-test-${Date.now()}`,data:{reason:'test',source:'web-push',receiptToken,deliveryId},actions:[{action:'open',title:'Ouvrir'}]});
    device=clearDeliveryFailure(withHealth(device,{lastTestAcceptedAt:new Date().toISOString(),lastDeliveryAcceptedAt:new Date().toISOString(),lastDeliveryReason:'test'}));await putDevice(device);
    return json(res,200,{ok:true,sent:true,health:healthSnapshot(device)});
  }catch(error){
    const status=Number(error.statusCode||error.status||0),code=deliveryErrorCode(error);
    if(device&&id&&(status===404||status===410)){await Promise.allSettled([deleteSchedule(device.schedules?.primaryId),deleteSchedule(device.schedules?.followupId),cancelMessage(device.snooze?.messageId)]);await deleteDevice(id);return json(res,200,{ok:true,expired:true});}
    if(device){try{device=applyDeliveryFailure(device,code);await putDevice(device);}catch(_){} }
    console.error('[KINETIK push test]',error);return json(res,500,{ok:false,error:code});
  }
};
