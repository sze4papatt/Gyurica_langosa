
(() => {
  document.getElementById('year').textContent = new Date().getFullYear();

  // Kínálat csempék: data-bg -> CSS háttérkép
  document.querySelectorAll('.menu-item--bg').forEach(el => {
    const url = el.getAttribute('data-bg');
    if (url) el.style.setProperty('--menu-bg', `url("${url}")`);
  });
  // Kínálat csempék – finom parallax scroll (ha nincs reduced motion)
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const menuTiles = Array.from(document.querySelectorAll('.menu-item--bg'));
  if (!prefersReduced && menuTiles.length) {
    let ticking = false;
    const updateMenuParallax = () => {
      ticking = false;
      const vh = window.innerHeight || 800;
      for (const el of menuTiles) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        const center = r.top + r.height / 2;
        const t = (center - vh / 2) / (vh / 2); // -1..1
        const offset = Math.max(-18, Math.min(18, -t * 18)); // px
        el.style.setProperty('--bgY', `${offset}px`);
      }
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateMenuParallax);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    updateMenuParallax();
  }



  const nav = document.querySelector('.nav');
  const burger = document.querySelector('.nav__burger');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  const track = document.querySelector('.slider__track');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const prev = document.querySelector('.slider__btn--prev');
  const next = document.querySelector('.slider__btn--next');
  const dots = Array.from(document.querySelectorAll('.dot'));
  let index = 0;

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const update = () => {
    if (!track) return;
    index = clamp(index, 0, slides.length - 1);
    track.style.transform = `translateX(${-index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
  };

  prev?.addEventListener('click', () => { index--; update(); });
  next?.addEventListener('click', () => { index++; update(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { index = i; update(); }));

  const viewport = document.querySelector('.slider__viewport');
  let startX = 0;
  let isDown = false;

  viewport?.addEventListener('pointerdown', (e) => {
    isDown = true;
    startX = e.clientX;
    viewport.setPointerCapture?.(e.pointerId);
  });
  viewport?.addEventListener('pointerup', (e) => {
    if (!isDown) return;
    isDown = false;
    const dx = e.clientX - startX;
    const threshold = 40;
    if (dx > threshold) index--;
    if (dx < -threshold) index++;
    update();
  });
  viewport?.addEventListener('pointercancel', () => { isDown = false; });

  update();

  fetch('assets/daily.json')
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      if (!data) return;
      const hours = document.getElementById('hours');
      const featuredDesc = document.getElementById('featuredDesc');
      const priceNote = document.getElementById('priceNote');
      if (hours && data.hours) hours.textContent = data.hours;
      if (featuredDesc && data.featured) {
        featuredDesc.innerHTML = `<strong>${data.featured.name}</strong> – ${data.featured.desc} <span class="muted">(${data.featured.price})</span>`;
      }
      if (priceNote && data.note) priceNote.textContent = data.note;
    })
    .catch(() => {});
})();
