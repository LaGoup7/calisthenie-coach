const { json,readJson,safeId,getDevice,authDevice }=require('../_lib/push-core');
const { send }=require('../_lib/web-push-sender');
module.exports=async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{ok:false,error:'method_not_allowed'});
  try{
    const body=await readJson(req),id=safeId(body.installationId);if(!id)return json(res,400,{ok:false,error:'invalid_device'});
    const device=await getDevice(id);if(!device||!authDevice(device,body.deviceSecret))return json(res,403,{ok:false,error:'device_auth_failed'});
    await send(device.subscription,{title:'KINETIK · Web Push actif',body:'Cette notification vient du serveur et fonctionne même lorsque la PWA est fermée.',tag:`kinetik-test-${Date.now()}`,data:{reason:'test',source:'web-push'},actions:[{action:'open',title:'Ouvrir'}]});
    return json(res,200,{ok:true,sent:true});
  }catch(error){console.error('[KINETIK push test]',error);return json(res,500,{ok:false,error:error.message||'test_failed'});}
};
