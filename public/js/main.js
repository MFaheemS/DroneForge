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
