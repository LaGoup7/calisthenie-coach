const {env,appOrigin,setSession,tokenRequest}=require('../../lib/strava-session');
function q(req,key){return req.query?.[key] ?? new URL(req.url,'https://local.invalid').searchParams.get(key);}
module.exports=async function handler(req,res){
  const home=appOrigin(req),code=q(req,'code'),denied=q(req,'error'),scopeParam=String(q(req,'scope')||'');
  if(denied){res.statusCode=302;res.setHeader('Location',`${home}/?strava=error&reason=access_denied`);return res.end();}
  if(!code){res.statusCode=302;res.setHeader('Location',`${home}/?strava=error&reason=token_exchange`);return res.end();}
  try{
    const result=await tokenRequest({client_id:env('STRAVA_CLIENT_ID'),client_secret:env('STRAVA_CLIENT_SECRET'),code:String(code),grant_type:'authorization_code'});
    if(!result.ok){console.error('Strava token exchange failed',result.status,result.data);res.statusCode=302;res.setHeader('Location',`${home}/?strava=error&reason=token_exchange`);return res.end();}
    const data=result.data||{},granted=String(scopeParam||data.scope||'').replace(/,/g,' ');
    if(!data.access_token||!data.refresh_token){console.error('Strava token response missing tokens');res.statusCode=302;res.setHeader('Location',`${home}/?strava=error&reason=token_exchange`);return res.end();}
    if(!granted.includes('activity:read')){console.error('Required Strava scope missing',granted);res.statusCode=302;res.setHeader('Location',`${home}/?strava=error&reason=missing_scope`);return res.end();}
    try{
      setSession(res,{access_token:data.access_token,refresh_token:data.refresh_token,expires_at:data.expires_at,scope:granted,athlete:data.athlete?{id:data.athlete.id,firstname:data.athlete.firstname,lastname:data.athlete.lastname,profile_medium:data.athlete.profile_medium}:null});
    }catch(e){console.error('Strava session creation failed',e);res.statusCode=302;res.setHeader('Location',`${home}/?strava=error&reason=session_error`);return res.end();}
    res.statusCode=302;res.setHeader('Cache-Control','no-store');res.setHeader('Location',`${home}/?strava=connected`);res.end();
  }catch(e){console.error('Strava callback exception',e);res.statusCode=302;res.setHeader('Location',`${home}/?strava=error&reason=token_exchange`);res.end();}
};
