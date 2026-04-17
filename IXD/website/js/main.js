/* ========================================
   WHERE TO FIND WILDLIFE — Main JS
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  const cutouts  = document.querySelectorAll('.animal-cutout');
  const allCards = document.querySelectorAll('.species-card');
  const CARD_W   = 228;
  const CARD_H   = 310;

  function positionCard(card, cutout) {
    const rect     = cutout.getBoundingClientRect();
    const heroRect = cutout.closest('.home-hero').getBoundingClientRect();
    const margin   = 20;

    // Sticker bounds relative to hero
    const sLeft   = rect.left   - heroRect.left;
    const sRight  = rect.right  - heroRect.left;
    const sTop    = rect.top    - heroRect.top;
    const sCenterY = sTop + rect.height / 2;

    let left, top;

    // Prefer: right of sticker → left of sticker → above (fallback)
    if (sRight + CARD_W + margin < heroRect.width) {
      left = sRight + margin;
    } else if (sLeft - CARD_W - margin > 0) {
      left = sLeft - CARD_W - margin;
    } else {
      // Centered above
      left = sLeft + rect.width / 2 - CARD_W / 2;
      left = Math.max(8, Math.min(left, heroRect.width - CARD_W - 8));
    }

    // Vertically centred on the sticker, clamped to viewport
    top = sCenterY - CARD_H / 2;
    top = Math.max(68, Math.min(top, heroRect.height - CARD_H - 8));

    card.style.left = left + 'px';
    card.style.top  = top  + 'px';
  }

  function closeAll() {
    allCards.forEach(c => c.classList.remove('visible'));
    cutouts.forEach(c => c.classList.remove('active'));
  }

  // ---------- Click: toggle card ----------
  cutouts.forEach(cutout => {
    cutout.addEventListener('click', (e) => {
      e.stopPropagation();
      const species = cutout.dataset.species;
      const card    = document.getElementById('card-' + species);
      if (!card) return;

      const isAlreadyActive = cutout.classList.contains('active');

      // Close everything first
      closeAll();

      if (!isAlreadyActive) {
        positionCard(card, cutout);
        card.classList.add('visible');
        cutout.classList.add('active');   // keeps glow/scale on sticker
      }
    });
  });

  // Keep card open while hovering over it
  allCards.forEach(card => {
    card.addEventListener('click', e => e.stopPropagation());
  });

  // Click outside → close
  document.addEventListener('click', () => closeAll());

});
