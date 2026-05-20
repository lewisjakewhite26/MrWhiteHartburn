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
  var DOT_IDS = ['hl6-landing-dot-tl', 'hl6-landing-dot-tr', 'hl6-landing-dot-bl', 'hl6-landing-dot-br'];
  var GRID_FADE_MS = 850;
  var CROSSFADE_MS = 2500;
  var EXIT_MS = 1100;

  var root;
  var chromeEl;
  var slidesEl;
  var gridLayer;
  var cursorDot;
  var startBtn;
  var fullscreenBtn;

  var order = [];
  var orderPos = 0;
  var slideEls = [];
  var displayTimer = null;
  var gridTimers = [];
  var busy = false;
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
      '<div class="hl6-landing-grid is-hidden" id="hl6-landing-grid">' +
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

    cursorDot = document.createElement('div');
    cursorDot.id = 'hl6-landing-cursor';
    cursorDot.setAttribute('aria-hidden', 'true');

    document.body.appendChild(root);
    document.body.appendChild(cursorDot);

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

  function resetGrid() {
    clearGridTimers();
    LINE_IDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove('is-drawn');
    });
    DOT_IDS.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.remove('is-visible');
    });
  }

  function drawGrid() {
    if (destroyed) return;
    resetGrid();
    gridLayer.classList.remove('is-hidden');

    var step = 0;
    function nextLine() {
      if (destroyed) return;
      if (step >= LINE_IDS.length) {
        DOT_IDS.forEach(function (id, i) {
          gridTimers.push(setTimeout(function () {
            if (destroyed) return;
            var dot = document.getElementById(id);
            if (dot) dot.classList.add('is-visible');
          }, i * 100));
        });
        return;
      }
      var delay = step === 0 ? 350 : randInt(500, 1200);
      gridTimers.push(setTimeout(function () {
        if (destroyed) return;
        var line = document.getElementById(LINE_IDS[step]);
        if (line) line.classList.add('is-drawn');
        step += 1;
        nextLine();
      }, delay));
    }
    nextLine();
  }

  function hideGrid(done) {
    clearGridTimers();
    resetGrid();
    gridLayer.classList.add('is-hidden');
    setTimeout(done, GRID_FADE_MS);
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

  function activateSlide(photoIndex, isFirst) {
    if (destroyed) return;
    slideEls.forEach(function (s, i) {
      s.classList.toggle('is-active', i === photoIndex);
    });
    applyKenBurns(slideEls[photoIndex]);

    setTimeout(function () {
      if (destroyed) return;
      drawGrid();
      scheduleHold();
      busy = false;
    }, isFirst ? 300 : CROSSFADE_MS);
  }

  function goToNextSlide() {
    if (destroyed || busy) return;
    busy = true;
    if (displayTimer) {
      clearTimeout(displayTimer);
      displayTimer = null;
    }

    hideGrid(function () {
      if (destroyed) return;
      orderPos += 1;
      if (orderPos >= order.length) {
        buildOrder();
        orderPos = 0;
      }
      activateSlide(order[orderPos], false);
    });
  }

  function advanceSlide() {
    goToNextSlide();
  }

  function stopSlideshow() {
    destroyed = true;
    if (displayTimer) {
      clearTimeout(displayTimer);
      displayTimer = null;
    }
    clearGridTimers();
  }

  function startSlideshow() {
    buildOrder();
    buildSlides();
    busy = true;
    activateSlide(order[0], true);
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
      if (cursorDot && cursorDot.parentNode) cursorDot.parentNode.removeChild(cursorDot);
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
    document.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mousemove', onPointerMove, { passive: true });
    startBtn.addEventListener('click', function (e) {
      e.preventDefault();
      startLesson();
    });
    startBtn.addEventListener('mouseenter', function () {
      cursorDot.classList.add('is-over-link');
    });
    startBtn.addEventListener('mouseleave', function () {
      cursorDot.classList.remove('is-over-link');
    });
    fullscreenBtn.addEventListener('mouseenter', function () {
      cursorDot.classList.add('is-over-link');
    });
    fullscreenBtn.addEventListener('mouseleave', function () {
      cursorDot.classList.remove('is-over-link');
    });
    initLandingFullscreen();
  }

  function moveCursorDot(clientX, clientY) {
    if (!cursorDot || !document.documentElement.classList.contains('hl6-landing-active')) return;
    var size = cursorDot.classList.contains('is-over-link') ? 14 : 8;
    var half = size / 2;
    cursorDot.style.left = (clientX - half) + 'px';
    cursorDot.style.top = (clientY - half) + 'px';
    cursorDot.classList.add('is-visible');
  }

  function onPointerMove(e) {
    moveCursorDot(e.clientX, e.clientY);
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
