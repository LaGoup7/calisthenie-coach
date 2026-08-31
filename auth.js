const {env,appOrigin,callbackUrl,configStatus}=require('../../lib/strava-session');
module.exports=async function handler(req,res){
  const cfg=configStatus(req),home=appOrigin(req);
  if(!cfg.clientIdConfigured||!cfg.clientSecretConfigured||!cfg.sessionSecretConfigured){
    res.statusCode=302;res.setHeader('Location',`${home}/?strava=error&reason=missing_config`);return res.end();
  }
  const q=new URLSearchParams({client_id:env('STRAVA_CLIENT_ID'),redirect_uri:callbackUrl(req),response_type:'code',approval_prompt:'force',scope:'activity:read_all'});
  res.statusCode=302;res.setHeader('Cache-Control','no-store');res.setHeader('Location',`https://www.strava.com/oauth/authorize?${q.toString()}`);res.end();
};
