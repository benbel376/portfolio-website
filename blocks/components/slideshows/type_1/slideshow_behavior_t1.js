export function handleSlideshowNavigation(elementId, state) {
  const el = typeof elementId === 'string' ? document.getElementById(elementId) : elementId;
  if (!el) return false;
  switch (state) {
    case 'visible':
      if (el.style.display === 'none') el.style.display = '';
      el.classList.add('nav-visible');
      el.classList.remove('nav-hidden');
      break;
    case 'hidden':
      el.classList.add('nav-hidden');
      el.classList.remove('nav-visible');
      el.style.display = 'none';
      break;
    default: break;
  }
  return true;
}

export function initSlideshow(elementOrId) {
  const root = typeof elementOrId === 'string' ? document.getElementById(elementOrId) : elementOrId;
  if (!root) return;
  const slides = Array.from(root.querySelectorAll('.slideshow__slide'));
  const dotsWrap = root.querySelector('.slideshow__dots');
  let idx = 0;

  function render(active) {
    slides.forEach((s, i) => s.classList.toggle('is-active', i === active));
    if (dotsWrap) dotsWrap.querySelectorAll('.slideshow__dot').forEach((d, i) => d.classList.toggle('is-active', i === active));
  }

  // Build dots once
  if (dotsWrap && dotsWrap.childElementCount === 0) {
    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'slideshow__dot' + (i === 0 ? ' is-active' : '');
      b.setAttribute('role', 'tab');
      b.addEventListener('click', () => { idx = i; render(idx); });
      dotsWrap.appendChild(b);
    });
  }

  root.querySelector('[data-slide-prev]')?.addEventListener('click', () => { idx = (idx - 1 + slides.length) % slides.length; render(idx); });
  root.querySelector('[data-slide-next]')?.addEventListener('click', () => { idx = (idx + 1) % slides.length; render(idx); });

  render(idx);
}

if (typeof window !== 'undefined') {
  window.handleSlideshowNavigation = handleSlideshowNavigation;
  window.initSlideshow = initSlideshow;
  window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-init-hook="initSlideshow"]').forEach(el => { try { initSlideshow(el); } catch(e){} });
  });
}


