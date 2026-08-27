const {getSession}=require('../../lib/strava-session');
module.exports=async function handler(req,res){
  res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');
  const session=getSession(req);
  res.statusCode=200;res.end(JSON.stringify(session?{connected:true,athlete:session.athlete||null,scope:session.scope||''}:{connected:false}));
};
