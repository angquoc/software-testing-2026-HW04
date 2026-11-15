// Snapshot cây ARIA và danh sách ô nhập / nút của một trang, để chọn selector (bước `script`, `review`, `maintain`).
// Chỉ dùng khi dự án cho phép đọc DOM. Output là dữ liệu về giao diện, KHÔNG phải kết quả mong đợi (oracle là đặc tả).
//
// Chạy từ thư mục gốc của dự án (dùng Playwright đã cài trong dự án):
//   node <skill>/scripts/aria_snapshot.mjs <url> [--browser chrome|edge|firefox] [--setup <file.mjs>] [--out <file.txt>]
// --setup: Module ES có `export default async function (page) { ... }`, chạy SAU khi mở <url> và TRƯỚC khi chụp
//          (đăng nhập, mở hộp thoại, điền form để thấy trạng thái lỗi). Xem assets/snapshot_setup.example.mjs.
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(resolve(process.cwd(), 'noop.js'));
let pw;
try {
  pw = require('@playwright/test');
} catch {
  pw = require('playwright');
}

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith('--') && !args[args.indexOf(a) - 1]?.startsWith('--'));
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : dflt;
};
if (!url) {
  console.error('Cách dùng: node aria_snapshot.mjs <url> [--browser chrome|edge|firefox] [--setup file.mjs] [--out file.txt]');
  process.exit(2);
}

const browserName = opt('browser', 'chrome');
const launcher = browserName === 'firefox' ? pw.firefox : pw.chromium;
const channel = { chrome: 'chrome', edge: 'msedge' }[browserName];
const browser = await launcher.launch(channel ? { channel } : {});
const page = await browser.newPage();
await page.goto(url);
await page.waitForLoadState('domcontentloaded');

const setup = opt('setup');
if (setup) {
  const mod = await import(pathToFileURL(resolve(setup)).href);
  await mod.default(page);
}

const aria = await page.locator('body').ariaSnapshot();
const controls = await page.evaluate(() => {
  const labelOf = (el) => {
    if (el.labels && el.labels.length) return [...el.labels].map((l) => l.innerText.trim()).join(' / ');
    return el.getAttribute('aria-label') || '';
  };
  return [...document.querySelectorAll('input, select, textarea, button, a[href], [role="button"], [data-testid]')]
    .filter((el) => el.offsetParent !== null || el.type === 'hidden')
    .map((el) => {
      const pick = ['type', 'name', 'id', 'placeholder', 'required', 'minlength', 'maxlength', 'min', 'max', 'step',
        'pattern', 'disabled', 'data-testid', 'aria-invalid', 'href'];
      const attrs = pick
        .filter((a) => el.hasAttribute(a))
        .map((a) => (el.getAttribute(a) === '' ? a : `${a}="${el.getAttribute(a)}"`));
      const text = (el.innerText || el.value || '').trim().replace(/\s+/g, ' ').slice(0, 60);
      return `${el.tagName.toLowerCase()} ${attrs.join(' ')}${labelOf(el) ? ` label="${labelOf(el)}"` : ''}${text ? ` text="${text}"` : ''}`;
    });
});

const report = [
  `# Snapshot ${new Date().toISOString()} | ${browserName} ${browser.version()}`,
  `# URL: ${page.url()} | Title: ${await page.title()}${setup ? ` | Setup: ${setup}` : ''}`,
  '',
  '## ARIA',
  aria,
  '',
  '## Phần tử tương tác',
  ...controls,
  '',
].join('\n');

const out = opt('out');
if (out) writeFileSync(out, report, 'utf8');
console.log(report);
await browser.close();
