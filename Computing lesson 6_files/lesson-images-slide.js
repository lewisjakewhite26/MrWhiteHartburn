/**
 * Slide 3 (dial 3) — example portraits grid. Drop images into slide-images/ as image-1.jpg … image-6.jpg
 */
(function () {
  var BASE = 'Computing lesson 6_files/slide-images/';
  var SLOTS = 6;

  function markMissing(img) {
    img.classList.add('hl6-image-missing');
  }

  function bind() {
    var panel = document.querySelector('[data-slide="2"]');
    if (!panel || panel.dataset.hl6ImagesBound === '1') return true;
    if (!panel.querySelector('.hl6-images-grid')) return false;

    panel.dataset.hl6ImagesBound = '1';
    panel.querySelectorAll('.hl6-image-slot__img').forEach(function (img) {
      if (!img.getAttribute('src')) {
        var slot = img.getAttribute('data-slot') || '1';
        img.src = BASE + 'image-' + slot + '.jpg';
      }
      img.addEventListener('error', function () {
        markMissing(img);
      });
      if (img.complete && img.naturalWidth === 0) markMissing(img);
    });
    return true;
  }

  function tryInit(n) {
    if (bind()) return;
    if (n <= 0) return;
    setTimeout(function () {
      tryInit(n - 1);
    }, 120);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      tryInit(50);
    });
  } else {
    tryInit(50);
  }
})();
