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
  var slidesEl;
  var gridLayer;
  var progressDotsEl;
  var slideCounterEl;
  var cursorDot;
  var startBtn;

  var order = [];
  var orderPos = 0;
  var slideEls = [];
  var activePhotoIndex = -1;
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

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function mountLanding() {
    root = document.createElement('div');
    root.id = 'hl6-landing';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Lesson introduction');
    root.innerHTML =
      '<motion.div class="hl6-landing-slides" id="hl6-landing-slides" aria-hidden="true"></div>' +
      '<div class="hl6-landing-grid is-hidden" id="hl6-landing-grid">' +
      '<svg class="hl6-landing-grid-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">' +
      '<line class="hl6-landing-grid-line" id="hl6-landing-line-h1" x1="0" y1="33.333" x2="100" y2="33.333" pathLength="1"/>' +
      '<line class="hl6-landing-grid-line" id="hl6-landing-line-h2" x1="0" y1="66.666" x2="100" y2="66.666" pathLength="1"/>' +
      '<line class="hl6-landing-grid-line" id="hl6-landing-line-v1" x1="33.333" y1="0" x2="33.333" y2="100" pathLength="1"/>' +
      '<line class="hl6-landing-grid-line" id="hl6-landing-line-v2" x1="66.666" y1="0" x2="66.666" y2="100" pathLength="1"/>' +
      '</svg>' +
      '<motion.div class="hl6-landing-dots" aria-hidden="true">' +
      '<span class="hl6-landing-ix hl6-landing-ix--tl" id="hl6-landing-dot-tl"></span>' +
      '<span class="hl6-landing-ix hl6-landing-ix--tr" id="hl6-landing-dot-tr"></span>' +
      '<span class="hl6-landing-ix hl6-landing-ix--bl" id="hl6-landing-dot-bl"></span>' +
      '<span class="hl6-landing-ix hl6-landing-ix--br" id="hl6-landing-dot-br"></span>' +
      '</motion.div></motion.div>' +
      '<motion.div class="hl6-landing-corners" aria-hidden="true">' +
      '<span class="hl6-landing-corner hl6-landing-corner--tl"></span>' +
      '<span class="hl6-landing-corner hl6-landing-corner--tr"></span>' +
      '<span class="hl6-landing-corner hl6-landing-corner--bl"></span>' +
      '<span class="hl6-landing-corner hl6-landing-corner--br"></span>' +
      '</motion.div>' +
      '<motion.div class="hl6-landing-vignette" aria-hidden="true"></motion.div>' +
      '<motion.div class="hl6-landing-grain" aria-hidden="true"></motion.div>' +
      '<header class="hl6-landing-brand-top">' +
      '<span class="hl6-landing-school">HARTBURN PRIMARY SCHOOL</span>' +
      '<span class="hl6-landing-divider" aria-hidden="true"></span>' +
      '<span class="hl6-landing-mr">Mr. White</span>' +
      '</header>' +
      '<motion.div class="hl6-landing-copy">' +
      '<p class="hl6-landing-label">COMPUTING / PHOTOGRAPHY</p>' +
      '<h1 class="hl6-landing-title">PORTRAIT PHOTOGRAPHY</h1>' +
      '<p class="hl6-landing-sub">Learning Focus — Rule of Thirds</p>' +
      '<button type="button" class="hl6-landing-start" id="hl6-landing-start">' +
      'START LESSON' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' +
      '</button>' +
      '</motion.div>' +
      '<nav class="hl6-landing-progress" id="hl6-landing-progress" aria-label="Slide progress"></nav>' +
      '<motion.div class="hl6-landing-counter" id="hl6-landing-counter" aria-live="polite">01 / 05</motion.div>';

    root.innerHTML = root.innerHTML.split('motion.div').join('div');

    cursorDot = document.createElement('div');
    cursorDot.id = 'hl6-landing-cursor';
    cursorDot.setAttribute('aria-hidden', 'true');

    document.body.appendChild(root);
    document.body.appendChild(cursorDot);

    slidesEl = document.getElementById('hl6-landing-slides');
    gridLayer = document.getElementById('hl6-landing-grid');
    progressDotsEl = document.getElementById('hl6-landing-progress');
    slideCounterEl = document.getElementById('hl6-landing-counter');
    startBtn = document.getElementById('hl6-landing-start');
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

  function buildProgressDots() {
    PHOTOS.forEach(function (_, i) {
      var dot = document.createElement('span');
      dot.className = 'hl6-landing-progress-dot';
      dot.dataset.photoIndex = String(i);
      progressDotsEl.appendChild(dot);
    });
  }

  function updateUI() {
    var dots = progressDotsEl.querySelectorAll('.hl6-landing-progress-dot');
    dots.forEach(function (d) {
      d.classList.toggle('is-active', Number(d.dataset.photoIndex) === activePhotoIndex);
    });
    slideCounterEl.textContent = pad2(orderPos + 1) + ' / ' + pad2(PHOTOS.length);
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
    activePhotoIndex = photoIndex;
    slideEls.forEach(function (s, i) {
      s.classList.toggle('is-active', i === photoIndex);
    });
    updateUI();
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
    buildProgressDots();
    busy = true;
    activateSlide(order[0], true);
  }

  function startLesson() {
    if (!root) return;
    stopSlideshow();
    if (root) root.classList.add('is-exiting');
    document.documentElement.classList.remove('hl6-landing-active');

    setTimeout(function () {
      if (root && root.parentNode) root.parentNode.removeChild(root);
      if (cursorDot && cursorDot.parentNode) cursorDot.parentNode.removeChild(cursorDot);
      root = null;
    }, EXIT_MS);

    try {
      sessionStorage.setItem('hl6-lesson-started', '1');
    } catch (e) {}
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
    bindEvents();

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
