const {clearSession}=require('../../lib/strava-session');
module.exports=async function handler(req,res){
  res.setHeader('Content-Type','application/json; charset=utf-8');clearSession(res);res.statusCode=200;res.end(JSON.stringify({ok:true}));
};
