// Chạy 1 feature trên 1 hoặc cả 3 trình duyệt; mỗi trình duyệt ra 1 HTML report riêng.
//   node tools/run.mjs <feature> <chrome|edge|firefox|all> [tham số thêm cho playwright]
// <feature>: Tên thư mục trong tests/ (ví dụ A_FR-01_DangKy), hoặc tiền tố trước dấu "_" (ví dụ A), hoặc "smoke" (tests/_smoke).
// Report: reports/<thư mục feature>/<trình duyệt>/index.html, tiêu đề "Run by: <MSSV> | <ISO> | <feature> x <trình duyệt>";
// kèm results.json (JSON reporter) để đọc kết quả bằng máy.
// Lần chạy chính thức (report nộp bài) do sinh viên tự chạy trên máy mình.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const BROWSERS = ['chrome', 'edge', 'firefox'];
const STUDENT_ID = readFileSync('tests/support/runInfo.ts', 'utf8').match(/STUDENT_ID\s*=\s*'([^']+)'/)?.[1] ?? '?';

function resolveFeature(arg) {
  if (!arg || !existsSync('tests')) return undefined;
  const dirs = readdirSync('tests', { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== 'support')
    .map((d) => d.name);
  if (dirs.includes(arg)) return arg;
  const hits = dirs.filter((d) => d.startsWith(`${arg}_`) || d === `_${arg}`);
  return hits.length === 1 ? hits[0] : undefined;
}

const [featureArg, browserArg = 'all', ...extra] = process.argv.slice(2);
const feature = resolveFeature(featureArg);
const browsers = browserArg === 'all' ? BROWSERS : [browserArg];
if (!feature || !browsers.every((b) => BROWSERS.includes(b))) {
  console.error('Cách dùng: node tools/run.mjs <thư mục feature | tiền tố | smoke> <chrome|edge|firefox|all> [tham số playwright]');
  process.exit(2);
}

// Chặn spec import `test` thẳng từ '@playwright/test': Spec đó sẽ thiếu annotation Run by .
const BAD_IMPORT = /import\s*\{[^}]*\btest\b[^}]*\}\s*from\s*['"]@playwright\/test['"]/;
const specs = readdirSync(`tests/${feature}`, { recursive: true })
  .map(String)
  .filter((f) => f.endsWith('.spec.ts'));
const bad = specs.filter((f) => BAD_IMPORT.test(readFileSync(join('tests', feature, f), 'utf8')));
if (bad.length) {
  console.error(`Spec import test từ '@playwright/test' (phải import từ tests/support/fixtures): ${bad.join(', ')}`);
  process.exit(2);
}

function localIsoNow() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `${sign}${pad(Math.floor(Math.abs(off) / 60))}:${pad(Math.abs(off) % 60)}`
  );
}

let worst = 0;
for (const browser of browsers) {
  const reportDir = `reports/${feature}/${browser}`;
  const resultsDir = `test-results/${feature}/${browser}`;
  rmSync(reportDir, { recursive: true, force: true });
  const env = {
    ...process.env,
    RUN_STARTED_AT: localIsoNow(),
    RUN_LABEL: `${feature} x ${browser}`,
    RUN_REPORT_DIR: reportDir,
    RUN_RESULTS_DIR: resultsDir,
  };
  console.log(`\n=== ${feature} x ${browser} | Run by: ${STUDENT_ID} | ${env.RUN_STARTED_AT} ===`);
  const r = spawnSync('npx', ['playwright', 'test', `tests/${feature}/`, `--project=${browser}`, ...extra], {
    stdio: 'inherit',
    env,
    shell: process.platform === 'win32',
  });
  console.log(`Report: ${reportDir}/index.html, ${reportDir}/results.json (mã thoát ${r.status})`);
  worst = Math.max(worst, r.status ?? 1);
}
process.exit(worst);
