/* Mobile in-app browser toolbars can resize the webview itself. Keep this chapter's initial pixel height. */
'use strict';
(()=>{
 const hero=document.querySelector('.hero');
 if(!hero)return;
 const mobile=matchMedia('(max-width:800px)');
 let fixedWidth=0,interacted=false;
 const copy=hero.querySelector('.hero-copy');
 function freeze(){
  if(!mobile.matches){hero.style.removeProperty('--hero-fixed-height');hero.style.removeProperty('--hero-copy-fixed');hero.style.removeProperty('--hero-label-bottom');fixedWidth=0;return;}
  const viewport=Math.min(window.innerHeight,window.visualViewport?.height||window.innerHeight);
  const header=document.querySelector('.site-header').getBoundingClientRect().height;
  const dock=document.querySelector('.mobile-contact-bar').getBoundingClientRect().height;
  const requested=Math.round(Math.max(240,viewport-header-dock)*1.15);
  hero.style.setProperty('--hero-fixed-height',requested+'px');
  hero.style.removeProperty('--hero-copy-fixed');
  const copyHeight=Math.ceil(copy.getBoundingClientRect().height);
  const portraitWidth=hero.querySelector('.hero-portrait').getBoundingClientRect().width;
  // Preserve a head-to-waist composition even when an in-app browser starts with a very short viewport.
  const fitted=Math.max(copyHeight+Math.round(portraitWidth*1.32),Math.min(requested,copyHeight+Math.round(portraitWidth*1.62)));
  hero.style.setProperty('--hero-fixed-height',fitted+'px');
  hero.style.setProperty('--hero-label-bottom',Math.max(20,Math.round(fitted-(viewport-header-dock)+20))+'px');
  hero.style.setProperty('--hero-copy-fixed',copyHeight+'px');
  fixedWidth=window.innerWidth;
 }
 freeze();
 window.addEventListener('resize',()=>{if(!mobile.matches||Math.abs(innerWidth-fixedWidth)>1)freeze();},{passive:true});
 window.addEventListener('orientationchange',()=>setTimeout(freeze,200),{passive:true});
 mobile.addEventListener('change',freeze);
 ['pointerdown','touchstart','wheel'].forEach(type=>window.addEventListener(type,()=>{interacted=true;},{once:true,passive:true}));
 document.fonts.ready.then(()=>{if(mobile.matches&&!interacted&&scrollY<4){hero.style.removeProperty('--hero-copy-fixed');hero.style.setProperty('--hero-copy-fixed',Math.ceil(copy.getBoundingClientRect().height)+'px');}});
})();
