/* Checkout Multi-Step JS */
(function () {
  /* ── State ── */
  let currentStep = 1;
  const state = {
    buildName: 'Custom Drone Build',
    fullName: '', email: '', address: '', city: '', state: '', zip: '',
    shippingMethod: 'priority'
  };

  const SHIPPING_COST = { priority: 45, standard: 0 };

  /* ── DOM refs ── */
  const steps = [1, 2, 3].map(n => document.getElementById('checkout-step-' + n));
  const indicators = [1, 2, 3].map(n => document.getElementById('step-indicator-' + n));
  const lines = [1, 2].map(n => document.getElementById('step-line-' + n));

  function showStep(n) {
    steps.forEach((s, i) => s.classList.toggle('hidden', i + 1 !== n));
    indicators.forEach((ind, i) => {
      ind.classList.toggle('active', i + 1 <= n);
    });
    lines.forEach((line, i) => {
      line.classList.toggle('active', i + 1 < n);
    });
    currentStep = n;
  }

  /* ── Validation helpers ── */
  function showErr(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle('hidden', !msg);
  }
  function clearAllErrors() {
    document.querySelectorAll('.form-error').forEach(e => { e.textContent = ''; e.classList.add('hidden'); });
  }

  function validateStep1() {
    const val = document.getElementById('buildNameInput').value.trim();
    if (!val) { showErr('err-buildName', 'Build name is required.'); return false; }
    state.buildName = val;
    return true;
  }

  function validateStep2() {
    let ok = true;
    const checks = [
      ['fullNameInput', 'err-fullName', v => v.length >= 2, 'Full name is required.'],
      ['emailInput',    'err-email',    v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Valid email required.'],
      ['addressInput',  'err-address',  v => v.length >= 3, 'Address is required.'],
      ['cityInput',     'err-city',     v => v.length >= 2, 'City is required.'],
      ['stateInput',    'err-state',    v => v.length >= 2, 'State is required.'],
      ['zipInput',      'err-zip',      v => /^\d{4,10}$/.test(v), 'Valid ZIP is required.'],
    ];
    checks.forEach(([inputId, errId, check, msg]) => {
      const val = document.getElementById(inputId)?.value.trim() || '';
      if (!check(val)) { showErr(errId, msg); ok = false; }
      else showErr(errId, '');
    });
    if (ok) {
      state.fullName = document.getElementById('fullNameInput').value.trim();
      state.email    = document.getElementById('emailInput').value.trim();
      state.address  = document.getElementById('addressInput').value.trim();
      state.city     = document.getElementById('cityInput').value.trim();
      state.state    = document.getElementById('stateInput').value.trim();
      state.zip      = document.getElementById('zipInput').value.trim();
    }
    return ok;
  }

  function validateStep3() {
    let ok = true;
    const num = document.getElementById('cardNumberInput')?.value.replace(/\s/g, '') || '';
    const exp = document.getElementById('cardExpiryInput')?.value || '';
    const cvc = document.getElementById('cardCvcInput')?.value || '';

    if (!/^\d{16}$/.test(num)) { showErr('err-cardNumber', 'Enter a valid 16-digit card number.'); ok = false; }
    else showErr('err-cardNumber', '');

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp)) { showErr('err-cardExpiry', 'Use MM/YY format.'); ok = false; }
    else showErr('err-cardExpiry', '');

    if (!/^\d{3,4}$/.test(cvc)) { showErr('err-cardCvc', 'Enter 3 or 4 digit CVC.'); ok = false; }
    else showErr('err-cardCvc', '');

    return ok;
  }

  /* ── Step navigation ── */
  document.getElementById('goToStep2Btn')?.addEventListener('click', () => {
    clearAllErrors();
    if (validateStep1()) showStep(2);
  });
  document.getElementById('backToStep1Btn')?.addEventListener('click', () => showStep(1));
  document.getElementById('goToStep3Btn')?.addEventListener('click', () => {
    clearAllErrors();
    if (validateStep2()) { populateHiddenFields(); showStep(3); }
  });
  document.getElementById('backToStep2Btn')?.addEventListener('click', () => showStep(2));

  /* ── Populate hidden fields before submit ── */
  function populateHiddenFields() {
    const map = {
      hiddenBuildName: state.buildName,
      hiddenFullName:  state.fullName,
      hiddenEmail:     state.email,
      hiddenAddress:   state.address,
      hiddenCity:      state.city,
      hiddenState:     state.state,
      hiddenZip:       state.zip,
      hiddenShippingMethod: state.shippingMethod,
    };
    Object.entries(map).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.value = val;
    });
  }

  /* ── Form submit ── */
  document.getElementById('checkoutForm')?.addEventListener('submit', function (e) {
    clearAllErrors();
    if (!validateStep3()) { e.preventDefault(); return; }
    populateHiddenFields();
    // disable submit to prevent double click
    const btn = document.getElementById('submitOrderBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Processing...'; }
  });

  /* ── Shipping method toggle ── */
  document.querySelectorAll('input[name="shippingMethod"]').forEach(radio => {
    radio.addEventListener('change', function () {
      state.shippingMethod = this.value;
      document.querySelectorAll('.shipping-option').forEach(opt => opt.classList.remove('selected'));
      this.closest('.shipping-option')?.classList.add('selected');
      updateShippingTotal();
    });
  });

  function updateShippingTotal() {
    const cost = SHIPPING_COST[state.shippingMethod] ?? 45;
    const shippingEl = document.getElementById('summaryShipping');
    const grandEl    = document.getElementById('summaryGrandTotal');
    if (shippingEl) shippingEl.textContent = cost > 0 ? '$' + cost.toFixed(2) : 'Free';

    // Recalculate grand total from subtotal shown in DOM
    if (grandEl) {
      const subtotalText = document.querySelector('.checkout-totals .checkout-total-row span:last-child')?.textContent || '0';
      const sub = parseFloat(subtotalText.replace('$', '')) || 0;
      const tax = sub * 0.08;
      grandEl.textContent = '$' + (sub + tax + cost).toFixed(2);
    }
  }

  /* ── Card number formatting ── */
  const cardNumberInput = document.getElementById('cardNumberInput');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function () {
      let v = this.value.replace(/\D/g, '').slice(0, 16);
      this.value = v.match(/.{1,4}/g)?.join(' ') || v;
      const disp = document.getElementById('cardDisplayNumber');
      if (disp) {
        const filled = v.padEnd(16, '•');
        disp.textContent = filled.match(/.{1,4}/g)?.join(' ') || '•••• •••• •••• ••••';
      }
    });
  }

  /* ── Card name mirror ── */
  document.getElementById('fullNameInput')?.addEventListener('input', function () {
    const disp = document.getElementById('cardDisplayName');
    if (disp) disp.textContent = this.value.toUpperCase() || 'OPERATOR NAME';
  });

  /* ── Card expiry formatting ── */
  const expiryInput = document.getElementById('cardExpiryInput');
  if (expiryInput) {
    expiryInput.addEventListener('input', function () {
      let v = this.value.replace(/\D/g, '').slice(0, 4);
      if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
      this.value = v;
      const disp = document.getElementById('cardDisplayExpiry');
      if (disp) disp.textContent = this.value || 'MM/YY';
    });
  }
})();
