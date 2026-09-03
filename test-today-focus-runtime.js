const fs=require('fs');
const journey=fs.readFileSync('app-journey.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
const index=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const pkg=require('./package.json');
let checks=0;const failures=[];
function ok(value,message){checks+=1;if(!value)failures.push(message);}
ok(journey.includes('function v10157PendingAgenda'), 'focus renderer missing');
ok(journey.includes('const primary=pending[0]'), 'primary mission is not limited to one');
ok(journey.includes('pending.slice(1,3)'), 'visible complements are not limited to two');
ok(journey.includes('pending.slice(3)'), 'remaining tasks are not preserved');
ok(journey.includes('Mission principale'), 'primary label missing');
ok(journey.includes("primary.kind==='workout'?'Lance-la juste au-dessus':'Commence ici'"), 'workout mission hint is misleading');
ok(journey.includes('Compléments utiles'), 'complements label missing');
ok(journey.includes('Voir les autres'), 'disclosure label missing');
ok(journey.includes("replace('<b>Prioritaire</b>','')"), 'competing priority labels remain visible');
ok(css.includes('.today-agenda-primary>.today-agenda-task'), 'primary visual treatment missing');
ok(css.includes('.today-agenda-support>.today-agenda-list'), 'support layout missing');
ok(css.includes('.today-agenda-more>summary'), 'disclosure layout missing');
ok(css.includes('@media(max-width:620px)'), 'mobile adaptation missing');
ok(index.includes('app-journey.js?v=10.157'), 'journey asset version missing');
ok(index.includes('app.js?v=10.157'), 'core asset version missing');
ok(index.includes('styles.css?v=10.157'), 'stylesheet asset version missing');
ok(sw.includes('kinetik-v10-157-today-focus'), 'PWA cache version missing');
ok(pkg.version==='10.157.0', 'package version mismatch');
if(failures.length){console.error(`TODAY_FOCUS_FAIL ${failures.length}/${checks}`);failures.forEach(x=>console.error(`- ${x}`));process.exit(1);}
console.log(`TODAY_FOCUS_OK ${checks} checks`);
