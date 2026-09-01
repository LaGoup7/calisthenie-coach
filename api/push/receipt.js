const { json,readJson,verifyReceiptToken,getDevice,putDevice,claimReceipt,withHealth }=require('../_lib/push-core');
module.exports=async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{ok:false,error:'method_not_allowed'});
  try{
    const body=await readJson(req,12000),event=['received','opened'].includes(String(body.event||''))?String(body.event):null,token=String(body.receiptToken||'');
    if(!event||token.length>1200)return json(res,400,{ok:false,error:'invalid_receipt'});
    const receipt=verifyReceiptToken(token);if(!receipt)return json(res,401,{ok:false,error:'invalid_receipt'});
    const claimed=await claimReceipt(token,event);if(!claimed)return json(res,200,{ok:true,duplicate:true});
    let device=await getDevice(receipt.installationId);if(!device)return json(res,200,{ok:true,ignored:'device_missing'});
    const now=new Date(),patch=event==='received'
      ?{lastReceivedAt:now.toISOString(),lastReceivedReason:receipt.reason}
      :{lastOpenedAt:now.toISOString(),lastOpenedReason:receipt.reason,lastOpenDelayMs:Math.max(0,now.getTime()-receipt.issuedAt)};
    device=withHealth(device,patch);await putDevice(device);
    return json(res,200,{ok:true,event});
  }catch(error){console.error('[KINETIK push receipt]',error);return json(res,error.statusCode||500,{ok:false,error:'receipt_failed'});}
};
