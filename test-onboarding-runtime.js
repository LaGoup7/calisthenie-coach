const fs = require('fs');

const source = fs.readFileSync('app-onboarding.js', 'utf8');
const index = fs.readFileSync('index.html', 'utf8');
const worker = fs.readFileSync('sw.js', 'utf8');
const css = fs.readFileSync('styles.css', 'utf8');
let checks = 0;
const failures = [];
function ok(value, message) {
  checks += 1;
  if (!value) failures.push(message);
}

ok(source.includes('kinetik_onboarding_v1'), 'versioned onboarding storage is missing');
ok(source.includes("status:'existing_user'"), 'existing users are not protected from auto-launch');
ok(source.includes("saved?.status==='in_progress'"), 'interrupted onboarding cannot resume');
ok(source.includes("onboardingPersist('deferred')"), 'deferred onboarding is not persisted');
ok(source.includes('KINETIK_ONBOARDING_LAST_STEP = 6'), 'six-step onboarding contract changed');
ok(source.includes('onbName'), 'identity field is missing');
ok(source.includes('data-onb-goal'), 'primary goal selection is missing');
ok(source.includes('data-onb-day'), 'availability selection is missing');
ok(source.includes('onbTargetWeight'), 'target weight field is missing');
ok(source.includes('onb-sport'), 'sport context is missing');
ok(source.includes('onb-equipment'), 'equipment selection is missing');
ok(source.includes('onb-restriction'), 'permanent restrictions are missing');
ok(source.includes('onbPrepSeconds'), 'timed-hold preparation is missing');
ok(source.includes('setAthleteProfile('), 'canonical athlete profile is not written');
ok(source.includes('recordCurrentWeight('), 'canonical weight history is not written');
ok(source.includes('setEquipmentSetup('), 'canonical equipment setup is not written');
ok(source.includes('setRestrictions('), 'canonical restrictions are not written');
ok(source.includes('setPrefs('), 'canonical preferences are not written');
ok(index.includes('app-onboarding.js?v=10.156-r2'), 'onboarding is missing from the HTML asset chain');
ok(index.lastIndexOf('app-onboarding.js') > index.lastIndexOf('account-manager.js'), 'onboarding must load last');
ok(worker.includes('app-onboarding.js?v=10.156-r2'), 'onboarding is missing from PWA precache');
ok(worker.includes("'/app-onboarding.js'"), 'onboarding is missing from core PWA requests');
ok(css.includes('.onboarding-shell'), 'onboarding visual system is missing');
ok(css.includes('@media(max-width:700px)'), 'mobile onboarding layout is missing');
ok(css.includes('@media(prefers-reduced-motion:reduce)'), 'reduced-motion support is missing');

if (failures.length) {
  console.error(`ONBOARDING_RUNTIME_FAIL ${failures.length}/${checks}`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}
console.log(`ONBOARDING_RUNTIME_OK ${checks} checks`);
