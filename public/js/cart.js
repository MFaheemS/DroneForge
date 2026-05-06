/* Cart Page JS */
(function () {
  /* ── Toast ── */
  function toast(msg, type = 'success') {
    const tc = document.getElementById('toastContainer');
    if (!tc) return;
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<span class="material-symbols-outlined" style="font-size:.9rem;">${type === 'success' ? 'check_circle' : 'error'}</span>${msg}`;
    tc.appendChild(t);
    setTimeout(() => { t.classList.add('fade-out'); setTimeout(() => t.remove(), 320); }, 3000);
  }

  /* ── Update summary totals from server response ── */
  function updateSummary(data) {
    if (!data) return;
    const sub = document.getElementById('summarySubtotal');
    const tax = document.getElementById('summaryTax');
    const total = document.getElementById('summaryTotal');
    const countLabel = document.getElementById('cartItemCountLabel');
    if (sub && data.subtotal !== undefined)   sub.textContent = '$' + data.subtotal.toFixed(2);
    if (tax && data.tax !== undefined)        tax.textContent = '$' + data.tax.toFixed(2);
    if (total && data.estimate !== undefined) total.textContent = '$' + data.estimate.toFixed(2);
    if (countLabel && data.count !== undefined) countLabel.textContent = data.count;
    updateNavBadge(data.count ?? 0);
  }

  function updateNavBadge(count) {
    const badge = document.getElementById('cartNavBadge');
    if (!badge) return;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  }

  /* ── Quantity change ── */
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', async function () {
      const partId = this.dataset.partId;
      const action = this.dataset.action;
      const qtyEl = document.getElementById('qty-' + partId);
      let qty = parseInt(qtyEl.textContent);
      qty = action === 'plus' ? qty + 1 : Math.max(1, qty - 1);

      try {
        const res = await fetch('/cart/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ partId, quantity: qty })
        });
        const data = await res.json();
        if (data.success) {
          qtyEl.textContent = qty;
          const priceEl = document.getElementById('price-' + partId);
          if (priceEl && data.lineTotal !== undefined)
            priceEl.textContent = '$' + data.lineTotal.toFixed(2);
          updateSummary(data);
        } else {
          toast(data.message || 'Update failed', 'error');
        }
      } catch {
        toast('Network error', 'error');
      }
    });
  });

  /* ── Remove item ── */
  document.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', async function () {
      const partId = this.dataset.partId;
      try {
        const res = await fetch('/cart/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ partId })
        });
        const data = await res.json();
        if (data.success) {
          const item = document.getElementById('cart-item-' + partId);
          if (item) { item.style.opacity = '0'; item.style.transform = 'translateX(20px)'; item.style.transition = 'all .25s'; setTimeout(() => item.remove(), 260); }
          updateSummary(data);
          if (data.count === 0) setTimeout(() => location.reload(), 400);
          toast('Item removed');
        } else {
          toast(data.message || 'Remove failed', 'error');
        }
      } catch {
        toast('Network error', 'error');
      }
    });
  });

  /* ── Clear Cart Modal ── */
  const clearBtn = document.getElementById('clearCartBtn');
  const modal = document.getElementById('clearCartModal');
  const modalClose = document.getElementById('clearCartModalClose');
  const cancelBtn = document.getElementById('clearCancelBtn');
  const confirmBtn = document.getElementById('clearConfirmBtn');

  function openModal() { if (modal) modal.classList.add('open'); }
  function closeModal() { if (modal) modal.classList.remove('open'); }

  if (clearBtn) clearBtn.addEventListener('click', openModal);
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/cart/clear', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
        const data = await res.json();
        if (data.success) { closeModal(); location.reload(); }
        else toast(data.message || 'Clear failed', 'error');
      } catch {
        toast('Network error', 'error');
      }
    });
  }
})();
