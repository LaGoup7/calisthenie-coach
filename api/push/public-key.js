const { envReady, json } = require('../_lib/push-core');
module.exports = async function handler(req,res){
  if(req.method!=='GET') return json(res,405,{ok:false,error:'method_not_allowed'});
  const config=envReady();
  return json(res,200,{ok:true,configured:config.ready,publicKey:config.ready?process.env.VAPID_PUBLIC_KEY:null,missing:process.env.NODE_ENV==='production'?[]:config.missing});
};
