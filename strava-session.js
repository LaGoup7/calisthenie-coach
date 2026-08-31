const crypto = require('crypto');

const COOKIE_NAME = 'cc_strava_session';
const DEFAULT_ORIGIN = 'https://calisthenie-coach.vercel.app';

function env(name){ return String(process.env[name] || '').trim(); }
function secretKey(){
  const secret = env('STRAVA_SESSION_SECRET') || env('STRAVA_CLIENT_SECRET');
  if(!secret) throw new Error('STRAVA_SESSION_SECRET missing');
  return crypto.createHash('sha256').update(secret).digest();
}
function b64url(buf){return Buffer.from(buf).toString('base64url');}
function fromB64url(v){return Buffer.from(v,'base64url');}
function seal(data){
  const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',secretKey(),iv);
  const enc=Buffer.concat([cipher.update(JSON.stringify(data),'utf8'),cipher.final()]),tag=cipher.getAuthTag();
  return `${b64url(iv)}.${b64url(tag)}.${b64url(enc)}`;
}
function unseal(value){
  try{
    const [ivS,tagS,encS]=String(value||'').split('.');if(!ivS||!tagS||!encS)return null;
    const decipher=crypto.createDecipheriv('aes-256-gcm',secretKey(),fromB64url(ivS));
    decipher.setAuthTag(fromB64url(tagS));
    return JSON.parse(Buffer.concat([decipher.update(fromB64url(encS)),decipher.final()]).toString('utf8'));
  }catch{return null;}
}
function parseCookies(req){
  const out={};String(req.headers.cookie||'').split(';').forEach(part=>{const i=part.indexOf('=');if(i<0)return;out[part.slice(0,i).trim()]=decodeURIComponent(part.slice(i+1).trim());});return out;
}
function getSession(req){return unseal(parseCookies(req)[COOKIE_NAME]);}
function cookie(value,maxAge=60*60*24*180){return `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;}
function setSession(res,data){res.setHeader('Set-Cookie',cookie(seal(data)));}
function clearSession(res){res.setHeader('Set-Cookie',cookie('',0));}
function requestBaseUrl(req){const proto=String(req.headers['x-forwarded-proto']||'https').split(',')[0].trim();const host=String(req.headers['x-forwarded-host']||req.headers.host||'').split(',')[0].trim();return host?`${proto}://${host}`:DEFAULT_ORIGIN;}
function appOrigin(req){
  const explicit=env('STRAVA_APP_ORIGIN') || env('PUBLIC_APP_URL');
  if(explicit) return explicit.replace(/\/$/,'');
  const prod=env('VERCEL_PROJECT_PRODUCTION_URL');
  if(prod) return `https://${prod.replace(/^https?:\/\//,'').replace(/\/$/,'')}`;
  // The registered Strava callback domain for this app is the production alias.
  if(String(req.headers.host||'').includes('calisthenie-coach.vercel.app')) return DEFAULT_ORIGIN;
  return requestBaseUrl(req);
}
function callbackUrl(req){return `${appOrigin(req)}/api/strava/callback`;}
function configStatus(req){return {clientIdConfigured:!!env('STRAVA_CLIENT_ID'),clientSecretConfigured:!!env('STRAVA_CLIENT_SECRET'),sessionSecretConfigured:!!env('STRAVA_SESSION_SECRET'),callbackUrl:callbackUrl(req),origin:appOrigin(req)};}
async function tokenRequest(params){
  const body=new URLSearchParams(params);
  const endpoints=['https://www.strava.com/oauth/token','https://www.strava.com/api/v3/oauth/token'];
  let last=null;
  for(const url of endpoints){
    try{
      const r=await fetch(url,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded','accept':'application/json'},body:body.toString()});
      const text=await r.text();let data={};try{data=text?JSON.parse(text):{};}catch{data={message:text.slice(0,200)};}
      if(r.ok) return {ok:true,status:r.status,data,url};
      last={ok:false,status:r.status,data,url};
      // Do not retry credential/code failures; fallback is only useful for endpoint compatibility.
      if(![404,405,410,500,502,503,504].includes(r.status)) break;
    }catch(e){last={ok:false,status:0,data:{message:e.message},url};}
  }
  return last||{ok:false,status:0,data:{message:'No token endpoint available'}};
}
async function refreshSession(req,res,session){
  if(!session) return null;
  const now=Math.floor(Date.now()/1000);
  if(Number(session.expires_at||0)>now+300 && session.access_token)return session;
  const result=await tokenRequest({client_id:env('STRAVA_CLIENT_ID'),client_secret:env('STRAVA_CLIENT_SECRET'),grant_type:'refresh_token',refresh_token:String(session.refresh_token||'')});
  if(!result.ok) return null;
  const data=result.data;
  const next={...session,access_token:data.access_token,refresh_token:data.refresh_token||session.refresh_token,expires_at:data.expires_at,scope:data.scope||session.scope};
  setSession(res,next);return next;
}
module.exports={COOKIE_NAME,env,getSession,setSession,clearSession,requestBaseUrl,appOrigin,callbackUrl,configStatus,tokenRequest,refreshSession};
