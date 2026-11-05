'use strict';
(() => {
  const figure = document.querySelector('.office-slideshow');
  const track = document.getElementById('office-carousel');
  if (!figure || !track) return;
  const slides = [...track.children];
  const dots = [...figure.querySelectorAll('.office-dot')];
  const total = slides.length;
  if (total < 2) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clone = slide => {
    const item = slide.cloneNode(true);
    item.setAttribute('aria-hidden', 'true');
    item.dataset.clone = 'true';
    item.querySelector('img').alt = '';
    return item;
  };
  track.prepend(clone(slides[total - 1]));
  track.append(clone(slides[0]));
  let index = 0, interval = 0, settling = 0, pausedUntil = 0, visible = false;
  let dragging = false, dragX = 0, dragLeft = 0, width = track.clientWidth;
  const hold = () => { pausedUntil = Date.now() + 5000; };
  const jump = slot => {
    track.style.scrollSnapType = 'none';
    track.style.scrollBehavior = 'auto';
    track.scrollLeft = slot * track.clientWidth;
    requestAnimationFrame(() => {
      if (dragging) return;
      track.style.removeProperty('scrollSnapType');
      track.style.removeProperty('scrollBehavior');
    });
  };
  const updateDots = () => dots.forEach((dot, i) => {
    if (i === index) dot.setAttribute('aria-current', 'true');
    else dot.removeAttribute('aria-current');
  });
  const settle = () => {
    if (dragging || !track.clientWidth) return;
    let slot = Math.round(track.scrollLeft / track.clientWidth);
    if (slot <= 0) { slot = total; jump(slot); }
    else if (slot >= total + 1) { slot = 1; jump(slot); }
    index = slot - 1;
    updateDots();
  };
  const move = slot => track.scrollTo({left:slot * track.clientWidth, behavior:reduced.matches ? 'auto' : 'smooth'});
  const tick = () => {
    if (!visible || document.hidden || reduced.matches || dragging || Date.now() < pausedUntil || figure.querySelector(':focus-visible')) return;
    move(Math.round(track.scrollLeft / track.clientWidth) + 1);
  };
  const updateAutoplay = () => {
    clearInterval(interval); interval = 0;
    if (visible && !document.hidden && !reduced.matches) interval = setInterval(tick, 2000);
  };
  track.addEventListener('scroll', () => {
    clearTimeout(settling);
    settling = setTimeout(settle, 130);
  }, {passive:true});
  track.addEventListener('scrollend', settle);
  track.addEventListener('pointerdown', event => {
    hold();
    if (event.pointerType !== 'mouse' || event.button !== 0) return;
    dragging = true; dragX = event.clientX; dragLeft = track.scrollLeft;
    track.classList.add('is-dragging');
    track.style.scrollSnapType = 'none'; track.style.scrollBehavior = 'auto';
    track.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  track.addEventListener('pointermove', event => {
    if (!dragging) return;
    track.scrollLeft = dragLeft - (event.clientX - dragX);
  });
  const finishDrag = event => {
    hold();
    if (!dragging) return;
    dragging = false; track.classList.remove('is-dragging');
    if (track.hasPointerCapture(event.pointerId)) track.releasePointerCapture(event.pointerId);
    track.style.removeProperty('scrollSnapType'); track.style.removeProperty('scrollBehavior');
    move(Math.round(track.scrollLeft / track.clientWidth));
  };
  track.addEventListener('pointerup', finishDrag);
  track.addEventListener('pointercancel', finishDrag);
  track.addEventListener('lostpointercapture', finishDrag);
  track.addEventListener('wheel', hold, {passive:true});
  track.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault(); hold();
    move(Math.round(track.scrollLeft / track.clientWidth) + (event.key === 'ArrowRight' ? 1 : -1));
  });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { hold(); move(i + 1); }));
  new ResizeObserver(() => {
    if (width === track.clientWidth) return;
    width = track.clientWidth; jump(index + 1);
  }).observe(track);
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting && entries[0].intersectionRatio >= .25;
    updateAutoplay();
  }, {threshold:.25}).observe(figure);
  document.addEventListener('visibilitychange', updateAutoplay);
  reduced.addEventListener('change', updateAutoplay);
  window.addEventListener('pagehide', () => { clearInterval(interval); clearTimeout(settling); });
  window.addEventListener('pageshow', updateAutoplay);
  jump(1); updateDots();
})();
