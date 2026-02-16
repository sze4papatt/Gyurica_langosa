
(() => {
  document.getElementById('year').textContent = new Date().getFullYear();

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
