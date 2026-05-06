/* Admin Panel JS */
(function () {
  /* ── Toast ── */
  function toast(msg, type = 'success') {
    const tc = document.getElementById('toastContainer');
    if (!tc) return;
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<span class="material-symbols-outlined" style="font-size:.9rem;">${type === 'success' ? 'check_circle' : 'error'}</span>${msg}`;
    tc.appendChild(t);
    setTimeout(() => { t.classList.add('fade-out'); setTimeout(() => t.remove(), 320); }, 3500);
  }

  /* ── Toggle User Status ── */
  document.querySelectorAll('.toggle-status-btn').forEach(btn => {
    btn.addEventListener('click', async function () {
      const userId = this.dataset.userId;
      const isActive = this.dataset.active === 'true';
      this.disabled = true;

      try {
        const res = await fetch(`/admin/users/${userId}/toggle-status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (data.success) {
          toast(data.message || 'Status updated');
          setTimeout(() => location.reload(), 1000);
        } else {
          toast(data.message || 'Update failed', 'error');
          this.disabled = false;
        }
      } catch {
        toast('Network error', 'error');
        this.disabled = false;
      }
    });
  });

  /* ── Change User Role ── */
  document.querySelectorAll('.role-select').forEach(sel => {
    sel.addEventListener('change', async function () {
      const userId = this.dataset.userId;
      const role = this.value;

      try {
        const res = await fetch(`/admin/users/${userId}/role`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role })
        });
        const data = await res.json();
        if (data.success) toast('Role updated to ' + role);
        else { toast(data.message || 'Role update failed', 'error'); }
      } catch {
        toast('Network error', 'error');
      }
    });
  });

  /* ── Delete Part ── */
  const deleteModal = document.getElementById('deletePartModal');
  const deleteNameEl = document.getElementById('deletePartName');
  const deleteModalClose = document.getElementById('deleteModalClose');
  const deleteCancelBtn = document.getElementById('deleteCancelBtn');
  const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
  let pendingDeleteId = null;

  document.querySelectorAll('.delete-part-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      pendingDeleteId = this.dataset.partId;
      if (deleteNameEl) deleteNameEl.textContent = this.dataset.partName;
      if (deleteModal) deleteModal.classList.add('open');
    });
  });

  function closeDeleteModal() { if (deleteModal) deleteModal.classList.remove('open'); pendingDeleteId = null; }
  if (deleteModalClose) deleteModalClose.addEventListener('click', closeDeleteModal);
  if (deleteCancelBtn) deleteCancelBtn.addEventListener('click', closeDeleteModal);
  if (deleteModal) deleteModal.addEventListener('click', e => { if (e.target === deleteModal) closeDeleteModal(); });

  if (deleteConfirmBtn) {
    deleteConfirmBtn.addEventListener('click', async () => {
      if (!pendingDeleteId) return;
      deleteConfirmBtn.disabled = true;
      try {
        const res = await fetch(`/admin/parts/${pendingDeleteId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          closeDeleteModal();
          toast('Part deleted');
          setTimeout(() => location.reload(), 1000);
        } else {
          toast(data.message || 'Delete failed', 'error');
          deleteConfirmBtn.disabled = false;
        }
      } catch {
        toast('Network error', 'error');
        deleteConfirmBtn.disabled = false;
      }
    });
  }

  /* ── Update Order Status ── */
  document.querySelectorAll('.update-order-status-btn').forEach(btn => {
    btn.addEventListener('click', async function () {
      const orderId = this.dataset.orderId;
      const select = document.querySelector(`.order-status-select[data-order-id="${orderId}"]`);
      if (!select) return;
      const status = select.value;
      this.disabled = true;

      try {
        const res = await fetch(`/admin/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
        const data = await res.json();
        if (data.success) {
          toast('Order status updated to ' + status);
          const badge = document.getElementById('status-badge-' + orderId);
          if (badge) {
            badge.className = `status-badge status-${status}`;
            badge.textContent = status.toUpperCase();
          }
        } else {
          toast(data.message || 'Update failed', 'error');
        }
      } catch {
        toast('Network error', 'error');
      } finally {
        this.disabled = false;
      }
    });
  });
})();
