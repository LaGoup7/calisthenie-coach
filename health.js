const {configStatus,getSession}=require('../../lib/strava-session');
module.exports=async function handler(req,res){
  res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');
  let session=false;try{session=!!getSession(req);}catch{}
  const cfg=configStatus(req);
  res.statusCode=200;res.end(JSON.stringify({ok:cfg.clientIdConfigured&&cfg.clientSecretConfigured&&cfg.sessionSecretConfigured,connected:session,clientIdConfigured:cfg.clientIdConfigured,clientSecretConfigured:cfg.clientSecretConfigured,sessionSecretConfigured:cfg.sessionSecretConfigured,callbackUrl:cfg.callbackUrl,origin:cfg.origin,expectedCallbackDomain:'calisthenie-coach.vercel.app'},null,2));
};
