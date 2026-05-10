/* ── DroneForge Catalog ── */
(function () {

  /* ─── DOM REFERENCES ─── */
  var grid         = document.getElementById('partsGrid');
  var emptyEl      = document.getElementById('partsEmpty');
  var countEl      = document.getElementById('countNum');
  var sortEl       = document.getElementById('sortSelect');
  var searchEl     = document.getElementById('searchInput');
  var searchClear  = document.getElementById('searchClear');
  var searchValid  = document.getElementById('searchValidation');
  var resetBtn     = document.getElementById('filterReset');
  var resetBtn2    = document.getElementById('clearFiltersEmpty');
  var filterBadge  = document.getElementById('filterBadge');
  var sidebar      = document.getElementById('filterSidebar');
  var mobToggle    = document.getElementById('filterToggleMobile');
  var mobApply     = document.getElementById('applyFiltersMobile');

  var pMinSlider   = document.getElementById('priceMin');
  var pMaxSlider   = document.getElementById('priceMax');
  var pMinDisp     = document.getElementById('priceMinDisplay');
  var pMaxDisp     = document.getElementById('priceMaxDisplay');
  var pMinInput    = document.getElementById('priceMinInput');
  var pMaxInput    = document.getElementById('priceMaxInput');

  var wMinSlider   = document.getElementById('weightMin');
  var wMaxSlider   = document.getElementById('weightMax');
  var wMinDisp     = document.getElementById('weightMinDisplay');
  var wMaxDisp     = document.getElementById('weightMaxDisplay');
  var wMinInput    = document.getElementById('weightMinInput');
  var wMaxInput    = document.getElementById('weightMaxInput');

  /* ─── ABSOLUTE BOUNDS (from slider attributes) ─── */
  var P_ABS_MIN = pMinSlider ? +pMinSlider.min : 0;
  var P_ABS_MAX = pMaxSlider ? +pMaxSlider.max : 99999;
  var W_ABS_MIN = wMinSlider ? +wMinSlider.min : 0;
  var W_ABS_MAX = wMaxSlider ? +wMaxSlider.max : 99999;

  /* ─── MUTABLE FILTER STATE (all safe defaults before any apply()) ─── */
  var pLo = P_ABS_MIN;
  var pHi = P_ABS_MAX;
  var wLo = W_ABS_MIN;
  var wHi = W_ABS_MAX;
  var searchTerm = '';
  var activeCat  = '';

  /* ─── CARD COLLECTION ─── */
  var allCards = Array.from(grid.querySelectorAll('.part-card'));

  /* ─── SEED STATE FROM SERVER-RENDERED VALUES ─── */
  if (pMinSlider) pLo = +pMinSlider.value;
  if (pMaxSlider) pHi = +pMaxSlider.value;
  if (wMinSlider) wLo = +wMinSlider.value;
  if (wMaxSlider) wHi = +wMaxSlider.value;

  var initCatBtn = document.querySelector('.filter-cat-btn.active');
  if (initCatBtn) activeCat = initCatBtn.dataset.cat || '';

  if (searchEl && searchEl.value) {
    searchTerm = searchEl.value.trim().toLowerCase();
    if (searchClear) searchClear.style.display = 'flex';
  }

  /* ═══════════════════════════════════════════
     CORE: apply filters + sort + DOM reorder
     Called only after all state is ready.
     ═══════════════════════════════════════════ */
  function apply() {
    var sort = sortEl ? sortEl.value : 'price-asc';

    /* 1 — decide visibility */
    allCards.forEach(function (c) {
      var name  = c.dataset.name     || '';
      var cat   = c.dataset.category || '';
      var price = parseFloat(c.dataset.price)  || 0;
      var wt    = parseFloat(c.dataset.weight) || 0;

      var ok = (!searchTerm || name.indexOf(searchTerm) !== -1)
            && (!activeCat  || cat === activeCat)
            && price >= pLo && price <= pHi
            && wt   >= wLo && wt   <= wHi;

      c.style.display = ok ? '' : 'none';
    });

    /* 2 — sort ALL cards and re-append in sorted order */
    var sorted = allCards.slice().sort(function (a, b) {
      var ap = parseFloat(a.dataset.price)  || 0;
      var bp = parseFloat(b.dataset.price)  || 0;
      var aw = parseFloat(a.dataset.weight) || 0;
      var bw = parseFloat(b.dataset.weight) || 0;
      var an = a.dataset.name || '';
      var bn = b.dataset.name || '';
      if (sort === 'price-asc')  return ap - bp;
      if (sort === 'price-desc') return bp - ap;
      if (sort === 'weight-asc') return aw - bw;
      if (sort === 'name-asc')   return an < bn ? -1 : an > bn ? 1 : 0;
      return 0;
    });

    sorted.forEach(function (c) { grid.appendChild(c); });
    grid.appendChild(emptyEl); /* keep emptyEl after cards */

    /* 3 — update count + empty state */
    var vis = 0;
    sorted.forEach(function (c) { if (c.style.display !== 'none') vis++; });
    if (countEl) countEl.textContent = vis;
    emptyEl.style.display = vis === 0 ? 'flex' : 'none';

    /* 4 — filter badge */
    var dirty = activeCat || pLo > P_ABS_MIN || pHi < P_ABS_MAX
                           || wLo > W_ABS_MIN || wHi < W_ABS_MAX;
    if (filterBadge) filterBadge.style.display = dirty ? 'flex' : 'none';
  }

  /* ─── SYNC HELPERS
     These update internal state from the DOM and refresh displays,
     then call apply().  They must NOT be called during initialisation —
     only from event handlers after the page is ready.
  ─── */
  function syncPriceFromSliders() {
    var lo = pMinSlider ? +pMinSlider.value : P_ABS_MIN;
    var hi = pMaxSlider ? +pMaxSlider.value : P_ABS_MAX;
    if (lo > hi) { lo = hi; if (pMinSlider) pMinSlider.value = lo; }
    pLo = lo; pHi = hi;
    if (pMinDisp)  pMinDisp.textContent  = lo;
    if (pMaxDisp)  pMaxDisp.textContent  = hi;
    if (pMinInput) pMinInput.value = lo;
    if (pMaxInput) pMaxInput.value = hi;
    apply();
  }

  function syncWeightFromSliders() {
    var lo = wMinSlider ? +wMinSlider.value : W_ABS_MIN;
    var hi = wMaxSlider ? +wMaxSlider.value : W_ABS_MAX;
    if (lo > hi) { lo = hi; if (wMinSlider) wMinSlider.value = lo; }
    wLo = lo; wHi = hi;
    if (wMinDisp)  wMinDisp.textContent  = lo;
    if (wMaxDisp)  wMaxDisp.textContent  = hi;
    if (wMinInput) wMinInput.value = lo;
    if (wMaxInput) wMaxInput.value = hi;
    apply();
  }

  /* ─── PRICE SLIDER EVENTS ─── */
  if (pMinSlider) {
    pMinSlider.addEventListener('input',  syncPriceFromSliders);
    pMinSlider.addEventListener('change', syncPriceFromSliders);
  }
  if (pMaxSlider) {
    pMaxSlider.addEventListener('input',  syncPriceFromSliders);
    pMaxSlider.addEventListener('change', syncPriceFromSliders);
  }

  /* ─── PRICE TEXT INPUT EVENTS ─── */
  if (pMinInput) {
    pMinInput.addEventListener('input', function () {
      var v = Math.max(P_ABS_MIN, Math.min(+this.value, pHi));
      if (pMinSlider) pMinSlider.value = v;
      syncPriceFromSliders();
    });
  }
  if (pMaxInput) {
    pMaxInput.addEventListener('input', function () {
      var v = Math.min(P_ABS_MAX, Math.max(+this.value, pLo));
      if (pMaxSlider) pMaxSlider.value = v;
      syncPriceFromSliders();
    });
  }

  /* ─── WEIGHT SLIDER EVENTS ─── */
  if (wMinSlider) {
    wMinSlider.addEventListener('input',  syncWeightFromSliders);
    wMinSlider.addEventListener('change', syncWeightFromSliders);
  }
  if (wMaxSlider) {
    wMaxSlider.addEventListener('input',  syncWeightFromSliders);
    wMaxSlider.addEventListener('change', syncWeightFromSliders);
  }

  /* ─── WEIGHT TEXT INPUT EVENTS ─── */
  if (wMinInput) {
    wMinInput.addEventListener('input', function () {
      var v = Math.max(W_ABS_MIN, Math.min(+this.value, wHi));
      if (wMinSlider) wMinSlider.value = v;
      syncWeightFromSliders();
    });
  }
  if (wMaxInput) {
    wMaxInput.addEventListener('input', function () {
      var v = Math.min(W_ABS_MAX, Math.max(+this.value, wLo));
      if (wMaxSlider) wMaxSlider.value = v;
      syncWeightFromSliders();
    });
  }

  /* ─── SEARCH ─── */
  if (searchEl) {
    searchEl.addEventListener('input', function () {
      if (this.value.length > 80) {
        if (searchValid) searchValid.textContent = 'Max 80 characters.';
        return;
      }
      if (searchValid) searchValid.textContent = '';
      searchTerm = this.value.trim().toLowerCase().replace(/<[^>]*>/g, '');
      if (searchClear) searchClear.style.display = searchTerm ? 'flex' : 'none';
      apply();
    });
  }
  if (searchClear) {
    searchClear.addEventListener('click', function () {
      if (searchEl) searchEl.value = '';
      searchTerm = '';
      searchClear.style.display = 'none';
      if (searchValid) searchValid.textContent = '';
      apply();
    });
  }

  /* ─── SORT ─── */
  if (sortEl) sortEl.addEventListener('change', apply);

  /* ─── CATEGORY ─── */
  document.querySelectorAll('.filter-cat-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-cat-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      activeCat = btn.dataset.cat || '';
      apply();
    });
  });

  /* ─── RESET ─── */
  function resetAll() {
    activeCat = '';
    document.querySelectorAll('.filter-cat-btn').forEach(function (b) { b.classList.remove('active'); });
    var allBtn = document.querySelector('.filter-cat-btn[data-cat=""]');
    if (allBtn) allBtn.classList.add('active');

    pLo = P_ABS_MIN; pHi = P_ABS_MAX;
    wLo = W_ABS_MIN; wHi = W_ABS_MAX;

    if (pMinSlider) pMinSlider.value = P_ABS_MIN;
    if (pMaxSlider) pMaxSlider.value = P_ABS_MAX;
    if (wMinSlider) wMinSlider.value = W_ABS_MIN;
    if (wMaxSlider) wMaxSlider.value = W_ABS_MAX;

    if (pMinDisp) pMinDisp.textContent = P_ABS_MIN;
    if (pMaxDisp) pMaxDisp.textContent = P_ABS_MAX;
    if (wMinDisp) wMinDisp.textContent = W_ABS_MIN;
    if (wMaxDisp) wMaxDisp.textContent = W_ABS_MAX;

    if (pMinInput) pMinInput.value = P_ABS_MIN;
    if (pMaxInput) pMaxInput.value = P_ABS_MAX;
    if (wMinInput) wMinInput.value = W_ABS_MIN;
    if (wMaxInput) wMaxInput.value = W_ABS_MAX;

    if (searchEl)    searchEl.value = '';
    if (searchClear) searchClear.style.display = 'none';
    if (searchValid) searchValid.textContent = '';
    searchTerm = '';

    apply();
  }
  if (resetBtn)  resetBtn.addEventListener('click', resetAll);
  if (resetBtn2) resetBtn2.addEventListener('click', resetAll);

  /* ─── MOBILE SIDEBAR ─── */
  if (mobToggle && sidebar) {
    mobToggle.addEventListener('click', function () {
      sidebar.classList.toggle('open');
      document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
    });
  }
  if (mobApply && sidebar) {
    mobApply.addEventListener('click', function () {
      sidebar.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  /* ─── SPEC POPUPS ─── */
  document.querySelectorAll('.btn-spec-toggle').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var card = btn.closest('.part-card');
      if (!card) return;
      var popup = document.getElementById('spec-' + card.dataset.id);
      if (!popup) return;
      var wasOpen = popup.classList.contains('visible');
      document.querySelectorAll('.spec-popup.visible').forEach(function (p) {
        p.classList.remove('visible');
        p.setAttribute('aria-hidden', 'true');
      });
      if (!wasOpen) {
        popup.classList.add('visible');
        popup.setAttribute('aria-hidden', 'false');
      }
    });
  });
  document.querySelectorAll('.spec-popup-close').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var popup = btn.closest('.spec-popup');
      if (popup) { popup.classList.remove('visible'); popup.setAttribute('aria-hidden', 'true'); }
    });
  });
  document.addEventListener('click', function () {
    document.querySelectorAll('.spec-popup.visible').forEach(function (p) {
      p.classList.remove('visible');
      p.setAttribute('aria-hidden', 'true');
    });
  });

  /* ─── ADD TO BUILD ─── */
  document.querySelectorAll('.add-to-build-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var part = {
        id:       btn.dataset.id,
        name:     btn.dataset.name,
        category: btn.dataset.category,
        price:    parseFloat(btn.dataset.price),
        weight:   parseFloat(btn.dataset.weight),
        image:    btn.dataset.image
      };
      var saved    = getLocalBuild();
      var existing = saved.filter(function (p) { return p.category === part.category; });
      var max      = part.category === 'motors' ? 4 : 1;
      if (existing.length >= max) {
        toast('Already have ' + (max === 1 ? 'a' : max) + ' ' + part.category + ' in your build.', 'info');
        return;
      }
      saved.push(part);
      saveLocalBuild(saved);
      toast(part.name + ' added to build!', 'success');
      btn.classList.add('btn-pulse');
      setTimeout(function () { btn.classList.remove('btn-pulse'); }, 600);
    });
  });

  function getLocalBuild() {
    try { return JSON.parse(localStorage.getItem('droneforge_build') || '[]'); } catch (e) { return []; }
  }
  function saveLocalBuild(d) { localStorage.setItem('droneforge_build', JSON.stringify(d)); }

  function toast(msg, type) {
    var icons = { success: 'check_circle', error: 'error', info: 'info' };
    var el = document.createElement('div');
    el.className = 'toast ' + (type || 'info');
    el.innerHTML = '<span class="material-symbols-outlined toast-icon" style="font-variation-settings:\'FILL\' 1">'
                 + (icons[type] || 'info') + '</span><span>' + msg + '</span>';
    var c = document.getElementById('toastContainer');
    if (c) c.appendChild(el);
    setTimeout(function () {
      el.classList.add('toast-exit');
      setTimeout(function () { el.remove(); }, 300);
    }, 3500);
  }

  /* ─── INITIAL RENDER ───
     Called exactly once, after ALL state is set up above.
  ─── */
  apply();

}());
