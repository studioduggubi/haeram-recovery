/* Mobile in-app browser toolbars can resize the webview itself. Keep this chapter's initial pixel height. */
'use strict';
(()=>{
 const hero=document.querySelector('.hero');
 if(!hero)return;
 const mobile=matchMedia('(max-width:800px)');
 let fixedWidth=0,interacted=false;
 const copy=hero.querySelector('.hero-copy');
 function freeze(){
  if(!mobile.matches){hero.style.removeProperty('--hero-fixed-height');hero.style.removeProperty('--hero-copy-fixed');fixedWidth=0;return;}
  const viewport=Math.min(window.innerHeight,window.visualViewport?.height||window.innerHeight);
  const header=document.querySelector('.site-header').getBoundingClientRect().height;
  const dock=document.querySelector('.mobile-contact-bar').getBoundingClientRect().height;
  hero.style.setProperty('--hero-fixed-height',Math.max(240,Math.round(viewport-header-dock))+'px');
  hero.style.removeProperty('--hero-copy-fixed');
  hero.style.setProperty('--hero-copy-fixed',Math.ceil(copy.getBoundingClientRect().height)+'px');
  fixedWidth=window.innerWidth;
 }
 freeze();
 window.addEventListener('resize',()=>{if(!mobile.matches||Math.abs(innerWidth-fixedWidth)>1)freeze();},{passive:true});
 window.addEventListener('orientationchange',()=>setTimeout(freeze,200),{passive:true});
 mobile.addEventListener('change',freeze);
 ['pointerdown','touchstart','wheel'].forEach(type=>window.addEventListener(type,()=>{interacted=true;},{once:true,passive:true}));
 document.fonts.ready.then(()=>{if(mobile.matches&&!interacted&&scrollY<4){hero.style.removeProperty('--hero-copy-fixed');hero.style.setProperty('--hero-copy-fixed',Math.ceil(copy.getBoundingClientRect().height)+'px');}});
})();
