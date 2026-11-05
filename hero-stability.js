/* Hero geometry belongs to normal CSS flow, never to startup viewport measurements. */
'use strict';
(()=>{
 const hero=document.getElementById('home');
 if(!hero)return;
 const homeEntry=()=>!location.hash||location.hash==='#home';
 const clearLegacy=()=>{
  ['--hero-fixed-height','--hero-copy-fixed','--hero-label-bottom'].forEach(key=>hero.style.removeProperty(key));
 };
 const toTop=()=>{
  window.scrollTo({left:0,top:0,behavior:'instant'});
 };
 clearLegacy();
 if(homeEntry()){
  try{history.scrollRestoration='manual';}catch{}
 }
 window.addEventListener('pageshow',()=>{
  clearLegacy();
  if(homeEntry()){
   toTop();
   requestAnimationFrame(toTop);
  }
 });
 document.querySelectorAll('a[href="#home"]').forEach(link=>link.addEventListener('click',event=>{
  event.preventDefault();
  history.replaceState(null,'',location.pathname+location.search+'#home');
  toTop();
 }));
})();
