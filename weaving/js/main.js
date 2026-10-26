document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const header = document.querySelector('.header');
  const navLinks = [...document.querySelectorAll('.nav a')];
  const sections = [...document.querySelectorAll('.screen, .footer')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = matchMedia('(min-width: 901px)');

  const topOf = (el) => el.getBoundingClientRect().top + window.scrollY;
  const maxScroll = () => root.scrollHeight - window.innerHeight;

  /* ---------- Контент из файлов content/works.js и content/reviews.js ---------- */
  const WORKS = window.WORKS || [];
  const REVIEWS = window.REVIEWS || [];
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const isVideo = (src) => /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(src);
  const mediaHtml = (src, alt) => {
    if (!src) return '';
    if (isVideo(src)) return `<video src="${esc(src)}" muted loop playsinline preload="metadata"></video>`;
    return `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy">`;
  };

  const placeholders = ['', ' media--red', ' media--beige'];
  document.querySelector('.slider__track').innerHTML = WORKS.map((w, i) => {
    const link = w.link || '#contacts';
    const external = /^https?:/i.test(link) ? ' target="_blank" rel="noopener"' : '';
    const cls = (w.media ? '' : placeholders[i % 3]) + (w.fit === 'contain' ? ' media--contain' : '');
    return `<article class="slide">
      <div class="media${cls} slide__media">${mediaHtml(w.media, w.alt || w.title)}</div>
      <div class="slide__info">
        <h3>${esc(w.title)}</h3>
        <p>${esc(w.text)}</p>
        <a class="btn btn--light" href="${esc(link)}"${external}>${esc(w.button || 'Хочу такое')}</a>
      </div>
    </article>`;
  }).join('');

  document.querySelector('.shots__track').innerHTML = REVIEWS.map((r) => `<figure class="shot-card">
      <button class="shot" type="button" aria-label="Открыть отзыв">${r.image ? `<img src="${esc(r.image)}" alt="${esc(r.alt || 'Отзыв клиента')}" loading="lazy">` : ''}</button>
      ${r.source ? `<figcaption>${esc(r.source)}</figcaption>` : ''}
    </figure>`).join('');

  // Видео в слайдере играет, только пока карточка видна на экране
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.play().catch(() => {});
      else e.target.pause();
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.slide video').forEach((v) => videoObserver.observe(v));

  /* ---------- Навигация по экранам справа: стрелки и метки ---------- */
  const titles = { hero: 'Главная', tech: 'Технология', works: 'Работы', about: 'Обо мне', faq: 'FAQ', reviews: 'Отзывы', contacts: 'Контакты' };
  const chevron = '<svg viewBox="0 0 12 8" aria-hidden="true"><path d="M1 7l5-5 5 5"/></svg>';
  const dotsBox = document.querySelector('.dots');
  dotsBox.innerHTML =
    `<button class="dots__btn dots__btn--up" type="button" aria-label="Предыдущий раздел">${chevron}</button>` +
    sections.map((s, i) => {
      const name = titles[s.id] || s.id;
      return `<a href="#${s.id}" aria-label="${name}"><span class="dots__label"><b>${String(i + 1).padStart(2, '0')}</b>${name}</span><span class="dots__mark"></span></a>`;
    }).join('') +
    `<button class="dots__btn dots__btn--down" type="button" aria-label="Следующий раздел">${chevron}</button>`;
  const dots = [...dotsBox.querySelectorAll('a')];
  const upBtn = dotsBox.querySelector('.dots__btn--up');
  const downBtn = dotsBox.querySelector('.dots__btn--down');

  /* ---------- Плавное появление контента ---------- */
  const revealSelector = '.hero__panel, .tech__head, .tech__media, .step, .works__top, .slider, .about__card, ' +
    '.faq__side, .faq__list details, .reviews__top, .shots, .footer__box';
  document.querySelectorAll(revealSelector).forEach((el) => {
    el.classList.add('reveal');
    el.style.setProperty('--i', [...el.parentElement.children].indexOf(el));
  });
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => e.target.classList.toggle('in', e.isIntersecting));
  }, { rootMargin: '-20% 0px -20% 0px' });
  sections.forEach((s) => revealObserver.observe(s));

  /* ---------- Текущий раздел ---------- */
  function currentIndex(offset = 10) {
    if (window.scrollY >= maxScroll() - 2) return sections.length - 1;
    let idx = 0;
    sections.forEach((s, i) => { if (topOf(s) <= window.scrollY + offset) idx = i; });
    return idx;
  }

  let ticking = false;
  function updateActive() {
    ticking = false;
    const i = currentIndex(window.innerHeight * 0.5);
    const id = '#' + sections[i].id;
    [...navLinks, ...dots].forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === id));
    upBtn.disabled = i === 0;
    downBtn.disabled = i === sections.length - 1;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateActive); }
  }, { passive: true });
  updateActive();

  /* ---------- Посекционная прокрутка (только на десктопе) ---------- */
  let fp = false;
  let animating = false;
  let rafId = 0;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function setFp() {
    fp = desktop.matches;
    root.classList.toggle('fp', fp);
  }
  desktop.addEventListener('change', setFp);
  setFp();

  function scrollToY(target) {
    cancelAnimationFrame(rafId);
    const y = Math.max(0, Math.min(target, maxScroll()));
    const start = window.scrollY;
    const delta = y - start;
    if (!delta) { animating = false; return; }
    if (reduce) { window.scrollTo(0, y); return; }

    const dur = Math.min(1300, 750 + (Math.abs(delta) / window.innerHeight) * 150);
    const t0 = performance.now();
    animating = true;
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      window.scrollTo(0, start + delta * ease(p));
      if (p < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        setTimeout(() => { animating = false; }, 450); // пауза, чтобы инерция тачпада не пролистнула дальше
      }
    };
    rafId = requestAnimationFrame(step);
  }

  // Переход на соседний экран. false — экран выше окна, пусть сначала прокрутится обычным образом
  function move(dir) {
    const i = currentIndex();
    const s = sections[i];
    const top = topOf(s);
    if (dir > 0 && top + s.offsetHeight > window.scrollY + window.innerHeight + 2) return false;
    if (dir < 0 && window.scrollY > top + 2) return false;
    const next = i + dir;
    if (next >= 0 && next < sections.length) scrollToY(topOf(sections[next]));
    return true;
  }

  window.addEventListener('wheel', (e) => {
    if (!fp || e.ctrlKey || document.querySelector('dialog[open]')) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // горизонтальный жест — для слайдера
    const dir = Math.sign(e.deltaY);
    if (!dir) return;
    if (animating) { e.preventDefault(); return; }
    if (move(dir)) e.preventDefault();
  }, { passive: false });

  window.addEventListener('keydown', (e) => {
    if (!fp || e.altKey || e.ctrlKey || e.metaKey || document.querySelector('dialog[open]') || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    const dirs = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 };
    if (!(e.key in dirs)) return;
    if (animating) { e.preventDefault(); return; }
    if (move(dirs[e.key])) e.preventDefault();
  });

  // Якоря: шапка, точки, кнопки
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    header.classList.remove('header--open');
    if (fp) scrollToY(topOf(target));
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });

  // Стрелки вверх/вниз в капсуле навигации
  const goStep = (dir) => {
    const next = Math.max(0, Math.min(sections.length - 1, currentIndex(window.innerHeight * 0.5) + dir));
    const target = sections[next];
    if (fp) scrollToY(topOf(target));
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };
  upBtn.addEventListener('click', () => goStep(-1));
  downBtn.addEventListener('click', () => goStep(1));

  /* ---------- Бургер-меню ---------- */
  document.getElementById('burger').addEventListener('click', () => header.classList.toggle('header--open'));

  /* ---------- Слайдер работ: одна работа за раз ---------- */
  const track = document.querySelector('.slider__track');
  const slides = [...track.children];
  const counter = document.querySelector('.counter');
  const GAP = 20;
  const pad = (n) => String(n).padStart(2, '0');
  const slideIndex = () => Math.round(track.scrollLeft / (track.clientWidth + GAP));

  function updateCounter() {
    counter.textContent = `${pad(slideIndex() + 1)} / ${pad(slides.length)}`;
  }
  track.addEventListener('scroll', updateCounter, { passive: true });
  updateCounter();

  document.querySelectorAll('#works .arrow').forEach((btn) => {
    btn.addEventListener('click', () => {
      const n = (slideIndex() + Number(btn.dataset.dir) + slides.length) % slides.length; // по кругу
      track.scrollTo({ left: n * (track.clientWidth + GAP), behavior: 'smooth' });
    });
  });

  /* ---------- Отзывы: слайдер скриншотов и просмотр в увеличении ---------- */
  const shots = document.querySelector('.shots__track');
  const bar = document.querySelector('.reviews__bar span');

  function updateBar() {
    bar.style.width = (shots.clientWidth / shots.scrollWidth) * 100 + '%';
    bar.style.transform = `translateX(${(shots.scrollLeft / shots.clientWidth) * 100}%)`;
  }
  shots.addEventListener('scroll', updateBar, { passive: true });
  window.addEventListener('resize', updateBar);
  updateBar();

  document.querySelectorAll('#reviews .arrow').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dir = Number(btn.dataset.dir);
      if (!shots.firstElementChild) return;
      const step = shots.firstElementChild.offsetWidth + 24;
      const atEnd = shots.scrollLeft + shots.clientWidth >= shots.scrollWidth - 2;
      if (dir > 0 && atEnd) shots.scrollTo({ left: 0, behavior: 'smooth' });
      else if (dir < 0 && shots.scrollLeft <= 2) shots.scrollTo({ left: shots.scrollWidth, behavior: 'smooth' });
      else shots.scrollBy({ left: dir * step, behavior: 'smooth' });
    });
  });

  const box = document.querySelector('.lightbox');
  const boxImg = box.querySelector('img');
  shots.addEventListener('click', (e) => {
    const shot = e.target.closest('.shot');
    const img = shot && shot.querySelector('img');
    if (!img) return; // пока вместо скриншота заглушка
    boxImg.src = img.currentSrc || img.src;
    boxImg.alt = img.alt;
    box.showModal();
  });
  box.addEventListener('click', (e) => { if (e.target !== boxImg) box.close(); });
});
