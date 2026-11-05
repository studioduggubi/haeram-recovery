"use strict";
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hero = document.querySelector('.hero');
  const heroVisual = document.querySelector('.hero-visual');
  const photographs = [...document.querySelectorAll('.about-portrait>img, .office-photo-frame>img, .visit-photo>img, .solution-art>img')];
  photographs.forEach(image => image.classList.add('depth-photo'));
  let frame = 0;
  const paintDepth = () => {
    frame = 0;
    if (reduced.matches) return;
    const height = window.innerHeight;
    if (hero && heroVisual) {
      const rect = hero.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < height) {
        const progress = Math.max(0, Math.min(300, 64 - rect.top));
        heroVisual.style.setProperty('--backdrop-shift', (progress * .08).toFixed(2) + 'px');
        heroVisual.style.setProperty('--portrait-shift', (progress * .018).toFixed(2) + 'px');
      }
    }
    photographs.forEach(image => {
      const rect = image.parentElement.getBoundingClientRect();
      if (rect.bottom < -50 || rect.top > height + 50) return;
      const progress = Math.max(-1, Math.min(1, (height / 2 - rect.top - rect.height / 2) / height));
      image.style.setProperty('--depth-shift', (progress * 16).toFixed(2) + 'px');
    });
  };
  const requestPaint = () => { if (!frame && !reduced.matches) frame = requestAnimationFrame(paintDepth); };
  window.addEventListener('scroll', requestPaint, {passive:true});
  window.addEventListener('resize', requestPaint, {passive:true});
  window.addEventListener('load', requestPaint, {once:true});
  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      heroVisual?.style.removeProperty('--backdrop-shift');
      heroVisual?.style.removeProperty('--portrait-shift');
      photographs.forEach(image => image.style.removeProperty('--depth-shift'));
    } else requestPaint();
  });
  // A disclosure changes content height, never the reader's viewport.
  // Suspend snapping before layout changes; restore only on deliberate scrolling.
  const root = document.documentElement;
  const disclosureSelector = '.solution-details,.faq-list details,.memo-details,.cost-disclosure,.intake-widget details';
  document.addEventListener('click', event => {
    const summary = event.target.closest('summary');
    const details = summary?.parentElement;
    if (!details?.matches(disclosureSelector)) return;
    event.preventDefault();
    const x = window.scrollX, y = window.scrollY;
    root.classList.add('disclosure-active');
    details.open = !details.open;
    window.scrollTo({left:x, top:y, behavior:'instant'});
    requestAnimationFrame(() => {
      window.scrollTo({left:x, top:y, behavior:'instant'});
      requestPaint();
    });
  });
  const resumeSnap = () => {
    if (!document.querySelector(disclosureSelector.split(',').map(s => s + '[open]').join(','))) root.classList.remove('disclosure-active');
  };
  window.addEventListener('wheel', resumeSnap, {passive:true});
  window.addEventListener('touchmove', resumeSnap, {passive:true});
  document.addEventListener('keydown', event => {
    if (['ArrowDown','ArrowUp','PageDown','PageUp','Home','End'].includes(event.key)) resumeSnap();
  });
  const questions = document.getElementById('question-content');
  if (questions) new MutationObserver(() => {
    document.getElementById('start').classList.toggle('has-result', !!questions.querySelector('.question-result'));
  }).observe(questions, {childList:true});
  requestPaint();
})();
