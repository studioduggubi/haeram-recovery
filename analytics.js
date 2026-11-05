'use strict';
(function(root,factory){
 if(typeof module==='object'&&module.exports){module.exports=factory;return;}
 if(!root.HaeramAnalytics)root.HaeramAnalytics=factory(root);
})(typeof window!=='undefined'?window:{},function createAnalytics(env,options){
 const doc=env.document;
 let config=options||{};
 if(!options&&doc){try{config=JSON.parse(doc.getElementById('analytics-config')?.textContent||'{}');}catch{}}
 const sections=new Set(['home','solutions','start','about','process','youtube','faq','contact']);
 const terms=new Set(['인천개인회생','인천개인파산','인천개인회생법무사','인천개인파산법무사','인천서구개인회생','인천개인회생상담','인천개인회생신청','인천개인회생비용','인천개인파산상담','해람법무사','김해람법무사','인천서해구개인회생']);
 const errors=new Set(['phone_required','invalid_phone','consent_required','backend_unconfirmed']);
 const placements=new Set(['header','mobile_dock','home','solutions','start','about','process','youtube','faq','contact','footer']);
 const dl=env.dataLayer=env.dataLayer||[];
 const seenSections=new Set(),seenSteps=new Set(),seenContent=new Set();
 let formStarted=false;
 let accepted=[];
 try{const stored=JSON.parse(env.sessionStorage?.getItem('haeram.analytics.accepted.v1')||'[]');if(Array.isArray(stored))accepted=stored.filter(id=>typeof id==='string'&&/^[a-f0-9-]{36}$/i.test(id)).slice(-40);}catch{}
 const acceptedIds=new Set(accepted);
 function safeUrl(raw,keepCampaign){
  try{
   const url=new URL(raw);
   if(!/^https?:$/.test(url.protocol))return '';
   const safe=new URL(url.origin+url.pathname);
   if(keepCampaign){
    for(const key of ['utm_source','utm_medium','utm_campaign','utm_id','utm_content','utm_term','utm_source_platform']){
     const value=url.searchParams.get(key);
     if(!value)continue;
     const allowed=key==='utm_term'?terms.has(value):/^[a-z][a-z0-9_-]{0,99}$/i.test(value);
     if(allowed)safe.searchParams.set(key,value);
    }
   }
   return safe.href;
  }catch{return '';}
 }
 let debug=false;try{debug=new URL(env.location.href).searchParams.get('analytics_debug')==='1';}catch{}
 function push(item){try{if(typeof dl.push!=='function')return false;dl.push(item);return true;}catch{return false;}}
 const context={
  analytics_page_location:safeUrl(env.location?.href||'',true),
  analytics_page_referrer:safeUrl(doc?.referrer||'',false),
  analytics_schema:'haeram-journey-v1',
  analytics_debug_mode:debug?true:undefined,
  analytics_allow_google_signals:false,
  analytics_allow_ad_personalization:false
 };
 push(context);
 function emit(event,params){
  // Only the fixed fields below reach the data layer. No form values or lead IDs.
  const out={event,form_id:'consultation',analytics_schema:'haeram-journey-v1'};
  if(sections.has(params?.section_id))out.section_id=params.section_id;
  if(placements.has(params?.cta_location))out.cta_location=params.cta_location;
  if(Number.isInteger(params?.step_index)&&params.step_index>=1&&params.step_index<=3)out.step_index=params.step_index;
  if(errors.has(params?.error_type))out.error_type=params.error_type;
  if(params?.content_type==='video'&&/^[A-Za-z0-9_-]{11}$/.test(params.item_id||'')){out.content_type='video';out.item_id=params.item_id;}
  if(params?.content_type==='faq'&&/^faq_\d{1,2}$/.test(params.item_id||'')){out.content_type='faq';out.item_id=params.item_id;}
  if(event==='generate_lead')out.method='phone_request';
  if(debug)out.debug_mode=true;
  return push(out);
 }
 const api=Object.freeze({
  startForm(){if(formStarted)return;formStarted=true;emit('form_start');},
  step(step){if(!Number.isInteger(step)||step<1||step>3||seenSteps.has(step))return;seenSteps.add(step);emit('form_step_view',{step_index:step});},
  validation(type){if(errors.has(type))emit('form_validation_error',{error_type:type});},
  submitError(){emit('lead_submit_error',{error_type:'backend_unconfirmed'});},
  success(id){
   // The backend-issued ID is used only locally to deduplicate successful saves.
   if(typeof id!=='string'||!id||acceptedIds.has(id))return false;
   acceptedIds.add(id);
   try{env.sessionStorage?.setItem('haeram.analytics.accepted.v1',JSON.stringify([...acceptedIds].filter(v=>/^[a-f0-9-]{36}$/i.test(v)).slice(-40)));}catch{}
   emit('generate_lead');return true;
  },
  resetForm(){formStarted=false;seenSteps.clear();},
  contentView(section){
   if(!sections.has(section)||seenSections.has(section))return;
   seenSections.add(section);emit('content_view',{section_id:section});
  }
 });
 if(doc){
  const placement=node=>{
   if(node.closest('.mobile-contact-bar'))return 'mobile_dock';
   if(node.closest('.site-header'))return 'header';
   const section=node.closest('section[id]')?.id;
   return sections.has(section)?section:'footer';
  };
  doc.addEventListener('click',event=>{
   try{
    const node=event.target?.closest?.('a,button');if(!node)return;
    if(node.matches('a[href^="tel:"]'))emit('click_to_call',{cta_location:placement(node)});
    if(node.matches('a[href]')){
     const url=new URL(node.href,env.location.href);
     if(url.hostname==='map.naver.com'&&url.pathname.includes('/entry/place/2000521595'))emit('naver_booking_click',{cta_location:placement(node)});
    }
    if(node.matches('.youtube-choice[data-video-id]')){
     const id=node.dataset.videoId,key='video_'+id;
     if(!seenContent.has(key)){seenContent.add(key);emit('select_content',{content_type:'video',item_id:id,section_id:'youtube'});}
    }
   }catch{}
  },{capture:true,passive:true});
  doc.querySelectorAll('#faq details').forEach((item,index)=>item.addEventListener('toggle',()=>{
   const id='faq_'+(index+1);
   if(item.open&&!seenContent.has(id)){seenContent.add(id);emit('select_content',{content_type:'faq',item_id:id,section_id:'faq'});}
  }));
  if(typeof env.IntersectionObserver==='function'){
   const visible=new Set(),timers=new Map();
   const stop=id=>{if(timers.has(id)){env.clearTimeout(timers.get(id));timers.delete(id);}};
   const schedule=id=>{
    stop(id);if(doc.visibilityState==='hidden')return;
    timers.set(id,env.setTimeout(()=>{
     timers.delete(id);if(!visible.has(id)||doc.visibilityState==='hidden')return;
     api.contentView(id);
     if(id==='start'){const step=Number(doc.getElementById('start')?.dataset.intakeStep);api.step(step);}
    },500));
   };
   const observer=new env.IntersectionObserver(entries=>entries.forEach(entry=>{
    const id=entry.target.id;if(entry.isIntersecting&&entry.intersectionRatio>=0.35){visible.add(id);schedule(id);}else{visible.delete(id);stop(id);}
   }),{threshold:[0,0.35]});
   doc.querySelectorAll('section.screen[id]').forEach(section=>{if(sections.has(section.id))observer.observe(section);});
   doc.addEventListener('visibilitychange',()=>{for(const id of visible){if(doc.visibilityState==='hidden')stop(id);else schedule(id);}});
  }
  // A single async GTM loader. GA4 is configured in GTM, never also via gtag.js.
  if(/^GTM-[A-Z0-9]{4,20}$/.test(config.gtmId||'')&&!doc.getElementById('haeram-gtm-loader')){
   push({'gtm.start':Date.now(),event:'gtm.js'});
   const script=doc.createElement('script');script.id='haeram-gtm-loader';script.async=true;
   script.src='https://www.googletagmanager.com/gtm.js?id='+encodeURIComponent(config.gtmId);
   doc.head.appendChild(script);
  }
 }
 return api;
});
