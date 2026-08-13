// ---------- Système de popups générique ----------
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('[data-popup-target]');
  const overlay = document.getElementById('popup-overlay');
  if (!overlay) return;

  const panel = overlay.querySelector('.popup__panel');
  const titleEl = overlay.querySelector('.popup__title');
  const bodyEl = overlay.querySelector('.popup__body');
  const closeBtn = overlay.querySelector('.popup__close');
  let lastFocused = null;

  function openPopup(id, triggerEl) {
    const source = document.getElementById(id);
    if (!source) return;
    titleEl.textContent = source.dataset.title || '';
    bodyEl.innerHTML = source.innerHTML;
    overlay.classList.add('is-open');
    document.body.classList.add('no-scroll');
    lastFocused = triggerEl || document.activeElement;
    closeBtn.focus();
  }

  function closePopup() {
    overlay.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    if (lastFocused) lastFocused.focus();
  }

  cards.forEach(card => {
    card.addEventListener('click', () => openPopup(card.dataset.popupTarget, card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPopup(card.dataset.popupTarget, card);
      }
    });
  });

  closeBtn.addEventListener('click', closePopup);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePopup();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closePopup();
  });

  // ---------- Système d'onglets (page Relations) ----------
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanels = document.querySelectorAll('.tab-panel');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('is-active'));
      tabPanels.forEach(p => p.classList.remove('is-active'));
      btn.classList.add('is-active');
      document.getElementById(btn.dataset.tabTarget).classList.add('is-active');
    });
  });
});