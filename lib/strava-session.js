const crypto = require('crypto');

const COOKIE_NAME = 'cc_strava_session';

function secretKey(){
  const secret = process.env.STRAVA_SESSION_SECRET || process.env.STRAVA_CLIENT_SECRET || '';
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
    const raw=Buffer.concat([decipher.update(fromB64url(encS)),decipher.final()]).toString('utf8');
    return JSON.parse(raw);
  }catch{return null;}
}
function parseCookies(req){
  const out={};String(req.headers.cookie||'').split(';').forEach(part=>{const i=part.indexOf('=');if(i<0)return;out[part.slice(0,i).trim()]=decodeURIComponent(part.slice(i+1).trim());});return out;
}
function getSession(req){return unseal(parseCookies(req)[COOKIE_NAME]);}
function cookie(value,maxAge=60*60*24*180){return `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;}
function setSession(res,data){res.setHeader('Set-Cookie',cookie(seal(data)));}
function clearSession(res){res.setHeader('Set-Cookie',cookie('',0));}
function baseUrl(req){const proto=String(req.headers['x-forwarded-proto']||'https').split(',')[0];const host=String(req.headers['x-forwarded-host']||req.headers.host);return `${proto}://${host}`;}
async function refreshSession(req,res,session){
  if(!session) return null;
  const now=Math.floor(Date.now()/1000);
  if(Number(session.expires_at||0)>now+300 && session.access_token)return session;
  const body=new URLSearchParams({
    client_id:String(process.env.STRAVA_CLIENT_ID||''),
    client_secret:String(process.env.STRAVA_CLIENT_SECRET||''),
    grant_type:'refresh_token',
    refresh_token:String(session.refresh_token||'')
  });
  const r=await fetch('https://www.strava.com/api/v3/oauth/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
  if(!r.ok) return null;
  const data=await r.json();
  const next={...session,access_token:data.access_token,refresh_token:data.refresh_token||session.refresh_token,expires_at:data.expires_at,scope:data.scope||session.scope};
  setSession(res,next);return next;
}
module.exports={COOKIE_NAME,getSession,setSession,clearSession,baseUrl,refreshSession};
