/**
 * Full-screen intro landing overlay. "Start Lesson" reveals the main lesson in-place.
 */
(function () {
  'use strict';

  var PHOTOS = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1920&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=1920&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1920&q=85&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1920&q=85&auto=format&fit=crop'
  ];

  var KB_CLASSES = ['kb-a', 'kb-b', 'kb-c', 'kb-d'];
  var LINE_IDS = ['hl6-landing-line-h1', 'hl6-landing-line-h2', 'hl6-landing-line-v1', 'hl6-landing-line-v2'];
  var LINE_DEFS = {
    'hl6-landing-line-h1': { x1: 0, y1: 33.333, x2: 100, y2: 33.333 },
    'hl6-landing-line-h2': { x1: 0, y1: 66.666, x2: 100, y2: 66.666 },
    'hl6-landing-line-v1': { x1: 33.333, y1: 0, x2: 33.333, y2: 100 },
    'hl6-landing-line-v2': { x1: 66.666, y1: 0, x2: 66.666, y2: 100 }
  };
  var DOT_IDS = ['hl6-landing-dot-tl', 'hl6-landing-dot-tr', 'hl6-landing-dot-bl', 'hl6-landing-dot-br'];
  var EXIT_MS = 1100;

  var root;
  var chromeEl;
  var slidesEl;
  var gridLayer;
  var startBtn;
  var fullscreenBtn;

  var order = [];
  var orderPos = 0;
  var slideEls = [];
  var displayTimer = null;
  var gridTimers = [];
  var gridLoopActive = false;
  var gridDotsShown = false;
  var destroyed = false;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function mountLanding() {
    root = document.createElement('div');
    root.id = 'hl6-landing';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Lesson introduction');
    root.innerHTML =
      '<div class="hl6-landing-slides" id="hl6-landing-slides" aria-hidden="true"></div>' +
      '<div class="hl6-landing-grid" id="hl6-landing-grid">' +
      '<svg class="hl6-landing-grid-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' +
      '<line class="hl6-landing-grid-line" id="hl6-landing-line-h1" x1="0" y1="33.333" x2="100" y2="33.333" pathLength="1"/>' +
      '<line class="hl6-landing-grid-line" id="hl6-landing-line-h2" x1="0" y1="66.666" x2="100" y2="66.666" pathLength="1"/>' +
      '<line class="hl6-landing-grid-line" id="hl6-landing-line-v1" x1="33.333" y1="0" x2="33.333" y2="100" pathLength="1"/>' +
      '<line class="hl6-landing-grid-line" id="hl6-landing-line-v2" x1="66.666" y1="0" x2="66.666" y2="100" pathLength="1"/>' +
      '</svg>' +
      '<div class="hl6-landing-dots" aria-hidden="true">' +
      '<span class="hl6-landing-ix hl6-landing-ix--tl" id="hl6-landing-dot-tl"></span>' +
      '<span class="hl6-landing-ix hl6-landing-ix--tr" id="hl6-landing-dot-tr"></span>' +
      '<span class="hl6-landing-ix hl6-landing-ix--bl" id="hl6-landing-dot-bl"></span>' +
      '<span class="hl6-landing-ix hl6-landing-ix--br" id="hl6-landing-dot-br"></span>' +
      '</div></div>' +
      '<div class="hl6-landing-corners" aria-hidden="true">' +
      '<span class="hl6-landing-corner hl6-landing-corner--tl"></span>' +
      '<span class="hl6-landing-corner hl6-landing-corner--tr"></span>' +
      '<span class="hl6-landing-corner hl6-landing-corner--bl"></span>' +
      '<span class="hl6-landing-corner hl6-landing-corner--br"></span>' +
      '</div>';

    document.body.appendChild(root);

    slidesEl = document.getElementById('hl6-landing-slides');
    gridLayer = document.getElementById('hl6-landing-grid');
  }

  function mountChrome() {
    chromeEl = document.createElement('div');
    chromeEl.id = 'hl6-landing-chrome';
    chromeEl.innerHTML =
      '<button type="button" class="hl6-landing-fs-btn" id="hl6-landing-fullscreen-btn" title="Enter Fullscreen" aria-label="Enter Fullscreen">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M8 3H5a2 2 0 0 0-2 2v3"></path><path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>' +
      '<path d="M3 16v3a2 2 0 0 0 2 2h3"></path><path d="M16 21h3a2 2 0 0 0 2-2v-3"></path></svg></button>' +
      '<button type="button" class="hl6-landing-start" id="hl6-landing-start">' +
      'ENTER LESSON' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' +
      '</button>';
    document.body.appendChild(chromeEl);
    startBtn = document.getElementById('hl6-landing-start');
    fullscreenBtn = document.getElementById('hl6-landing-fullscreen-btn');
  }

  function buildOrder() {
    order = shuffle(PHOTOS.map(function (_, i) { return i; }));
    orderPos = 0;
  }

  function buildSlides() {
    PHOTOS.forEach(function (url, i) {
      var slide = document.createElement('div');
      slide.className = 'hl6-landing-slide';
      slide.dataset.index = String(i);
      var img = document.createElement('img');
      img.src = url;
      img.alt = '';
      img.decoding = 'async';
      img.loading = i === 0 ? 'eager' : 'lazy';
      slide.appendChild(img);
      slidesEl.appendChild(slide);
      slideEls.push(slide);
    });
  }

  function clearGridTimers() {
    gridTimers.forEach(clearTimeout);
    gridTimers = [];
  }

  function setLineDrawDirection(id, fromCanonicalStart) {
    var line = document.getElementById(id);
    var d = LINE_DEFS[id];
    if (!line || !d) return;
    if (fromCanonicalStart) {
      line.setAttribute('x1', d.x1);
      line.setAttribute('y1', d.y1);
      line.setAttribute('x2', d.x2);
      line.setAttribute('y2', d.y2);
    } else {
      line.setAttribute('x1', d.x2);
      line.setAttribute('y1', d.y2);
      line.setAttribute('x2', d.x1);
      line.setAttribute('y2', d.y1);
    }
  }

  function resetGridLines() {
    LINE_IDS.forEach(function (id) {
      var line = document.getElementById(id);
      if (!line) return;
      line.classList.remove('is-drawn');
      line.style.transitionDuration = '';
      line.style.transitionTimingFunction = '';
    });
  }

  function showGridDots() {
    if (gridDotsShown) return;
    gridDotsShown = true;
    DOT_IDS.forEach(function (id, i) {
      gridTimers.push(setTimeout(function () {
        if (!gridLoopActive) return;
        var dot = document.getElementById(id);
        if (dot) dot.classList.add('is-visible');
      }, i * 100));
    });
  }

  function runGridDrawLoop() {
    if (destroyed || !gridLoopActive) return;
    clearGridTimers();
    gridLoopActive = true;
    resetGridLines();

    var sequence = shuffle(LINE_IDS.slice());
    var step = 0;

    function nextLine() {
      if (destroyed || !gridLoopActive) return;
      if (step >= sequence.length) {
        showGridDots();
        gridTimers.push(setTimeout(function () {
          if (destroyed || !gridLoopActive) return;
          runGridDrawLoop();
        }, randInt(1200, 3200)));
        return;
      }
      var delay = step === 0 ? randInt(650, 1500) : randInt(380, 1450);
      gridTimers.push(setTimeout(function () {
        if (destroyed || !gridLoopActive) return;
        var lineId = sequence[step];
        var line = document.getElementById(lineId);
        if (line) {
          setLineDrawDirection(lineId, Math.random() > 0.5);
          line.style.transitionDuration = rand(0.7, 1.4).toFixed(2) + 's';
          line.style.transitionTimingFunction = Math.random() > 0.45
            ? 'cubic-bezier(0.4, 0, 0.2, 1)'
            : 'cubic-bezier(0.22, 0.85, 0.32, 1)';
          line.classList.add('is-drawn');
        }
        step += 1;
        nextLine();
      }, delay));
    }
    nextLine();
  }

  function initPersistentGrid() {
    if (destroyed || gridLoopActive) return;
    gridLoopActive = true;
    runGridDrawLoop();
  }

  function applyKenBurns(slide) {
    var img = slide.querySelector('img');
    KB_CLASSES.forEach(function (c) { img.classList.remove(c); });
    img.style.animation = 'none';
    void img.offsetWidth;
    img.style.animationDuration = rand(14, 28).toFixed(2) + 's';
    img.classList.add(KB_CLASSES[randInt(0, KB_CLASSES.length - 1)]);
  }

  function scheduleHold() {
    if (destroyed) return;
    if (displayTimer) clearTimeout(displayTimer);
    displayTimer = setTimeout(advanceSlide, rand(7, 14) * 1000);
  }

  function activateSlide(photoIndex) {
    if (destroyed) return;
    slideEls.forEach(function (s, i) {
      s.classList.toggle('is-active', i === photoIndex);
    });
    applyKenBurns(slideEls[photoIndex]);
    scheduleHold();
  }

  function goToNextSlide() {
    if (destroyed) return;
    if (displayTimer) {
      clearTimeout(displayTimer);
      displayTimer = null;
    }
    orderPos += 1;
    if (orderPos >= order.length) {
      buildOrder();
      orderPos = 0;
    }
    activateSlide(order[orderPos]);
  }

  function advanceSlide() {
    goToNextSlide();
  }

  function stopSlideshow() {
    destroyed = true;
    gridLoopActive = false;
    if (displayTimer) {
      clearTimeout(displayTimer);
      displayTimer = null;
    }
    clearGridTimers();
  }

  function startSlideshow() {
    buildOrder();
    buildSlides();
    initPersistentGrid();
    activateSlide(order[0]);
  }

  function startLesson() {
    if (!root) return;
    stopSlideshow();
    if (root) root.classList.add('is-exiting');
    if (chromeEl) chromeEl.classList.add('is-exiting');
    document.documentElement.classList.remove('hl6-landing-active');

    setTimeout(function () {
      if (root && root.parentNode) root.parentNode.removeChild(root);
      if (chromeEl && chromeEl.parentNode) chromeEl.parentNode.removeChild(chromeEl);
      root = null;
      chromeEl = null;
    }, EXIT_MS);

    try {
      sessionStorage.setItem('hl6-lesson-started', '1');
    } catch (e) {}
  }

  function updateFullscreenIcon(isFull) {
    if (!fullscreenBtn) return;
    fullscreenBtn.title = isFull ? 'Exit Fullscreen' : 'Enter Fullscreen';
    fullscreenBtn.setAttribute('aria-label', fullscreenBtn.title);
    var svg = fullscreenBtn.querySelector('svg');
    if (!svg) return;
    if (isFull) {
      svg.innerHTML =
        '<path d="M8 3v3a2 2 0 0 1-2 2H3"></path><path d="M21 8h-3a2 2 0 0 1-2-2V3"></path>' +
        '<path d="M3 16h3a2 2 0 0 1 2 2v3"></path><path d="M16 21v-3a2 2 0 0 1 2-2h3"></path>';
    } else {
      svg.innerHTML =
        '<path d="M8 3H5a2 2 0 0 0-2 2v3"></path><path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>' +
        '<path d="M3 16v3a2 2 0 0 0 2 2h3"></path><path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>';
    }
  }

  function initLandingFullscreen() {
    if (!fullscreenBtn) return;
    fullscreenBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(function () {
          updateFullscreenIcon(true);
        }).catch(function () {});
      } else {
        document.exitFullscreen().then(function () {
          updateFullscreenIcon(false);
        }).catch(function () {});
      }
    });
    document.addEventListener('fullscreenchange', function () {
      if (!document.documentElement.classList.contains('hl6-landing-active')) return;
      updateFullscreenIcon(!!document.fullscreenElement);
    });
  }

  function bindEvents() {
    startBtn.addEventListener('click', function (e) {
      e.preventDefault();
      startLesson();
    });
    initLandingFullscreen();
  }

  function ensureBrandVisible() {
    function tick(n) {
      var cluster = document.getElementById('hl6-brand-cluster');
      if (cluster) {
        if (window.hl6SyncBrandSize) window.hl6SyncBrandSize();
        else window.dispatchEvent(new Event('resize'));
        return;
      }
      if (n <= 0) return;
      setTimeout(function () {
        tick(n - 1);
      }, 100);
    }
    tick(80);
  }

  function shouldSkipLanding() {
    try {
      if (sessionStorage.getItem('hl6-lesson-started') === '1') return true;
    } catch (e) {}
    if (window.location.hash === '#lesson') return true;
    return false;
  }

  function boot() {
    if (shouldSkipLanding()) {
      document.documentElement.classList.remove('hl6-landing-active');
      return;
    }

    document.documentElement.classList.add('hl6-landing-active');
    mountLanding();
    mountChrome();
    bindEvents();
    ensureBrandVisible();

    PHOTOS.forEach(function (url) {
      var img = new Image();
      img.src = url;
    });

    startSlideshow();
  }

  window.hl6StartLesson = startLesson;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
