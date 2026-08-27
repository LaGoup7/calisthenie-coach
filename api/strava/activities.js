const {getSession,refreshSession,clearSession}=require('../../lib/strava-session');
module.exports=async function handler(req,res){
  res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');
  try{
    let session=getSession(req);if(!session){res.statusCode=401;return res.end(JSON.stringify({error:'Strava non connecté'}));}
    session=await refreshSession(req,res,session);if(!session){clearSession(res);res.statusCode=401;return res.end(JSON.stringify({error:'Connexion Strava expirée'}));}
    const days=Math.min(60,Math.max(1,Number(req.query?.days||21))),after=Math.floor(Date.now()/1000)-days*86400;
    const url=`https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=100&page=1`;
    const r=await fetch(url,{headers:{Authorization:`Bearer ${session.access_token}`}});
    if(!r.ok){res.statusCode=r.status;return res.end(JSON.stringify({error:`Strava API ${r.status}`}));}
    const raw=await r.json();
    const activities=(Array.isArray(raw)?raw:[]).map(a=>({id:a.id,name:a.name,type:a.type,sport_type:a.sport_type,start_date:a.start_date,start_date_local:a.start_date_local,elapsed_time:a.elapsed_time,moving_time:a.moving_time,distance:a.distance,total_elevation_gain:a.total_elevation_gain,average_speed:a.average_speed,max_speed:a.max_speed,average_heartrate:a.average_heartrate,max_heartrate:a.max_heartrate,device_name:a.device_name}));
    res.statusCode=200;res.end(JSON.stringify({activities}));
  }catch(e){console.error(e);res.statusCode=500;res.end(JSON.stringify({error:'Erreur de synchronisation Strava'}));}
};
