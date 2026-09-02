/* KINETIK v10.146 · Body map, anatomy, body-system consistency and measurements. */
/* V10.100 · Body Map V2 — anatomie + confiance + statuts fiables             */
/* ========================================================================== */

v1095Avg=function(){
  const vals=[...arguments]
    .filter(v=>v!==null && v!==undefined && v!=='')
    .map(v=>Number(v))
    .filter(v=>Number.isFinite(v)&&v>=0);
  return vals.length?Math.round(vals.reduce((s,v)=>s+v,0)/vals.length):null;
};

function v10100ZoneInputs(id,mode='overall'){
  const cap=key=>{const x=capabilityScores().find(c=>c.id===key);return x?.assessed?{label:x.label,value:Number(x.score),kind:'cap'}:null;};
  const mob=key=>{const x=mobilityProfiles().find(c=>c.id===key);return x?.assessed?{label:x.label,value:Number(x.score),kind:'mob'}:null;};
  const legs=()=>{const x=v1095LegsScore();return x==null?null:{label:'Jambes',value:x,kind:'cap'};};
  const sources={
    shoulders:[cap('push'),cap('balance'),mob('shoulders')],
    chest:[cap('push'),mob('thorax')],
    back:[cap('pull'),cap('explosive'),mob('thorax')],
    arms:[cap('pull'),cap('push')],
    forearms:[cap('grip')],
    wrists:[cap('grip'),cap('balance'),mob('wrists')],
    core:[cap('core'),cap('balance')],
    hips:[legs(),cap('core'),mob('hips')],
    quads:[legs(),mob('hips')],
    hamstrings:[legs(),mob('posterior')],
    calves:[legs(),mob('ankles')],
    ankles:[mob('ankles'),legs()]
  };
  let rows=(sources[id]||[]).filter(Boolean);
  if(mode==='strength') rows=rows.filter(x=>x.kind==='cap');
  if(mode==='mobility') rows=rows.filter(x=>x.kind==='mob');
  return rows;
}
function v10100Confidence(id,mode='overall'){
  const count=v10100ZoneInputs(id,mode).length;
  if(!count)return {id:'none',label:'Aucune donnée',score:0};
  if(count===1)return {id:'low',label:'Faible',score:35};
  if(count===2)return {id:'medium',label:'Moyenne',score:68};
  return {id:'high',label:'Élevée',score:92};
}
function v10100ZoneStatus(score,confidence){
  if(score==null || confidence?.id==='none') return {id:'none',label:'À évaluer'};
  if(confidence?.id==='low') return {id:'partial',label:'Données limitées'};
  return v1095BodyTone(score);
}
function v10100ZoneData(id,mode='overall'){
  const lookup=v1095BodyZoneLookup(mode);
  const zone=lookup[id];
  if(!zone)return null;
  const confidence=v10100Confidence(id,mode);
  return {...zone,confidence,status:v10100ZoneStatus(zone.score,confidence),inputs:v10100ZoneInputs(id,mode)};
}
function v10100ZoneClass(z){
  if(!z)return 'tone-none';
  if(z.status?.id==='none')return 'tone-none';
  if(z.status?.id==='partial')return 'tone-partial';
  return `tone-${z.tone?.id||'none'}`;
}
function v10100InputText(rows=[]){
  if(!rows.length)return 'Aucune donnée fiable enregistrée pour cette zone.';
  return rows.map(x=>`${x.label} ${Math.round(x.value)}/100`).join(' · ');
}


v1095BodyMapSVG=function(view='front',mode='overall',selectedId=''){
  const ids=view==='back'
    ?['shoulders','back','arms','forearms','wrists','core','hips','hamstrings','calves','ankles']
    :['shoulders','chest','arms','forearms','wrists','core','hips','quads','calves','ankles'];
  const zones=Object.fromEntries(ids.map(id=>[id,v10100ZoneData(id,mode)]));
  const z=id=>zones[id]||{id,label:id,score:null,status:{id:'none',label:'À évaluer'},confidence:{label:'Aucune donnée'}};
  const attrs=id=>`class="bodymap-zone ${v10100ZoneClass(z(id))}${selectedId===id?' selected':''}" data-body-zone="${id}" role="button" tabindex="0" aria-label="${esc(z(id).label)} ${z(id).score!=null?z(id).score+' sur 100':z(id).status.label}"`;
  const front=view==='front';

  return `<svg class="bodymap-figure bodymap-v4" viewBox="0 0 320 560" role="img" aria-label="Carte corporelle ${front?'face':'dos'}">
    <defs>
      <filter id="bodyGlowV4" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#4f46e5" flood-opacity=".20"/>
      </filter>
      <linearGradient id="bodyShellV4" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f8fbff"/>
        <stop offset="1" stop-color="#dde5f0"/>
      </linearGradient>
      <linearGradient id="bodyHeadV4" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#eef3fa"/>
        <stop offset="1" stop-color="#dbe4ef"/>
      </linearGradient>
      <linearGradient id="bodyLimbV4" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#eef3fa"/>
        <stop offset="1" stop-color="#d7e0eb"/>
      </linearGradient>
    </defs>

    <text x="160" y="20" text-anchor="middle" class="bodymap-caption">${front?'VUE FACE':'VUE DOS'}</text>

    <g class="bodymap-v4-shell">
      <ellipse cx="160" cy="58" rx="28" ry="34" class="bodymap-head-shell"/>
      <path d="M148 89 Q160 97 172 89 L176 109 Q160 114 144 109 Z" class="bodymap-neck-shell"/>
      <path d="M110 116
               Q126 101 147 104
               L173 104
               Q194 101 210 116
               Q218 124 221 137
               L218 170
               Q216 214 208 247
               Q200 279 181 292
               Q171 298 160 299
               Q149 298 139 292
               Q120 279 112 247
               Q104 214 102 170
               L99 137
               Q102 124 110 116 Z" class="bodymap-shell-torso"/>
      <path d="M132 295 Q160 309 188 295 L194 325 Q180 339 160 341 Q140 339 126 325 Z" class="bodymap-shell-pelvis"/>
      <path d="M102 127 Q84 136 78 157 Q74 175 78 198 L85 236 Q88 251 94 268 Q98 279 108 275 Q114 268 111 253 L108 209 L112 161 Q114 137 102 127 Z" class="bodymap-shell-arm"/>
      <path d="M218 127 Q236 136 242 157 Q246 175 242 198 L235 236 Q232 251 226 268 Q222 279 212 275 Q206 268 209 253 L212 209 L208 161 Q206 137 218 127 Z" class="bodymap-shell-arm"/>
      <path d="M95 272 Q106 270 112 280 L116 359 Q116 378 103 388 Q92 386 88 373 L82 303 Q81 282 95 272 Z" class="bodymap-shell-forearm"/>
      <path d="M225 272 Q214 270 208 280 L204 359 Q204 378 217 388 Q228 386 232 373 L238 303 Q239 282 225 272 Z" class="bodymap-shell-forearm"/>
      <path d="M132 326 Q145 318 150 334 L149 408 Q147 441 142 476 Q138 486 128 480 Q127 446 124 414 Q121 360 122 342 Q123 331 132 326 Z" class="bodymap-shell-leg"/>
      <path d="M188 326 Q175 318 170 334 L171 408 Q173 441 178 476 Q182 486 192 480 Q193 446 196 414 Q199 360 198 342 Q197 331 188 326 Z" class="bodymap-shell-leg"/>
      <path d="M129 481 Q139 478 145 484 L145 505 Q138 513 126 508 Q123 494 129 481 Z" class="bodymap-shell-foot"/>
      <path d="M191 481 Q181 478 175 484 L175 505 Q182 513 194 508 Q197 494 191 481 Z" class="bodymap-shell-foot"/>
      <ellipse cx="99" cy="404" rx="13" ry="18" class="bodymap-shell-hand"/>
      <ellipse cx="221" cy="404" rx="13" ry="18" class="bodymap-shell-hand"/>
    </g>

    <g ${attrs('shoulders')}>
      <path d="M116 121 Q133 108 149 112 L171 112 Q187 108 204 121 L198 143 Q183 137 168 137 L152 137 Q137 137 122 143 Z"/>
      <ellipse cx="113" cy="140" rx="22" ry="27"/>
      <ellipse cx="207" cy="140" rx="22" ry="27"/>
    </g>

    ${front?`
    <g ${attrs('chest')}>
      <path d="M123 145 Q140 132 154 140 L154 195 Q138 202 124 191 Z"/>
      <path d="M197 145 Q180 132 166 140 L166 195 Q182 202 196 191 Z"/>
      <path d="M146 147 Q160 155 174 147" class="bodymap-muscle-line"/>
    </g>`:`
    <g ${attrs('back')}>
      <path d="M118 141 Q139 129 160 132 Q181 129 202 141 L205 194 Q198 226 180 244 Q171 253 160 256 Q149 253 140 244 Q122 226 115 194 Z"/>
      <path d="M132 149 Q144 168 160 175 Q176 168 188 149 L184 225 Q173 236 160 239 Q147 236 136 225 Z" class="bodymap-subshape"/>
    </g>`}

    <g ${attrs('arms')}>
      <path d="M101 156 Q90 164 89 181 L92 237 Q94 255 108 264 Q119 258 119 242 L117 185 Q117 166 101 156 Z"/>
      <path d="M219 156 Q230 164 231 181 L228 237 Q226 255 212 264 Q201 258 201 242 L203 185 Q203 166 219 156 Z"/>
    </g>

    <g ${attrs('forearms')}>
      <path d="M98 270 Q109 268 114 278 L118 355 Q118 372 105 382 Q94 380 90 367 L85 296 Q84 278 98 270 Z"/>
      <path d="M222 270 Q211 268 206 278 L202 355 Q202 372 215 382 Q226 380 230 367 L235 296 Q236 278 222 270 Z"/>
    </g>

    <g ${attrs('wrists')}>
      <ellipse cx="99" cy="404" rx="15" ry="20"/>
      <ellipse cx="221" cy="404" rx="15" ry="20"/>
    </g>

    <g ${attrs('core')}>
      ${front?`
        <path d="M128 198 Q144 207 160 207 Q176 207 192 198 L195 265 Q184 282 160 286 Q136 282 125 265 Z"/>
        <rect x="143" y="214" width="14" height="24" rx="5" class="bodymap-subshape"/>
        <rect x="163" y="214" width="14" height="24" rx="5" class="bodymap-subshape"/>
        <rect x="139" y="243" width="16" height="25" rx="5" class="bodymap-subshape"/>
        <rect x="165" y="243" width="16" height="25" rx="5" class="bodymap-subshape"/>
        <path d="M148 198 Q160 204 172 198" class="bodymap-muscle-line"/>
      `:`
        <path d="M129 198 Q145 208 160 208 Q175 208 191 198 L194 264 Q183 279 160 283 Q137 279 126 264 Z"/>
        <path d="M140 214 Q160 225 180 214 L182 259 Q171 268 160 270 Q149 268 138 259 Z" class="bodymap-subshape"/>
      `}
    </g>

    <g ${attrs('hips')}>
      <path d="M129 291 Q144 303 160 304 Q176 303 191 291 L198 320 Q181 335 160 336 Q139 335 122 320 Z"/>
    </g>

    <g ${attrs(front?'quads':'hamstrings')}>
      <path d="M133 325 Q145 320 150 333 L149 405 Q146 423 135 425 Q126 416 125 398 L124 346 Q124 332 133 325 Z"/>
      <path d="M187 325 Q175 320 170 333 L171 405 Q174 423 185 425 Q194 416 195 398 L196 346 Q196 332 187 325 Z"/>
      ${front?`<path d="M135 338 L148 343 L146 396 L133 402 Z" class="bodymap-subshape"/>
               <path d="M185 338 L172 343 L174 396 L187 402 Z" class="bodymap-subshape"/>`:``}
    </g>

    <g ${attrs('calves')}>
      <path d="M132 427 Q141 421 147 428 L145 478 Q140 490 130 486 Q125 475 126 460 Z"/>
      <path d="M188 427 Q179 421 173 428 L175 478 Q180 490 190 486 Q195 475 194 460 Z"/>
    </g>

    <g ${attrs('ankles')}>
      <path d="M129 481 Q140 478 146 484 L146 505 Q138 513 126 508 Q123 494 129 481 Z"/>
      <path d="M191 481 Q180 478 174 484 L174 505 Q182 513 194 508 Q197 494 191 481 Z"/>
    </g>

    <path d="M106 125 Q95 166 98 214 Q101 268 108 322 Q111 353 111 392 Q111 438 125 480
             M214 125 Q225 166 222 214 Q219 268 212 322 Q209 353 209 392 Q209 438 195 480" class="bodymap-outline" fill="none"/>
    <path d="M160 115 L160 338" class="bodymap-midline"/>
  </svg>`;
};


v1095ZoneDetailCard=function(mode='overall',view='front'){
  const base=v1095SelectedBodyZone(mode,view);
  const zone=base?v10100ZoneData(base.id,mode):null;
  if(!zone)return '';
  const actionLabel=zone.action==='flexibility'?'Voir mobilité':zone.action==='measurements'?'Voir mesures':'Voir capacités';
  const score=zone.score!=null?`${zone.score}<small>/100</small>`:'—';
  return `<article class="body-zone-detail card body-zone-detail-v2">
    <div class="body-zone-detail-head">
      <div><div class="kicker">Zone sélectionnée</div><h3>${esc(zone.label)}</h3></div>
      <div class="body-zone-score ${v10100ZoneClass(zone)}">${score}</div>
    </div>

    <div class="body-zone-state-grid">
      <div><span>Statut</span><strong>${esc(zone.status.label)}</strong></div>
      <div><span>Confiance</span><strong class="confidence-${zone.confidence.id}">${esc(zone.confidence.label)}</strong></div>
    </div>

    <p class="body-zone-description">${esc(zone.desc||'')}</p>

    <div class="body-zone-sources">
      <span>Basé sur</span>
      <strong>${esc(v10100InputText(zone.inputs||[]))}</strong>
    </div>

    ${zone.score==null?`
      <div class="body-zone-empty-note">
        <strong>Pas encore de score.</strong>
        <span>KINETIK attend au moins une donnée réellement enregistrée avant de colorer cette zone.</span>
      </div>`:''}

    <div class="body-zone-mini-actions">
      <button class="btn btn-secondary compact" data-body-zone-cycle="prev">← Zone</button>
      <button class="btn btn-secondary compact" data-body-zone-cycle="next">Zone →</button>
      <button class="btn btn-outline compact" ${v1095ActionButton(zone.action)}>${actionLabel} →</button>
    </div>
  </article>`;
};

function v10100PriorityZones(mode='overall',limit=3){
  return Object.values(v1095BodyZoneLookup(mode))
    .map(z=>v10100ZoneData(z.id,mode))
    .filter(z=>z && z.score!=null)
    .sort((a,b)=>{
      const aPartial=a.status.id==='partial'?1:0, bPartial=b.status.id==='partial'?1:0;
      return bPartial-aPartial || a.score-b.score;
    }).slice(0,limit);
}
function v10100StrongZones(mode='overall',limit=3){
  return Object.values(v1095BodyZoneLookup(mode))
    .map(z=>v10100ZoneData(z.id,mode))
    .filter(z=>z && z.score!=null && z.confidence.id!=='low')
    .sort((a,b)=>b.score-a.score).slice(0,limit);
}
v1095PriorityZones=function(mode='overall',limit=3){return v10100PriorityZones(mode,limit);};
v1095StrongZones=function(mode='overall',limit=3){return v10100StrongZones(mode,limit);};

v1095ZoneChip=function(z){
  const zone=v10100ZoneData(z.id,state.progressBodyMode||'overall')||z;
  return `<button class="body-overview-chip ${v10100ZoneClass(zone)}" data-body-zone="${zone.id}">
    <span>${esc(zone.label)}</span>
    <strong>${zone.score!=null?zone.score+'/100':zone.status?.label||'À évaluer'}</strong>
  </button>`;
};


/* ========================================================================== */
/* V10.103 · Body Map V5 — silhouette continue + heatmap de confiance         */
/* Le corps reste neutre. Les couleurs sont des overlays de données.          */
/* ========================================================================== */
function v10103EvidenceLabel(level){
  const n=Number(level||0);
  return n>=3?'test':n>=2?'séance':n>=1?'déclaré':'sans preuve';
}
function v10103CapabilityEvidence(id){
  const test=id=>Number(assessmentEvidenceForTest(id)||0), ex=name=>Number(assessmentEvidenceForExercise(name)||0);
  const map={
    pull:[test('pullups'),ex('Chest-to-bar'),ex('Tractions explosives'),ex('Muscle-up strict')],
    push:[test('dips'),ex('Pike push-ups pieds surélevés'),ex('Handstand push-up au mur'),ex('Handstand push-up libre')],
    grip:[test('dead_hang'),ex('Towel hang'),ex('One-arm assisted hang')],
    core:[test('l_sit'),ex('Tuck L-sit'),ex('L-sit'),ex('Toes-to-bar'),ex('Hollow hold')],
    balance:[test('wall_handstand'),ex('Handstand libre'),ex('Handstand push-up au mur'),ex('Handstand push-up libre')],
    explosive:[ex('Chest-to-bar'),ex('Tractions explosives'),ex('Muscle-up assisté'),ex('Muscle-up strict')],
    legs:[ex('Pistol squat'),ex('Pistol squat assisté'),ex('Bulgarian split squat'),ex('Shrimp squat')]
  };
  return Math.max(0,...(map[id]||[]));
}
function v10103ExpectedInputs(id,mode='overall'){
  const e={
    shoulders:[['cap','push','Poussée'],['cap','balance','Équilibre'],['mob','shoulders','Mobilité épaules']],
    chest:[['cap','push','Poussée'],['mob','thorax','Mobilité thorax']],
    back:[['cap','pull','Tirage'],['cap','explosive','Explosivité'],['mob','thorax','Mobilité thorax']],
    arms:[['cap','pull','Tirage'],['cap','push','Poussée']],
    forearms:[['cap','grip','Grip']],
    wrists:[['cap','grip','Grip'],['cap','balance','Équilibre'],['mob','wrists','Mobilité poignets']],
    core:[['cap','core','Core'],['cap','balance','Équilibre']],
    hips:[['cap','legs','Jambes'],['cap','core','Core'],['mob','hips','Mobilité hanches']],
    quads:[['cap','legs','Jambes'],['mob','hips','Mobilité hanches']],
    hamstrings:[['cap','legs','Jambes'],['mob','posterior','Chaîne postérieure']],
    calves:[['cap','legs','Jambes'],['mob','ankles','Mobilité chevilles']],
    ankles:[['cap','legs','Jambes'],['mob','ankles','Mobilité chevilles']]
  };
  let rows=(e[id]||[]).map(([kind,key,label])=>({kind,key,label}));
  if(mode==='strength')rows=rows.filter(x=>x.kind==='cap');
  if(mode==='mobility')rows=rows.filter(x=>x.kind==='mob');
  return rows;
}
function v10103InputForExpected(x){
  if(x.kind==='cap'){
    if(x.key==='legs'){
      const value=v1095LegsScore();
      return value==null?null:{...x,value:Number(value),evidence:v10103CapabilityEvidence('legs')||1};
    }
    const c=capabilityScores().find(v=>v.id===x.key);
    return c?.assessed?{...x,value:Number(c.score),evidence:v10103CapabilityEvidence(x.key)}:null;
  }
  const m=mobilityProfiles().find(v=>v.id===x.key);
  return m?.assessed?{...x,value:Number(m.score),evidence:2}:null;
}
function v10103ZoneInputs(id,mode='overall'){
  return v10103ExpectedInputs(id,mode).map(v10103InputForExpected).filter(Boolean);
}
function v10103ZoneConfidence(id,mode='overall'){
  const expected=v10103ExpectedInputs(id,mode), inputs=v10103ZoneInputs(id,mode);
  if(!inputs.length)return {id:'none',label:'Aucune donnée',coverage:0,evidence:0};
  const coverage=expected.length?inputs.length/expected.length:0;
  const evidence=inputs.reduce((s,x)=>s+Number(x.evidence||0),0)/inputs.length;
  if(coverage<.5 || evidence<1.5)return {id:'low',label:'Faible',coverage,evidence};
  if(coverage<1 || evidence<2.5)return {id:'medium',label:'Moyenne',coverage,evidence};
  return {id:'high',label:'Élevée',coverage,evidence};
}
function v10103ZoneData(id,mode='overall'){
  const zone=v1095BodyZoneLookup(mode)[id];
  if(!zone)return null;
  const inputs=v10103ZoneInputs(id,mode), expected=v10103ExpectedInputs(id,mode), confidence=v10103ZoneConfidence(id,mode);
  const present=new Set(inputs.map(x=>`${x.kind}:${x.key}`));
  const missing=expected.filter(x=>!present.has(`${x.kind}:${x.key}`));
  const status=zone.score==null||confidence.id==='none'?{id:'none',label:'À évaluer'}:
    confidence.id==='low'?{id:'partial',label:'Données limitées'}:v1095BodyTone(zone.score);
  return {...zone,inputs,expected,missing,confidence,status};
}
function v10103ZoneVisual(z){
  if(!z||z.status?.id==='none')return 'tone-none confidence-none';
  if(z.confidence?.id==='low')return 'tone-partial confidence-low';
  return `tone-${z.tone?.id||'none'} confidence-${z.confidence?.id||'none'}`;
}
function v10103InputSummary(inputs=[]){
  if(!inputs.length)return 'Aucune donnée enregistrée';
  return inputs.map(x=>`${x.label} ${Math.round(x.value)}/100 · ${v10103EvidenceLabel(x.evidence)}`).join(' · ');
}
function v10103MissingSummary(missing=[]){return missing.map(x=>x.label).join(' · ');}
function v10103ZoneCta(zone){
  if(zone?.missing?.length){
    const hasCap=zone.missing.some(x=>x.kind==='cap');
    return {label:'Compléter cette zone',attr:hasCap?'data-view="assessment"':'data-view="flexibility"'};
  }
  if(zone?.confidence?.id==='low')return {label:'Renforcer la preuve',attr:'data-view="assessment"'};
  return {label:zone?.action==='flexibility'?'Voir mobilité':'Voir capacités',attr:v1095ActionButton(zone?.action)};
}

v1095BodyMapSVG=function(view='front',mode='overall',selectedId=''){
  const ids=view==='back'
    ?['shoulders','back','arms','forearms','wrists','core','hips','hamstrings','calves','ankles']
    :['shoulders','chest','arms','forearms','wrists','core','hips','quads','calves','ankles'];
  const zones=Object.fromEntries(ids.map(id=>[id,v10103ZoneData(id,mode)]));
  const z=id=>zones[id]||{id,label:id,score:null,status:{id:'none',label:'À évaluer'},confidence:{id:'none',label:'Aucune donnée'}};
  const attrs=id=>`class="bodymap-zone bodymap-overlay ${v10103ZoneVisual(z(id))}${selectedId===id?' selected':''}" data-body-zone="${id}" role="button" tabindex="0" aria-label="${esc(z(id).label)} ${z(id).score!=null?z(id).score+' sur 100':z(id).status.label}"`;
  const front=view==='front';
  return `<svg class="bodymap-figure bodymap-v5" viewBox="0 0 300 540" role="img" aria-label="Carte corporelle ${front?'face':'dos'}">
    <defs>
      <filter id="v5Shadow" x="-30%" y="-20%" width="160%" height="150%"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-color="#64748b" flood-opacity=".14"/></filter>
      <filter id="v5Select" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#4f46e5" flood-opacity=".25"/></filter>
      <linearGradient id="v5Skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1f5f9"/><stop offset="1" stop-color="#dce4ee"/></linearGradient>
    </defs>

    <!-- Neutral, continuous silhouette. It never carries performance color. -->
    <g class="bodymap-v5-shell" filter="url(#v5Shadow)">
      <ellipse cx="150" cy="45" rx="27" ry="32"/>
      <path d="M138 75 Q150 83 162 75 L165 96 Q150 103 135 96 Z"/>
      <path d="M103 101 Q124 88 141 94 Q150 99 159 94 Q176 88 197 101
               Q211 111 215 129 Q217 159 211 197 Q208 224 201 249
               Q193 274 174 286 Q163 292 150 293 Q137 292 126 286
               Q107 274 99 249 Q92 224 89 197 Q83 159 85 129 Q89 111 103 101 Z"/>
      <path d="M124 282 Q150 296 176 282 L185 317 Q171 334 150 336 Q129 334 115 317 Z"/>
      <path d="M90 112 Q70 124 66 148 Q64 172 70 203 L78 244 Q81 259 88 276 L98 270 Q94 251 92 233 L94 194 L100 144 Q102 123 90 112 Z"/>
      <path d="M210 112 Q230 124 234 148 Q236 172 230 203 L222 244 Q219 259 212 276 L202 270 Q206 251 208 233 L206 194 L200 144 Q198 123 210 112 Z"/>
      <path d="M87 270 Q98 264 107 276 L111 351 Q111 370 101 386 L88 381 Q84 366 84 349 L79 294 Q78 278 87 270 Z"/>
      <path d="M213 270 Q202 264 193 276 L189 351 Q189 370 199 386 L212 381 Q216 366 216 349 L221 294 Q222 278 213 270 Z"/>
      <path d="M87 381 Q101 377 107 390 L106 409 Q100 420 87 414 Q80 399 87 381 Z"/>
      <path d="M213 381 Q199 377 193 390 L194 409 Q200 420 213 414 Q220 399 213 381 Z"/>
      <path d="M122 313 Q137 308 143 326 L142 393 Q140 420 137 451 L127 485 Q118 489 112 479 L115 444 Q112 410 110 374 L109 336 Q110 320 122 313 Z"/>
      <path d="M178 313 Q163 308 157 326 L158 393 Q160 420 163 451 L173 485 Q182 489 188 479 L185 444 Q188 410 190 374 L191 336 Q190 320 178 313 Z"/>
      <path d="M126 478 Q137 476 142 484 L141 505 Q132 516 116 509 Q114 490 126 478 Z"/>
      <path d="M174 478 Q163 476 158 484 L159 505 Q168 516 184 509 Q186 490 174 478 Z"/>
    </g>

    <!-- Data heatmap overlays. -->
    <g ${attrs('shoulders')}>
      <path d="M104 106 Q119 96 137 101 L132 126 Q118 124 105 139 Q94 132 94 119 Q96 111 104 106 Z"/>
      <path d="M196 106 Q181 96 163 101 L168 126 Q182 124 195 139 Q206 132 206 119 Q204 111 196 106 Z"/>
      <path d="M133 102 Q150 108 167 102 L164 119 Q150 124 136 119 Z" class="bodymap-overlay-secondary"/>
    </g>

    ${front?`
      <g ${attrs('chest')}>
        <path d="M111 132 Q128 120 146 129 L146 178 Q128 186 113 172 Z"/>
        <path d="M189 132 Q172 120 154 129 L154 178 Q172 186 187 172 Z"/>
      </g>`:`
      <g ${attrs('back')}>
        <path d="M105 128 Q127 115 150 124 Q173 115 195 128 L201 181 Q195 220 177 244 Q164 257 150 260 Q136 257 123 244 Q105 220 99 181 Z"/>
        <path d="M124 136 Q137 155 150 161 Q163 155 176 136 L171 224 Q161 237 150 240 Q139 237 129 224 Z" class="bodymap-overlay-secondary"/>
      </g>`}

    <g ${attrs('arms')}>
      <path d="M92 143 Q80 153 81 173 L86 229 Q89 247 101 257 Q111 250 110 232 L108 176 Q108 155 92 143 Z"/>
      <path d="M208 143 Q220 153 219 173 L214 229 Q211 247 199 257 Q189 250 190 232 L192 176 Q192 155 208 143 Z"/>
    </g>

    <g ${attrs('forearms')}>
      <path d="M90 264 Q101 260 107 272 L111 343 Q112 363 101 377 Q90 373 87 359 L82 292 Q81 274 90 264 Z"/>
      <path d="M210 264 Q199 260 193 272 L189 343 Q188 363 199 377 Q210 373 213 359 L218 292 Q219 274 210 264 Z"/>
    </g>

    <g ${attrs('wrists')}>
      <path d="M86 374 Q99 369 108 383 L107 405 Q99 416 86 409 Q79 393 86 374 Z"/>
      <path d="M214 374 Q201 369 192 383 L193 405 Q201 416 214 409 Q221 393 214 374 Z"/>
    </g>

    <g ${attrs('core')}>
      ${front?`
        <path d="M116 180 Q132 188 150 188 Q168 188 184 180 L188 248 Q177 270 150 276 Q123 270 112 248 Z"/>
        <path d="M132 198 Q150 207 168 198" class="bodymap-anatomy-line"/>
        <path d="M126 220 H174 M124 244 H176 M150 195 V260" class="bodymap-anatomy-line"/>`
        :`<path d="M114 184 Q132 194 150 194 Q168 194 186 184 L188 247 Q177 267 150 273 Q123 267 112 247 Z"/>
          <path d="M130 210 Q150 221 170 210 L172 249 Q161 259 150 262 Q139 259 128 249 Z" class="bodymap-overlay-secondary"/>`}
    </g>

    <g ${attrs('hips')}>
      ${front?`<path d="M117 276 Q133 288 150 290 Q167 288 183 276 L189 313 Q171 328 150 329 Q129 328 111 313 Z"/>`
        :`<path d="M112 278 Q130 270 150 284 Q170 270 188 278 L190 315 Q173 333 150 330 Q127 333 110 315 Z"/>`}
    </g>

    <g ${attrs(front?'quads':'hamstrings')}>
      <path d="M120 316 Q136 307 144 326 L142 390 Q140 416 130 438 Q117 433 114 412 L112 344 Q112 326 120 316 Z"/>
      <path d="M180 316 Q164 307 156 326 L158 390 Q160 416 170 438 Q183 433 186 412 L188 344 Q188 326 180 316 Z"/>
      ${front?`<path d="M126 329 Q137 337 140 356 M174 329 Q163 337 160 356" class="bodymap-anatomy-line"/>`:''}
    </g>

    <g ${attrs('calves')}>
      <path d="M126 431 Q137 423 143 436 L139 481 Q132 493 121 483 Q116 464 119 447 Z"/>
      <path d="M174 431 Q163 423 157 436 L161 481 Q168 493 179 483 Q184 464 181 447 Z"/>
    </g>

    <g ${attrs('ankles')}>
      <path d="M120 474 Q132 472 140 482 L140 503 Q131 512 116 506 Q114 488 120 474 Z"/>
      <path d="M180 474 Q168 472 160 482 L160 503 Q169 512 184 506 Q186 488 180 474 Z"/>
    </g>
  </svg>`;
};

v1095ZoneDetailCard=function(mode='overall',view='front'){
  const base=v1095SelectedBodyZone(mode,view), zone=base?v10103ZoneData(base.id,mode):null;
  if(!zone)return '';
  const cta=v10103ZoneCta(zone), provisional=zone.confidence.id!=='high'&&zone.score!=null;
  return `<article class="body-zone-detail card body-zone-detail-v5">
    <div class="body-zone-detail-head">
      <div><div class="kicker">Zone sélectionnée</div><h3>${esc(zone.label)}</h3></div>
      <div class="body-zone-score ${v10103ZoneVisual(zone)}"><span>${provisional?'Provisoire':'Niveau'}</span>${zone.score!=null?`${zone.score}<small>/100</small>`:'—'}</div>
    </div>
    <div class="body-zone-state-grid">
      <div><span>Statut</span><strong>${esc(zone.status.label)}</strong></div>
      <div><span>Confiance</span><strong class="confidence-${zone.confidence.id}">${esc(zone.confidence.label)}</strong></div>
    </div>
    <p class="body-zone-description">${esc(zone.desc||'')}</p>
    <div class="body-zone-sources"><span>Données disponibles</span><strong>${esc(v10103InputSummary(zone.inputs))}</strong></div>
    ${zone.missing.length?`<div class="body-zone-missing"><span>Données manquantes</span><strong>${esc(v10103MissingSummary(zone.missing))}</strong></div>`:''}
    ${zone.confidence.id==='low'?`<p class="body-zone-caution">La couleur de niveau reste volontairement neutre tant que cette zone repose sur trop peu de données fiables.</p>`:''}
    <div class="body-zone-mini-actions">
      <button class="btn btn-secondary compact" data-body-zone-cycle="prev">← Zone</button>
      <button class="btn btn-secondary compact" data-body-zone-cycle="next">Zone →</button>
      <button class="btn btn-outline compact" ${cta.attr}>${cta.label} →</button>
    </div>
  </article>`;
};

v1095ZoneChip=function(z){
  const zone=v10103ZoneData(z.id,state.progressBodyMode||'overall')||z;
  return `<button class="body-overview-chip ${v10103ZoneVisual(zone)}" data-body-zone="${zone.id}"><span>${esc(zone.label)}</span><strong>${zone.score!=null?zone.score+'/100':zone.status?.label||'À évaluer'}</strong></button>`;
};

v1095PriorityZones=function(mode='overall',limit=3){
  return Object.values(v1095BodyZoneLookup(mode)).map(z=>v10103ZoneData(z.id,mode)).filter(Boolean)
    .sort((a,b)=>{
      const au=a.confidence.id==='none'?2:a.confidence.id==='low'?1:0, bu=b.confidence.id==='none'?2:b.confidence.id==='low'?1:0;
      if(au!==bu)return bu-au;
      return (a.score??999)-(b.score??999);
    }).slice(0,limit);
};
v1095StrongZones=function(mode='overall',limit=3){
  return Object.values(v1095BodyZoneLookup(mode)).map(z=>v10103ZoneData(z.id,mode))
    .filter(z=>z&&z.score!=null&&['medium','high'].includes(z.confidence.id)).sort((a,b)=>b.score-a.score).slice(0,limit);
};


/* ========================================================================== */
/* V10.104 · Body Map V6 — silhouette humaine anatomique stylisée             */
/* Base corporelle continue + overlays heatmap indépendants.                   */
/* ========================================================================== */
v1095BodyMapSVG=function(view='front',mode='overall',selectedId=''){
  const ids=view==='back'
    ?['shoulders','back','arms','forearms','wrists','core','hips','hamstrings','calves','ankles']
    :['shoulders','chest','arms','forearms','wrists','core','hips','quads','calves','ankles'];
  const zones=Object.fromEntries(ids.map(id=>[id,v10103ZoneData(id,mode)]));
  const z=id=>zones[id]||{id,label:id,score:null,status:{id:'none',label:'À évaluer'},confidence:{id:'none',label:'Aucune donnée'}};
  const attrs=id=>`class="bodymap-zone bodymap-overlay ${v10103ZoneVisual(z(id))}${selectedId===id?' selected':''}" data-body-zone="${id}" role="button" tabindex="0" aria-label="${esc(z(id).label)} ${z(id).score!=null?z(id).score+' sur 100':z(id).status.label}"`;
  const front=view==='front';

  return `<svg class="bodymap-figure bodymap-v6" viewBox="0 0 360 620" role="img" aria-label="Carte corporelle humaine ${front?'face':'dos'}">
    <defs>
      <filter id="v6ShellShadow" x="-30%" y="-20%" width="160%" height="150%">
        <feDropShadow dx="0" dy="9" stdDeviation="10" flood-color="#64748b" flood-opacity=".12"/>
      </filter>
      <filter id="v6Select" x="-45%" y="-45%" width="190%" height="190%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#4f46e5" flood-opacity=".28"/>
      </filter>
      <linearGradient id="v6Skin" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f6f8fb"/>
        <stop offset=".55" stop-color="#e8edf4"/>
        <stop offset="1" stop-color="#dce4ee"/>
      </linearGradient>
      <linearGradient id="v6SkinSide" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#dbe3ed"/>
        <stop offset=".5" stop-color="#f2f5f9"/>
        <stop offset="1" stop-color="#dbe3ed"/>
      </linearGradient>
    </defs>

    <!-- Silhouette humaine neutre : aucune couleur de performance ici. -->
    <g class="bodymap-v6-shell" filter="url(#v6ShellShadow)">
      <!-- tête -->
      <path d="M180 22
               C160 22 148 38 149 59
               C150 80 161 94 180 96
               C199 94 210 80 211 59
               C212 38 200 22 180 22 Z"/>
      <!-- cou + trapèzes -->
      <path d="M166 91
               C167 102 165 110 158 116
               C147 119 131 123 118 134
               L129 155
               C145 145 161 142 180 142
               C199 142 215 145 231 155
               L242 134
               C229 123 213 119 202 116
               C195 110 193 102 194 91
               C186 97 174 97 166 91 Z"/>
      <!-- torse -->
      <path d="M121 137
               C138 127 157 122 180 122
               C203 122 222 127 239 137
               C251 148 255 168 253 193
               C251 224 246 251 238 279
               C232 301 221 320 205 329
               C196 334 188 337 180 338
               C172 337 164 334 155 329
               C139 320 128 301 122 279
               C114 251 109 224 107 193
               C105 168 109 148 121 137 Z"/>
      <!-- bras gauche -->
      <path d="M116 143
               C101 147 91 160 87 180
               C83 204 88 231 92 254
               C96 277 98 292 94 313
               C91 329 85 349 82 369
               C80 385 84 398 94 403
               C104 406 112 399 116 387
               C122 368 124 347 125 327
               C126 305 126 282 128 260
               C131 227 136 195 133 167
               C131 153 125 145 116 143 Z"/>
      <!-- bras droit -->
      <path d="M244 143
               C259 147 269 160 273 180
               C277 204 272 231 268 254
               C264 277 262 292 266 313
               C269 329 275 349 278 369
               C280 385 276 398 266 403
               C256 406 248 399 244 387
               C238 368 236 347 235 327
               C234 305 234 282 232 260
               C229 227 224 195 227 167
               C229 153 235 145 244 143 Z"/>
      <!-- mains -->
      <path d="M88 397
               C80 401 77 412 80 424
               C83 436 91 444 100 441
               C108 438 111 428 108 416
               C105 404 97 397 88 397 Z"/>
      <path d="M272 397
               C280 401 283 412 280 424
               C277 436 269 444 260 441
               C252 438 249 428 252 416
               C255 404 263 397 272 397 Z"/>
      <!-- bassin -->
      <path d="M153 323
               C162 329 171 333 180 334
               C189 333 198 329 207 323
               C218 337 222 353 220 370
               C208 379 195 384 180 385
               C165 384 152 379 140 370
               C138 353 142 337 153 323 Z"/>
      <!-- jambe gauche continue -->
      <path d="M146 369
               C158 367 166 378 168 395
               C170 423 165 450 161 478
               C158 500 158 522 156 545
               C154 565 151 582 145 594
               C139 603 127 601 124 590
               C122 572 126 551 126 532
               C126 511 121 491 118 470
               C114 442 111 414 116 392
               C120 378 132 370 146 369 Z"/>
      <!-- jambe droite continue -->
      <path d="M214 369
               C202 367 194 378 192 395
               C190 423 195 450 199 478
               C202 500 202 522 204 545
               C206 565 209 582 215 594
               C221 603 233 601 236 590
               C238 572 234 551 234 532
               C234 511 239 491 242 470
               C246 442 249 414 244 392
               C240 378 228 370 214 369 Z"/>
      <!-- pieds -->
      <path d="M125 585 C135 580 148 581 154 590 C154 601 149 609 137 611 C124 612 116 606 116 598 C117 592 120 588 125 585 Z"/>
      <path d="M235 585 C225 580 212 581 206 590 C206 601 211 609 223 611 C236 612 244 606 244 598 C243 592 240 588 235 585 Z"/>
    </g>

    <!-- Repères anatomiques neutres très légers. -->
    <g class="bodymap-v6-guides">
      ${front?`
        <path d="M180 143 V321"/>
        <path d="M145 192 C155 199 167 203 180 203 C193 203 205 199 215 192"/>
        <path d="M153 227 H207 M151 256 H209"/>
        <path d="M139 377 C147 391 155 401 164 407 M221 377 C213 391 205 401 196 407"/>
      `:`
        <path d="M180 143 V318"/>
        <path d="M139 167 C151 180 165 187 180 189 C195 187 209 180 221 167"/>
        <path d="M143 256 C154 268 167 275 180 277 C193 275 206 268 217 256"/>
      `}
    </g>

    <!-- HEATMAP : seule cette couche porte le niveau / la confiance. -->
    <g ${attrs('shoulders')}>
      <path d="M119 142
               C128 129 142 124 158 126
               C164 132 166 142 164 153
               C150 151 136 155 125 165
               C117 160 114 151 119 142 Z"/>
      <path d="M241 142
               C232 129 218 124 202 126
               C196 132 194 142 196 153
               C210 151 224 155 235 165
               C243 160 246 151 241 142 Z"/>
      ${front?'':`<path d="M155 128 C164 133 172 136 180 136 C188 136 196 133 205 128 L201 146 C194 151 187 154 180 155 C173 154 166 151 159 146 Z" class="bodymap-overlay-secondary"/>`}
    </g>

    ${front?`
      <g ${attrs('chest')}>
        <path d="M132 158
                 C145 147 160 146 176 154
                 L176 202
                 C158 208 143 204 131 191 Z"/>
        <path d="M228 158
                 C215 147 200 146 184 154
                 L184 202
                 C202 208 217 204 229 191 Z"/>
      </g>
    `:`
      <g ${attrs('back')}>
        <path d="M128 151
                 C145 139 162 139 180 148
                 C198 139 215 139 232 151
                 C235 177 231 209 224 238
                 C216 264 201 286 180 297
                 C159 286 144 264 136 238
                 C129 209 125 177 128 151 Z"/>
        <path d="M151 157
                 C160 170 170 178 180 182
                 C190 178 200 170 209 157
                 L202 248
                 C194 261 187 267 180 270
                 C173 267 166 261 158 248 Z" class="bodymap-overlay-secondary"/>
      </g>
    `}

    <g ${attrs('arms')}>
      <path d="M110 165
               C100 170 96 185 98 203
               L104 261
               C106 278 113 289 122 290
               C130 284 131 271 130 255
               L127 198
               C126 180 121 168 110 165 Z"/>
      <path d="M250 165
               C260 170 264 185 262 203
               L256 261
               C254 278 247 289 238 290
               C230 284 229 271 230 255
               L233 198
               C234 180 239 168 250 165 Z"/>
    </g>

    <g ${attrs('forearms')}>
      <path d="M104 286
               C113 282 121 289 123 304
               L119 363
               C118 382 111 393 101 395
               C92 390 91 377 94 361
               L98 309
               C98 298 99 290 104 286 Z"/>
      <path d="M256 286
               C247 282 239 289 237 304
               L241 363
               C242 382 249 393 259 395
               C268 390 269 377 266 361
               L262 309
               C262 298 261 290 256 286 Z"/>
    </g>

    <g ${attrs('wrists')}>
      <path d="M96 386 C104 383 112 388 114 399 L112 421 C108 431 100 434 92 428 C87 417 88 403 92 394 C93 390 94 388 96 386 Z"/>
      <path d="M264 386 C256 383 248 388 246 399 L248 421 C252 431 260 434 268 428 C273 417 272 403 268 394 C267 390 266 388 264 386 Z"/>
    </g>

    <g ${attrs('core')}>
      ${front?`
        <path d="M143 205
                 C154 211 167 214 180 214
                 C193 214 206 211 217 205
                 L220 286
                 C211 310 197 323 180 326
                 C163 323 149 310 140 286 Z"/>
        <path d="M156 221 H174 V246 H153 Z
                 M186 221 H204 L207 246 H186 Z
                 M153 253 H174 V279 H150 Z
                 M186 253 H207 L210 279 H186 Z" class="bodymap-overlay-secondary"/>
      `:`
        <path d="M142 209
                 C154 218 167 222 180 222
                 C193 222 206 218 218 209
                 L220 284
                 C210 306 196 318 180 321
                 C164 318 150 306 140 284 Z"/>
        <path d="M156 235 C164 244 172 249 180 251 C188 249 196 244 204 235 L202 286 C195 296 187 301 180 303 C173 301 165 296 158 286 Z" class="bodymap-overlay-secondary"/>
      `}
    </g>

    <g ${attrs('hips')}>
      ${front?`
        <path d="M145 316
                 C156 325 168 330 180 331
                 C192 330 204 325 215 316
                 L220 366
                 C207 378 194 383 180 384
                 C166 383 153 378 140 366 Z"/>
      `:`
        <path d="M140 318
                 C153 309 166 311 180 322
                 C194 311 207 309 220 318
                 L222 367
                 C208 382 194 387 180 386
                 C166 387 152 382 138 367 Z"/>
      `}
    </g>

    <g ${attrs(front?'quads':'hamstrings')}>
      <path d="M132 374
               C145 369 158 378 161 396
               C162 426 157 455 153 483
               C149 501 142 510 132 507
               C123 496 122 478 121 461
               L118 410
               C117 390 121 378 132 374 Z"/>
      <path d="M228 374
               C215 369 202 378 199 396
               C198 426 203 455 207 483
               C211 501 218 510 228 507
               C237 496 238 478 239 461
               L242 410
               C243 390 239 378 228 374 Z"/>
      ${front?`
        <path d="M137 390 C146 401 151 414 153 430 M223 390 C214 401 209 414 207 430" class="bodymap-anatomy-line"/>
      `:''}
    </g>

    <g ${attrs('calves')}>
      <path d="M132 498
               C141 492 150 499 151 514
               L148 565
               C144 580 136 586 128 579
               C123 566 125 549 126 535
               C126 519 127 505 132 498 Z"/>
      <path d="M228 498
               C219 492 210 499 209 514
               L212 565
               C216 580 224 586 232 579
               C237 566 235 549 234 535
               C234 519 233 505 228 498 Z"/>
    </g>

    <g ${attrs('ankles')}>
      <path d="M126 568 C134 564 143 568 147 578 L145 597 C138 607 126 607 120 598 C119 586 121 575 126 568 Z"/>
      <path d="M234 568 C226 564 217 568 213 578 L215 597 C222 607 234 607 240 598 C241 586 239 575 234 568 Z"/>
    </g>
  </svg>`;
};

/* V6: "vrai corps" = davantage d'espace utile et moins d'effet schéma. */


/* ========================================================================== */
/* V10.105 · Body Map Premium V7                                               */
/* Anatomical athlete silhouette + independent data heatmap overlays.          */
/* ========================================================================== */
v1095BodyMapSVG=function(view='front',mode='overall',selectedId=''){
  const ids=view==='back'
    ?['shoulders','back','arms','forearms','wrists','core','hips','hamstrings','calves','ankles']
    :['shoulders','chest','arms','forearms','wrists','core','hips','quads','calves','ankles'];

  const zones=Object.fromEntries(ids.map(id=>[id,v10103ZoneData(id,mode)]));
  const z=id=>zones[id]||{
    id,label:id,score:null,
    status:{id:'none',label:'À évaluer'},
    confidence:{id:'none',label:'Aucune donnée'}
  };
  const attrs=id=>`class="bodymap-zone v7-zone ${v10103ZoneVisual(z(id))}${selectedId===id?' selected':''}" data-body-zone="${id}" role="button" tabindex="0" aria-label="${esc(z(id).label)} ${z(id).score!=null?z(id).score+' sur 100':z(id).status.label}"`;

  const front=view==='front';

  return `<svg class="bodymap-figure bodymap-v7 ${selectedId?'has-selection':''}" viewBox="0 0 420 720" role="img" aria-label="Profil corporel KINETIK ${front?'face':'dos'}">
    <defs>
      <linearGradient id="v7Body" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fbfcfe"/>
        <stop offset=".46" stop-color="#eef2f7"/>
        <stop offset="1" stop-color="#dfe6ef"/>
      </linearGradient>
      <linearGradient id="v7BodyEdge" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#d7e0eb"/>
        <stop offset=".48" stop-color="#f7f9fc"/>
        <stop offset="1" stop-color="#d7e0eb"/>
      </linearGradient>
      <linearGradient id="v7BodyLeg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f4f7fb"/>
        <stop offset="1" stop-color="#dde5ef"/>
      </linearGradient>
      <filter id="v7BodyShadow" x="-25%" y="-15%" width="150%" height="145%">
        <feDropShadow dx="0" dy="12" stdDeviation="13" flood-color="#64748b" flood-opacity=".13"/>
      </filter>
      <filter id="v7SelectedGlow" x="-45%" y="-45%" width="190%" height="190%">
        <feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="#4f46e5" flood-opacity=".32"/>
      </filter>
      <pattern id="v7LimitedPattern" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
        <rect width="8" height="8" fill="rgba(165,180,252,.20)"/>
        <rect width="2" height="8" fill="rgba(99,102,241,.22)"/>
      </pattern>
    </defs>

    <!--
      NEUTRAL ATHLETE SILHOUETTE
      This layer never represents performance. It only gives the map a
      believable human form; data lives in the overlays below.
    -->
    <g class="v7-shell" filter="url(#v7BodyShadow)">
      <!-- head -->
      <path class="v7-head" d="
        M210 24
        C188 24 173 41 173 65
        C173 91 188 108 210 110
        C232 108 247 91 247 65
        C247 41 232 24 210 24 Z"/>
      <!-- ears -->
      <path class="v7-ear" d="M173 59 C166 57 163 64 165 74 C167 83 171 87 176 84 L178 64 Z"/>
      <path class="v7-ear" d="M247 59 C254 57 257 64 255 74 C253 83 249 87 244 84 L242 64 Z"/>
      <!-- neck -->
      <path class="v7-neck" d="
        M193 101
        C195 116 192 126 183 133
        C192 142 201 147 210 147
        C219 147 228 142 237 133
        C228 126 225 116 227 101
        C218 108 202 108 193 101 Z"/>

      <!-- torso / ribcage -->
      <path class="v7-torso" d="
        M174 131
        C157 134 140 143 128 156
        C116 170 113 194 117 223
        C120 248 126 274 132 298
        C139 326 151 349 168 361
        C180 369 194 373 210 374
        C226 373 240 369 252 361
        C269 349 281 326 288 298
        C294 274 300 248 303 223
        C307 194 304 170 292 156
        C280 143 263 134 246 131
        C236 136 224 139 210 139
        C196 139 184 136 174 131 Z"/>

      <!-- left arm -->
      <path class="v7-upper-arm" d="
        M134 151
        C117 153 104 166 98 188
        C92 212 96 241 101 269
        C105 290 108 310 105 329
        C101 350 93 373 91 394
        C89 411 94 424 105 428
        C116 430 125 422 129 408
        C134 389 136 368 137 347
        C138 322 137 299 140 276
        C144 245 151 212 150 183
        C149 164 143 153 134 151 Z"/>
      <!-- right arm -->
      <path class="v7-upper-arm" d="
        M286 151
        C303 153 316 166 322 188
        C328 212 324 241 319 269
        C315 290 312 310 315 329
        C319 350 327 373 329 394
        C331 411 326 424 315 428
        C304 430 295 422 291 408
        C286 389 284 368 283 347
        C282 322 283 299 280 276
        C276 245 269 212 270 183
        C271 164 277 153 286 151 Z"/>

      <!-- hands -->
      <path class="v7-hand" d="
        M96 421
        C86 426 82 439 85 452
        C87 465 95 474 105 472
        C114 470 119 459 117 446
        C115 432 106 422 96 421 Z"/>
      <path class="v7-hand" d="
        M324 421
        C334 426 338 439 335 452
        C333 465 325 474 315 472
        C306 470 301 459 303 446
        C305 432 314 422 324 421 Z"/>

      <!-- pelvis -->
      <path class="v7-pelvis" d="
        M167 354
        C181 365 195 370 210 371
        C225 370 239 365 253 354
        C265 369 269 389 265 411
        C250 424 232 431 210 432
        C188 431 170 424 155 411
        C151 389 155 369 167 354 Z"/>

      <!-- left thigh -->
      <path class="v7-thigh" d="
        M165 405
        C181 402 191 416 192 438
        C193 469 188 501 184 532
        C181 554 179 574 176 594
        C172 612 163 622 151 619
        C140 613 137 597 138 579
        C140 555 135 531 132 507
        C128 478 124 449 129 429
        C134 414 148 406 165 405 Z"/>
      <!-- right thigh -->
      <path class="v7-thigh" d="
        M255 405
        C239 402 229 416 228 438
        C227 469 232 501 236 532
        C239 554 241 574 244 594
        C248 612 257 622 269 619
        C280 613 283 597 282 579
        C280 555 285 531 288 507
        C292 478 296 449 291 429
        C286 414 272 406 255 405 Z"/>

      <!-- left lower leg -->
      <path class="v7-lower-leg" d="
        M151 610
        C164 605 176 615 179 632
        C181 652 177 674 172 692
        C164 702 150 700 144 691
        C140 673 139 649 142 630
        C143 620 146 613 151 610 Z"/>
      <!-- right lower leg -->
      <path class="v7-lower-leg" d="
        M269 610
        C256 605 244 615 241 632
        C239 652 243 674 248 692
        C256 702 270 700 276 691
        C280 673 281 649 278 630
        C277 620 274 613 269 610 Z"/>

      <!-- feet -->
      <path class="v7-foot" d="M144 685 C154 679 168 681 174 690 C175 703 167 711 153 712 C139 712 132 706 133 698 C135 692 138 688 144 685 Z"/>
      <path class="v7-foot" d="M276 685 C266 679 252 681 246 690 C245 703 253 711 267 712 C281 712 288 706 287 698 C285 692 282 688 276 685 Z"/>
    </g>

    <!-- Subtle anatomical landmarks -->
    <g class="v7-guides">
      ${front?`
        <path d="M174 151 C188 158 199 161 210 161 C221 161 232 158 246 151"/>
        <path d="M210 160 V353"/>
        <path d="M161 221 C177 229 193 232 210 232 C227 232 243 229 259 221"/>
        <path d="M172 257 H248 M169 290 H251"/>
        <path d="M166 415 C177 425 185 438 189 452 M254 415 C243 425 235 438 231 452"/>
        <path d="M151 613 C160 622 167 635 168 648 M269 613 C260 622 253 635 252 648"/>
      `:`
        <path d="M177 150 C188 159 199 164 210 166 C221 164 232 159 243 150"/>
        <path d="M210 147 V354"/>
        <path d="M154 216 C171 235 190 246 210 249 C230 246 249 235 266 216"/>
        <path d="M169 294 C183 304 196 309 210 310 C224 309 237 304 251 294"/>
        <path d="M166 410 C178 424 187 438 190 454 M254 410 C242 424 233 438 230 454"/>
      `}
    </g>

    <!--
      PERFORMANCE / MOBILITY OVERLAYS
      These are the only colored elements.
    -->
    <g ${attrs('shoulders')}>
      <path d="
        M136 156
        C148 145 162 140 178 142
        C185 151 186 163 182 175
        C166 175 151 181 141 193
        C132 188 128 177 130 167
        C131 162 133 159 136 156 Z"/>
      <path d="
        M284 156
        C272 145 258 140 242 142
        C235 151 234 163 238 175
        C254 175 269 181 279 193
        C288 188 292 177 290 167
        C289 162 287 159 284 156 Z"/>
      ${front?'':`<path class="v7-secondary" d="M183 142 C193 150 201 154 210 155 C219 154 227 150 237 142 L232 169 C224 176 217 180 210 181 C203 180 196 176 188 169 Z"/>`}
    </g>

    ${front?`
      <g ${attrs('chest')}>
        <path d="
          M149 184
          C164 169 184 168 202 178
          L203 233
          C184 242 164 238 149 223
          C143 211 143 196 149 184 Z"/>
        <path d="
          M271 184
          C256 169 236 168 218 178
          L217 233
          C236 242 256 238 271 223
          C277 211 277 196 271 184 Z"/>
      </g>
    `:`
      <g ${attrs('back')}>
        <path d="
          M139 177
          C160 160 184 158 210 170
          C236 158 260 160 281 177
          C285 209 280 248 269 286
          C259 317 239 341 210 353
          C181 341 161 317 151 286
          C140 248 135 209 139 177 Z"/>
        <path class="v7-secondary" d="
          M167 184
          C181 204 196 215 210 219
          C224 215 239 204 253 184
          L245 291
          C232 308 221 316 210 319
          C199 316 188 308 175 291 Z"/>
      </g>
    `}

    <g ${attrs('arms')}>
      <!-- Upper-arm overlays now follow the real silhouette contour instead of floating inside it. -->
      <path d="
        M133 157
        C121 159 112 170 107 188
        C102 208 105 233 109 256
        C112 271 117 284 126 291
        C136 291 141 279 141 263
        C142 240 147 213 146 188
        C145 171 141 160 133 157 Z"/>
      <path d="
        M287 157
        C299 159 308 170 313 188
        C318 208 315 233 311 256
        C308 271 303 284 294 291
        C284 291 279 279 279 263
        C278 240 273 213 274 188
        C275 171 279 160 287 157 Z"/>
    </g>

    <g ${attrs('forearms')}>
      <!-- Forearms start at the anatomical elbow and track the shell down to the wrist. -->
      <path d="
        M126 291
        C136 289 141 299 140 316
        C139 338 136 362 132 384
        C129 402 122 414 112 416
        C102 413 99 401 101 387
        C104 367 109 348 112 329
        C115 309 116 297 126 291 Z"/>
      <path d="
        M294 291
        C284 289 279 299 280 316
        C281 338 284 362 288 384
        C291 402 298 414 308 416
        C318 413 321 401 319 387
        C316 367 311 348 308 329
        C305 309 304 297 294 291 Z"/>
    </g>

    <g ${attrs('wrists')}>
      <!-- Wrist/hand overlays are centered on the actual hand shell. -->
      <path d="
        M99 418
        C89 423 86 436 89 449
        C91 460 98 468 106 466
        C114 464 118 454 116 443
        C114 430 107 420 99 418 Z"/>
      <path d="
        M321 418
        C331 423 334 436 331 449
        C329 460 322 468 314 466
        C306 464 302 454 304 443
        C306 430 313 420 321 418 Z"/>
    </g>

    <g ${attrs('core')}>
      ${front?`
        <path d="
          M157 241
          C173 250 191 254 210 254
          C229 254 247 250 263 241
          L266 322
          C256 346 238 360 210 365
          C182 360 164 346 154 322 Z"/>
        <path class="v7-secondary" d="M177 270 H201 V295 H174 Z M219 270 H243 L246 295 H219 Z M174 303 H201 V332 H170 Z M219 303 H246 L250 332 H219 Z"/>
      `:`
        <path d="
          M156 245
          C174 256 192 260 210 260
          C228 260 246 256 264 245
          L267 319
          C255 342 237 355 210 359
          C183 355 165 342 153 319 Z"/>
        <path class="v7-secondary" d="M180 275 C191 287 201 292 210 294 C219 292 229 287 240 275 L241 326 C230 338 219 343 210 345 C201 343 190 338 179 326 Z"/>
      `}
    </g>

    <g ${attrs('hips')}>
      ${front?`
        <path d="
          M161 354
          C176 365 193 371 210 372
          C227 371 244 365 259 354
          L265 406
          C249 420 231 427 210 428
          C189 427 171 420 155 406 Z"/>
      `:`
        <path d="
          M154 356
          C171 345 191 348 210 364
          C229 348 249 345 266 356
          L268 407
          C251 425 231 432 210 430
          C189 432 169 425 152 407 Z"/>
      `}
    </g>

    <g ${attrs(front?'quads':'hamstrings')}>
      <path d="
        M157 411
        C174 405 188 418 191 441
        C193 474 187 508 182 539
        C178 562 168 574 155 570
        C143 561 141 540 142 519
        L138 458
        C137 433 143 416 157 411 Z"/>
      <path d="
        M263 411
        C246 405 232 418 229 441
        C227 474 233 508 238 539
        C242 562 252 574 265 570
        C277 561 279 540 278 519
        L282 458
        C283 433 277 416 263 411 Z"/>
      ${front?`<path class="v7-anatomy-line" d="M161 429 C173 442 179 459 181 478 M259 429 C247 442 241 459 239 478"/>`:''}
    </g>

    <g ${attrs('calves')}>
      <path d="
        M151 562
        C163 554 176 563 178 581
        L174 646
        C169 663 158 670 147 661
        C141 646 143 624 144 605
        C144 585 146 569 151 562 Z"/>
      <path d="
        M269 562
        C257 554 244 563 242 581
        L246 646
        C251 663 262 670 273 661
        C279 646 277 624 276 605
        C276 585 274 569 269 562 Z"/>
    </g>

    <g ${attrs('ankles')}>
      <path d="M145 650 C156 645 171 650 176 664 L173 695 C164 706 149 705 141 694 C138 677 139 660 145 650 Z"/>
      <path d="M275 650 C264 645 249 650 244 664 L247 695 C256 706 271 705 279 694 C282 677 281 660 275 650 Z"/>
    </g>
  </svg>`;
};


/* ========================================================================== */
/* V10.107 · Body Map 3D Beta                                                  */
/* Three.js procedural athlete · 360° rotation · clickable KINETIK zones.      */
/* SVG V7 remains the automatic fallback.                                      */
/* ========================================================================== */

function v10107DisplayMode(){
  if(!state.progressBodyDisplay) state.progressBodyDisplay='3d';
  return state.progressBodyDisplay;
}
function v10107ThreeAvailable(){
  return typeof window!=='undefined' && !!window.THREE;
}
function v10107ColorForZone(zone){
  if(!zone || zone.status?.id==='none') return {color:0x94a3b8,opacity:.035,emissive:0x000000};
  if(zone.confidence?.id==='low') return {color:0x818cf8,opacity:.30,emissive:0x312e81};
  const id=zone.tone?.id||'none';
  const map={
    low:{color:0xef6f78,opacity:.72,emissive:0x3b080d},
    watch:{color:0xf59e62,opacity:.72,emissive:0x421704},
    ok:{color:0xe8c85e,opacity:.68,emissive:0x332702},
    good:{color:0x5fc987,opacity:.69,emissive:0x073b1b},
    great:{color:0x6868de,opacity:.72,emissive:0x181852},
    none:{color:0x94a3b8,opacity:.04,emissive:0x000000}
  };
  return map[id]||map.none;
}

function v10107RenderBodyVisual(view,mode,selectedId){
  const display=v10107DisplayMode();
  if(display==='3d' && v10107ThreeAvailable()){
    return `<div class="body3d-stage" id="body3DStage" aria-label="Modèle corporel 3D interactif">
      <div class="body3d-help">
        <span>360°</span>
        <strong>Glisse pour tourner</strong>
        <small>Tap sur une zone pour l’analyser</small>
      </div>
      <button class="body3d-reset" type="button" data-body3d-reset aria-label="Recentrer le modèle">↺</button>
    </div>`;
  }
  return `<div class="body3d-fallback">${v1095BodyMapSVG(view,mode,selectedId)}</div>`;
}

const _v1095RenderProgressOverviewV10107=v1095RenderProgressOverview;
v1095RenderProgressOverview=function(){
  const mode=state.progressBodyMode||'overall';
  const view=state.progressBodyView||'front';
  const display=v10107DisplayMode();
  const summary=v1095OverviewSummary();
  const selected=v1095SelectedBodyZone(mode,view);
  state.progressBodyZone=selected?.id||state.progressBodyZone;
  const priority=v1095PriorityZones(mode,3),strong=v1095StrongZones(mode,3);
  const modeLabel=mode==='strength'?'Force':mode==='mobility'?'Mobilité':'Vue d’ensemble';

  return `
    <section class="card body-overview-hero">
      <div class="section-head">
        <div><div class="kicker">Vue d’ensemble</div><h2>Ton corps en un coup d’œil</h2></div>
        <span class="pill">Objectif · ${esc(v1095GoalText())}</span>
      </div>
      <div class="body-overview-stats">
        <article><span>Niveau global</span><strong>${summary.global!=null?summary.global+'/100':'—'}</strong><small>${esc(summary.globalLabel)}</small></article>
        <article><span>Plus solide</span><strong>${esc(summary.strong?.label||'—')}</strong><small>${summary.strong?.score!=null?summary.strong.score+'/100':'À construire'}</small></article>
        <article><span>Zone prioritaire</span><strong>${esc(summary.weak?.label||'—')}</strong><small>${summary.weak?.score!=null?summary.weak.score+'/100':'À évaluer'}</small></article>
        <article><span>Équilibre</span><strong>${esc(summary.balance)}</strong><small>${esc(summary.coverage)} · ${esc(summary.evidence)}</small></article>
      </div>
    </section>

    <section class="card body-overview-card body-overview-card-3d">
      <div class="body-overview-toolbar">
        <div class="body-overview-toggle" role="tablist" aria-label="Mode de lecture">
          <button class="${mode==='overall'?'active':''}" data-body-mode="overall">Vue d’ensemble</button>
          <button class="${mode==='strength'?'active':''}" data-body-mode="strength">Force</button>
          <button class="${mode==='mobility'?'active':''}" data-body-mode="mobility">Mobilité</button>
        </div>
        <div class="body-toolbar-right">
          <div class="body-overview-toggle body-display-toggle" role="tablist" aria-label="Affichage du corps">
            <button class="${display==='2d'?'active':''}" data-body-display="2d">2D</button>
            <button class="${display==='3d'?'active':''}" data-body-display="3d">3D</button>
          </div>
          <div class="body-overview-toggle" role="tablist" aria-label="Orientation du corps">
            <button class="${view==='front'?'active':''}" data-body-view="front">Face</button>
            <button class="${view==='back'?'active':''}" data-body-view="back">Dos</button>
          </div>
        </div>
      </div>

      <div class="body-overview-model-wrap">
        <div class="body-overview-model body-overview-model-3d">
          ${v10107RenderBodyVisual(view,mode,selected?.id||'')}
        </div>
        <div class="body-overview-side">
          ${v1095ZoneDetailCard(mode,view)}
          <div class="body-overview-legend">
            <span><i class="tone-none"></i>À évaluer</span>
            <span><i class="tone-partial"></i>Données limitées</span>
            <span><i class="tone-low"></i>Fragile</span>
            <span><i class="tone-watch"></i>À travailler</span>
            <span><i class="tone-ok"></i>Correct</span>
            <span><i class="tone-good"></i>Solide</span>
            <span><i class="tone-great"></i>Avancé</span>
          </div>
          ${display==='3d'?`<p class="body3d-note">Rotation libre à 360° · cadrage complet du corps par défaut.</p>`:''}
        </div>
      </div>
    </section>

    <section class="body-overview-grid">
      <article class="card body-overview-list-card">
        <div class="section-head"><div><div class="kicker">À travailler</div><h3>Les zones les moins avancées</h3></div><span class="pill">${modeLabel}</span></div>
        <div class="body-overview-chip-list">
          ${priority.length?priority.map(v1095ZoneChip).join(''):'<div class="empty">Pas assez de données pour identifier une priorité.</div>'}
        </div>
      </article>
      <article class="card body-overview-list-card">
        <div class="section-head"><div><div class="kicker">Points forts</div><h3>Ce qui soutient ton objectif</h3></div><span class="pill">${modeLabel}</span></div>
        <div class="body-overview-chip-list">
          ${strong.length?strong.map(v1095ZoneChip).join(''):'<div class="empty">Tes points forts apparaîtront ici avec plus de données.</div>'}
        </div>
      </article>
    </section>

    <section class="card body-overview-actions">
      <div class="section-head"><div><div class="kicker">Actions rapides</div><h3>Aller au bon endroit</h3></div></div>
      <div class="body-overview-action-grid">
        <button data-progress-tab="performance"><span>Performances</span><strong>Voir les records et tendances</strong><b>→</b></button>
        <button data-view="skills"><span>Capacités</span><strong>Voir le profil détaillé</strong><b>→</b></button>
        <button data-view="flexibility"><span>Mobilité</span><strong>Voir les zones à travailler</strong><b>→</b></button>
        <button data-view="assessment"><span>Évaluation</span><strong>Confirmer les repères utiles</strong><b>→</b></button>
      </div>
    </section>`;
};

let v10107Body3DInstance=null;
function v10107DisposeBody3D(){
  const inst=v10107Body3DInstance;
  if(!inst)return;
  try{
    inst.stopped=true;
    inst.resizeObserver?.disconnect?.();
    inst.renderer?.setAnimationLoop?.(null);
    inst.renderer?.dispose?.();
    inst.scene?.traverse?.(obj=>{
      if(obj.geometry?.dispose)obj.geometry.dispose();
      if(obj.material){
        const mats=Array.isArray(obj.material)?obj.material:[obj.material];
        mats.forEach(m=>m?.dispose?.());
      }
    });
  }catch(e){}
  v10107Body3DInstance=null;
}

function v10107InitBody3D(){
  const host=document.getElementById('body3DStage');
  if(!host || !v10107ThreeAvailable()) return;
  v10107DisposeBody3D();

  const THREE=window.THREE;
  const scene=new THREE.Scene();
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));
  renderer.setClearColor(0x000000,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.05;
  host.prepend(renderer.domElement);
  renderer.domElement.className='body3d-canvas';

  const camera=new THREE.PerspectiveCamera(29,1,.1,50);
  camera.position.set(0,-0.02,9.35);

  const hemi=new THREE.HemisphereLight(0xffffff,0xb9c3d3,2.05);
  scene.add(hemi);
  const key=new THREE.DirectionalLight(0xffffff,3.0);
  key.position.set(3.4,5.4,5.8);
  scene.add(key);
  const fill=new THREE.DirectionalLight(0xdde5ff,1.55);
  fill.position.set(-4,2.5,3);
  scene.add(fill);
  const rim=new THREE.DirectionalLight(0xb8c4ff,1.35);
  rim.position.set(0,3,-5);
  scene.add(rim);

  const body=new THREE.Group();
  scene.add(body);

  const shellMat=new THREE.MeshPhysicalMaterial({
    color:0xe8edf4,roughness:.56,metalness:0,
    clearcoat:.16,clearcoatRoughness:.7,
    transparent:true,opacity:.98
  });
  const jointMat=new THREE.MeshPhysicalMaterial({
    color:0xf1f4f8,roughness:.58,metalness:0,
    clearcoat:.12,transparent:true,opacity:.98
  });

  function addMesh(geometry,material,pos=[0,0,0],scale=[1,1,1],rot=[0,0,0],parent=body){
    const m=new THREE.Mesh(geometry,material);
    m.position.set(...pos);m.scale.set(...scale);m.rotation.set(...rot);
    parent.add(m);return m;
  }
  function capsuleGeom(radius,length){
    if(THREE.CapsuleGeometry) return new THREE.CapsuleGeometry(radius,length,8,24);
    return new THREE.CylinderGeometry(radius,radius,length+radius*2,24,1,false);
  }
  function addCapsule(material,pos,radius,length,scale=[1,1,1],rot=[0,0,0],parent=body){
    return addMesh(capsuleGeom(radius,length),material,pos,scale,rot,parent);
  }
  function lathe(points,segments=48){
    return new THREE.LatheGeometry(points.map(([r,y])=>new THREE.Vector2(r,y)),segments);
  }

  // --- Neutral athlete shell ---
  addMesh(new THREE.SphereGeometry(.39,40,28),jointMat,[0,2.63,0],[.78,1.0,.72]);
  addMesh(new THREE.CylinderGeometry(.18,.21,.42,28),shellMat,[0,2.22,0]);

  const torso=addMesh(lathe([
    [.40,-.98],[.47,-.78],[.52,-.48],[.59,-.05],[.66,.43],[.62,.72],[.50,.96]
  ]),shellMat,[0,1.20,0],[1.0,1.0,.67]);
  const pelvis=addMesh(lathe([
    [.47,-.43],[.54,-.25],[.58,.04],[.54,.31],[.46,.45]
  ]),shellMat,[0,-.18,0],[1.0,1.0,.73]);

  // Shoulder base makes the torso read as one body rather than separate limbs.
  addCapsule(shellMat,[0,1.93,0],.23,1.08,[1,1,.84],[0,0,Math.PI/2]);

  const armRot=.105;
  addCapsule(shellMat,[-.79,1.25,0],.16,.76,[1,1,.95],[0,0,-armRot]);
  addCapsule(shellMat,[ .79,1.25,0],.16,.76,[1,1,.95],[0,0, armRot]);
  addCapsule(shellMat,[-.86,.35,.01],.14,.78,[1,1,.92],[0,0,-.045]);
  addCapsule(shellMat,[ .86,.35,.01],.14,.78,[1,1,.92],[0,0, .045]);
  addMesh(new THREE.SphereGeometry(.18,28,20),jointMat,[-.89,-.20,.05],[.80,1.18,.70]);
  addMesh(new THREE.SphereGeometry(.18,28,20),jointMat,[ .89,-.20,.05],[.80,1.18,.70]);

  addCapsule(shellMat,[-.31,-1.22,0],.225,.92,[1,1,.94],[0,0,-.025]);
  addCapsule(shellMat,[ .31,-1.22,0],.225,.92,[1,1,.94],[0,0, .025]);
  addCapsule(shellMat,[-.31,-2.30,.02],.175,.88,[1,1,.92],[0,0,.012]);
  addCapsule(shellMat,[ .31,-2.30,.02],.175,.88,[1,1,.92],[0,0,-.012]);
  addMesh(new THREE.SphereGeometry(.22,30,20),jointMat,[-.31,-3.00,.16],[.76,.48,1.42]);
  addMesh(new THREE.SphereGeometry(.22,30,20),jointMat,[ .31,-3.00,.16],[.76,.48,1.42]);

  // --- Zone overlays ---
  const zoneMeshes=[];
  const mode=state.progressBodyMode||'overall';
  const selectedId=state.progressBodyZone||'';

  function zoneMaterial(zoneId){
    const zone=v10103ZoneData(zoneId,mode);
    const style=v10107ColorForZone(zone);
    const selected=selectedId===zoneId;
    return new THREE.MeshStandardMaterial({
      color:style.color,
      roughness:.46,
      metalness:0,
      transparent:true,
      opacity:selected?Math.max(style.opacity,.62):style.opacity,
      depthWrite:false,
      emissive:selected?0x312e81:style.emissive,
      emissiveIntensity:selected?.28:.035,
      side:THREE.DoubleSide
    });
  }
  function tag(mesh,zoneId){
    mesh.userData.zoneId=zoneId;
    zoneMeshes.push(mesh);
    return mesh;
  }
  function zSphere(zoneId,pos,scale){
    return tag(addMesh(new THREE.SphereGeometry(1,30,22),zoneMaterial(zoneId),pos,scale),zoneId);
  }
  function zCapsule(zoneId,pos,radius,length,scale=[1,1,1],rot=[0,0,0]){
    return tag(addCapsule(zoneMaterial(zoneId),pos,radius,length,scale,rot),zoneId);
  }

  // Shoulders / deltoids.
  zSphere('shoulders',[-.67,1.85,.02],[.31,.26,.30]);
  zSphere('shoulders',[ .67,1.85,.02],[.31,.26,.30]);

  // Front chest and posterior back are separate clickable surfaces.
  zSphere('chest',[-.28,1.45,.39],[.37,.34,.105]);
  zSphere('chest',[ .28,1.45,.39],[.37,.34,.105]);
  zSphere('back',[0,1.36,-.39],[.63,.72,.105]);

  // Arms / forearms / wrists follow the neutral limb axes.
  zCapsule('arms',[-.79,1.25,.015],.168,.76,[1,1,.98],[0,0,-armRot]);
  zCapsule('arms',[ .79,1.25,.015],.168,.76,[1,1,.98],[0,0, armRot]);
  zCapsule('forearms',[-.86,.35,.025],.147,.78,[1,1,.95],[0,0,-.045]);
  zCapsule('forearms',[ .86,.35,.025],.147,.78,[1,1,.95],[0,0, .045]);
  zSphere('wrists',[-.89,-.20,.07],[.15,.22,.14]);
  zSphere('wrists',[ .89,-.20,.07],[.15,.22,.14]);

  // Core front + lower-back surface.
  zSphere('core',[0,.70,.405],[.45,.68,.095]);
  zSphere('core',[0,.70,-.405],[.45,.68,.095]);

  // Hips / glutes.
  zSphere('hips',[0,-.22,.30],[.56,.38,.17]);
  zSphere('hips',[0,-.22,-.30],[.56,.38,.17]);

  // Thighs: front quads and posterior hamstrings.
  zCapsule('quads',[-.31,-1.22,.16],.19,.90,[1,.98,.72],[0,0,-.025]);
  zCapsule('quads',[ .31,-1.22,.16],.19,.90,[1,.98,.72],[0,0, .025]);
  zCapsule('hamstrings',[-.31,-1.22,-.16],.19,.90,[1,.98,.72],[0,0,-.025]);
  zCapsule('hamstrings',[ .31,-1.22,-.16],.19,.90,[1,.98,.72],[0,0, .025]);

  // Calves and ankle/foot zones.
  zCapsule('calves',[-.31,-2.30,.03],.18,.86,[1,1,.94],[0,0,.012]);
  zCapsule('calves',[ .31,-2.30,.03],.18,.86,[1,1,.94],[0,0,-.012]);
  zSphere('ankles',[-.31,-2.88,.09],[.17,.20,.19]);
  zSphere('ankles',[ .31,-2.88,.09],[.17,.20,.19]);

  // Ground shadow.
  const shadow=new THREE.Mesh(
    new THREE.CircleGeometry(1.25,64),
    new THREE.MeshBasicMaterial({color:0x94a3b8,transparent:true,opacity:.09,depthWrite:false})
  );
  shadow.rotation.x=-Math.PI/2;
  shadow.position.set(0,-3.18,0);
  scene.add(shadow);

  // Initial orientation: face/dos button snaps the 3D model.
  if(!Number.isFinite(state.progressBody3DYaw)){
    state.progressBody3DYaw=(state.progressBodyView||'front')==='back'?Math.PI:0;
  }
  body.rotation.y=Number(state.progressBody3DYaw||0);
  body.rotation.x=Number(state.progressBody3DPitch||0);

  const raycaster=new THREE.Raycaster();
  const pointer=new THREE.Vector2();
  let downX=0,downY=0,lastX=0,lastY=0,dragging=false,moved=false;

  function resize(){
    if(!host.isConnected)return;
    const rect=host.getBoundingClientRect();
    const w=Math.max(260,Math.round(rect.width));
    const h=Math.max(430,Math.round(rect.height));
    renderer.setSize(w,h,false);
    camera.aspect=w/h;
    camera.updateProjectionMatrix();
  }

  function pointerToNdc(ev){
    const r=renderer.domElement.getBoundingClientRect();
    pointer.x=((ev.clientX-r.left)/r.width)*2-1;
    pointer.y=-((ev.clientY-r.top)/r.height)*2+1;
  }
  function pick(ev){
    pointerToNdc(ev);
    raycaster.setFromCamera(pointer,camera);
    const hits=raycaster.intersectObjects(zoneMeshes,false);
    const hit=hits.find(h=>h.object?.userData?.zoneId);
    if(!hit)return;
    const zoneId=hit.object.userData.zoneId;
    state.progressBodyZone=zoneId;
    // Keep a sensible 2D context for the right-side panel and fallback.
    if(['back','hamstrings'].includes(zoneId)) state.progressBodyView='back';
    render();
  }

  renderer.domElement.addEventListener('pointerdown',ev=>{
    dragging=true;moved=false;
    downX=lastX=ev.clientX;downY=lastY=ev.clientY;
    renderer.domElement.setPointerCapture?.(ev.pointerId);
  });
  renderer.domElement.addEventListener('pointermove',ev=>{
    if(!dragging)return;
    const dx=ev.clientX-lastX,dy=ev.clientY-lastY;
    if(Math.hypot(ev.clientX-downX,ev.clientY-downY)>5)moved=true;
    body.rotation.y+=dx*.012;
    body.rotation.x=Math.max(-.24,Math.min(.24,body.rotation.x+dy*.0045));
    lastX=ev.clientX;lastY=ev.clientY;
    state.progressBody3DYaw=body.rotation.y;
    state.progressBody3DPitch=body.rotation.x;
  });
  const endPointer=ev=>{
    if(!dragging)return;
    dragging=false;
    renderer.domElement.releasePointerCapture?.(ev.pointerId);
    if(!moved)pick(ev);
  };
  renderer.domElement.addEventListener('pointerup',endPointer);
  renderer.domElement.addEventListener('pointercancel',()=>{dragging=false;});

  renderer.domElement.addEventListener('wheel',ev=>{
    ev.preventDefault();
    camera.position.z=Math.max(7.2,Math.min(10.2,camera.position.z+ev.deltaY*.003));
  },{passive:false});

  const resizeObserver=new ResizeObserver(resize);
  resizeObserver.observe(host);
  resize();

  const inst={renderer,scene,camera,body,resizeObserver,stopped:false};
  v10107Body3DInstance=inst;
  function loop(){
    if(inst.stopped)return;
    if(!host.isConnected){v10107DisposeBody3D();return;}
    renderer.render(scene,camera);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

const _bindEventsV10107=bindEvents;
bindEvents=function(){
  _bindEventsV10107();

  document.querySelectorAll('[data-body-display]').forEach(b=>b.onclick=()=>{
    state.progressBodyDisplay=b.dataset.bodyDisplay||'2d';
    if(state.progressBodyDisplay==='3d'){
      state.progressBody3DYaw=(state.progressBodyView||'front')==='back'?Math.PI:0;
      state.progressBody3DPitch=0;
    }
    render();
  });

  // In 3D, Face/Dos are camera/model snap controls as well.
  if(v10107DisplayMode()==='3d'){
    document.querySelectorAll('[data-body-view]').forEach(b=>b.onclick=()=>{
      const next=b.dataset.bodyView||'front';
      state.progressBodyView=next;
      state.progressBody3DYaw=next==='back'?Math.PI:0;
      state.progressBody3DPitch=0;
      render();
    });
  }

  document.querySelectorAll('[data-body3d-reset]').forEach(b=>b.onclick=()=>{
    state.progressBody3DYaw=(state.progressBodyView||'front')==='back'?Math.PI:0;
    state.progressBody3DPitch=0;
    render();
  });

  if(document.getElementById('body3DStage')){
    requestAnimationFrame(v10107InitBody3D);
  }
};


/* ========================================================================== */
/* V10.108 · Correctif renderer Body Map 3D                                   */
/* Le renderer Progression gardait encore la référence V7 2D.                 */
/* ========================================================================== */
/* v10.146: Progression owns its overview renderer; Body no longer overrides it. */

applyAppTheme();

window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();state.deferredInstall=e;if(state.view==='settings'&&!state.active)render();});
window.addEventListener('appinstalled',()=>{state.deferredInstall=null;});
// Prime Web Audio from a genuine user gesture. This matters on iOS.
document.addEventListener('pointerdown',()=>unlockTimerAudio(),{passive:true});
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible'&&state.active?.timerRunning){
    const end=Number(state.active.timerEndAt||0);
    if(end&&Date.now()>=end)finishRunningTimer();
    else requestTimerWakeLock();
  }
});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
const _stravaQs=new URLSearchParams(location.search),stravaParam=_stravaQs.get('strava'),stravaReason=_stravaQs.get('reason');if(stravaParam){const reasonLabel=({missing_config:'configuration Vercel incomplète',token_exchange:'échange du code refusé par Strava',missing_scope:'permission activité non accordée',session_error:'session sécurisée impossible',callback_domain:'domaine de callback invalide',access_denied:'autorisation refusée'})[stravaReason]||stravaReason;state.stravaMessage=stravaParam==='connected'?'Strava connecté ✓':stravaParam==='error'?`Erreur de connexion Strava${reasonLabel?' · '+reasonLabel:''}`:'Connexion Strava non terminée';sessionStorage.setItem('cc_strava_return',stravaParam);history.replaceState({},'',location.pathname);}
render();
setTimeout(async()=>{await loadStravaStatus();const returned=sessionStorage.getItem('cc_strava_return');if(returned==='connected'&&state.stravaStatus.connected){sessionStorage.removeItem('cc_strava_return');if(!getStravaMeta().lastSync)syncStravaActivities();}},80);


/* ========================================================================== */
/* V10.109 · Haut du corps détaillé                                           */
/* Bras remplacés par biceps + triceps. Trapèzes ajoutés.                     */
/* ========================================================================== */
function v10109ZoneIds(view='front'){
  return view==='back'
    ?['shoulders','traps','back','triceps','biceps','forearms','wrists','core','hips','hamstrings','calves','ankles']
    :['shoulders','traps','chest','biceps','triceps','forearms','wrists','core','hips','quads','calves','ankles'];
}

v1095BodyZones=function(mode='overall',view='front'){
  const pull=v1095CapabilityScore('pull'),push=v1095CapabilityScore('push'),core=v1095CapabilityScore('core'),grip=v1095CapabilityScore('grip'),balance=v1095CapabilityScore('balance'),explosive=v1095CapabilityScore('explosive');
  const mShoulders=v1095MobilityScore('shoulders'),mThorax=v1095MobilityScore('thorax'),mWrists=v1095MobilityScore('wrists'),mHips=v1095MobilityScore('hips'),mPosterior=v1095MobilityScore('posterior'),mAnkles=v1095MobilityScore('ankles');
  const legs=v1095LegsScore();
  const data={
    overall:{
      shoulders:{score:v1095Avg(push,balance,mShoulders),label:'Épaules',desc:'Stabilité scapulaire, poussée et contrôle des deltoïdes.',action:'skills'},
      traps:{score:v1095Avg(pull,explosive,mThorax,mShoulders),label:'Trapèzes',desc:'Stabilité haute du dos, tirage et posture scapulaire.',action:'skills'},
      chest:{score:v1095Avg(push,balance),label:'Pectoraux',desc:'Lecture surtout basée sur la poussée.',action:'skills'},
      back:{score:v1095Avg(pull,explosive,mThorax),label:'Dos',desc:'Tractions, tirage haut et ouverture thoracique.',action:'skills'},
      biceps:{score:v1095Avg(pull,grip),label:'Biceps',desc:'Tirage, flexion du coude et contribution au grip.',action:'skills'},
      triceps:{score:v1095Avg(push,balance,core),label:'Triceps',desc:'Extension du coude, poussée et verrouillage des appuis.',action:'skills'},
      forearms:{score:v1095Avg(grip),label:'Avant-bras',desc:'Grip et tenue à la barre.',action:'skills'},
      wrists:{score:v1095Avg(grip,mWrists,balance),label:'Poignets',desc:'Grip, stabilité et extension utile.',action:'flexibility'},
      core:{score:v1095Avg(core,balance),label:'Core / abdos',desc:'Gainage, compression et contrôle.',action:'skills'},
      hips:{score:v1095Avg(legs,mHips,core),label:'Hanches',desc:'Force unilatérale et mobilité de hanche.',action:'flexibility'},
      quads:{score:v1095Avg(legs,mHips),label:'Quadriceps',desc:'Jambes unilatérales et squat.',action:'skills'},
      hamstrings:{score:v1095Avg(legs,mPosterior),label:'Ischios',desc:'Chaîne postérieure et contrôle des jambes.',action:'flexibility'},
      calves:{score:v1095Avg(legs,mAnkles),label:'Mollets',desc:'Appui et contrôle du bas de jambe.',action:'skills'},
      ankles:{score:v1095Avg(mAnkles,legs),label:'Chevilles',desc:'Mobilité utile au squat et à la course.',action:'flexibility'}
    },
    strength:{
      shoulders:{score:v1095Avg(push,balance),label:'Épaules',desc:'Poussée verticale et stabilité inversée.',action:'skills'},
      traps:{score:v1095Avg(pull,explosive),label:'Trapèzes',desc:'Tirage haut, stabilité scapulaire et explosivité.',action:'skills'},
      chest:{score:v1095Avg(push),label:'Pectoraux',desc:'Basé sur les dips et variantes de poussée.',action:'skills'},
      back:{score:v1095Avg(pull,explosive),label:'Dos',desc:'Basé sur le tirage et l’explosivité.',action:'skills'},
      biceps:{score:v1095Avg(pull,grip),label:'Biceps',desc:'Lecture via les tirages et la suspension.',action:'skills'},
      triceps:{score:v1095Avg(push,balance),label:'Triceps',desc:'Lecture via la poussée et la stabilité des appuis.',action:'skills'},
      forearms:{score:v1095Avg(grip),label:'Avant-bras',desc:'Grip et suspension.',action:'skills'},
      wrists:{score:v1095Avg(grip,balance),label:'Poignets',desc:'Stabilité utile au handstand et au grip.',action:'skills'},
      core:{score:v1095Avg(core,balance),label:'Core / abdos',desc:'Compression et maintien.',action:'skills'},
      hips:{score:v1095Avg(legs,core),label:'Hanches',desc:'Contrôle du bassin et jambes.',action:'skills'},
      quads:{score:v1095Avg(legs),label:'Quadriceps',desc:'Lecture via les skills jambes.',action:'skills'},
      hamstrings:{score:v1095Avg(legs),label:'Ischios',desc:'Lecture via les skills jambes.',action:'skills'},
      calves:{score:v1095Avg(legs),label:'Mollets',desc:'Lecture globale des jambes.',action:'skills'},
      ankles:{score:null,label:'Chevilles',desc:'Pas de score force dédié pour le moment.',action:'flexibility'}
    },
    mobility:{
      shoulders:{score:v1095Avg(mShoulders),label:'Épaules',desc:'Flexion et confort au-dessus de la tête.',action:'flexibility'},
      traps:{score:v1095Avg(mThorax,mShoulders),label:'Trapèzes',desc:'Ouverture haute du thorax et aisance scapulaire.',action:'flexibility'},
      chest:{score:v1095Avg(mThorax),label:'Thorax',desc:'Ouverture du haut du tronc.',action:'flexibility'},
      back:{score:v1095Avg(mThorax),label:'Thorax / dos',desc:'Rotation thoracique et ouverture.',action:'flexibility'},
      biceps:{score:null,label:'Biceps',desc:'Pas de test mobilité direct pour le moment.',action:'flexibility'},
      triceps:{score:v1095Avg(mShoulders),label:'Triceps',desc:'Lecture indirecte via la flexion d’épaule.',action:'flexibility'},
      forearms:{score:null,label:'Avant-bras',desc:'Les avant-bras n’ont pas de test mobilité direct.',action:'flexibility'},
      wrists:{score:v1095Avg(mWrists),label:'Poignets',desc:'Extension utile pour appuis et handstand.',action:'flexibility'},
      core:{score:v1095Avg(mThorax,mHips),label:'Tronc',desc:'Mobilité du tronc et des hanches.',action:'flexibility'},
      hips:{score:v1095Avg(mHips),label:'Hanches',desc:'Rotation interne et squat profond.',action:'flexibility'},
      quads:{score:v1095Avg(mHips),label:'Quadriceps / hanches',desc:'Lecture indirecte via squat profond.',action:'flexibility'},
      hamstrings:{score:v1095Avg(mPosterior),label:'Chaîne postérieure',desc:'Flexion avant et ischios.',action:'flexibility'},
      calves:{score:v1095Avg(mAnkles),label:'Bas de jambe',desc:'Lecture indirecte via chevilles.',action:'flexibility'},
      ankles:{score:v1095Avg(mAnkles),label:'Chevilles',desc:'Knee-to-wall gauche et droite.',action:'flexibility'}
    }
  };
  const base=(data[mode]||data.overall);
  return v10109ZoneIds(view).map(id=>({id,...base[id],tone:v1095BodyTone(base[id]?.score)}));
};

v10103ExpectedInputs=function(id,mode='overall'){
  const e={
    shoulders:[['cap','push','Poussée'],['cap','balance','Équilibre'],['mob','shoulders','Mobilité épaules']],
    traps:[['cap','pull','Tirage'],['cap','explosive','Explosivité'],['mob','thorax','Mobilité thorax']],
    chest:[['cap','push','Poussée'],['mob','thorax','Mobilité thorax']],
    back:[['cap','pull','Tirage'],['cap','explosive','Explosivité'],['mob','thorax','Mobilité thorax']],
    biceps:[['cap','pull','Tirage'],['cap','grip','Grip']],
    triceps:[['cap','push','Poussée'],['cap','balance','Équilibre'],['mob','shoulders','Mobilité épaules']],
    forearms:[['cap','grip','Grip']],
    wrists:[['cap','grip','Grip'],['cap','balance','Équilibre'],['mob','wrists','Mobilité poignets']],
    core:[['cap','core','Core'],['cap','balance','Équilibre']],
    hips:[['cap','legs','Jambes'],['cap','core','Core'],['mob','hips','Mobilité hanches']],
    quads:[['cap','legs','Jambes'],['mob','hips','Mobilité hanches']],
    hamstrings:[['cap','legs','Jambes'],['mob','posterior','Chaîne postérieure']],
    calves:[['cap','legs','Jambes'],['mob','ankles','Mobilité chevilles']],
    ankles:[['cap','legs','Jambes'],['mob','ankles','Mobilité chevilles']]
  };
  let rows=(e[id]||[]).map(([kind,key,label])=>({kind,key,label}));
  if(mode==='strength')rows=rows.filter(x=>x.kind==='cap');
  if(mode==='mobility')rows=rows.filter(x=>x.kind==='mob');
  return rows;
};

function v10109BodyMapAttrs(id,z,selectedId){
  return `class="bodymap-zone v7-zone ${v10103ZoneVisual(z(id))}${selectedId===id?' selected':''}" data-body-zone="${id}" role="button" tabindex="0" aria-label="${esc(z(id).label)} ${z(id).score!=null?z(id).score+' sur 100':z(id).status.label}"`;
}

v1095BodyMapSVG=function(view='front',mode='overall',selectedId=''){
  const ids=v10109ZoneIds(view);
  const zones=Object.fromEntries(ids.map(id=>[id,v10103ZoneData(id,mode)]));
  const z=id=>zones[id]||{id,label:id,score:null,status:{id:'none',label:'À évaluer'},confidence:{id:'none',label:'Aucune donnée'}};
  const attrs=id=>v10109BodyMapAttrs(id,z,selectedId);
  const front=view==='front';
  return `<svg class="bodymap-figure bodymap-v7 bodymap-v109" viewBox="0 0 420 720" role="img" aria-label="Profil corporel KINETIK ${front?'face':'dos'}">
    <defs>
      <linearGradient id="v109Body" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fbfcfe"/>
        <stop offset=".46" stop-color="#eef2f7"/>
        <stop offset="1" stop-color="#dfe6ef"/>
      </linearGradient>
      <linearGradient id="v109BodyEdge" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#d7e0eb"/>
        <stop offset=".48" stop-color="#f7f9fc"/>
        <stop offset="1" stop-color="#d7e0eb"/>
      </linearGradient>
      <linearGradient id="v109BodyLeg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f4f7fb"/>
        <stop offset="1" stop-color="#dde5ef"/>
      </linearGradient>
      <filter id="v109BodyShadow" x="-25%" y="-15%" width="150%" height="145%">
        <feDropShadow dx="0" dy="12" stdDeviation="13" flood-color="#64748b" flood-opacity=".13"/>
      </filter>
      <filter id="v109SelectedGlow" x="-45%" y="-45%" width="190%" height="190%">
        <feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="#4f46e5" flood-opacity=".32"/>
      </filter>
      <pattern id="v109LimitedPattern" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
        <rect width="8" height="8" fill="rgba(165,180,252,.20)"/>
        <rect width="2" height="8" fill="rgba(99,102,241,.22)"/>
      </pattern>
    </defs>

    <g class="v7-shell" filter="url(#v109BodyShadow)">
      <path class="v7-head" d="M210 24 C188 24 173 41 173 65 C173 91 188 108 210 110 C232 108 247 91 247 65 C247 41 232 24 210 24 Z"/>
      <path class="v7-ear" d="M173 59 C166 57 163 64 165 74 C167 83 171 87 176 84 L178 64 Z"/>
      <path class="v7-ear" d="M247 59 C254 57 257 64 255 74 C253 83 249 87 244 84 L242 64 Z"/>
      <path class="v7-neck" d="M193 101 C195 116 192 126 183 133 C192 142 201 147 210 147 C219 147 228 142 237 133 C228 126 225 116 227 101 C218 108 202 108 193 101 Z"/>
      <path class="v7-torso" d="M174 131 C157 134 140 143 128 156 C116 170 113 194 117 223 C120 248 126 274 132 298 C139 326 151 349 168 361 C180 369 194 373 210 374 C226 373 240 369 252 361 C269 349 281 326 288 298 C294 274 300 248 303 223 C307 194 304 170 292 156 C280 143 263 134 246 131 C236 136 224 139 210 139 C196 139 184 136 174 131 Z"/>
      <path class="v7-upper-arm" d="M134 151 C117 153 104 166 98 188 C92 212 96 241 101 269 C105 290 108 310 105 329 C103 343 103 359 108 373 C114 388 128 389 136 377 C142 365 144 346 145 328 C146 302 145 275 147 248 C149 222 155 189 149 166 C147 157 142 152 134 151 Z"/>
      <path class="v7-upper-arm" d="M286 151 C303 153 316 166 322 188 C328 212 324 241 319 269 C315 290 312 310 315 329 C317 343 317 359 312 373 C306 388 292 389 284 377 C278 365 276 346 275 328 C274 302 275 275 273 248 C271 222 265 189 271 166 C273 157 278 152 286 151 Z"/>
      <path class="v7-forearm" d="M107 370 C119 367 130 378 132 395 L130 451 C127 472 122 492 111 501 C100 505 92 497 90 483 L90 409 C91 392 95 375 107 370 Z"/>
      <path class="v7-forearm" d="M313 370 C301 367 290 378 288 395 L290 451 C293 472 298 492 309 501 C320 505 328 497 330 483 L330 409 C329 392 325 375 313 370 Z"/>
      <ellipse class="v7-hand" cx="109" cy="519" rx="18" ry="26"/>
      <ellipse class="v7-hand" cx="311" cy="519" rx="18" ry="26"/>
      <path class="v7-pelvis" d="M169 359 C181 366 195 370 210 371 C225 370 239 366 251 359 C262 375 267 397 263 420 C247 434 229 441 210 442 C191 441 173 434 157 420 C153 397 158 375 169 359 Z"/>
      <path class="v7-thigh" d="M166 422 C182 418 193 431 197 454 C201 497 194 541 188 584 C185 604 183 626 177 645 C170 654 156 653 151 642 C147 622 150 600 150 580 C150 553 145 526 141 499 C136 470 135 441 142 430 C147 425 156 422 166 422 Z"/>
      <path class="v7-thigh" d="M254 422 C238 418 227 431 223 454 C219 497 226 541 232 584 C235 604 237 626 243 645 C250 654 264 653 269 642 C273 622 270 600 270 580 C270 553 275 526 279 499 C284 470 285 441 278 430 C273 425 264 422 254 422 Z"/>
      <path class="v7-shin" d="M160 641 C171 637 181 644 183 661 L180 705 C174 716 162 718 153 710 C149 690 151 665 160 641 Z"/>
      <path class="v7-shin" d="M260 641 C249 637 239 644 237 661 L240 705 C246 716 258 718 267 710 C271 690 269 665 260 641 Z"/>
      <ellipse class="v7-foot" cx="165" cy="710" rx="23" ry="14"/>
      <ellipse class="v7-foot" cx="255" cy="710" rx="23" ry="14"/>
    </g>

    <g class="v7-guides">
      <path d="M210 148 V442"/>
      <path d="M164 421 C177 430 193 435 210 435 C227 435 243 430 256 421"/>
      ${front?`<path d="M144 216 C164 225 183 228 210 228 C237 228 256 225 276 216"/><path d="M154 287 H266 M160 324 H260"/>`:`<path d="M147 182 C166 199 187 206 210 208 C233 206 254 199 273 182"/><path d="M162 324 C178 340 194 347 210 349 C226 347 242 340 258 324"/>`}
    </g>

    <g ${attrs('shoulders')}>
      <path d="M152 145 C164 136 176 134 188 139 C190 152 184 167 172 178 C160 176 151 166 148 153 C147 150 148 147 152 145 Z"/>
      <path d="M268 145 C256 136 244 134 232 139 C230 152 236 167 248 178 C260 176 269 166 272 153 C273 150 272 147 268 145 Z"/>
    </g>

    <g ${attrs('traps')}>
      ${front
        ?`<path d="M170 136 C182 130 196 127 210 127 C224 127 238 130 250 136 L243 165 C232 173 222 177 210 178 C198 177 188 173 177 165 Z"/><path d="M188 164 C195 169 203 171 210 171 C217 171 225 169 232 164" class="bodymap-overlay-secondary"/>`
        :`<path d="M165 132 C179 125 194 122 210 122 C226 122 241 125 255 132 L245 168 C235 177 223 182 210 184 C197 182 185 177 175 168 Z"/><path d="M177 144 C187 151 198 155 210 155 C222 155 233 151 243 144" class="bodymap-overlay-secondary"/>`}
    </g>

    ${front
      ?`<g ${attrs('chest')}><path d="M151 182 C168 170 187 169 204 177 L204 255 C186 264 168 263 151 252 Z"/><path d="M269 182 C252 170 233 169 216 177 L216 255 C234 264 252 263 269 252 Z"/><path d="M188 190 C194 194 202 197 210 197 C218 197 226 194 232 190" class="bodymap-overlay-secondary"/></g>`
      :`<g ${attrs('back')}><path d="M149 173 C168 161 188 160 210 171 C232 160 252 161 271 173 C274 223 267 270 251 306 C240 331 226 346 210 352 C194 346 180 331 169 306 C153 270 146 223 149 173 Z"/><path d="M179 184 C188 198 198 206 210 210 C222 206 232 198 241 184 L234 292 C226 306 218 314 210 317 C202 314 194 306 186 292 Z" class="bodymap-overlay-secondary"/></g>`}

    <g ${attrs('biceps')}>
      <path d="M122 193 C113 198 109 212 111 228 L117 287 C120 304 128 314 140 316 C149 311 152 300 151 284 L148 228 C147 210 139 197 122 193 Z"/>
      <path d="M298 193 C307 198 311 212 309 228 L303 287 C300 304 292 314 280 316 C271 311 268 300 269 284 L272 228 C273 210 281 197 298 193 Z"/>
    </g>

    <g ${attrs('triceps')}>
      <path d="M145 182 C132 188 125 203 124 222 L126 292 C129 307 136 318 147 320 C154 314 156 302 156 286 L157 227 C157 207 154 192 145 182 Z"/>
      <path d="M275 182 C288 188 295 203 296 222 L294 292 C291 307 284 318 273 320 C266 314 264 302 264 286 L263 227 C263 207 266 192 275 182 Z"/>
    </g>

    <g ${attrs('forearms')}>
      <path d="M123 319 C134 315 144 322 147 337 L144 425 C141 447 134 466 123 476 C113 479 105 471 103 455 L104 366 C106 347 111 328 123 319 Z"/>
      <path d="M297 319 C286 315 276 322 273 337 L276 425 C279 447 286 466 297 476 C307 479 315 471 317 455 L316 366 C314 347 309 328 297 319 Z"/>
    </g>

    <g ${attrs('wrists')}>
      <ellipse cx="109" cy="519" rx="15" ry="22"/>
      <ellipse cx="311" cy="519" rx="15" ry="22"/>
    </g>

    <g ${attrs('core')}>
      ${front
        ?`<path d="M159 258 C174 267 191 271 210 271 C229 271 246 267 261 258 L264 360 C253 388 236 402 210 408 C184 402 167 388 156 360 Z"/><path d="M181 290 H201 V328 H177 Z M219 290 H239 V328 H219 Z M177 338 H201 V378 H173 Z M219 338 H243 V378 H219 Z" class="bodymap-overlay-secondary"/>`
        :`<path d="M160 265 C175 274 192 278 210 278 C228 278 245 274 260 265 L262 357 C252 384 235 397 210 401 C185 397 168 384 158 357 Z"/><path d="M180 301 C189 313 199 320 210 323 C221 320 231 313 240 301 L238 364 C229 376 220 382 210 384 C200 382 191 376 182 364 Z" class="bodymap-overlay-secondary"/>`}
    </g>

    <g ${attrs('hips')}>
      ${front
        ?`<path d="M159 408 C173 420 191 426 210 427 C229 426 247 420 261 408 L266 460 C250 476 231 484 210 485 C189 484 170 476 154 460 Z"/>`
        :`<path d="M154 410 C171 399 189 403 210 417 C231 403 249 399 266 410 L268 460 C251 479 231 487 210 486 C189 487 169 479 152 460 Z"/>`}
    </g>

    <g ${attrs(front?'quads':'hamstrings')}>
      <path d="M166 486 C181 481 192 492 196 513 C199 552 194 591 188 631 C185 648 178 656 166 654 C157 643 155 623 154 604 L152 531 C152 511 156 492 166 486 Z"/>
      <path d="M254 486 C239 481 228 492 224 513 C221 552 226 591 232 631 C235 648 242 656 254 654 C263 643 265 623 266 604 L268 531 C268 511 264 492 254 486 Z"/>
    </g>

    <g ${attrs('calves')}>
      <path d="M166 631 C177 625 186 632 188 647 L184 700 C179 714 169 719 160 711 C156 694 158 675 166 631 Z"/>
      <path d="M254 631 C243 625 234 632 232 647 L236 700 C241 714 251 719 260 711 C264 694 262 675 254 631 Z"/>
    </g>

    <g ${attrs('ankles')}>
      <ellipse cx="165" cy="710" rx="18" ry="12"/>
      <ellipse cx="255" cy="710" rx="18" ry="12"/>
    </g>
  </svg>`;
};

v10107InitBody3D=function(){
  const host=document.getElementById('body3DStage');
  if(!host || !v10107ThreeAvailable()) return;
  v10107DisposeBody3D();
  const THREE=window.THREE;
  const scene=new THREE.Scene();
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));
  renderer.setClearColor(0x000000,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.05;
  host.prepend(renderer.domElement);
  renderer.domElement.className='body3d-canvas';

  const camera=new THREE.PerspectiveCamera(29,1,.1,50);
  // V10.114: true default framing. The authoritative renderer is now
  // genuinely farther back so the whole silhouette fits without manual zoom.
  camera.position.set(0,-0.12,9.85);

  scene.add(new THREE.HemisphereLight(0xffffff,0xb9c3d3,2.05));
  const key=new THREE.DirectionalLight(0xffffff,3.0); key.position.set(3.4,5.4,5.8); scene.add(key);
  const fill=new THREE.DirectionalLight(0xdde5ff,1.55); fill.position.set(-4,2.5,3); scene.add(fill);
  const rim=new THREE.DirectionalLight(0xb8c4ff,1.35); rim.position.set(0,3,-5); scene.add(rim);

  const body=new THREE.Group(); scene.add(body);
  const shellMat=new THREE.MeshPhysicalMaterial({color:0xe8edf4,roughness:.56,metalness:0,clearcoat:.16,clearcoatRoughness:.7,transparent:true,opacity:.98});
  const jointMat=new THREE.MeshPhysicalMaterial({color:0xf1f4f8,roughness:.58,metalness:0,clearcoat:.12,transparent:true,opacity:.98});

  function addMesh(geometry,material,pos=[0,0,0],scale=[1,1,1],rot=[0,0,0],parent=body){ const m=new THREE.Mesh(geometry,material); m.position.set(...pos); m.scale.set(...scale); m.rotation.set(...rot); parent.add(m); return m; }
  function capsuleGeom(radius,length){ if(THREE.CapsuleGeometry) return new THREE.CapsuleGeometry(radius,length,8,24); return new THREE.CylinderGeometry(radius,radius,length+radius*2,24,1,false); }
  function addCapsule(material,pos,radius,length,scale=[1,1,1],rot=[0,0,0],parent=body){ return addMesh(capsuleGeom(radius,length),material,pos,scale,rot,parent); }
  function lathe(points,segments=48){ return new THREE.LatheGeometry(points.map(([r,y])=>new THREE.Vector2(r,y)),segments); }

  addMesh(new THREE.SphereGeometry(.39,40,28),jointMat,[0,2.63,0],[.78,1.0,.72]);
  addMesh(new THREE.CylinderGeometry(.18,.21,.42,28),shellMat,[0,2.22,0]);
  addMesh(lathe([[.40,-.98],[.47,-.78],[.52,-.48],[.59,-.05],[.66,.43],[.62,.72],[.50,.96]]),shellMat,[0,1.20,0],[1.0,1.0,.67]);
  addMesh(lathe([[.47,-.43],[.54,-.25],[.58,.04],[.54,.31],[.46,.45]]),shellMat,[0,-.18,0],[1.0,1.0,.73]);
  addCapsule(shellMat,[0,1.93,0],.23,1.08,[1,1,.84],[0,0,Math.PI/2]);
  const armRot=.105;
  addCapsule(shellMat,[-.79,1.25,0],.16,.76,[1,1,.95],[0,0,-armRot]);
  addCapsule(shellMat,[ .79,1.25,0],.16,.76,[1,1,.95],[0,0, armRot]);
  addCapsule(shellMat,[-.86,.35,.01],.14,.78,[1,1,.92],[0,0,-.045]);
  addCapsule(shellMat,[ .86,.35,.01],.14,.78,[1,1,.92],[0,0, .045]);
  addMesh(new THREE.SphereGeometry(.18,28,20),jointMat,[-.89,-.20,.05],[.80,1.18,.70]);
  addMesh(new THREE.SphereGeometry(.18,28,20),jointMat,[ .89,-.20,.05],[.80,1.18,.70]);
  addCapsule(shellMat,[-.31,-1.22,0],.225,.92,[1,1,.94],[0,0,-.025]);
  addCapsule(shellMat,[ .31,-1.22,0],.225,.92,[1,1,.94],[0,0, .025]);
  addCapsule(shellMat,[-.31,-2.30,.02],.175,.88,[1,1,.92],[0,0,.012]);
  addCapsule(shellMat,[ .31,-2.30,.02],.175,.88,[1,1,.92],[0,0,-.012]);
  addMesh(new THREE.SphereGeometry(.22,30,20),jointMat,[-.31,-3.00,.16],[.76,.48,1.42]);
  addMesh(new THREE.SphereGeometry(.22,30,20),jointMat,[ .31,-3.00,.16],[.76,.48,1.42]);

  const zoneMeshes=[];
  const mode=state.progressBodyMode||'overall';
  const selectedId=state.progressBodyZone||'';
  function zoneMaterial(zoneId){
    const zone=v10103ZoneData(zoneId,mode), style=v10107ColorForZone(zone), selected=selectedId===zoneId;
    return new THREE.MeshStandardMaterial({color:style.color,roughness:.46,metalness:0,transparent:true,opacity:selected?Math.max(style.opacity,.62):style.opacity,depthWrite:false,emissive:selected?0x312e81:style.emissive,emissiveIntensity:selected?.28:.035,side:THREE.DoubleSide});
  }
  function tag(mesh,zoneId){ mesh.userData.zoneId=zoneId; zoneMeshes.push(mesh); return mesh; }
  function zSphere(zoneId,pos,scale){ return tag(addMesh(new THREE.SphereGeometry(1,30,22),zoneMaterial(zoneId),pos,scale),zoneId); }
  function zCapsule(zoneId,pos,radius,length,scale=[1,1,1],rot=[0,0,0]){ return tag(addCapsule(zoneMaterial(zoneId),pos,radius,length,scale,rot),zoneId); }
  function zBox(zoneId,pos,size=[1,1,1],rot=[0,0,0]){ return tag(addMesh(new THREE.BoxGeometry(1,1,1),zoneMaterial(zoneId),pos,size,rot),zoneId); }

  zSphere('shoulders',[-.68,1.84,.03],[.31,.26,.31]);
  zSphere('shoulders',[ .68,1.84,.03],[.31,.26,.31]);
  zCapsule('traps',[0,1.92,-.08],.16,.62,[1.35,.9,.45],[0,0,Math.PI/2]);
  zSphere('traps',[-.19,1.73,-.08],[.18,.14,.10]);
  zSphere('traps',[ .19,1.73,-.08],[.18,.14,.10]);

  zSphere('chest',[-.28,1.45,.39],[.37,.34,.105]);
  zSphere('chest',[ .28,1.45,.39],[.37,.34,.105]);
  zSphere('back',[0,1.36,-.39],[.63,.72,.105]);

  zCapsule('biceps',[-.77,1.24,.14],.12,.55,[.92,1,.62],[0,0,-armRot]);
  zCapsule('biceps',[ .77,1.24,.14],.12,.55,[.92,1,.62],[0,0, armRot]);
  zCapsule('triceps',[-.80,1.24,-.12],.12,.58,[.95,1,.66],[0,0,-armRot]);
  zCapsule('triceps',[ .80,1.24,-.12],.12,.58,[.95,1,.66],[0,0, armRot]);

  zCapsule('forearms',[-.86,.35,.025],.147,.78,[1,1,.95],[0,0,-.045]);
  zCapsule('forearms',[ .86,.35,.025],.147,.78,[1,1,.95],[0,0, .045]);
  zSphere('wrists',[-.89,-.20,.07],[.15,.22,.14]);
  zSphere('wrists',[ .89,-.20,.07],[.15,.22,.14]);

  zSphere('core',[0,.70,.405],[.45,.68,.095]);
  zSphere('core',[0,.70,-.405],[.45,.68,.095]);
  // Hips = anterior/lateral pelvis. Glutes are a distinct posterior muscle zone.
  zSphere('hips',[0,-.22,.30],[.56,.38,.17]);
  zSphere('glutes',[-.24,-.24,-.30],[.34,.34,.18]);
  zSphere('glutes',[ .24,-.24,-.30],[.34,.34,.18]);
  zCapsule('quads',[-.31,-1.22,.16],.19,.90,[1,.98,.72],[0,0,-.025]);
  zCapsule('quads',[ .31,-1.22,.16],.19,.90,[1,.98,.72],[0,0, .025]);
  zCapsule('hamstrings',[-.31,-1.22,-.16],.19,.90,[1,.98,.72],[0,0,-.025]);
  zCapsule('hamstrings',[ .31,-1.22,-.16],.19,.90,[1,.98,.72],[0,0, .025]);
  zCapsule('calves',[-.31,-2.30,.03],.18,.86,[1,1,.94],[0,0,.012]);
  zCapsule('calves',[ .31,-2.30,.03],.18,.86,[1,1,.94],[0,0,-.012]);
  zSphere('ankles',[-.31,-2.88,.09],[.17,.20,.19]);
  zSphere('ankles',[ .31,-2.88,.09],[.17,.20,.19]);

  const shadow=new THREE.Mesh(new THREE.CircleGeometry(1.25,64),new THREE.MeshBasicMaterial({color:0x94a3b8,transparent:true,opacity:.09,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2; shadow.position.set(0,-3.18,0); scene.add(shadow);
  if(!Number.isFinite(state.progressBody3DYaw)) state.progressBody3DYaw=(state.progressBodyView||'front')==='back'?Math.PI:0;
  body.rotation.y=Number(state.progressBody3DYaw||0); body.rotation.x=Number(state.progressBody3DPitch||0);

  const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2();
  let downX=0,downY=0,lastX=0,lastY=0,dragging=false,moved=false;
  function resize(){ if(!host.isConnected)return; const rect=host.getBoundingClientRect(); const w=Math.max(260,Math.round(rect.width)); const h=Math.max(430,Math.round(rect.height)); renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
  function pointerToNdc(ev){ const r=renderer.domElement.getBoundingClientRect(); pointer.x=((ev.clientX-r.left)/r.width)*2-1; pointer.y=-((ev.clientY-r.top)/r.height)*2+1; }
  function pick(ev){ pointerToNdc(ev); raycaster.setFromCamera(pointer,camera); const hits=raycaster.intersectObjects(zoneMeshes,false); const hit=hits.find(h=>h.object?.userData?.zoneId); if(!hit)return; const zoneId=hit.object.userData.zoneId; state.progressBodyZone=zoneId; const yaw=((body.rotation.y%(Math.PI*2))+(Math.PI*2))%(Math.PI*2); const isBack=yaw>Math.PI/2 && yaw<Math.PI*1.5; state.progressBodyView=isBack?'back':'front'; render(); }

  renderer.domElement.addEventListener('pointerdown',ev=>{ dragging=true; moved=false; downX=lastX=ev.clientX; downY=lastY=ev.clientY; renderer.domElement.setPointerCapture?.(ev.pointerId); });
  renderer.domElement.addEventListener('pointermove',ev=>{ if(!dragging)return; const dx=ev.clientX-lastX, dy=ev.clientY-lastY; if(Math.hypot(ev.clientX-downX,ev.clientY-downY)>5)moved=true; body.rotation.y+=dx*.012; body.rotation.x=Math.max(-.24,Math.min(.24,body.rotation.x+dy*.0045)); lastX=ev.clientX; lastY=ev.clientY; state.progressBody3DYaw=body.rotation.y; state.progressBody3DPitch=body.rotation.x; });
  const endPointer=ev=>{ if(!dragging)return; dragging=false; renderer.domElement.releasePointerCapture?.(ev.pointerId); if(!moved)pick(ev); };
  renderer.domElement.addEventListener('pointerup',endPointer); renderer.domElement.addEventListener('pointercancel',()=>{dragging=false;});
  renderer.domElement.addEventListener('wheel',ev=>{ ev.preventDefault(); camera.position.z=Math.max(8.8,Math.min(13.0,camera.position.z+ev.deltaY*.003)); },{passive:false});
  const resizeObserver=new ResizeObserver(resize); resizeObserver.observe(host); resize();
  const inst={renderer,scene,camera,body,resizeObserver,stopped:false}; v10107Body3DInstance=inst;
  function loop(){ if(inst.stopped)return; if(!host.isConnected){v10107DisposeBody3D();return;} renderer.render(scene,camera); requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
};



/* ========================================================================== */
/* V10.110 · Référentiel corporel unifié                                      */
/* Body Map ↔ volume ↔ bibliothèque ↔ mobilité ↔ mesures ↔ restrictions.      */
/* ========================================================================== */

const KINETIK_BODY_TAXONOMY = Object.freeze({
  strength:[
    {id:'chest',label:'Pectoraux',volume:'Pectoraux'},
    {id:'back',label:'Dos',volume:'Dos'},
    {id:'traps',label:'Trapèzes',volume:'Trapèzes'},
    {id:'shoulders',label:'Épaules',volume:'Épaules'},
    {id:'biceps',label:'Biceps',volume:'Biceps'},
    {id:'triceps',label:'Triceps',volume:'Triceps'},
    {id:'forearms',label:'Avant-bras / grip',volume:'Grip'},
    {id:'core',label:'Core / abdos / lombaires',volume:'Core'},
    {id:'glutes',label:'Fessiers',volume:'Fessiers'},
    {id:'quads',label:'Quadriceps',volume:'Quadriceps'},
    {id:'hamstrings',label:'Ischios',volume:'Ischios'},
    {id:'calves',label:'Mollets',volume:'Mollets'}
  ],
  mobility:[
    {id:'wrists',label:'Poignets',flex:'Poignets'},
    {id:'shoulders',label:'Épaules',flex:'Épaules'},
    {id:'chestMobility',label:'Pectoraux',flex:'Pectoraux'},
    {id:'thorax',label:'Thorax',flex:'Thorax'},
    {id:'hips',label:'Hanches',flex:'Hanches'},
    {id:'hipFlexors',label:'Fléchisseurs de hanche',flex:'Fléchisseurs hanche'},
    {id:'adductors',label:'Adducteurs',flex:'Adducteurs'},
    {id:'hamstrings',label:'Ischios / chaîne postérieure',flex:'Ischios'},
    {id:'ankles',label:'Chevilles',flex:'Chevilles'}
  ],
  joints:[
    {id:'wrists',label:'Poignets'},
    {id:'elbows',label:'Coudes'},
    {id:'shoulders',label:'Épaules'},
    {id:'back',label:'Dos / lombaires'},
    {id:'hips',label:'Hanches'},
    {id:'knees',label:'Genoux'},
    {id:'ankles',label:'Chevilles'}
  ]
});

function v10110VolumeLabel(group){
  return group==='Grip'?'Avant-bras / Grip':group;
}

/* Trapèzes: auparavant visibles dans la Body Map, mais absents du moteur de volume. */
if(!VOLUME_GROUPS.includes('Trapèzes')) VOLUME_GROUPS.splice(3,0,'Trapèzes');
DEFAULT_TRAINING_CONFIG.volumeTargets['Trapèzes']={min:6,max:12};

/* Existing saved configs remain compatible because getTrainingConfig starts from DEFAULT_TRAINING_CONFIG. */
function v10110PatchExercise(name,{trap=0,addMuscles=[]}={}){
  const item=exerciseInfo(name);
  if(!item)return;
  item.volume=item.volume||{};
  if(trap>0) item.volume['Trapèzes']=trap;
  item.muscles=Array.isArray(item.muscles)?item.muscles:[];
  if(trap>=.25 && !item.muscles.includes('Trapèzes')) item.muscles.push('Trapèzes');
  addMuscles.forEach(m=>{if(!item.muscles.includes(m))item.muscles.push(m);});
}

/* Weighted coaching contribution; intentionally conservative on compound movements. */
[
  ['Row avec bande',.55],['Australian rows',.55],
  ['Tractions assistées',.25],['Tractions strictes',.25],
  ['Chest-to-bar',.40],['Tractions explosives',.45],
  ['Chin-ups assistés',.20],['Chin-ups',.20],
  ['Archer pull-ups assistés',.30],['Archer pull-ups',.30],
  ['Scapular pull-ups',.75],['Face pulls',.80],
  ['Dead hang',.15],['Towel hang',.15],['One-arm assisted hang',.20],
  ['Muscle-up assisté',.30],['Muscle-up strict',.30],
  ['Tuck front lever',.45],['Advanced tuck front lever',.50],
  ['One-leg front lever',.50],['Straddle front lever',.55],['Front lever',.60],
  ['Handstand au mur',.20],['Handstand décollages du mur',.20],['Handstand libre',.20],
  ['HSPU négatives au mur',.25],['Handstand push-up au mur',.30],['Handstand push-up libre',.30],
  ['Human flag support vertical',.20],['Tuck human flag',.25],['One-leg human flag',.25],
  ['Straddle human flag',.30],['Human flag',.30]
].forEach(([name,trap])=>v10110PatchExercise(name,{trap}));

/* Grip is a function, forearms are the anatomical region: expose both in the exercise library. */
EXERCISE_LIBRARY.forEach(item=>{
  if(item.muscles?.includes('Grip') && !item.muscles.includes('Avant-bras')) item.muscles.push('Avant-bras');
});

/* Body Map: fessiers were tracked in volume but not selectable anatomically. */
const _v1095BodyZonesV10110=v1095BodyZones;
v1095BodyZones=function(mode='overall',view='front'){
  const rows=_v1095BodyZonesV10110(mode,view);
  if(view!=='back') return rows;
  const legs=v1095LegsScore(), core=v1095CapabilityScore('core'), mHips=v1095MobilityScore('hips');
  const score=mode==='strength'?v1095Avg(legs,core):
    mode==='mobility'?v1095Avg(mHips):
    v1095Avg(legs,core,mHips);
  const glutes={id:'glutes',score,label:'Fessiers',desc:mode==='mobility'?'Mobilité de hanche et contrôle du bassin.':'Extension de hanche, stabilité du bassin et force du bas du corps.',action:mode==='mobility'?'flexibility':'skills',tone:v1095BodyTone(score)};
  const idx=rows.findIndex(x=>x.id==='hamstrings');
  if(!rows.some(x=>x.id==='glutes')) rows.splice(idx<0?rows.length:idx,0,glutes);
  return rows;
};

const _v10103ExpectedInputsV10110=v10103ExpectedInputs;
v10103ExpectedInputs=function(id,mode='overall'){
  if(id==='glutes'){
    let rows=[
      {kind:'cap',key:'legs',label:'Jambes'},
      {kind:'cap',key:'core',label:'Core'},
      {kind:'mob',key:'hips',label:'Mobilité hanches'}
    ];
    if(mode==='strength')rows=rows.filter(x=>x.kind==='cap');
    if(mode==='mobility')rows=rows.filter(x=>x.kind==='mob');
    return rows;
  }
  return _v10103ExpectedInputsV10110(id,mode);
};

const _v10109ZoneIdsV10110=v10109ZoneIds;
v10109ZoneIds=function(view='front'){
  const ids=_v10109ZoneIdsV10110(view).slice();
  if(view==='back'&&!ids.includes('glutes')){
    const i=ids.indexOf('hamstrings');
    ids.splice(i<0?ids.length:i,0,'glutes');
  }
  return ids;
};

/* Inject a real selectable glute overlay into the current premium SVG back view. */
const _v1095BodyMapSVGV10110=v1095BodyMapSVG;
v1095BodyMapSVG=function(view='front',mode='overall',selectedId=''){
  let svg=_v1095BodyMapSVGV10110(view,mode,selectedId);
  if(view!=='back')return svg;
  const zone=v10103ZoneData('glutes',mode);
  if(!zone)return svg;
  const cls=`bodymap-zone v7-zone ${v10103ZoneVisual(zone)}${selectedId==='glutes'?' selected':''}`;
  const group=`<g class="${cls}" data-body-zone="glutes" role="button" tabindex="0" aria-label="Fessiers ${zone.score!=null?zone.score+' sur 100':zone.status.label}">
    <path d="M157 414 C171 404 190 407 207 423 L205 472 C190 484 171 483 156 467 Z"/>
    <path d="M263 414 C249 404 230 407 213 423 L215 472 C230 484 249 483 264 467 Z"/>
  </g>`;
  const marker=/<g class="bodymap-zone v7-zone [^"]*" data-body-zone="hamstrings"/;
  return marker.test(svg)?svg.replace(marker,group+'$&'):svg;
};

/* Restrictions / readiness: hips were missing even though the app trains them heavily. */
if(!RESTRICTION_AREAS.some(([id])=>id==='hips')){
  const kneeIndex=RESTRICTION_AREAS.findIndex(([id])=>id==='knees');
  RESTRICTION_AREAS.splice(kneeIndex<0?RESTRICTION_AREAS.length:kneeIndex,0,['hips','Hanches']);
}
const _exerciseStressAreasV10110=exerciseStressAreas;
exerciseStressAreas=function(name){
  const out=_exerciseStressAreasV10110(name),n=String(name).toLowerCase();
  const add=x=>{if(!out.includes(x))out.push(x);};
  if(/squat|fente|lunge|bulgarian|pistol|shrimp|deadlift|rdl|good morning|nordic|hamstring|90\/90|frog|couch stretch|side plank|human flag/.test(n))add('hips');
  return out;
};

/* Measurements: circumference is useful, but it measures the whole arm, not biceps alone. */
const armLeftField=BODY_FIELDS.find(x=>x.key==='armLeft');
const armRightField=BODY_FIELDS.find(x=>x.key==='armRight');
if(armLeftField)armLeftField.label='Bras gauche (biceps + triceps)';
if(armRightField)armRightField.label='Bras droit (biceps + triceps)';
if(BODY_SYMMETRY[0]?.[0]==='Bras')BODY_SYMMETRY[0][0]='Bras (biceps + triceps)';

/* Lightweight developer audit to prevent future taxonomy drift. */
function v10110BodyTaxonomyAudit(){
  const strength=KINETIK_BODY_TAXONOMY.strength.map(x=>({
    zone:x.label,
    volume:x.volume?VOLUME_GROUPS.includes(x.volume):true,
    bodyMap:['chest','back','traps','shoulders','biceps','triceps','forearms','core','glutes','quads','hamstrings','calves'].includes(x.id),
    library:x.volume==='Grip'
      ?EXERCISE_LIBRARY.some(e=>e.muscles?.includes('Grip'))
      :EXERCISE_LIBRARY.some(e=>e.muscles?.includes(x.volume))
  }));
  const mobility=KINETIK_BODY_TAXONOMY.mobility.map(x=>({
    zone:x.label,
    flex:FLEX_ZONES.includes(x.flex),
    tested:['wrists','shoulders','thorax','hips','hamstrings','ankles'].includes(x.id)
  }));
  return {
    strength,mobility,
    restrictionAreas:RESTRICTION_AREAS.map(([id,label])=>({id,label})),
    notes:[
      'Fléchisseurs de hanche et adducteurs sont gérés comme sous-zones de mobilité, sans faux score de force.',
      'Avant-bras est anatomique; Grip reste la métrique fonctionnelle historique.',
      'Épaules restent bilatérales en force: les séparer gauche/droite sans données unilatérales créerait une fausse précision.'
    ]
  };
}
if(typeof window!=='undefined')window.__KINETIK_BODY_AUDIT__=v10110BodyTaxonomyAudit();

/* Refresh once so all late-patch taxonomy changes are visible immediately. */
try{render();}catch(e){console.warn('KINETIK body taxonomy refresh',e);}


/* ========================================================================== */
/* V10.111 · Body System Consistency                                           */
/* Vérification transversale : Body Map, volume, mobilité, bibliothèque,       */
/* évaluations, mesures et readiness.                                          */
/* ========================================================================== */

const KINETIK_BODY_ZONE_SOURCES = Object.freeze({
  chest:{
    label:'Pectoraux',kind:'derived',
    capabilities:['push'],mobility:['thorax'],
    tests:['Dips stricts','Pompes / poussée'],
    volume:'Pectoraux',measurement:'chest'
  },
  back:{
    label:'Dos / dorsaux',kind:'derived',
    capabilities:['pull','explosive'],mobility:['thorax'],
    tests:['Tractions strictes','Chest-to-bar'],
    volume:'Dos'
  },
  traps:{
    label:'Trapèzes',kind:'derived',
    capabilities:['pull','explosive'],mobility:['thorax','shoulders'],
    tests:['Scapular pull-ups','Face pulls','Tirage'],
    volume:'Trapèzes'
  },
  shoulders:{
    label:'Épaules',kind:'derived-bilateral',
    capabilities:['push','balance'],mobility:['shoulders'],
    tests:['Poussée verticale','Handstand','Mobilité épaules G/D'],
    volume:'Épaules',measurement:'shoulders',restriction:'shoulders'
  },
  biceps:{
    label:'Biceps',kind:'derived',
    capabilities:['pull','grip'],
    tests:['Tractions / chin-ups','Curl biceps'],
    volume:'Biceps',measurement:'arm'
  },
  triceps:{
    label:'Triceps',kind:'derived',
    capabilities:['push','balance'],
    tests:['Dips','Pike / HSPU','Extension triceps'],
    volume:'Triceps',measurement:'arm'
  },
  forearms:{
    label:'Avant-bras / grip',kind:'mixed',
    capabilities:['grip'],tests:['Dead hang','Towel hang'],
    volume:'Grip',measurement:'forearm',restriction:'wrists'
  },
  core:{
    label:'Core / abdos / lombaires',kind:'derived',
    capabilities:['core','balance'],mobility:['thorax','hips'],
    tests:['L-sit','Hollow hold','Gainage'],
    volume:'Core',restriction:'back'
  },
  hips:{
    label:'Hanches',kind:'mixed',
    capabilities:['legs','core'],mobility:['hips'],
    tests:['Mobilité hanches','Squat / jambes'],
    restriction:'hips'
  },
  glutes:{
    label:'Fessiers',kind:'derived',
    capabilities:['legs','core'],mobility:['hips'],
    tests:['Pistol / split squat','Contrôle du bassin'],
    volume:'Fessiers'
  },
  quads:{
    label:'Quadriceps',kind:'derived',
    capabilities:['legs'],mobility:['hips'],
    tests:['Pistol / split squat'],
    volume:'Quadriceps',measurement:'thigh',restriction:'knees'
  },
  hamstrings:{
    label:'Ischios',kind:'mixed',
    capabilities:['legs'],mobility:['posterior'],
    tests:['Chaîne postérieure','Jambes'],
    volume:'Ischios',measurement:'thigh'
  },
  calves:{
    label:'Mollets',kind:'derived',
    capabilities:['legs'],mobility:['ankles'],
    tests:['Contrôle du bas de jambe'],
    volume:'Mollets',measurement:'calf',restriction:'ankles'
  },
  ankles:{
    label:'Chevilles',kind:'direct-mobility',
    mobility:['ankles'],tests:['Knee-to-wall G/D'],
    restriction:'ankles'
  },
  wrists:{
    label:'Poignets',kind:'direct-mobility',
    capabilities:['grip','balance'],mobility:['wrists'],
    tests:['Mobilité poignets'],restriction:'wrists'
  },
  thorax:{
    label:'Thorax',kind:'direct-mobility',
    mobility:['thorax'],tests:['Rotation thoracique']
  },
  hipFlexors:{
    label:'Fléchisseurs de hanche',kind:'mobility-only',
    mobility:['Fléchisseurs hanche']
  },
  adductors:{
    label:'Adducteurs',kind:'mobility-only',
    mobility:['Adducteurs']
  }
});

/* Anatomical wording in user-facing volume pages; internal storage keys stay stable. */
v10110VolumeLabel=function(group){
  const labels={
    Grip:'Avant-bras / Grip',
    Core:'Core / Abdos / Lombaires',
    Dos:'Dos / Dorsaux'
  };
  return labels[group]||group;
};

function v10111ZoneSourceMeta(id){
  return KINETIK_BODY_ZONE_SOURCES[id]||null;
}
function v10111ZoneScoreLabel(zone){
  const meta=v10111ZoneSourceMeta(zone?.id);
  if(!zone || zone.score==null)return 'Niveau';
  if(meta?.kind==='direct-mobility')return 'Mesure';
  if(meta?.kind==='mobility-only')return 'Mobilité';
  return 'Estimation';
}
function v10111ZoneMethodText(zone){
  const meta=v10111ZoneSourceMeta(zone?.id);
  if(!meta)return '';
  if(meta.kind==='derived-bilateral'){
    return 'Score dérivé de performances bilatérales. KINETIK ne sépare pas gauche/droite en force sans mesure unilatérale fiable.';
  }
  if(meta.kind==='derived'){
    return 'Score dérivé de plusieurs performances : il ne s’agit pas d’un test isolé du muscle.';
  }
  if(meta.kind==='mixed'){
    return 'Lecture combinant performances et données fonctionnelles disponibles.';
  }
  if(meta.kind==='direct-mobility'){
    return 'Cette zone peut s’appuyer sur un protocole de mobilité directement mesuré.';
  }
  if(meta.kind==='mobility-only'){
    return 'Zone suivie dans Mobilité ; aucun faux score de force n’est créé.';
  }
  return '';
}

/* Final zone card: state explicitly when a muscle score is derived. */
v1095ZoneDetailCard=function(mode='overall',view='front'){
  const base=v1095SelectedBodyZone(mode,view), zone=base?v10103ZoneData(base.id,mode):null;
  if(!zone)return '';
  const cta=v10103ZoneCta(zone);
  const provisional=zone.confidence.id!=='high'&&zone.score!=null;
  const method=v10111ZoneMethodText(zone);
  const levelLabel=provisional?'Provisoire':v10111ZoneScoreLabel(zone);
  return `<article class="body-zone-detail card body-zone-detail-v5 body-zone-detail-v111">
    <div class="body-zone-detail-head">
      <div><div class="kicker">Zone sélectionnée</div><h3>${esc(zone.label)}</h3></div>
      <div class="body-zone-score ${v10103ZoneVisual(zone)}"><span>${levelLabel}</span>${zone.score!=null?`${zone.score}<small>/100</small>`:'—'}</div>
    </div>
    <div class="body-zone-state-grid">
      <div><span>Statut</span><strong>${esc(zone.status.label)}</strong></div>
      <div><span>Confiance</span><strong class="confidence-${zone.confidence.id}">${esc(zone.confidence.label)}</strong></div>
    </div>
    <p class="body-zone-description">${esc(zone.desc||'')}</p>
    ${method?`<div class="body-zone-method"><span>Méthode</span><strong>${esc(method)}</strong></div>`:''}
    <div class="body-zone-sources"><span>Données disponibles</span><strong>${esc(v10103InputSummary(zone.inputs))}</strong></div>
    ${zone.missing.length?`<div class="body-zone-missing"><span>Données manquantes</span><strong>${esc(v10103MissingSummary(zone.missing))}</strong></div>`:''}
    ${zone.confidence.id==='low'?`<p class="body-zone-caution">La couleur de niveau reste volontairement neutre tant que cette zone repose sur trop peu de données fiables.</p>`:''}
    <div class="body-zone-mini-actions">
      <button class="btn btn-secondary compact" data-body-zone-cycle="prev">← Zone</button>
      <button class="btn btn-secondary compact" data-body-zone-cycle="next">Zone →</button>
      <button class="btn btn-outline compact" ${cta.attr}>${cta.label} →</button>
    </div>
  </article>`;
};

/* Cross-page audit. This is developer-facing and creates no extra UI clutter. */
function v10111BodySystemAudit(){
  const bodyMapIds=new Set([
    ...v10109ZoneIds('front'),
    ...v10109ZoneIds('back'),
    'glutes'
  ]);

  const strength=KINETIK_BODY_TAXONOMY.strength.map(row=>{
    const source=KINETIK_BODY_ZONE_SOURCES[row.id]||{};
    const volumeOk=!row.volume||VOLUME_GROUPS.includes(row.volume);
    const libraryOk=!row.volume || (row.volume==='Grip'
      ? EXERCISE_LIBRARY.some(e=>e.muscles?.includes('Grip')||e.muscles?.includes('Avant-bras'))
      : EXERCISE_LIBRARY.some(e=>e.muscles?.includes(row.volume)));
    return {
      zone:row.label,
      bodyMap:bodyMapIds.has(row.id),
      volume:volumeOk,
      library:libraryOk,
      source:source.kind||'unknown'
    };
  });

  const mobility=KINETIK_BODY_TAXONOMY.mobility.map(row=>({
    zone:row.label,
    mobilityEngine:FLEX_ZONES.includes(row.flex),
    directlyTested:['Poignets','Épaules','Thorax','Hanches','Ischios / chaîne postérieure','Chevilles'].includes(row.label),
    bodyMap:['wrists','shoulders','thorax','hips','hamstrings','ankles','chestMobility'].includes(row.id)
      ? (row.id==='chestMobility' ? bodyMapIds.has('chest') : row.id==='thorax' ? (bodyMapIds.has('chest')||bodyMapIds.has('back')) : bodyMapIds.has(row.id))
      : false
  }));

  const measureLabels=BODY_FIELDS.map(x=>x.label);
  const measurements={
    chest:measureLabels.some(x=>/poitrine/i.test(x)),
    shoulders:measureLabels.some(x=>/épaules/i.test(x)),
    arms:measureLabels.some(x=>/biceps.*triceps/i.test(x)),
    forearms:measureLabels.some(x=>/avant-bras/i.test(x)),
    thighs:measureLabels.some(x=>/cuisse/i.test(x)),
    calves:measureLabels.some(x=>/mollet/i.test(x))
  };

  const restrictionIds=new Set(RESTRICTION_AREAS.map(([id])=>id));
  const restrictions=['wrists','elbows','shoulders','back','hips','knees','ankles']
    .map(id=>({id,covered:restrictionIds.has(id)}));

  const missing=[
    ...strength.filter(x=>!x.bodyMap||!x.volume||!x.library).map(x=>`strength:${x.zone}`),
    ...mobility.filter(x=>!x.mobilityEngine).map(x=>`mobility:${x.zone}`),
    ...restrictions.filter(x=>!x.covered).map(x=>`restriction:${x.id}`)
  ];

  return {
    ok:missing.length===0,
    missing,
    strength,
    mobility,
    measurements,
    restrictions,
    principles:[
      'Biceps, triceps, trapèzes, pectoraux, dos et fessiers utilisent des scores dérivés : KINETIK ne prétend pas les isoler avec un test musculaire fictif.',
      'Épaules : mobilité gauche/droite possible, mais force conservée bilatérale tant qu’aucune évaluation unilatérale fiable n’existe.',
      'Adducteurs et fléchisseurs de hanche restent des zones Mobilité dédiées, pas des scores de force.',
      'Coudes et genoux sont des articulations de readiness/restriction, pas des muscles à scorer.'
    ]
  };
}
if(typeof window!=='undefined'){
  window.__KINETIK_BODY_SYSTEM_AUDIT__=v10111BodySystemAudit();
  if(!window.__KINETIK_BODY_SYSTEM_AUDIT__.ok){
    console.warn('KINETIK body-system consistency:',window.__KINETIK_BODY_SYSTEM_AUDIT__.missing);
  }
}

/* One final render applies the cleaned labels/card without changing navigation. */
try{render();}catch(e){console.warn('KINETIK body consistency refresh',e);}

/* ========================================================================== */
