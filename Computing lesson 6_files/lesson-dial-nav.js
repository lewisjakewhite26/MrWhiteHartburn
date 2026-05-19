/**
 * Lesson 6 (Figma export): horizontal slides + dial.
 * - Always opens on slide 1.
 * - Click dial numbers 1–5 → that slide; dial SVG + ticks rotate to match.
 * - Counter-rotates each number button so hit targets stay on the labels.
 */
(function () {
  var TRACK_ID = 'lesson-slide-track';
  var DIAL_ID = 'lesson-dial-root';

  function getTrack() {
    return document.getElementById(TRACK_ID) || (function () {
      var a = document.querySelector('[data-slide="0"]');
      return a ? a.parentElement : null;
    })();
  }

  function getDial() {
    return document.getElementById(DIAL_ID) || document.querySelector('.fixed.top-8.left-8.z-50');
  }

  function slideCount(track) {
    return Array.from(track.children).filter(function (el) {
      return el.hasAttribute('data-slide');
    }).length;
  }

  function findSlideLabel(dialRoot) {
    var divs = dialRoot.querySelectorAll('div');
    for (var i = 0; i < divs.length; i++) {
      var t = (divs[i].textContent || '').trim();
      if (/^SLIDE\s+\d+\s*\/\s*\d+$/i.test(t)) return divs[i];
    }
    return null;
  }

  function getNumberWrap(dialFace) {
    var wraps = dialFace.querySelectorAll('.absolute.inset-0');
    for (var w = 0; w < wraps.length; w++) {
      if (wraps[w].querySelector('button')) return wraps[w];
    }
    return null;
  }

  function patchButtonCounterRotate(btn, slideIndex, angleStep) {
    var st = btn.getAttribute('style') || '';
    var rot = slideIndex * angleStep;
    var next;
    if (/rotate\([^)]*\)/.test(st)) {
      next = st.replace(/rotate\([^)]*\)/, 'rotate(' + rot + 'deg)');
    } else {
      next = st + (st && !/;\s*$/.test(st) ? '; ' : '') + 'rotate(' + rot + 'deg)';
    }
    btn.setAttribute('style', next);
  }

  function applySlide(track, dialRoot, slideIndex, total) {
    slideIndex = Math.max(0, Math.min(total - 1, slideIndex));
    track.style.transform = 'translateX(-' + slideIndex * 100 + '%)';

    var dialFace =
      dialRoot.querySelector('.relative.h-36.w-36') ||
      dialRoot.querySelector('.relative.h-32.w-32') ||
      dialRoot.querySelector('.relative');
    if (!dialFace) return slideIndex;

    var angleStep = 360 / total;
    var deg = -slideIndex * angleStep;

    var svg = dialFace.querySelector('svg');
    if (svg) {
      svg.style.transform = 'rotate(' + deg + 'deg)';
      svg.style.transition = 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    dialFace.querySelectorAll('svg line').forEach(function (line, i) {
      var on = i === slideIndex;
      line.setAttribute('stroke', on ? '#007AFF' : 'rgba(255,255,255,0.3)');
      line.setAttribute('stroke-width', on ? '3' : '2');
    });

    var numWrap = getNumberWrap(dialFace);
    if (numWrap) {
      numWrap.style.transform = 'rotate(' + deg + 'deg)';
      numWrap.style.transition = 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)';
      numWrap.querySelectorAll('button').forEach(function (btn) {
        patchButtonCounterRotate(btn, slideIndex, angleStep);
      });
      numWrap.querySelectorAll('button span').forEach(function (span, i) {
        var on = i === slideIndex;
        span.className = on
          ? 'transition-all text-[#007AFF] font-bold text-lg scale-110'
          : 'transition-all text-white/50 hover:text-white/80';
      });
    }

    var label = findSlideLabel(dialRoot);
    if (label) label.textContent = 'SLIDE ' + (slideIndex + 1) + '/' + total;

    return slideIndex;
  }

  function bind() {
    var track = getTrack();
    var dialRoot = getDial();
    if (!track || !dialRoot) return false;

    var total = slideCount(track);
    if (!total) return false;

    if (dialRoot.dataset.hl6Nav === '1') return true;
    dialRoot.dataset.hl6Nav = '1';

    var dialFace =
      dialRoot.querySelector('.relative.h-36.w-36') ||
      dialRoot.querySelector('.relative.h-32.w-32') ||
      dialRoot.querySelector('.relative');

    var current = 0;
    current = applySlide(track, dialRoot, 0, total);

    function goTo(i) {
      current = applySlide(track, dialRoot, i, total);
    }

    var numWrap = dialFace ? getNumberWrap(dialFace) : null;
    if (numWrap) {
      numWrap.querySelectorAll('button').forEach(function (btn, idx) {
        btn.style.pointerEvents = 'auto';
        btn.style.cursor = 'pointer';
        btn.type = 'button';
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          goTo(idx);
        });
      });
    }

    dialRoot.style.zIndex = '60';
    return true;
  }

  function tryBind(n) {
    if (bind()) return;
    if (n <= 0) return;
    setTimeout(function () {
      tryBind(n - 1);
    }, 100);
  }

  function boot() {
    tryBind(60);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  var mo;
  try {
    mo = new MutationObserver(function () {
      var d = getDial();
      if (d && d.dataset.hl6Nav !== '1') boot();
    });
    var c = document.getElementById('container');
    if (c) mo.observe(c, { childList: true, subtree: true });
  } catch (e) {}
})();
