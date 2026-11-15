import { defineConfig, devices } from '@playwright/test';
import { WEB_URL } from './tests/support/urls';
import { STUDENT_ID, localIsoNow } from './tests/support/runInfo';

// Mỗi lần chạy (1 feature x 1 trình duyệt) ra 1 HTML report có "Run by: 23120061" + timestamp ISO (đề §6, §11; D9):
// Ở tiêu đề report, và ở annotation của từng test (tests/support/fixtures.ts).
// tools/run.mjs đặt các biến môi trường bên dưới; chạy thẳng `npx playwright test` thì dùng giá trị mặc định.
// Worker kế thừa biến môi trường của tiến trình chính, nên mọi worker thấy cùng một timestamp.
process.env.RUN_STARTED_AT ??= localIsoNow();
const runStartedAt = process.env.RUN_STARTED_AT;
const runLabel = process.env.RUN_LABEL ?? 'ad-hoc';
const reportDir = process.env.RUN_REPORT_DIR ?? 'playwright-report';
const resultsDir = process.env.RUN_RESULTS_DIR ?? 'test-results';

export default defineConfig({
  testDir: './tests',
  outputDir: resultsDir,
  // Dữ liệu EShop dùng chung một DB: Chạy tuần tự cho an toàn. Đổi khi chốt D10.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: true,
  timeout: 30_000,
  expect: { timeout: 5_000 },

  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: reportDir,
        open: 'never',
        title: `Run by: ${STUDENT_ID} | ${runStartedAt} | ${runLabel}`,
      },
    ],
    // Kết quả dạng máy đọc được, để soạn 03_results.md từ đúng lần chạy (không thay HTML report).
    ['json', { outputFile: `${reportDir}/results.json` }],
  ],

  use: {
    baseURL: WEB_URL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'off',
  },

  projects: [
    { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
