/**
 * Slide 6 — Success criteria checklist: all off by default, tap to toggle.
 */
(function () {
  var SVG_CHECKED =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-check hl6-criteria-icon h-6 w-6 flex-shrink-0" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>';
  var SVG_UNCHECKED =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle hl6-criteria-icon h-6 w-6 flex-shrink-0" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle></svg>';

  var panel;
  var items = [];
  var countEl;
  var progressEl;

  function findCountEl() {
    var row = panel.querySelector('.mb-2.flex.items-center.justify-between');
    if (row) {
      var spans = row.querySelectorAll('span');
      for (var i = 0; i < spans.length; i++) {
        if (/\d+\s*\/\s*\d+/.test((spans[i].textContent || '').trim())) return spans[i];
      }
    }
    var spans = panel.querySelectorAll('span');
    for (var j = 0; j < spans.length; j++) {
      if (/\d+\s*\/\s*\d+/.test((spans[j].textContent || '').trim())) return spans[j];
    }
    return null;
  }

  function findProgressEl() {
    return panel.querySelector('.h-full.bg-gradient-to-r');
  }

  function isChecked(btn) {
    return btn.getAttribute('data-checked') === '1';
  }

  function setChecked(btn, checked) {
    btn.setAttribute('data-checked', checked ? '1' : '0');
    btn.setAttribute('aria-pressed', checked ? 'true' : 'false');

    var svg = btn.querySelector('svg.lucide');
    if (svg) {
      svg.outerHTML = checked ? SVG_CHECKED : SVG_UNCHECKED;
    }
  }

  function updateProgress() {
    var total = items.length;
    var done = 0;
    items.forEach(function (btn) {
      if (isChecked(btn)) done++;
    });
    if (countEl) countEl.textContent = done + ' / ' + total;
    if (progressEl) {
      progressEl.style.width = total ? (done / total) * 100 + '%' : '0%';
    }
  }

  function bind() {
    panel = document.querySelector('[data-slide="4"]');
    if (!panel) return false;
    if (panel.dataset.hl6CriteriaBound === '1') return true;

    var list = panel.querySelector('.space-y-3');
    if (!list) return false;

    items = Array.from(list.querySelectorAll(':scope > button'));
    if (!items.length) return false;

    countEl = findCountEl();
    progressEl = findProgressEl();

    items.forEach(function (btn, i) {
      btn.type = 'button';
      btn.classList.add('hl6-criteria-item');
      btn.style.cursor = 'pointer';
      btn.setAttribute('aria-label', 'Toggle criterion ' + (i + 1));

      setChecked(btn, false);

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        setChecked(btn, !isChecked(btn));
        updateProgress();
      });
    });

    updateProgress();
    panel.dataset.hl6CriteriaBound = '1';
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
