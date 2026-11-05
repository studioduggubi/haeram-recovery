
'use strict';
(()=>{
 const root=document.getElementById('intake-screen');
 if (!root) return;
 const config=JSON.parse(document.getElementById('intake-config').textContent);
 let startedAt=Date.now();
 let requestId=crypto.randomUUID();
 let submitting=false;
 const data={concern:'',income:'',debt:'',name:'',phone:'',time:''};
 const concerns=['매달 갚을 돈이 부담돼요','독촉·압류가 걱정돼요','법원 문서·기한이 있어요','회생·파산부터 알아보고 싶어요'];
 const incomes=['정기적인 소득이 있어요','수입이 일정하지 않아요','현재 소득이 거의 없어요'];
 const debts=['3천만원 미만','3천만~1억원 미만','1억원 이상','잘 모르겠어요'];
 const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let step=1;
 function heading(text,desc){return '<h3 tabindex="-1">'+text+'</h3><p class="desc">'+desc+'</p>';}
 function render(focus=false){
  if(focus)document.documentElement.classList.add('disclosure-active');
  document.getElementById('start').dataset.intakeStep=String(step);
  document.getElementById('intake-step').textContent=step<=3?step+' / 3':'요청 완료';document.getElementById('intake-progress').style.width=Math.min(step,3)/3*100+'%';
  if(step===1){
   root.innerHTML=heading('무엇이 가장 걱정되세요?','가장 먼저 이야기하고 싶은 한 가지만 골라주세요.')+'<div class="choices">'+concerns.map((v,i)=>'<button class="choice" type="button" data-concern="'+i+'" aria-pressed="'+(data.concern===v)+'">'+v+'</button>').join('')+'</div><p class="reassure"><span aria-hidden="true">✓</span>연락처는 마지막에 남겨요. 상담 요청을 누르기 전에는 사무실로 전달하지 않아요.</p>';
   root.querySelectorAll('[data-concern]').forEach(e=>e.addEventListener('click',()=>{data.concern=concerns[Number(e.dataset.concern)];step=2;render(true);}));
  }else if(step===2){
   const choices=(key,options)=>'<div class="chips">'+options.map((v,i)=>'<button class="choice" type="button" data-field="'+key+'" data-index="'+i+'" aria-pressed="'+(data[key]===v)+'">'+v+'</button>').join('')+'</div>';
   root.innerHTML=heading('소득과 채무, 두 가지만요.','정확한 금액이나 서류는 지금 필요 없어요.')+'<fieldset><legend>현재 소득은 어떤가요?</legend>'+choices('income',incomes)+'</fieldset><fieldset><legend>채무는 대략 어느 정도인가요?</legend>'+choices('debt',debts)+'</fieldset><p class="tiny">이 답변만으로 회생·파산 가능 여부를 판단하지 않습니다.</p><div class="actions"><button class="back" data-back type="button">← 이전</button><button class="primary" id="next" type="button" '+(!data.income||!data.debt?'disabled':'')+'>연락받을 번호 남기기 →</button></div>';
   root.querySelectorAll('[data-field]').forEach(e=>e.addEventListener('click',()=>{const k=e.dataset.field;data[k]=(k==='income'?incomes:debts)[Number(e.dataset.index)];root.querySelectorAll('[data-field="'+k+'"]').forEach(c=>c.setAttribute('aria-pressed',String(c===e)));document.getElementById('next').disabled=!data.income||!data.debt;}));
   document.getElementById('next').addEventListener('click',()=>{step=3;render(true);});
  }else if(step===3){
   root.innerHTML=heading('어느 번호로 연락드릴까요?','해람법무사에서 상담 연락을 드리기 위한 번호예요.')+'<details class="summary intake-review"><summary>선택한 답변 확인</summary><p>'+esc(data.concern)+' · '+esc(data.income)+' · '+esc(data.debt)+'</p></details><form id="lead-form" novalidate><div class="intake-honeypot" aria-hidden="true"><label>회사 홈페이지<input name="website" tabindex="-1" autocomplete="off"></label></div><div class="form-field"><label class="field" for="customer-phone">연락 가능한 전화번호 <small>필수</small></label><input class="text-input phone" id="customer-phone" name="phone" type="tel" inputmode="tel" autocomplete="off" required maxlength="20" placeholder="010-0000-0000" value="'+esc(data.phone)+'" aria-describedby="phone-note form-error"><p class="tiny" id="phone-note" style="margin-top:6px">연락받으실 번호가 맞는지 한 번 확인해주세요.</p></div><details class="optional-fields"><summary>이름·연락 시간 남기기 <span class="optional">선택</span></summary><div class="form-field"><label class="field" for="customer-name">불러드릴 이름 <small>선택 · 별칭도 괜찮아요</small></label><input class="text-input" id="customer-name" name="name" autocomplete="off" maxlength="30" placeholder="예: 김해람" value="'+esc(data.name)+'"></div><div class="form-field"><label class="field" for="contact-time">연락받기 편한 시간 <small>선택</small></label><select id="contact-time" name="time"><option value="">선택하지 않아도 괜찮아요</option><option>오전이 편해요</option><option>오후가 편해요</option><option>시간을 먼저 조율하고 싶어요</option></select></div></details><label class="consent"><input id="consent" type="checkbox" required><span>상담 연락을 위한 개인정보 수집·이용 안내를 확인하고 동의합니다. <span class="optional">필수</span></span></label><details><summary>어떤 정보가 전달되나요?</summary><p>수집·이용 주체: 해람법무사 사무소. 목적: 상담 요청 확인과 전화 연락. 항목: 전화번호, 선택한 고민·소득·채무 범위, 이름·희망 시간(입력 시). 보유 기간: 접수일로부터 90일 이내. 동의를 거부할 수 있으며, 이 경우 요청서 접수가 어렵습니다. 네이버 예약이나 전화 상담도 이용할 수 있습니다.</p></details><p class="error" id="form-error" role="alert"></p><div class="actions"><button class="back" data-back type="button">← 이전</button><button class="primary" type="submit">이 내용으로 전화 상담 요청하기</button></div></form>';
   document.getElementById('contact-time').value=data.time;
   const save=()=>{data.name=document.getElementById('customer-name').value.trim();data.phone=document.getElementById('customer-phone').value.trim();data.time=document.getElementById('contact-time').value;};
   document.getElementById('lead-form').addEventListener('submit',async e=>{e.preventDefault();save();const digits=data.phone.replace(/\D/g,'');const error=document.getElementById('form-error');if(!digits){error.textContent='연락 가능한 전화번호를 입력해주세요.';document.getElementById('customer-phone').focus({preventScroll:true});return;}if(!/^0(?:1[016789]\d{7,8}|2\d{7,8}|[3-6]\d\d{7,8})$/.test(digits)){error.textContent='전화번호를 확인해주세요. 예: 010-0000-0000';document.getElementById('customer-phone').focus({preventScroll:true});return;}if(!document.getElementById('consent').checked){error.textContent='상담 연락을 위한 수집·이용 동의를 확인해주세요.';return;}data.phone=digits;
 if(submitting)return;
 if(!config.endpoint){error.textContent='전화 상담 요청은 연결 준비 중이에요. 지금은 네이버 예약이나 전화 상담을 이용해주세요.';return;}
 submitting=true;const submit=e.currentTarget.querySelector('[type=submit]');submit.disabled=true;submit.textContent='요청을 보내고 있어요…';error.textContent='';
 try{
  const payload=new URLSearchParams({request_id:requestId,concern:data.concern,income:data.income,debt_range:data.debt,name:data.name,phone:data.phone,preferred_time:data.time,consent:'true',consent_version:config.consentVersion,website:document.querySelector('[name=website]').value,started_at:String(startedAt)});
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);
  let response;try{response=await fetch(config.endpoint,{method:'POST',body:payload,redirect:'follow',signal:controller.signal});}finally{clearTimeout(timeout);}
  const result=await response.json();
  if(!response.ok||!result.ok||!result.leadId)throw new Error('not recorded');
  step=4;render(true);
 }catch{error.textContent='접수 결과를 확인하지 못했어요. 입력 내용은 그대로예요. 다시 시도하거나 네이버 예약·전화 상담을 이용해주세요.';submit.disabled=false;submit.textContent='다시 상담 요청하기';}
 finally{submitting=false;}
});
   root.querySelector('[data-back]').addEventListener('click',()=>{save();step=2;render(true);});
  }else{
   root.innerHTML='<div class="finish-symbol" aria-hidden="true">✓</div>'+heading('상담 요청을<br>잘 받았습니다.','남겨주신 전화번호로 해람법무사에서 연락드릴게요.')+'<div class="summary"><strong>'+esc(data.name||'고객')+'님의 상담 요청</strong><p>연락처: '+esc(data.phone.slice(0,3)+'-****-'+data.phone.slice(-4))+'</p><p>'+esc(data.concern)+'</p><p>'+esc(data.income)+' · '+esc(data.debt)+'</p><p>'+esc(data.time||'연락 시간 미선택')+'</p></div><p class="desc">급하게 확인할 기한이 있다면 전화로 먼저 알려주세요.</p><a class="intake-phone-link" href="tel:050714146860">0507-1414-6860 바로 전화 ↗</a><button type="button" class="primary" id="restart">다른 상담 요청 작성하기</button>';
   document.getElementById('restart').addEventListener('click',()=>{Object.keys(data).forEach(k=>data[k]='');requestId=crypto.randomUUID();startedAt=Date.now();step=1;render(true);});
  }
  if(step===2)root.querySelector('[data-back]').addEventListener('click',()=>{step=1;render(true);});
  if(step>=3){
   const summary=root.querySelector('.summary');
   summary.insertAdjacentHTML('afterend','<div class="intake-memo"><button type="button" class="memo-copy">상담 메모 복사하기 ↗</button><p>어디서 상담받으시든, 이 메모가 이야기를 꺼내는 데 도움이 되길 바라요.</p><span class="copy-feedback" role="status"></span></div>');
   root.querySelector('.memo-copy').addEventListener('click',async()=>{
    const memo=['상담 준비 메모','가장 큰 걱정: '+data.concern,'소득 상황: '+data.income,'채무 범위: '+data.debt,'','법원에서 받은 문서나 기한이 있다면 상담 때 먼저 알려주세요.','이 메모는 회생·파산 가능 여부나 법원 결과를 판단한 내용이 아닙니다.'].join('\n');
    const feedback=root.querySelector('.copy-feedback');
    try{await navigator.clipboard.writeText(memo);feedback.textContent='메모를 복사했어요. 편한 곳에 붙여넣어 두세요.';}
    catch{const field=document.createElement('textarea');field.value=memo;field.setAttribute('aria-label','상담 준비 메모');root.querySelector('.intake-memo').append(field);field.focus({preventScroll:true});field.select();feedback.textContent='아래 메모를 선택해 복사해주세요.';}
   });
  }
  root.insertAdjacentHTML('beforeend','<div class="intake-alternatives"><a href="'+config.bookingUrl.replace(/&/g,'&amp;')+'" target="_blank" rel="noopener noreferrer">네이버 예약 ↗</a><a href="tel:050714146860">바로 전화 ↗</a></div>');
 if(focus){root.querySelector('h3').focus({preventScroll:true});requestAnimationFrame(()=>{const widget=document.querySelector('.intake-widget');const header=document.querySelector('.site-header').getBoundingClientRect().height;const top=widget.getBoundingClientRect().top+scrollY-header-14;window.scrollTo({top:Math.max(0,top),behavior:'instant'});});}
 }
 document.querySelectorAll('a[href="#start"]').forEach(link=>link.addEventListener('click',event=>{
  event.preventDefault();document.documentElement.classList.add('disclosure-active');
  history.replaceState(null,'','#start');
  const target=step===1?document.getElementById('start'):document.getElementById('intake-widget');
  const header=document.querySelector('.site-header').getBoundingClientRect().height;
  window.scrollTo({top:Math.max(0,target.getBoundingClientRect().top+scrollY-header-(step===1?0:14)),behavior:'instant'});
 }));
 render();
 if(location.hash==='#start'){
  document.documentElement.classList.add('disclosure-active');
  let interacted=false;
  ['pointerdown','wheel','touchstart','keydown'].forEach(type=>document.addEventListener(type,()=>{interacted=true;},{once:true,passive:true}));
  document.fonts.ready.then(()=>{if(interacted||step!==1||location.hash!=='#start')return;const section=document.getElementById('start');const header=document.querySelector('.site-header').getBoundingClientRect().height;window.scrollTo({top:Math.max(0,section.getBoundingClientRect().top+scrollY-header),behavior:'instant'});});
 }
})();
