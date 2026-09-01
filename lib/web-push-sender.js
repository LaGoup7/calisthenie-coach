let configured = false;
function client() {
  const webpush = require('web-push');
  if (!configured) {
    webpush.setVapidDetails(process.env.VAPID_SUBJECT, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
    configured = true;
  }
  return webpush;
}
async function send(subscription, payload) {
  return client().sendNotification(subscription, JSON.stringify(payload), { TTL: 60 * 60 * 12 });
}
module.exports = { send };
