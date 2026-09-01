const crypto=require('crypto');
const webpush=require('web-push');
const keys=webpush.generateVAPIDKeys();
const delivery=crypto.randomBytes(32).toString('base64url');
console.log('VAPID_PUBLIC_KEY='+keys.publicKey);
console.log('VAPID_PRIVATE_KEY='+keys.privateKey);
console.log('PUSH_DELIVERY_SECRET='+delivery);
console.log('VAPID_SUBJECT=mailto:YOUR_EMAIL');
