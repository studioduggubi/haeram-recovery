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
  document.addEventListener('toggle', event => {
    if (!event.target.matches('.solution-details,.faq-list details,.memo-details')) return;
    document.documentElement.classList.toggle('reading-expanded', !!document.querySelector('.solution-details[open],.faq-list details[open],.memo-details[open]'));
    requestPaint();
  }, true);
  const questions = document.getElementById('question-content');
  if (questions) new MutationObserver(() => {
    const section = document.getElementById('start');
    const result = !!questions.querySelector('.question-result');
    section.classList.toggle('has-result', result);
    section.classList.toggle('is-answering', !result && !document.getElementById('step-count').textContent.startsWith('01'));
    if (!questions.querySelector('.memo-details[open]')) document.documentElement.classList.toggle('reading-expanded', !!document.querySelector('.solution-details[open],.faq-list details[open]')); 
  }).observe(questions, {childList:true});
  requestPaint();
})();
