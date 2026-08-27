const {baseUrl}=require('../../lib/strava-session');
module.exports=async function handler(req,res){
  const clientId=process.env.STRAVA_CLIENT_ID;
  if(!clientId||!process.env.STRAVA_CLIENT_SECRET){res.statusCode=500;return res.end('Strava environment variables are not configured.');}
  const redirectUri=`${baseUrl(req)}/api/strava/callback`;
  const q=new URLSearchParams({client_id:String(clientId),redirect_uri:redirectUri,response_type:'code',approval_prompt:'auto',scope:'activity:read_all'});
  res.statusCode=302;res.setHeader('Location',`https://www.strava.com/oauth/authorize?${q.toString()}`);res.end();
};
