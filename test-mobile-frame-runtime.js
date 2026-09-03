const fs=require('fs');
const css=fs.readFileSync('styles.css','utf8');
const index=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const pkg=require('./package.json');
let checks=0;const failures=[];
function ok(value,message){checks+=1;if(!value)failures.push(message);}
ok(index.includes('viewport-fit=cover'), 'viewport does not expose iPhone safe areas');
ok(css.includes('padding-left:calc(var(--safe-left) + 16px)!important'), 'left iPhone gutter is not additive');
ok(css.includes('padding-right:calc(var(--safe-right) + 16px)!important'), 'right iPhone gutter is not additive');
ok(css.includes('width:calc(100% - var(--safe-left) - var(--safe-right) - 24px)!important'), 'mobile navigation gutter is incorrect');
ok(css.includes('bottom:calc(var(--safe-bottom) + 6px)!important'), 'mobile navigation does not clear the home area');
ok(css.includes('right:calc(var(--safe-right) + 16px)!important'), 'floating action does not respect the right safe area');
ok(css.includes('@media(orientation:landscape) and (max-height:500px)'), 'iPhone landscape rule is missing');
ok(index.includes('styles.css?v=10.158'), 'stylesheet cache key mismatch');
ok(index.includes('app.js?v=10.158'), 'app cache key mismatch');
ok(sw.includes('kinetik-v10-158-iphone-gutters'), 'service worker cache mismatch');
ok(pkg.version==='10.158.0', 'package version mismatch');
if(failures.length){console.error(`MOBILE_FRAME_FAIL ${failures.length}/${checks}`);failures.forEach(x=>console.error(`- ${x}`));process.exit(1);}
console.log(`MOBILE_FRAME_OK ${checks} checks`);
