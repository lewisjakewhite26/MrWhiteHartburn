/**
 * Slide 2 toolkit demos.
 * AE/AF: blur the slide, show a sharp copy through the yellow box (works on IWB).
 */
(function () {
  var panel;
  var section;
  var fxRoot;
  var hint;
  var afBox;
  var sharpWindow;
  var gridOverlay;
  var headroomZone;
  var exposureUi;
  var exposureRange;
  var exposureValue;
  var mode = null;
  var cardButtons = [];
  var lastTapTime = 0;
  var afHole = null;

  function getTrack() {
    return (
      document.getElementById('lesson-slide-track') ||
      (function () {
        var a = document.querySelector('[data-slide="0"]');
        return a ? a.parentElement : null;
      })()
    );
  }

  function currentSlideIndex() {
    var track = getTrack();
    if (!track) return 0;
    var style = track.getAttribute('style') || '';
    var m = /translateX\(\s*-?(\d+(?:\.\d+)?)%\s*\)/i.exec(style);
    if (m) return Math.round(parseFloat(m[1]) / 100);
    return 0;
  }

  function buildFxLayer() {
    var old = document.getElementById('hl6-toolkit-overlay');
    if (old) old.remove();
    var existing = document.getElementById('hl6-slide-fx');
    if (existing) existing.remove();

    fxRoot = document.createElement('div');
    fxRoot.id = 'hl6-slide-fx';
    fxRoot.innerHTML =
      '<div id="hl6-sharp-window" aria-hidden="true"></div>' +
      '<div id="hl6-af-box"><span id="hl6-af-label">AE/AF LOCK</span></div>' +
      '<div id="hl6-grid-overlay" aria-hidden="true"></div>' +
      '<div id="hl6-headroom-zone" aria-hidden="true"></div>' +
      '<div id="hl6-exposure-ui">' +
      '<span style="color:#FF9500;font-size:1.25rem">☀</span>' +
      '<input type="range" id="hl6-exposure-range" min="-100" max="100" value="0">' +
      '<span id="hl6-exposure-value">0</span></div>' +
      '<p id="hl6-toolkit-hint"></p>' +
      '<button type="button" id="hl6-toolkit-exit" aria-label="End demo">×</button>';

    document.body.appendChild(fxRoot);
    cacheFxRefs();

    gridOverlay.innerHTML =
      '<svg viewBox="0 0 100 100" preserveAspectRatio="none">' +
      '<line x1="33.33" y1="0" x2="33.33" y2="100" stroke="rgba(255,255,255,0.3)" stroke-width="0.35"/>' +
      '<line x1="66.66" y1="0" x2="66.66" y2="100" stroke="rgba(255,255,255,0.3)" stroke-width="0.35"/>' +
      '<line x1="0" y1="33.33" x2="100" y2="33.33" stroke="rgba(255,255,255,0.3)" stroke-width="0.35"/>' +
      '<line x1="0" y1="66.66" x2="100" y2="66.66" stroke="rgba(255,255,255,0.3)" stroke-width="0.35"/>' +
      '<line x1="0" y1="33.33" x2="100" y2="33.33" stroke="#007AFF" stroke-width="0.9"/>' +
      '</svg>';

    fxRoot.querySelector('#hl6-toolkit-exit').addEventListener('click', function (e) {
      e.stopPropagation();
      closeDemo();
    });

    fxRoot.addEventListener('pointerdown', onAfTap, { passive: false });
    exposureRange.addEventListener('input', onExposureInput);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mode) closeDemo();
    });

    window.addEventListener('resize', function () {
      if (mode === 'aeaf' && afHole) placeAfLock(afHole.cx, afHole.cy);
    });
  }

  function cacheFxRefs() {
    hint = fxRoot.querySelector('#hl6-toolkit-hint');
    afBox = fxRoot.querySelector('#hl6-af-box');
    sharpWindow = fxRoot.querySelector('#hl6-sharp-window');
    gridOverlay = fxRoot.querySelector('#hl6-grid-overlay');
    headroomZone = fxRoot.querySelector('#hl6-headroom-zone');
    exposureUi = fxRoot.querySelector('#hl6-exposure-ui');
    exposureRange = fxRoot.querySelector('#hl6-exposure-range');
    exposureValue = fxRoot.querySelector('#hl6-exposure-value');
  }

  function clearAfLock() {
    afHole = null;
    if (panel) {
      panel.style.filter = '';
      panel.style.webkitFilter = '';
    }
    if (sharpWindow) {
      sharpWindow.innerHTML = '';
      sharpWindow.setAttribute('data-visible', '0');
    }
    if (afBox) afBox.setAttribute('data-visible', '0');
  }

  function resetFx() {
    if (!section) return;
    section.removeAttribute('data-hl6-locked');
    section.removeAttribute('data-hl6-demo');
    section.style.filter = '';
    clearAfLock();
    if (gridOverlay) gridOverlay.setAttribute('data-visible', '0');
    if (headroomZone) headroomZone.setAttribute('data-visible', '0');
    if (exposureUi) exposureUi.setAttribute('data-visible', '0');
    if (exposureRange) exposureRange.value = '0';
    if (exposureValue) exposureValue.textContent = '0';
    if (fxRoot) {
      fxRoot.setAttribute('data-active', '0');
      fxRoot.removeAttribute('data-mode');
    }
  }

  function closeDemo() {
    mode = null;
    resetFx();
    cardButtons.forEach(function (b) {
      b.classList.remove('hl6-toolkit-card-active');
    });
  }

  function openDemo(demoMode, cardBtn) {
    if (!section) return;
    if (mode === demoMode) {
      closeDemo();
      return;
    }

    closeDemo();
    buildFxLayer();
    mode = demoMode;
    section.setAttribute('data-hl6-demo', demoMode);
    fxRoot.setAttribute('data-active', '1');
    fxRoot.setAttribute('data-mode', demoMode);

    cardButtons.forEach(function (b) {
      b.classList.remove('hl6-toolkit-card-active');
    });
    if (cardBtn) cardBtn.classList.add('hl6-toolkit-card-active');

    if (demoMode === 'aeaf') {
      hint.textContent = 'Tap once — clear inside the box, blurry outside';
    } else if (demoMode === 'exposure') {
      hint.textContent = 'Slide to change brightness on this whole slide';
      exposureUi.setAttribute('data-visible', '1');
      onExposureInput();
    } else if (demoMode === 'headroom') {
      hint.textContent = 'Rule of thirds — eyes in the top third (blue band)';
      gridOverlay.setAttribute('data-visible', '1');
      headroomZone.setAttribute('data-visible', '1');
    }

    syncSlideWatch();
  }

  function focusBoxSize() {
    var vmin = Math.min(window.innerWidth, window.innerHeight);
    return Math.max(170, Math.min(Math.round(vmin * 0.24), 280));
  }

  function placeAfLock(clientX, clientY) {
    if (!panel || !sharpWindow) return;

    var size = focusBoxSize();
    var pad = 12;
    var half = size / 2;

    var left = Math.max(pad, Math.min(window.innerWidth - size - pad, clientX - half));
    var top = Math.max(pad, Math.min(window.innerHeight - size - pad, clientY - half));
    var cx = left + half;
    var cy = top + half;

    afHole = { cx: cx, cy: cy, left: left, top: top, size: size };

    panel.style.filter = 'blur(8px)';
    panel.style.webkitFilter = 'blur(8px)';
    panel.style.transition = 'filter 0.2s ease';

    sharpWindow.innerHTML = '';
    var clone = panel.cloneNode(true);
    clone.classList.add('hl6-sharp-clone');
    clone.style.filter = 'none';
    clone.style.webkitFilter = 'none';
    clone.style.pointerEvents = 'none';
    clone.setAttribute('aria-hidden', 'true');

    var rect = panel.getBoundingClientRect();
    clone.style.position = 'absolute';
    clone.style.left = rect.left - left + 'px';
    clone.style.top = rect.top - top + 'px';
    clone.style.width = rect.width + 'px';
    clone.style.height = rect.height + 'px';
    clone.style.margin = '0';

    sharpWindow.appendChild(clone);
    sharpWindow.style.left = left + 'px';
    sharpWindow.style.top = top + 'px';
    sharpWindow.style.width = size + 'px';
    sharpWindow.style.height = size + 'px';
    sharpWindow.setAttribute('data-visible', '1');

    afBox.style.left = cx + 'px';
    afBox.style.top = cy + 'px';
    afBox.style.width = size + 'px';
    afBox.style.height = size + 'px';
    afBox.setAttribute('data-visible', '1');

    section.setAttribute('data-hl6-locked', '1');
    hint.textContent = 'AE/AF LOCK — tap again to move focus';
  }

  function onAfTap(e) {
    if (mode !== 'aeaf') return;
    if (!e.isPrimary) return;
    if (e.target.closest('#hl6-toolkit-exit') || e.target.closest('#hl6-exposure-ui')) return;

    var now = Date.now();
    if (now - lastTapTime < 280) return;
    lastTapTime = now;

    if (e.pointerType === 'touch') e.preventDefault();

    placeAfLock(e.clientX, e.clientY);
  }

  function onExposureInput() {
    var v = parseInt(exposureRange.value, 10);
    var brightness = 1 + v / 100;
    section.style.filter = 'brightness(' + brightness + ')';
    exposureValue.textContent = v > 0 ? '+' + v : String(v);
    if (v < -30) hint.textContent = 'Darker — moody (whole slide)';
    else if (v > 30) hint.textContent = 'Brighter — light and open (whole slide)';
    else hint.textContent = 'Slide to change brightness on this whole slide';
  }

  function syncSlideWatch() {
    if (currentSlideIndex() !== 1 && mode) closeDemo();
    if (mode && fxRoot) {
      fxRoot.setAttribute('data-active', currentSlideIndex() === 1 ? '1' : '0');
    }
  }

  function bind() {
    panel = document.querySelector('[data-slide="1"]');
    if (!panel) return false;
    section = panel.querySelector('section');
    if (!section) return false;
    if (panel.dataset.hl6ToolkitBound === '3') return true;

    buildFxLayer();

    cardButtons = Array.from(panel.querySelectorAll('.grid button')).slice(0, 3);
    if (cardButtons.length < 3) return false;

    var modes = ['aeaf', 'exposure', 'headroom'];
    cardButtons.forEach(function (btn, i) {
      btn.type = 'button';
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (currentSlideIndex() !== 1) return;
        openDemo(modes[i], btn);
      });
    });

    if (getTrack()) setInterval(syncSlideWatch, 200);

    panel.dataset.hl6ToolkitBound = '3';
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
