/* ── DroneForge Catalog JS ── */
(function () {
  'use strict';

  const grid       = document.getElementById('partsGrid');
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  const searchValid = document.getElementById('searchValidation');
  const countEl    = document.getElementById('countNum');
  const emptyEl    = document.getElementById('partsEmpty');
  const sortSelect  = document.getElementById('sortSelect');
  const filterReset = document.getElementById('filterReset');
  const clearFiltersEmpty = document.getElementById('clearFiltersEmpty');
  const filterToggleMobile = document.getElementById('filterToggleMobile');
  const applyMobile = document.getElementById('applyFiltersMobile');
  const sidebar    = document.getElementById('filterSidebar');
  const filterBadge = document.getElementById('filterBadge');

  let allCards = Array.from(grid.querySelectorAll('.part-card'));
  let activeCategory = '';
  let searchTerm = '';
  let priceMinVal = 0, priceMaxVal = Infinity;
  let weightMaxVal = Infinity;

  // ── Seed from existing filter state (server-rendered) ──
  const activeCatBtn = document.querySelector('.filter-cat-btn.active');
  if (activeCatBtn) activeCategory = activeCatBtn.dataset.cat || '';

  // ── SEARCH ──
  function sanitizeSearch(val) {
    return val.replace(/<[^>]*>/g, '').trim().toLowerCase();
  }

  searchInput.addEventListener('input', () => {
    const raw = searchInput.value;
    if (raw.length > 80) {
      searchValid.textContent = 'Search query too long (max 80 chars).';
      return;
    }
    searchValid.textContent = '';
    searchClear.style.display = raw ? 'flex' : 'none';
    searchTerm = sanitizeSearch(raw);
    applyFilters();
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchTerm = '';
    searchClear.style.display = 'none';
    searchValid.textContent = '';
    applyFilters();
  });

  // ── CATEGORY BUTTONS ──
  document.querySelectorAll('.filter-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.cat || '';
      applyFilters();
      updateFilterBadge();
    });
  });

  // ── PRICE RANGE SLIDERS ──
  const priceMinEl  = document.getElementById('priceMin');
  const priceMaxEl  = document.getElementById('priceMax');
  const priceMinDisp = document.getElementById('priceMinDisplay');
  const priceMaxDisp = document.getElementById('priceMaxDisplay');

  if (priceMinEl && priceMaxEl) {
    priceMinVal = Number(priceMinEl.value);
    priceMaxVal = Number(priceMaxEl.value);

    function syncPriceSliders() {
      let lo = Number(priceMinEl.value);
      let hi = Number(priceMaxEl.value);
      if (lo > hi) { priceMinEl.value = hi; lo = hi; }
      priceMinVal = lo;
      priceMaxVal = hi;
      priceMinDisp.textContent = lo.toFixed(0);
      priceMaxDisp.textContent = hi.toFixed(0);
      applyFilters();
      updateFilterBadge();
    }
    priceMinEl.addEventListener('input', syncPriceSliders);
    priceMaxEl.addEventListener('input', syncPriceSliders);
    syncPriceSliders();
  }

  // ── WEIGHT SLIDER ──
  const weightEl     = document.getElementById('weightMax');
  const weightDisp   = document.getElementById('weightDisplay-val');
  if (weightEl) {
    weightMaxVal = Number(weightEl.value);
    weightEl.addEventListener('input', () => {
      weightMaxVal = Number(weightEl.value);
      weightDisp.textContent = weightMaxVal;
      applyFilters();
      updateFilterBadge();
    });
  }

  // ── SORT ──
  sortSelect.addEventListener('change', () => applyFilters());

  // ── RESET FILTERS ──
  function resetFilters() {
    document.querySelectorAll('.filter-cat-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.filter-cat-btn[data-cat=""]')?.classList.add('active');
    activeCategory = '';
    if (priceMinEl) { priceMinEl.value = priceMinEl.min; priceMinVal = Number(priceMinEl.min); priceMinDisp.textContent = priceMinEl.min; }
    if (priceMaxEl) { priceMaxEl.value = priceMaxEl.max; priceMaxVal = Number(priceMaxEl.max); priceMaxDisp.textContent = priceMaxEl.max; }
    if (weightEl)   { weightEl.value = weightEl.max; weightMaxVal = Number(weightEl.max); weightDisp.textContent = weightEl.max; }
    searchInput.value = '';
    searchTerm = '';
    searchClear.style.display = 'none';
    applyFilters();
    updateFilterBadge();
  }
  filterReset?.addEventListener('click', resetFilters);
  clearFiltersEmpty?.addEventListener('click', resetFilters);

  // ── MAIN FILTER + SORT FUNCTION ──
  function applyFilters() {
    const sortVal = sortSelect.value;
    let visible = [];

    allCards.forEach(card => {
      const name     = card.dataset.name     || '';
      const category = card.dataset.category || '';
      const price    = parseFloat(card.dataset.price)  || 0;
      const weight   = parseFloat(card.dataset.weight) || 0;

      const matchSearch   = !searchTerm || name.includes(searchTerm);
      const matchCategory = !activeCategory || category === activeCategory;
      const matchPrice    = price >= priceMinVal && price <= priceMaxVal;
      const matchWeight   = weight <= weightMaxVal;

      const show = matchSearch && matchCategory && matchPrice && matchWeight;
      card.style.display = show ? '' : 'none';
      if (show) visible.push(card);
    });

    // Sort visible cards
    visible.sort((a, b) => {
      const aP = parseFloat(a.dataset.price), bP = parseFloat(b.dataset.price);
      const aW = parseFloat(a.dataset.weight), bW = parseFloat(b.dataset.weight);
      const aN = (a.dataset.name || ''), bN = (b.dataset.name || '');
      if (sortVal === 'price-asc')  return aP - bP;
      if (sortVal === 'price-desc') return bP - aP;
      if (sortVal === 'weight-asc') return aW - bW;
      if (sortVal === 'name-asc')   return aN.localeCompare(bN);
      return 0;
    });

    // Re-append in sorted order
    visible.forEach(card => grid.appendChild(card));

    countEl.textContent = visible.length;
    emptyEl.style.display = visible.length === 0 ? 'flex' : 'none';
    if (emptyEl.style.display === 'none') grid.appendChild(emptyEl);
  }

  function updateFilterBadge() {
    const active = activeCategory || priceMinVal > Number(priceMinEl?.min) || priceMaxVal < Number(priceMaxEl?.max) || weightMaxVal < Number(weightEl?.max);
    filterBadge.style.display = active ? 'flex' : 'none';
  }

  // ── SPEC POPUPS ──
  document.querySelectorAll('.btn-spec-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const popup = document.getElementById(`spec-${id}`);
      if (!popup) return;
      const isVisible = popup.classList.contains('visible');
      document.querySelectorAll('.spec-popup.visible').forEach(p => p.classList.remove('visible'));
      if (!isVisible) {
        popup.classList.add('visible');
        popup.setAttribute('aria-hidden', 'false');
      }
    });
  });

  document.querySelectorAll('.spec-popup-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      btn.closest('.spec-popup')?.classList.remove('visible');
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.spec-popup.visible').forEach(p => {
      p.classList.remove('visible');
      p.setAttribute('aria-hidden', 'true');
    });
  });

  // ── ADD TO BUILD BUTTON ──
  document.querySelectorAll('.add-to-build-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const part = {
        id:       btn.dataset.id,
        name:     btn.dataset.name,
        category: btn.dataset.category,
        price:    parseFloat(btn.dataset.price),
        weight:   parseFloat(btn.dataset.weight),
        image:    btn.dataset.image
      };

      // Validation: can only have one per category (except motors can have 4)
      const saved = getLocalBuild();
      const cat = part.category;
      const catParts = saved.filter(p => p.category === cat);
      const maxCount = cat === 'motors' ? 4 : 1;

      if (catParts.length >= maxCount) {
        showToast(`Already have ${maxCount === 1 ? 'a' : maxCount} ${cat} in your build. Visit the Builder to replace.`, 'info');
        return;
      }

      saved.push(part);
      saveLocalBuild(saved);
      showToast(`${part.name} added to build!`, 'success');
      animateBtn(btn);
    });
  });

  function animateBtn(btn) {
    btn.classList.add('btn-pulse');
    setTimeout(() => btn.classList.remove('btn-pulse'), 600);
  }

  // ── MOBILE FILTER TOGGLE ──
  filterToggleMobile?.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
  });
  applyMobile?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    document.body.style.overflow = '';
  });

  // ── LOCAL BUILD HELPERS ──
  function getLocalBuild() {
    try { return JSON.parse(localStorage.getItem('droneforge_build') || '[]'); }
    catch { return []; }
  }
  function saveLocalBuild(data) {
    localStorage.setItem('droneforge_build', JSON.stringify(data));
  }

  // ── TOAST SYSTEM ──
  function showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    const icons = { success: 'check_circle', error: 'error', info: 'info' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="material-symbols-outlined toast-icon" style="font-variation-settings:'FILL' 1;">${icons[type] || 'info'}</span>
      <span>${msg}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ── INITIAL FILTER APPLY ──
  applyFilters();

})();
