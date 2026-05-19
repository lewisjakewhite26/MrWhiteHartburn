/**
 * Slide 5 — Editing Lab: drag slider to compare colour (before) vs B&W (after).
 */
(function () {
  var compareRoot;
  var rangeInput;
  var beforeLayer;
  var handleLayer;
  var dragging = false;

  function findCompareWidget() {
    var panel = document.querySelector('[data-slide="3"]');
    if (!panel) return null;

    var root = panel.querySelector('.aspect-\\[16\\/10\\]');
    if (!root) {
      root = panel.querySelector('.max-w-5xl.overflow-hidden.rounded-2xl');
    }
    if (!root) return null;

    var range = root.querySelector('input[type="range"]');
    if (!range) return null;

    var before = null;
    root.querySelectorAll('[style*="clip-path"]').forEach(function (el) {
      if ((el.getAttribute('style') || '').indexOf('clip-path') !== -1) {
        before = el;
      }
    });

    var handle = null;
    root.querySelectorAll('.absolute.top-0.h-full').forEach(function (el) {
      var st = el.getAttribute('style') || '';
      if (st.indexOf('left') !== -1) handle = el;
    });

    if (!before || !handle) return null;

    return { root: root, range: range, before: before, handle: handle };
  }

  function setSplit(percent) {
    var pct = Math.max(0, Math.min(100, percent));
    var hideRight = 100 - pct;

    beforeLayer.style.clipPath = 'inset(0 ' + hideRight + '% 0 0)';
    beforeLayer.style.webkitClipPath = 'inset(0 ' + hideRight + '% 0 0)';
    handleLayer.style.left = pct + '%';
    rangeInput.value = String(Math.round(pct));
    rangeInput.setAttribute('aria-valuenow', rangeInput.value);
  }

  function percentFromPointer(e) {
    var rect = compareRoot.getBoundingClientRect();
    var x = e.clientX - rect.left;
    return (x / rect.width) * 100;
  }

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    dragging = true;
    compareRoot.setPointerCapture(e.pointerId);
    setSplit(percentFromPointer(e));
    if (e.pointerType === 'touch') e.preventDefault();
  }

  function onPointerMove(e) {
    if (!dragging) return;
    setSplit(percentFromPointer(e));
  }

  function onPointerUp(e) {
    if (!dragging) return;
    dragging = false;
    try {
      compareRoot.releasePointerCapture(e.pointerId);
    } catch (err) {}
  }

  function bind() {
    var parts = findCompareWidget();
    if (!parts) return false;
    if (parts.root.dataset.hl6CompareBound === '1') return true;

    compareRoot = parts.root;
    rangeInput = parts.range;
    beforeLayer = parts.before;
    handleLayer = parts.handle;

    setSplit(parseFloat(rangeInput.value) || 50);

    rangeInput.addEventListener('input', function () {
      setSplit(parseFloat(rangeInput.value));
    });

    rangeInput.addEventListener('change', function () {
      setSplit(parseFloat(rangeInput.value));
    });

    compareRoot.style.touchAction = 'none';
    compareRoot.addEventListener('pointerdown', onPointerDown);
    compareRoot.addEventListener('pointermove', onPointerMove);
    compareRoot.addEventListener('pointerup', onPointerUp);
    compareRoot.addEventListener('pointercancel', onPointerUp);

    rangeInput.style.opacity = '0';
    rangeInput.style.position = 'absolute';
    rangeInput.style.inset = '0';
    rangeInput.style.width = '100%';
    rangeInput.style.height = '100%';
    rangeInput.style.zIndex = '25';
    rangeInput.style.cursor = 'ew-resize';
    rangeInput.style.margin = '0';

    parts.root.dataset.hl6CompareBound = '1';
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
