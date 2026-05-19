/**
 * Hartburn Year 4 — rule of thirds copy, criteria tiers, small teach/share timers.
 * Revert: restore .backup-before-lesson-updates files and remove this + CSS from HTML.
 */
(function () {
  var TEACH_SEC = 6 * 60;
  var SHARE_SEC = 6 * 60;

  function getTrack() {
    return (
      document.getElementById('lesson-slide-track') ||
      (function () {
        var a = document.querySelector('[data-slide="0"]');
        return a ? a.parentElement : null;
      })()
    );
  }

  function currentSlideIndex(track) {
    var style = track.getAttribute('style') || '';
    var m = /translateX\(\s*-?(\d+(?:\.\d+)?)%\s*\)/i.exec(style);
    if (m) return Math.round(parseFloat(m[1]) / 100);
    return 0;
  }

  function gridSvg() {
    return (
      '<svg class="hl6-grid-svg" viewBox="0 0 100 100" aria-hidden="true">' +
      '<rect width="100" height="100" fill="rgba(255,255,255,0.04)"/>' +
      '<line x1="33.3" y1="0" x2="33.3" y2="100" stroke="rgba(0,122,255,0.55)" stroke-width="1"/>' +
      '<line x1="66.6" y1="0" x2="66.6" y2="100" stroke="rgba(0,122,255,0.55)" stroke-width="1"/>' +
      '<line x1="0" y1="33.3" x2="100" y2="33.3" stroke="rgba(0,122,255,0.55)" stroke-width="1"/>' +
      '<line x1="0" y1="66.6" x2="100" y2="66.6" stroke="rgba(0,122,255,0.55)" stroke-width="1"/>' +
      '<circle cx="66.6" cy="33.3" r="4" fill="#007AFF" opacity="0.9"/>' +
      '</svg>'
    );
  }

  function injectHero() {
    var panel = document.querySelector('[data-slide="0"]');
    if (!panel || panel.querySelector('.hl6-rot-banner')) return;
    var section = panel.querySelector('section');
    if (!section) return;
    var inner = section.querySelector('.relative.z-10');
    if (!inner) return;
    var box = document.createElement('div');
    box.className = 'hl6-inject hl6-rot-banner';
    box.setAttribute('data-hl6', 'hero-rot');
    box.innerHTML =
      '<h3>Learning focus — Rule of Thirds</h3>' +
      '<p>Divide the frame into a 3×3 grid. Place your subject\'s <strong>eyes on the top horizontal line</strong> — that gives balanced headroom and a clear focal point.</p>' +
      '<div class="hl6-grid-demo">' +
      gridSvg() +
      '<p style="margin:0;font-size:0.75rem;max-width:14rem;text-align:left;color:rgba(255,255,255,0.65)">Blue dot = where eyes often sit in a strong portrait.</p>' +
      '</div>';
    var sub = inner.querySelector('p');
    if (sub && sub.nextSibling) {
      sub.parentNode.insertBefore(box, sub.nextSibling);
    } else {
      inner.appendChild(box);
    }
  }

  function injectToolkitNote() {
    var panel = document.querySelector('[data-slide="1"]');
    if (!panel || panel.querySelector('.hl6-toolkit-note')) return;
    var container = panel.querySelector('.mx-auto.max-w-7xl');
    if (!container) return;
    var heading = container.querySelector('h2');
    if (!heading) return;
    var note = document.createElement('div');
    note.className = 'hl6-inject hl6-toolkit-note';
    note.setAttribute('data-hl6', 'toolkit-rot');
    note.innerHTML =
      '<strong style="color:#007AFF">Rule of thirds in portraits:</strong> ' +
      'Headroom means leaving space above the head — with eyes in the <strong>top third</strong>, composition stays balanced. AE/AF lock and exposure support that shot.';
    heading.parentNode.insertBefore(note, heading.nextElementSibling);
  }

  function injectCriteriaTiers() {
    var panel = document.querySelector('[data-slide="4"]');
    if (!panel || panel.querySelector('.hl6-criteria-tiers')) return;
    var container = panel.querySelector('.mx-auto.max-w-4xl');
    if (!container) return;
    var cards = container.querySelectorAll('.rounded-2xl.border');
    var mainCard = cards[0];
    if (!mainCard) return;
    var wrap = document.createElement('div');
    wrap.className = 'hl6-inject hl6-criteria-tiers';
    wrap.setAttribute('data-hl6', 'criteria');
    wrap.innerHTML =
      '<div class="hl6-tier" data-tier="all">I can take one portrait where my subject\'s eyes sit in the top third of the frame.</div>' +
      '<div class="hl6-tier" data-tier="most">I can take three portraits using different styles and explain my compositional choices.</div>' +
      '<div class="hl6-tier" data-tier="some">I can select my best portrait, edit it to change the mood, and explain what I changed and why.</div>';
    var headingBlock = container.querySelector('.mb-16.text-center');
    if (headingBlock && headingBlock.nextElementSibling) {
      container.insertBefore(wrap, headingBlock.nextElementSibling);
    } else {
      mainCard.parentNode.insertBefore(wrap, mainCard);
    }
  }

  /* ——— Timers ——— */
  var timerState = {
    phase: null,
    remaining: 0,
    running: false,
    interval: null,
    warned: false,
  };

  function formatTime(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function buildTimerBar() {
    if (document.getElementById('hl6-timer-bar')) return document.getElementById('hl6-timer-bar');
    var bar = document.createElement('div');
    bar.id = 'hl6-timer-bar';
    bar.innerHTML =
      '<span id="hl6-timer-phase">TEACH</span>' +
      '<span id="hl6-timer-display">6:00</span>' +
      '<button type="button" id="hl6-timer-start" title="Start / pause">▶</button>' +
      '<button type="button" id="hl6-timer-reset" title="Reset">↺</button>';
    document.body.appendChild(bar);

    bar.querySelector('#hl6-timer-start').addEventListener('click', function () {
      if (timerState.running) pauseTimer();
      else startTimer();
    });
    bar.querySelector('#hl6-timer-reset').addEventListener('click', resetTimer);
    return bar;
  }

  function setPhase(phase) {
    var bar = buildTimerBar();
    timerState.phase = phase;
    if (phase === 'teach') {
      bar.setAttribute('data-phase', 'teach');
      bar.querySelector('#hl6-timer-phase').textContent = 'TEACH';
      if (!timerState.running && timerState.remaining === 0) timerState.remaining = TEACH_SEC;
    } else if (phase === 'share') {
      bar.setAttribute('data-phase', 'share');
      bar.querySelector('#hl6-timer-phase').textContent = 'SHARE';
      if (!timerState.running && timerState.remaining === 0) timerState.remaining = SHARE_SEC;
    } else {
      bar.removeAttribute('data-phase');
      bar.querySelector('#hl6-timer-phase').textContent = '—';
    }
    updateTimerDisplay();
  }

  function updateTimerDisplay() {
    var bar = document.getElementById('hl6-timer-bar');
    if (!bar) return;
    var disp = bar.querySelector('#hl6-timer-display');
    if (disp) disp.textContent = formatTime(timerState.remaining);
    if (timerState.remaining <= 60 && timerState.phase) {
      bar.setAttribute('data-warning', '1');
    } else {
      bar.removeAttribute('data-warning');
    }
  }

  function startTimer() {
    if (!timerState.phase) return;
    timerState.running = true;
    var btn = document.querySelector('#hl6-timer-start');
    if (btn) btn.textContent = '❚❚';
    if (timerState.interval) clearInterval(timerState.interval);
    timerState.interval = setInterval(function () {
      if (timerState.remaining > 0) {
        timerState.remaining--;
        updateTimerDisplay();
      } else {
        pauseTimer();
      }
    }, 1000);
  }

  function pauseTimer() {
    timerState.running = false;
    if (timerState.interval) {
      clearInterval(timerState.interval);
      timerState.interval = null;
    }
    var btn = document.querySelector('#hl6-timer-start');
    if (btn) btn.textContent = '▶';
  }

  function resetTimer() {
    pauseTimer();
    timerState.warned = false;
    timerState.remaining =
      timerState.phase === 'share' ? SHARE_SEC : timerState.phase === 'teach' ? TEACH_SEC : 0;
    updateTimerDisplay();
  }

  function syncTimerToSlide(index) {
    var bar = buildTimerBar();
    if (index <= 2) {
      if (timerState.phase !== 'teach') {
        pauseTimer();
        timerState.phase = 'teach';
        timerState.remaining = TEACH_SEC;
        setPhase('teach');
      }
    } else if (index >= 3) {
      if (timerState.phase !== 'share') {
        pauseTimer();
        timerState.phase = 'share';
        timerState.remaining = SHARE_SEC;
        setPhase('share');
      }
    }
    bar.style.display = index <= 4 ? 'flex' : 'none';
  }

  var closePortraitModal = null;

  function watchSlides() {
    var track = getTrack();
    if (!track) return;
    var last = -1;
    function tick() {
      var idx = currentSlideIndex(track);
      if (idx !== last) {
        last = idx;
        syncTimerToSlide(idx);
        if (idx !== 2 && closePortraitModal) closePortraitModal();
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function initFullscreen() {
    var btn = document.getElementById('lesson-fullscreen-btn') || document.querySelector('[title="Enter Fullscreen"]');
    if (!btn) return;
    if (!btn.id) btn.id = 'lesson-fullscreen-btn';
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(function() {
          updateFullscreenUI(true);
        }).catch(function(err) {
          console.error(err);
        });
      } else {
        document.exitFullscreen().then(function() {
          updateFullscreenUI(false);
        });
      }
    });
    document.addEventListener('fullscreenchange', function() {
      updateFullscreenUI(!!document.fullscreenElement);
    });
  }

  function updateFullscreenUI(isFull) {
    var btn = document.getElementById('lesson-fullscreen-btn');
    if (!btn) return;
    btn.title = isFull ? 'Exit Fullscreen' : 'Enter Fullscreen';
    var svg = btn.querySelector('svg');
    if (svg) {
      if (isFull) {
        svg.outerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minimize h-4 w-4 text-white/60"><path d="M8 3v3a2 2 0 0 1-2 2H3"></path><path d="M21 8h-3a2 2 0 0 1-2-2V3"></path><path d="M3 16h3a2 2 0 0 1 2 2v3"></path><path d="M16 21v-3a2 2 0 0 1 2-2h3"></path></svg>';
      } else {
        svg.outerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-maximize h-4 w-4 text-white/60"><path d="M8 3H5a2 2 0 0 0-2 2v3"></path><path d="M21 8V5a2 2 0 0 0-2-2h-3"></path><path d="M3 16v3a2 2 0 0 0 2 2h3"></path><path d="M16 21h3a2 2 0 0 0 2-2v-3"></path></svg>';
      }
    }
  }

  function initKeyboardAndScrollNav() {
    var lastTransitionTime = 0;
    var cooldown = 850;

    function goToSlide(index) {
      var track = getTrack();
      if (!track) return false;
      var slides = track.querySelectorAll('[data-slide]');
      var total = slides.length;
      if (index < 0 || index >= total) return false;
      var dialButtons = document.querySelectorAll('#lesson-dial-root button');
      if (dialButtons[index]) {
        dialButtons[index].click();
        return true;
      }
      return false;
    }

    function goToNextSlide() {
      var track = getTrack();
      if (!track) return false;
      var current = currentSlideIndex(track);
      return goToSlide(current + 1);
    }

    function goToPrevSlide() {
      var track = getTrack();
      if (!track) return false;
      var current = currentSlideIndex(track);
      return goToSlide(current - 1);
    }

    window.addEventListener('keydown', function(e) {
      var modal = document.getElementById('hl6-portrait-modal');
      if (modal && modal.classList.contains('hl6-modal-open')) {
        if (e.key === 'Escape' && closePortraitModal) {
          e.preventDefault();
          closePortraitModal();
        }
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrevSlide();
      }
    });

    window.addEventListener('wheel', function(e) {
      // Only transition on horizontal scrolls, ignore vertical scrolls completely
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      if (Math.abs(e.deltaX) < 15) return;

      if (e.target.closest && (e.target.closest('input[type="range"]') || e.target.closest('[data-hl6-compare-bound]') || e.target.closest('.aspect-\\[16\\/10\\]') || e.target.closest('.max-w-5xl'))) {
        return;
      }
      var now = Date.now();
      if (now - lastTransitionTime < cooldown) return;

      var next = e.deltaX > 0;
      var prev = e.deltaX < 0;

      if (next) {
        if (goToNextSlide()) lastTransitionTime = now;
      } else if (prev) {
        if (goToPrevSlide()) lastTransitionTime = now;
      }
    }, { passive: true });

    var touchStartX = 0;
    var touchStartY = 0;
    var touchStartTime = 0;

    window.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
      touchStartTime = Date.now();
    }, { passive: true });

    window.addEventListener('touchend', function(e) {
      if (e.target.closest && (e.target.closest('input[type="range"]') || e.target.closest('[data-hl6-compare-bound]') || e.target.closest('.hl6-criteria-item') || e.target.closest('.hl6-card') || e.target.closest('.aspect-\\[16\\/10\\]') || e.target.closest('.max-w-5xl'))) {
        return;
      }
      var diffX = e.changedTouches[0].screenX - touchStartX;
      var diffY = e.changedTouches[0].screenY - touchStartY;
      var duration = Date.now() - touchStartTime;
      if (duration < 500 && Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX < 0) {
          goToNextSlide();
        } else {
          goToPrevSlide();
        }
      }
    }, { passive: true });
  }

  function initContent() {
    injectHero();
    // injectToolkitNote();
    injectCriteriaTiers();
    buildTimerBar();
    setPhase('teach');
    initPortraitCards();
    watchSlides();
    initFullscreen();
    initKeyboardAndScrollNav();
  }

  function tryInit(n) {
    if (document.querySelector('[data-slide="0"]')) {
      initContent();
      return;
    }
    if (n <= 0) return;
    setTimeout(function () {
      tryInit(n - 1);
    }, 100);
  }

  var PORTRAIT_DATA = [
    {
      title: "The Direct Link",
      subtitle: "THE 'STARE'",
      color: "#007AFF",
      img: "./Computing lesson 6_files/6108083a4fdade73fcdcecc812dbec10106166ed.png",
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye h-7 w-7" style="color: rgb(0, 122, 255);"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle></svg>',
      details: [
        { label: "THE POSE", text: "Your subject should look straight at the camera. Try a calm face or a small smile—no big 'cheese' smiles!" },
        { label: "TECHNICAL", text: "Remember to lock the focus on the eyes (tap and hold)." },
        { label: "FRAMING", text: "Put the eyes in the top third of your photo. Make sure there's good space above the head." }
      ]
    },
    {
      title: "The Story Scene",
      subtitle: "THE 'CONTEXT'",
      color: "#FF9500",
      img: "./Computing lesson 6_files/3b0375db66beef55266b63ca1e459a1cc24185d4.png",
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-zap h-7 w-7" style="color: rgb(255, 149, 0);"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"></path></svg>',
      details: [
        { label: "THE POSE", text: "Take a photo of your subject in a place that shows what they like (playground, classroom, library, art area)." },
        { label: "TECHNICAL", text: "Move closer or further away to get the right distance. Include things in the background that help tell the story." },
        { label: "FRAMING", text: "Think about what's behind your subject—the background helps tell their story." }
      ]
    },
    {
      title: "The Artistic Emotion",
      subtitle: "THE 'MOOD'",
      color: "#007AFF",
      img: "./Computing lesson 6_files/2b33d968363d178963549ce160de4de20e32958f.png",
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-palette h-7 w-7" style="color: rgb(0, 122, 255);"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>',
      details: [
        { label: "THE POSE", text: "Ask your subject to show a strong feeling just with their face—happy, curious, mysterious, or serious." },
        { label: "TECHNICAL", text: "Use the brightness slider (sun icon). Slide down for dark and mysterious, up for bright and happy." },
        { label: "FRAMING", text: "Let the brightness help show the feeling." }
      ]
    }
  ];

  function initPortraitCards() {
    var modal = document.getElementById('hl6-portrait-modal');
    if (!modal) return;

    if (modal.parentElement !== document.body) {
      document.body.appendChild(modal);
    }

    function openModal(index) {
      if (!modal) return;
      
      var data = PORTRAIT_DATA[index];
      if (!data) return;
      
      var modalImg = document.getElementById('hl6-modal-img');
      var modalTitle = document.getElementById('hl6-modal-title');
      var modalSubtitle = document.getElementById('hl6-modal-subtitle');
      var modalBody = document.getElementById('hl6-modal-body');

      if (modalImg) {
        modalImg.src = data.img;
        modalImg.alt = data.title;
      }
      if (modalTitle) modalTitle.textContent = data.title;
      
      if (modalSubtitle) {
        modalSubtitle.textContent = data.subtitle;
        modalSubtitle.style.color = data.color;
      }
      
      if (modalBody) {
        var html = '';
        data.details.forEach(function (det) {
          html += '<section class="hl6-modal-section" style="border-left-color:' + data.color + '">' +
            '<p class="hl6-modal-section-label">' + det.label + '</p>' +
            '<p class="hl6-modal-section-text">' + det.text + '</p>' +
            '</section>';
        });
        modalBody.innerHTML = html;
      }
      
      modal.setAttribute('aria-hidden', 'false');
      modal.classList.add('hl6-modal-open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      if (!modal) return;
      modal.classList.remove('hl6-modal-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    closePortraitModal = closeModal;
    
    // Attach single delegated click handler to document
    document.addEventListener('click', function (e) {
      // 1. Check if clicked a portrait thumbnail (or inside it)
      var thumb = e.target.closest('.hl6-portrait-thumbnail');
      if (thumb) {
        e.stopPropagation();
        var index = parseInt(thumb.getAttribute('data-card-index'), 10);
        openModal(index);
        return;
      }
      
      // 2. Check if clicked the close button
      var closeBtn = e.target.closest('#hl6-modal-close');
      if (closeBtn) {
        e.stopPropagation();
        closeModal();
        return;
      }
      
      // 3. Backdrop or outside panel closes the modal
      if (e.target.closest('[data-hl6-close="1"]')) {
        e.stopPropagation();
        closeModal();
        return;
      }

      var openModalEl = document.getElementById('hl6-portrait-modal');
      if (openModalEl && openModalEl.classList.contains('hl6-modal-open')) {
        if (!e.target.closest('.hl6-modal-panel')) {
          e.stopPropagation();
          closeModal();
        }
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('hl6-modal-open')) {
        e.preventDefault();
        closeModal();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      tryInit(60);
    });
  } else {
    tryInit(60);
  }
})();

(function () {
  var TOTAL_SEC = 30 * 60;
  var SLIDE_TARGETS = ['By 03:00', 'By 08:00', 'By 22:00', '', 'By 30:00'];

  var elapsed = 0;
  var running = false;
  var tickId = null;
  var lastSlide = -1;

  function getTrack() {
    return (
      document.getElementById('lesson-slide-track') ||
      (function () {
        var first = document.querySelector('[data-slide="0"]');
        return first ? first.parentElement : null;
      })()
    );
  }

  function readSlideIndex() {
    var track = getTrack();
    if (!track) return 0;
    var style = track.getAttribute('style') || '';
    var m = /translateX\(\s*-?(\d+(?:\.\d+)?)%\s*\)/i.exec(style);
    if (m) return Math.round(parseFloat(m[1]) / 100);
    return 0;
  }

  function formatTime(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function render() {
    var root = document.getElementById('hl6-global-timer');
    if (!root) return;
    var disp = document.getElementById('hl6-global-timer-display');
    var target = document.getElementById('hl6-global-timer-target');
    if (disp) disp.textContent = formatTime(elapsed);
    root.setAttribute('data-running', running ? '1' : '0');
    if (target) {
      var idx = readSlideIndex();
      var label = SLIDE_TARGETS[idx] != null ? SLIDE_TARGETS[idx] : '';
      target.textContent = label;
    }
  }

  function pause() {
    running = false;
    if (tickId) {
      clearInterval(tickId);
      tickId = null;
    }
    render();
  }

  function start() {
    if (elapsed >= TOTAL_SEC) return;
    running = true;
    if (tickId) clearInterval(tickId);
    tickId = setInterval(function () {
      if (elapsed < TOTAL_SEC) {
        elapsed++;
        render();
      }
      if (elapsed >= TOTAL_SEC) pause();
    }, 1000);
    render();
  }

  function toggle() {
    if (running) pause();
    else start();
  }

  function reset() {
    pause();
    elapsed = 0;
    render();
  }

  function syncSlideLabel() {
    var idx = readSlideIndex();
    if (idx === lastSlide) return;
    lastSlide = idx;
    render();
  }

  function mount() {
    if (document.getElementById('hl6-global-timer')) return true;

    var root = document.createElement('div');
    root.id = 'hl6-global-timer';
    root.setAttribute('data-running', '0');
    root.innerHTML =
      '<button type="button" id="hl6-global-timer-face" aria-label="Start or pause lesson timer">' +
      '<span id="hl6-global-timer-display">0:00</span>' +
      '<span id="hl6-global-timer-target"></span>' +
      '</button>' +
      '<button type="button" id="hl6-global-timer-reset" aria-label="Reset lesson timer to zero">↺</button>';

    document.body.appendChild(root);

    root.querySelector('#hl6-global-timer-face').addEventListener('click', function (e) {
      e.preventDefault();
      toggle();
    });

    root.querySelector('#hl6-global-timer-reset').addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      reset();
    });

    render();
    return true;
  }

  function watchSlides() {
    function loop() {
      syncSlideLabel();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  function tryBoot(n) {
    if (!getTrack()) {
      if (n <= 0) return;
      setTimeout(function () {
        tryBoot(n - 1);
      }, 100);
      return;
    }
    if (mount()) watchSlides();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      tryBoot(80);
    });
  } else {
    tryBoot(80);
  }
})();

(function () {
  function gridSvg() {
    return (
      '<svg class="hl6-grid-svg" viewBox="0 0 100 100" aria-hidden="true">' +
      '<rect width="100" height="100" fill="rgba(255,255,255,0.04)"/>' +
      '<line x1="33.3" y1="0" x2="33.3" y2="100" stroke="rgba(0,122,255,0.55)" stroke-width="1"/>' +
      '<line x1="66.6" y1="0" x2="66.6" y2="100" stroke="rgba(0,122,255,0.55)" stroke-width="1"/>' +
      '<line x1="0" y1="33.3" x2="100" y2="33.3" stroke="rgba(0,122,255,0.55)" stroke-width="1"/>' +
      '<line x1="0" y1="66.6" x2="100" y2="66.6" stroke="rgba(0,122,255,0.55)" stroke-width="1"/>' +
      '<circle cx="66.6" cy="33.3" r="4" fill="#007AFF" opacity="0.9"/>' +
      '</svg>'
    );
  }

  function setupTagline(panel) {
    var inner = panel.querySelector('.relative.z-10');
    if (!inner) return;
    var paras = inner.querySelectorAll('p');
    for (var i = 0; i < paras.length; i++) {
      var el = paras[i];
      if (el.classList.contains('hl6-hero-tagline')) continue;
      var text = el.textContent || '';
      if (text.indexOf('Learn how to take great portrait') === -1) continue;
      el.classList.add('hl6-hero-tagline');
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        var on = el.getAttribute('data-glow') === '1';
        el.setAttribute('data-glow', on ? '0' : '1');
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          var on = el.getAttribute('data-glow') === '1';
          el.setAttribute('data-glow', on ? '0' : '1');
        }
      });
      break;
    }
  }

  function setupRotModal(panel) {
    if (document.getElementById('hl6-rot-modal')) return;
    var banner = panel.querySelector('.hl6-rot-banner');
    if (!banner || banner.classList.contains('hl6-rot-banner-trigger')) return;

    var modal = document.createElement('div');
    modal.id = 'hl6-rot-modal';
    modal.className = 'hl6-rot-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'hl6-rot-modal-title');
    modal.innerHTML =
      '<div class="hl6-rot-modal-backdrop" data-hl6-rot-close="1"></div>' +
      '<div class="hl6-rot-modal-panel">' +
      '<button type="button" class="hl6-rot-modal-close" aria-label="Close">Close</button>' +
      '<h3 id="hl6-rot-modal-title">Learning focus — Rule of Thirds</h3>' +
      '<p>Divide the frame into a 3×3 grid. Place your subject\'s <strong>eyes on the top horizontal line</strong> — that gives balanced headroom and a clear focal point.</p>' +
      '<div class="hl6-grid-demo">' +
      gridSvg() +
      '<p class="hl6-rot-modal-note">Blue dot = where eyes often sit in a strong portrait.</p>' +
      '</div></div>';

    document.body.appendChild(modal);

    var trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = banner.className + ' hl6-rot-banner-trigger';
    trigger.setAttribute('data-hl6', 'hero-rot');
    trigger.setAttribute('aria-haspopup', 'dialog');
    trigger.setAttribute('aria-controls', 'hl6-rot-modal');
    trigger.innerHTML = '<h3>Learning focus — Rule of Thirds</h3>';
    banner.parentNode.replaceChild(trigger, banner);

    function openRotModal() {
      modal.classList.add('hl6-rot-modal-open');
      modal.setAttribute('aria-hidden', 'false');
    }

    function closeRotModal() {
      modal.classList.remove('hl6-rot-modal-open');
      modal.setAttribute('aria-hidden', 'true');
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      openRotModal();
    });

    var closeBtn = modal.querySelector('.hl6-rot-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        closeRotModal();
      });
    }

    var backdrop = modal.querySelector('[data-hl6-rot-close]');
    if (backdrop) {
      backdrop.addEventListener('click', function (e) {
        e.stopPropagation();
        closeRotModal();
      });
    }

    document.addEventListener('click', function (e) {
      if (!modal.classList.contains('hl6-rot-modal-open')) return;
      if (!e.target.closest('.hl6-rot-modal-panel')) closeRotModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('hl6-rot-modal-open')) {
        e.preventDefault();
        closeRotModal();
      }
    });
  }

  function tryBoot(n) {
    var panel = document.querySelector('[data-slide="0"]');
    if (!panel || !panel.querySelector('.hl6-rot-banner')) {
      if (n <= 0) return;
      setTimeout(function () {
        tryBoot(n - 1);
      }, 100);
      return;
    }
    setupTagline(panel);
    setupRotModal(panel);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      tryBoot(80);
    });
  } else {
    tryBoot(80);
  }
})();

(function () {
  function syncNameSize() {
    var img = document.querySelector('#hl6-brand-cluster .hl6-school-logo-img');
    var name = document.getElementById('hl6-teacher-name');
    if (!img || !name) return;
    var h = img.getBoundingClientRect().height;
    if (!h) h = 40;
    name.style.fontSize = Math.round(h * 0.58) + 'px';
  }

  function setupBrandCluster() {
    if (document.getElementById('hl6-brand-cluster')) return true;
    var logo = document.querySelector('.hl6-school-logo-badge');
    if (!logo) return false;

    var cluster = document.createElement('div');
    cluster.id = 'hl6-brand-cluster';

    var name = document.createElement('span');
    name.id = 'hl6-teacher-name';
    name.textContent = 'Mr. White';

    document.body.appendChild(cluster);
    cluster.appendChild(logo);
    cluster.appendChild(name);

    syncNameSize();
    return true;
  }

  function tryBoot(n) {
    if (!setupBrandCluster()) {
      if (n <= 0) return;
      setTimeout(function () {
        tryBoot(n - 1);
      }, 100);
      return;
    }
    window.addEventListener('resize', syncNameSize);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncNameSize);
    }
    var img = document.querySelector('#hl6-brand-cluster .hl6-school-logo-img');
    if (img && !img.complete) {
      img.addEventListener('load', syncNameSize);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      tryBoot(80);
    });
  } else {
    tryBoot(80);
  }
})();
