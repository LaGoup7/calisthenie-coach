const {getSession,configStatus}=require('../../lib/strava-session');
module.exports=async function handler(req,res){
  res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');
  const diagnostic=String(req.query?.diagnostic||'')==='1';
  let session=null;try{session=getSession(req);}catch{}
  if(diagnostic){
    const cfg=configStatus(req);
    res.statusCode=200;return res.end(JSON.stringify({ok:cfg.clientIdConfigured&&cfg.clientSecretConfigured&&cfg.sessionSecretConfigured,connected:!!session,clientIdConfigured:cfg.clientIdConfigured,clientSecretConfigured:cfg.clientSecretConfigured,sessionSecretConfigured:cfg.sessionSecretConfigured,callbackUrl:cfg.callbackUrl,origin:cfg.origin,expectedCallbackDomain:'calisthenie-coach.vercel.app'},null,2));
  }
  res.statusCode=200;res.end(JSON.stringify(session?{connected:true,athlete:session.athlete||null,scope:session.scope||''}:{connected:false}));
};
