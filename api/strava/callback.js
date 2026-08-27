const {baseUrl,setSession}=require('../../lib/strava-session');
module.exports=async function handler(req,res){
  const home=baseUrl(req);
  const code=req.query?.code; const denied=req.query?.error;
  if(denied||!code){res.statusCode=302;res.setHeader('Location',`${home}/?strava=cancelled`);return res.end();}
  try{
    const body=new URLSearchParams({client_id:String(process.env.STRAVA_CLIENT_ID||''),client_secret:String(process.env.STRAVA_CLIENT_SECRET||''),code:String(code),grant_type:'authorization_code'});
    const r=await fetch('https://www.strava.com/api/v3/oauth/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
    if(!r.ok) throw new Error(`Strava token exchange failed: ${r.status}`);
    const data=await r.json();
    const granted=String(req.query?.scope||data.scope||'');
    if(!granted.includes('activity:read')) throw new Error(`Required Strava activity scope not granted (received: ${granted||'none'})`);
    setSession(res,{access_token:data.access_token,refresh_token:data.refresh_token,expires_at:data.expires_at,scope:granted,athlete:data.athlete?{id:data.athlete.id,firstname:data.athlete.firstname,lastname:data.athlete.lastname,profile_medium:data.athlete.profile_medium}:null});
    res.statusCode=302;res.setHeader('Location',`${home}/?strava=connected`);res.end();
  }catch(e){console.error(e);res.statusCode=302;res.setHeader('Location',`${home}/?strava=error`);res.end();}
};
