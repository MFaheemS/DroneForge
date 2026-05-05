/* ── DroneForge Builder JS ── */
(function () {
  'use strict';

  // ── STATE ──
  const SLOTS = {
    frame:            { label: 'Frame',            max: 1, parts: [] },
    motors:           { label: 'Motors ×4',        max: 4, parts: [] },
    propellers:       { label: 'Propellers',       max: 1, parts: [] },
    battery:          { label: 'Battery',          max: 1, parts: [] },
    flightController: { label: 'Flight Controller',max: 1, parts: [] },
    camera:           { label: 'Camera',           max: 1, parts: [] },
    ESC:              { label: 'ESC',              max: 1, parts: [] },
    transmitter:      { label: 'Transmitter',      max: 1, parts: [] }
  };
  let currentSlot = null;
  let modalParts  = [];

  // ── DOM ──
  const modal         = document.getElementById('slotModal');
  const modalTitle    = document.getElementById('modalTitle');
  const modalCategory = document.getElementById('modalCategory');
  const modalClose    = document.getElementById('modalClose');
  const modalSearch   = document.getElementById('modalSearch');
  const modalList     = document.getElementById('modalPartsList');

  const resetModal    = document.getElementById('resetModal');
  const resetModalClose = document.getElementById('resetModalClose');
  const resetCancelBtn  = document.getElementById('resetCancelBtn');
  const resetConfirmBtn = document.getElementById('resetConfirmBtn');

  const summaryParts  = document.getElementById('summaryParts');
  const summaryBadge  = document.getElementById('summaryPartCount');
  const totalPriceEl  = document.getElementById('totalPrice');
  const totalWeightEl = document.getElementById('totalWeight');
  const flightTimeEl  = document.getElementById('flightTime');
  const compatDot     = document.getElementById('compatDot');
  const compatText    = document.getElementById('compatText');
  const compatBanner  = document.getElementById('compatBanner');
  const compatMsg     = document.getElementById('compatMsg');
  const compatIcon    = document.getElementById('compatIcon');
  const orderBtn      = document.getElementById('orderBuildBtn');
  const toastContainer = document.getElementById('toastContainer');

  const LABEL_MAP = {
    frame: 'Frame', motors: 'Motors', propellers: 'Propellers',
    battery: 'Battery', flightController: 'Flight Controller',
    camera: 'Camera', ESC: 'ESC', transmitter: 'Transmitter'
  };

  // ── LOAD FROM LOCALSTORAGE ──
  function loadBuild() {
    try {
      const raw = localStorage.getItem('droneforge_build');
      if (!raw) return;
      const parts = JSON.parse(raw);
      parts.forEach(part => {
        const slot = SLOTS[part.category];
        if (!slot) return;
        if (slot.parts.length < slot.max) slot.parts.push(part);
      });
    } catch (_) {}
    renderAll();
  }

  function saveBuild() {
    const all = [];
    Object.values(SLOTS).forEach(s => s.parts.forEach(p => all.push(p)));
    localStorage.setItem('droneforge_build', JSON.stringify(all));
  }

  // ── OPEN SLOT MODAL ──
  function openSlotModal(slotKey) {
    currentSlot = slotKey;
    const slot = SLOTS[slotKey];
    modalTitle.textContent    = `Select ${slot.label}`;
    modalCategory.textContent = LABEL_MAP[slotKey] || slotKey;
    modalSearch.value = '';
    modalList.innerHTML = '<div class="modal-loading"><div class="spinner"></div>Loading parts…</div>';

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    modalSearch.focus();

    fetch(`/parts/api/category/${slotKey}`)
      .then(r => r.json())
      .then(data => {
        modalParts = data.parts || [];
        renderModalParts(modalParts, slot.parts);
      })
      .catch(() => {
        modalList.innerHTML = '<div class="modal-no-results">Failed to load parts. Please try again.</div>';
      });
  }

  function renderModalParts(parts, selectedParts) {
    if (!parts.length) {
      modalList.innerHTML = '<div class="modal-no-results">No parts available for this category.</div>';
      return;
    }
    const selectedIds = selectedParts.map(p => p.id);
    modalList.innerHTML = parts.map(p => {
      const isSelected = selectedIds.includes(String(p._id));
      const specs = p.specs ? Object.entries(p.specs).slice(0, 3).map(([k, v]) => `${v}`).join(' · ') : '';
      return `
        <div class="modal-part-row ${isSelected ? 'selected' : ''}"
             data-id="${p._id}"
             data-name="${encodeURIComponent(p.name)}"
             data-price="${p.price}"
             data-weight="${p.weight}"
             data-image="${p.imageUrl || ''}"
             tabindex="0"
             role="option"
             aria-selected="${isSelected}">
          <img src="${p.imageUrl || ''}" alt="${p.name}" class="modal-part-thumb" loading="lazy"
               onerror="this.src='';this.style.background='var(--surface-container)'" />
          <div class="modal-part-info">
            <div class="modal-part-name">${p.name}</div>
            <div class="modal-part-specs">${p.weight}g${specs ? ' · ' + specs : ''}</div>
          </div>
          <div class="modal-part-price">$${p.price.toFixed(2)}</div>
          <span class="material-symbols-outlined modal-part-check" style="font-variation-settings:'FILL' 1;">check_circle</span>
        </div>
      `;
    }).join('');

    // Bind click on each row
    modalList.querySelectorAll('.modal-part-row').forEach(row => {
      const select = () => selectPartFromModal(row);
      row.addEventListener('click', select);
      row.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); } });
    });
  }

  function selectPartFromModal(row) {
    const slot = SLOTS[currentSlot];
    const part = {
      id:       row.dataset.id,
      name:     decodeURIComponent(row.dataset.name),
      category: currentSlot,
      price:    parseFloat(row.dataset.price),
      weight:   parseFloat(row.dataset.weight),
      image:    row.dataset.image
    };

    if (row.classList.contains('selected')) {
      // Deselect
      slot.parts = slot.parts.filter(p => p.id !== part.id);
      row.classList.remove('selected');
      row.setAttribute('aria-selected', 'false');
      showToast(`${part.name} removed.`, 'info');
    } else {
      if (slot.parts.length >= slot.max) {
        // Replace
        slot.parts = slot.parts.slice(1);
        modalList.querySelectorAll('.modal-part-row.selected').forEach(r => {
          r.classList.remove('selected');
          r.setAttribute('aria-selected', 'false');
        });
      }
      slot.parts.push(part);
      row.classList.add('selected');
      row.setAttribute('aria-selected', 'true');
      showToast(`${part.name} added to build!`, 'success');
    }

    renderAll();
    saveBuild();

    // Auto-close if slot is now full
    if (slot.parts.length >= slot.max) {
      setTimeout(closeModal, 400);
    }
  }

  // ── CLOSE MODAL ──
  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    currentSlot = null;
  }
  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); closeResetModal(); }
  });

  // ── MODAL SEARCH ──
  modalSearch?.addEventListener('input', () => {
    const q = modalSearch.value.toLowerCase().trim();
    const filtered = q ? modalParts.filter(p => p.name.toLowerCase().includes(q)) : modalParts;
    renderModalParts(filtered, SLOTS[currentSlot]?.parts || []);
  });

  // ── SLOT CLICK (SVG groups + pills) ──
  document.querySelectorAll('.slot-group[data-slot]').forEach(el => {
    const handler = () => openSlotModal(el.dataset.slot);
    el.addEventListener('click', handler);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); } });
  });

  document.querySelectorAll('.slot-pill[data-slot]').forEach(pill => {
    pill.addEventListener('click', () => openSlotModal(pill.dataset.slot));
  });

  // ── RENDER ALL ──
  function renderAll() {
    renderSlotVisuals();
    renderSummary();
    renderCompatibility();
  }

  function renderSlotVisuals() {
    Object.entries(SLOTS).forEach(([key, slot]) => {
      const isFilled = slot.parts.length > 0;

      // SVG groups
      document.querySelectorAll(`.slot-group[data-slot="${key}"]`).forEach(g => {
        g.classList.toggle('filled', isFilled);
      });

      // Pills
      const pill = document.getElementById(`pill-${key}`);
      const pillStatus = document.getElementById(`pill-status-${key}`);
      if (pill) {
        pill.classList.toggle('filled', isFilled);
        if (pillStatus) {
          pillStatus.classList.toggle('filled', isFilled);
          if (isFilled) {
            const name = slot.parts[0].name;
            pillStatus.textContent = slot.max > 1 ? `×${slot.parts.length}` : name.split(' ').slice(0, 2).join(' ');
          } else {
            pillStatus.textContent = '—';
          }
        }
      }
    });
  }

  function renderSummary() {
    const allParts = [];
    Object.values(SLOTS).forEach(s => s.parts.forEach(p => allParts.push(p)));

    const filledSlots = Object.values(SLOTS).filter(s => s.parts.length > 0).length;
    summaryBadge.textContent = `${filledSlots}/8`;

    if (allParts.length === 0) {
      summaryParts.innerHTML = `
        <div class="summary-empty">
          <img src="/images/dji-small.gif" alt="Empty build" width="80" loading="lazy" />
          <p>No parts selected yet.</p>
          <p style="font-size:.8rem;color:var(--muted);">Click a slot on the schematic to add parts.</p>
        </div>`;
      orderBtn.disabled = true;
      return;
    }

    summaryParts.innerHTML = allParts.map(p => `
      <div class="summary-part-item">
        <img src="${p.image || ''}" alt="${p.name}" class="summary-part-thumb"
             onerror="this.src='';this.style.background='var(--surface-container)'" loading="lazy"/>
        <div class="summary-part-info">
          <div class="summary-part-name">${p.name}</div>
          <div class="summary-part-cat">${LABEL_MAP[p.category] || p.category}</div>
        </div>
        <span class="summary-part-price">$${p.price.toFixed(2)}</span>
        <button class="summary-part-remove" data-id="${p.id}" data-cat="${p.category}" aria-label="Remove ${p.name}">
          <span class="material-symbols-outlined" style="font-size:.85rem;">close</span>
        </button>
      </div>
    `).join('');

    // Remove buttons
    summaryParts.querySelectorAll('.summary-part-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const cat = btn.dataset.cat;
        if (SLOTS[cat]) {
          SLOTS[cat].parts = SLOTS[cat].parts.filter(p => p.id !== id);
          renderAll();
          saveBuild();
        }
      });
    });

    // Totals
    const totalPrice  = allParts.reduce((s, p) => s + p.price, 0);
    const totalWeight = allParts.reduce((s, p) => s + p.weight, 0);

    totalPriceEl.textContent  = `$${totalPrice.toFixed(2)}`;
    totalWeightEl.textContent = `${totalWeight}g`;

    // Estimate flight time
    const battery = SLOTS.battery.parts[0];
    const motors  = SLOTS.motors.parts;
    if (battery && motors.length > 0) {
      const mAh = parseFloat((battery.name.match(/(\d{3,5})\s*mah/i) || battery.name.match(/(\d{3,5})/i) || [])[1]) || 1500;
      const avgDraw = 20; // amps per motor avg
      const motorCount = motors.length;
      const minutes = ((mAh / 1000) / (motorCount * avgDraw)) * 60;
      flightTimeEl.textContent = `~${Math.max(1, Math.round(minutes))} min`;
    } else {
      flightTimeEl.textContent = '—';
    }

    orderBtn.disabled = filledSlots < 3;
  }

  function renderCompatibility() {
    const allParts = [];
    Object.values(SLOTS).forEach(s => s.parts.forEach(p => allParts.push(p)));
    if (allParts.length < 2) {
      compatDot.className   = 'compat-dot';
      compatText.textContent = '—';
      compatBanner.style.display = 'none';
      return;
    }

    const issues = [];

    // Check: motors × 4 required for a full build
    const motorCount = SLOTS.motors.parts.length;
    if (motorCount > 0 && motorCount < 4) {
      issues.push(`Only ${motorCount}/4 motors selected — need all 4 for a flyable build.`);
    }

    // Check: heavy frame + micro motors
    const frame = SLOTS.frame.parts[0];
    const motors = SLOTS.motors.parts;
    if (frame && motors.length > 0) {
      const frameIsHeavy = frame.weight > 200;
      const motorIsSmall = motors[0].name.toLowerCase().includes('nano') || motors[0].name.toLowerCase().includes('micro');
      if (frameIsHeavy && motorIsSmall) {
        issues.push('Heavy frame detected with micro motors — may lack sufficient thrust.');
      }
    }

    // Check: battery too heavy for build
    const battery = SLOTS.battery.parts[0];
    const totalWeightNoBatt = allParts.filter(p => p.category !== 'battery').reduce((s, p) => s + p.weight, 0);
    if (battery && battery.weight > totalWeightNoBatt * 1.5) {
      issues.push('Battery is very heavy relative to the build — consider a lighter pack.');
    }

    if (issues.length === 0) {
      compatDot.className    = 'compat-dot green';
      compatText.textContent  = 'Compatible';
      compatBanner.style.display = 'none';
    } else {
      const isWarning = issues.length <= 1;
      compatDot.className    = `compat-dot ${isWarning ? 'yellow' : 'red'}`;
      compatText.textContent  = isWarning ? 'Warning' : 'Issues';
      compatBanner.style.display = 'flex';
      compatBanner.style.background = isWarning ? 'rgba(255,138,0,0.08)' : 'rgba(255,180,171,0.08)';
      compatBanner.style.borderColor = isWarning ? 'rgba(255,138,0,0.3)' : 'rgba(255,180,171,0.3)';
      compatBanner.style.color = isWarning ? 'var(--orange)' : 'var(--error)';
      compatMsg.textContent = issues[0];
      compatIcon.textContent = isWarning ? 'warning' : 'error';
    }
  }

  // ── RESET BUILD ──
  function openResetModal() {
    resetModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Shake schematic
    const canvas = document.getElementById('schematicCanvas');
    canvas?.classList.add('shake');
    setTimeout(() => canvas?.classList.remove('shake'), 500);
  }
  function closeResetModal() {
    resetModal.classList.remove('open');
    document.body.style.overflow = '';
  }
  document.getElementById('resetBuildBtn')?.addEventListener('click', openResetModal);
  document.getElementById('resetBuildBtn2')?.addEventListener('click', openResetModal);
  document.getElementById('saveOrderBtn')?.addEventListener('click', () => {
    document.getElementById('orderBuildBtn')?.click();
  });
  resetModalClose?.addEventListener('click', closeResetModal);
  resetCancelBtn?.addEventListener('click', closeResetModal);
  resetModal?.addEventListener('click', e => { if (e.target === resetModal) closeResetModal(); });

  resetConfirmBtn?.addEventListener('click', () => {
    Object.values(SLOTS).forEach(s => { s.parts = []; });
    saveBuild();
    renderAll();
    closeResetModal();
    showToast('Build has been reset.', 'info');
  });

  // ── ORDER BUTTON ──
  orderBtn?.addEventListener('click', () => {
    const allParts = [];
    Object.values(SLOTS).forEach(s => s.parts.forEach(p => allParts.push(p)));
    if (allParts.length === 0) return;
    showToast('Build saved to cart! Proceeding to checkout…', 'success');
    // Redirect to cart (Module 3)
    setTimeout(() => { window.location.href = '/cart'; }, 1500);
  });

  // ── TOAST ──
  function showToast(msg, type = 'info') {
    const icons = { success: 'check_circle', error: 'error', info: 'info' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="material-symbols-outlined toast-icon" style="font-variation-settings:'FILL' 1;">${icons[type] || 'info'}</span>
      <span>${msg}</span>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ── ADD SHAKE KEYFRAME ──
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-8px); }
      40%      { transform: translateX(8px); }
      60%      { transform: translateX(-5px); }
      80%      { transform: translateX(5px); }
    }
    .shake { animation: shake .4s var(--ease) both; }
    .btn-pulse { animation: btnPulse .5s var(--ease); }
    @keyframes btnPulse {
      0%,100% { transform: scale(1); }
      50%      { transform: scale(.95); box-shadow: 0 0 16px rgba(0,242,255,.4); }
    }
  `;
  document.head.appendChild(style);

  // ── INIT ──
  loadBuild();

})();
