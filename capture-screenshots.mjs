/**
 * Capture PNG screenshots of all lesson slides, popups, and interactive UI states.
 *
 * 1. Start the lesson server (from this folder):
 *      py -m http.server 8765 --bind 127.0.0.1
 * 2. Install Playwright once:
 *      npm install playwright
 *      npx playwright install chromium
 * 3. Run:
 *      node capture-screenshots.mjs
 *
 * Output: ./screenshots/*.png
 */

import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL =
  process.env.LESSON_URL ||
  'http://127.0.0.1:8765/Computing%20lesson%206.html';
const OUT_DIR = path.join(__dirname, 'screenshots');
const VIEWPORT = { width: 1920, height: 1080 };

const SLIDE_NAMES = [
  '01-hero',
  '02-toolkit',
  '03-portraits',
  '04-editing-lab',
  '05-success-criteria',
];

const PORTRAIT_NAMES = ['direct-link', 'story-scene', 'artistic-emotion'];

const COMPARE_POSITIONS = [
  { value: 0, name: 'before-full' },
  { value: 25, name: 'mostly-before' },
  { value: 50, name: 'middle' },
  { value: 75, name: 'mostly-after' },
  { value: 100, name: 'after-full' },
];

async function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function capture(page, name) {
  const file = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log('   ', file);
}

async function goToSlide(page, index) {
  await closeToolkit(page);
  await closeModal(page);
  const dial = page.locator('#lesson-dial-root button');
  await dial.nth(index).click();
  await wait(650);
}

async function closeModal(page) {
  const modal = page.locator('#hl6-portrait-modal.hl6-modal-open');
  if (await modal.count()) {
    await page.locator('#hl6-modal-close').click();
    await modal.waitFor({ state: 'hidden', timeout: 3000 }).catch(() => {});
    await wait(300);
  }
}

async function closeToolkit(page) {
  const closed = await page.evaluate(() => {
    const fx = document.getElementById('hl6-slide-fx');
    if (!fx || fx.getAttribute('data-active') !== '1') return false;
    const btn = document.getElementById('hl6-toolkit-exit');
    if (btn) btn.click();
    return true;
  });
  if (closed) await wait(350);
}

async function openToolkitCard(page, cardIndex) {
  const card = page.locator('[data-slide="1"] .grid > button').nth(cardIndex);
  await card.click({ force: true });
  await page.locator('#hl6-slide-fx[data-active="1"]').waitFor({ timeout: 5000 });
  await wait(400);
}

async function setExposure(page, value) {
  await page.locator('#hl6-exposure-range').evaluate((el, v) => {
    el.value = String(v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
  await wait(350);
}

async function setCompare(page, percent) {
  const range = page.locator('[data-slide="3"] input[type="range"]').first();
  await range.waitFor({ timeout: 5000 });
  await range.evaluate((el, pct) => {
    el.value = String(pct);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, percent);
  await wait(400);
}

async function setCriteriaCount(page, checkedCount) {
  await page.evaluate((n) => {
    const items = Array.from(
      document.querySelectorAll(
        '[data-slide="4"] .hl6-criteria-item, [data-slide="4"] .space-y-3 > button'
      )
    );
    items.forEach((btn, i) => {
      const want = i < n;
      const has = btn.getAttribute('data-checked') === '1';
      if (want !== has) btn.click();
    });
  }, checkedCount);
  await wait(400);
}

async function captureBaseSlides(page) {
  console.log('\n— Base slides —');
  for (let i = 0; i < SLIDE_NAMES.length; i++) {
    await goToSlide(page, i);
    await capture(page, `slide-${SLIDE_NAMES[i]}`);
  }
}

async function captureTimerStates(page) {
  console.log('\n— Timer bar —');
  await goToSlide(page, 0);
  await capture(page, 'ui-timer-teach-idle');

  await page.locator('#hl6-timer-start').click();
  await wait(1200);
  await capture(page, 'ui-timer-teach-running');

  await page.locator('#hl6-timer-start').click();
  await wait(200);
  await capture(page, 'ui-timer-teach-paused');

  await page.locator('#hl6-timer-reset').click();
  await wait(200);

  await goToSlide(page, 3);
  await capture(page, 'ui-timer-share-idle');
}

async function captureToolkitDemos(page) {
  console.log('\n— Toolkit demos (slide 2) —');
  await goToSlide(page, 1);

  await openToolkitCard(page, 0);
  await capture(page, 'toolkit-aeaf-ready');

  await page.locator('#hl6-slide-fx').click({
    position: { x: VIEWPORT.width / 2, y: VIEWPORT.height / 2 },
  });
  await page.locator('#hl6-sharp-window[data-visible="1"]').waitFor({ timeout: 5000 });
  await wait(450);
  await capture(page, 'toolkit-aeaf-locked');

  await openToolkitCard(page, 1);
  await capture(page, 'toolkit-exposure-neutral');
  await setExposure(page, -65);
  await capture(page, 'toolkit-exposure-dark');
  await setExposure(page, 70);
  await capture(page, 'toolkit-exposure-bright');

  await openToolkitCard(page, 2);
  await capture(page, 'toolkit-headroom-grid');

  await closeToolkit(page);
}

async function capturePortraitPopups(page) {
  console.log('\n— Portrait popups (slide 3) —');
  await goToSlide(page, 2);

  for (let i = 0; i < PORTRAIT_NAMES.length; i++) {
    await page.locator(`.hl6-portrait-thumbnail[data-card-index="${i}"]`).click();
    await page.locator('#hl6-portrait-modal.hl6-modal-open').waitFor({ timeout: 5000 });
    await wait(450);
    await capture(page, `popup-portrait-${PORTRAIT_NAMES[i]}`);
    await closeModal(page);
  }
}

async function captureEditingCompare(page) {
  console.log('\n— Editing compare slider (slide 4) —');
  await goToSlide(page, 3);

  for (const { value, name } of COMPARE_POSITIONS) {
    await setCompare(page, value);
    await capture(page, `editing-compare-${name}`);
  }
}

async function captureSuccessCriteria(page) {
  console.log('\n— Success criteria (slide 5) —');
  await goToSlide(page, 4);

  await setCriteriaCount(page, 0);
  await capture(page, 'criteria-none-checked');

  await setCriteriaCount(page, 3);
  await capture(page, 'criteria-three-checked');

  await setCriteriaCount(page, 5);
  await capture(page, 'criteria-all-checked');
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: VIEWPORT });

  console.log('Opening', BASE_URL);
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (err) {
    await browser.close();
    console.error(
      '\nCould not load the lesson. Is the server running?\n' +
        '  py -m http.server 8765 --bind 127.0.0.1\n'
    );
    throw err;
  }
  await wait(1000);

  await captureBaseSlides(page);
  await captureTimerStates(page);
  await captureToolkitDemos(page);
  await capturePortraitPopups(page);
  await captureEditingCompare(page);
  await captureSuccessCriteria(page);

  await closeToolkit(page);
  await closeModal(page);
  await browser.close();

  const total =
    SLIDE_NAMES.length +
    4 +
    6 +
    PORTRAIT_NAMES.length +
    COMPARE_POSITIONS.length +
    3;
  console.log(`\nDone. ~${total} screenshots in:\n  ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
