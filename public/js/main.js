/* ── DroneForge Main JS — Aeronautical Operations Interface ── */
'use strict';

/* ─────────────────────────────────
   HAMBURGER NAV
   ───────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    }
  });
}

/* ─────────────────────────────────
   SCROLL REVEAL
   ───────────────────────────────── */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ─────────────────────────────────
   ANIMATED COUNTERS
   ───────────────────────────────── */
function animCounter(el) {
  const target  = parseInt(el.dataset.target, 10);
  const suffix  = el.dataset.suffix || '';
  const dur     = 2000;
  const step    = target / (dur / 16);
  let   current = 0;
  const id = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current).toLocaleString() + suffix;
    if (current >= target) clearInterval(id);
  }, 16);
}

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animCounter(e.target);
      counterObs.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => counterObs.observe(el));

/* ─────────────────────────────────
   PASSWORD TOGGLE
   ───────────────────────────────── */
document.querySelectorAll('.input-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const inp = btn.previousElementSibling;
    if (!inp) return;
    const isPassword = inp.type === 'password';
    inp.type = isPassword ? 'text' : 'password';
    const icon = btn.querySelector('.material-symbols-outlined');
    if (icon) icon.textContent = isPassword ? 'visibility_off' : 'visibility';
  });
});

/* ─────────────────────────────────
   PASSWORD STRENGTH
   ───────────────────────────────── */
const pwInput     = document.getElementById('password');
const strengthBar = document.querySelector('.password-strength-bar');
if (pwInput && strengthBar) {
  pwInput.addEventListener('input', () => {
    const v = pwInput.value;
    let score = 0;
    if (v.length >= 8)           score++;
    if (/[A-Z]/.test(v))         score++;
    if (/[0-9]/.test(v))         score++;
    if (/[^A-Za-z0-9]/.test(v))  score++;
    strengthBar.className = 'password-strength-bar';
    if (v.length > 0) {
      const cls = ['strength-weak','strength-fair','strength-good','strength-strong'];
      strengthBar.classList.add(cls[score - 1] || 'strength-weak');
    }
  });
}

/* ─────────────────────────────────
   AUTO-DISMISS ALERTS
   ───────────────────────────────── */
document.querySelectorAll('.alert').forEach(a => {
  setTimeout(() => {
    a.style.transition = 'opacity .5s ease, transform .5s ease';
    a.style.opacity    = '0';
    a.style.transform  = 'translateY(-8px)';
    setTimeout(() => a.remove(), 500);
  }, 5000);
});

/* ─────────────────────────────────
   HOVER CARD GLOW
   ───────────────────────────────── */
document.querySelectorAll('.bento-item, .step-card, .card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    card.style.setProperty('--mouse-x', x + '%');
    card.style.setProperty('--mouse-y', y + '%');
  });
});

/* ─────────────────────────────────
   CUSTOM CURSOR
   ───────────────────────────────── */
(function () {
  if (window.matchMedia('(hover: none)').matches) return;
  const dot  = document.createElement('div'); dot.className  = 'cursor-dot';
  const ring = document.createElement('div'); ring.className = 'cursor-ring';
  document.body.append(dot, ring);
  let mx = -100, my = -100, rx = -100, ry = -100;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mousedown', () => { dot.classList.add('clicking'); ring.classList.add('clicking'); });
  document.addEventListener('mouseup',   () => { dot.classList.remove('clicking'); ring.classList.remove('clicking'); });
  (function loop() {
    dot.style.left  = mx + 'px'; dot.style.top  = my + 'px';
    rx += (mx - rx) * 0.15;     ry += (my - ry) * 0.15;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  })();
})();

/* ─────────────────────────────────
   PAGE TRANSITION FADE
   ───────────────────────────────── */
(function () {
  const overlay = document.createElement('div');
  overlay.className = 'page-transition';
  document.body.appendChild(overlay);
  // Fade in on load
  overlay.classList.add('fading');
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.remove('fading')));
  // Fade out on link clicks
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript') || a.target === '_blank') return;
    a.addEventListener('click', e => {
      e.preventDefault();
      overlay.classList.add('fading');
      setTimeout(() => { window.location.href = href; }, 220);
    });
  });
})();

/* ─────────────────────────────────
   3D TILT CARDS
   ───────────────────────────────── */
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width  / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `perspective(600px) rotateY(${dx * 6}deg) rotateX(${-dy * 5}deg) translateZ(4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform .4s ease';
    card.style.transform = '';
    setTimeout(() => card.style.transition = '', 400);
  });
});

/* ─────────────────────────────────
   TESTIMONIALS CAROUSEL
   ───────────────────────────────── */
(function () {
  const track  = document.getElementById('testimonialsTrack');
  const dotsEl = document.getElementById('tDots');
  const prevBtn= document.getElementById('tPrev');
  const nextBtn= document.getElementById('tNext');
  if (!track) return;

  const cards = track.querySelectorAll('.testimonial-card');
  const perView = window.innerWidth < 768 ? 1 : 3;
  const total = Math.ceil(cards.length / perView);
  let current = 0;

  // Build dots
  for (let i = 0; i < total; i++) {
    const d = document.createElement('div');
    d.className = 'tctl-dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => go(i));
    dotsEl.appendChild(d);
  }

  function go(idx) {
    current = (idx + total) % total;
    const cardWidth = cards[0].offsetWidth + 24; // gap 1.5rem = 24px
    track.style.transform = `translateX(-${current * perView * cardWidth}px)`;
    dotsEl.querySelectorAll('.tctl-dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  prevBtn?.addEventListener('click', () => go(current - 1));
  nextBtn?.addEventListener('click', () => go(current + 1));

  // Auto-advance
  let timer = setInterval(() => go(current + 1), 5000);
  track.addEventListener('mouseenter', () => clearInterval(timer));
  track.addEventListener('mouseleave', () => { timer = setInterval(() => go(current + 1), 5000); });
})();
