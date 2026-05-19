/**
 * Slide 1 — remove old Unsplash URL; portrait grid bg is set in lesson-hero.css.
 */
(function () {
  function applyHero() {
    var panel = document.querySelector('[data-slide="0"]');
    if (!panel) return false;

    var bg = panel.querySelector('.absolute.inset-0.bg-cover');
    if (bg) {
      bg.style.backgroundImage = 'none';
      bg.removeAttribute('style');
      bg.classList.add('hl6-hero-bg');
    }

    return true;
  }

  function tryInit(n) {
    if (applyHero()) return;
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
