import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { ADMIN_URL } from '../../support/urls';
import { ADMIN_ACCOUNT } from '../../support/accounts';
import { ADMIN_STATE } from '../../support/pages/AdminCouponsPage';

// Chuẩn bị cho mỗi lượt chạy FR-17 (một trình duyệt): Reset DB về dữ liệu mẫu, rồi đăng nhập admin và lưu storageState.
// Quyết định của SV (bước script, phần P1): globalSetup theo feature; lỗi phải rõ ràng, kèm log.
const BACKEND_DIR = path.resolve(__dirname, '../../../../eshop-sut/backend');

function resetDatabase(): void {
  const r = spawnSync(process.execPath, ['database.js'], { cwd: BACKEND_DIR, encoding: 'utf8', timeout: 60_000 });
  const log = [
    `  Lệnh: node database.js`,
    `  Thư mục: ${BACKEND_DIR}`,
    `  Mã thoát: ${r.status}${r.signal ? ` (signal ${r.signal})` : ''}`,
    `  stdout:\n${(r.stdout ?? '').trim() || '(trống)'}`,
    `  stderr:\n${(r.stderr ?? '').trim() || '(trống)'}`,
  ].join('\n');
  if (r.error || r.status !== 0) {
    throw new Error(`[FR-17 setup] Reset DB thất bại.\n${log}${r.error ? `\n  Lỗi: ${r.error.message}` : ''}`);
  }
  console.log(`[FR-17 setup] Reset DB xong.\n${log}`);
}

async function loginAndSaveState(): Promise<void> {
  const browser = await chromium.launch({ channel: 'chrome' });
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto(ADMIN_URL);
    await page.getByPlaceholder('Email').fill(ADMIN_ACCOUNT.email);
    await page.getByPlaceholder('Password').fill(ADMIN_ACCOUNT.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('heading', { name: 'EShop Admin', level: 1 }).waitFor({ timeout: 10_000 });
    const token = await page.evaluate(() => localStorage.getItem('adminToken'));
    if (!token) throw new Error('Không thấy khóa adminToken trong localStorage sau khi đăng nhập');
    mkdirSync(path.dirname(ADMIN_STATE), { recursive: true });
    await context.storageState({ path: ADMIN_STATE });
    console.log(`[FR-17 setup] Đăng nhập admin xong, lưu storageState: ${ADMIN_STATE}`);
  } catch (e) {
    const bodyText = (await page.locator('body').innerText().catch(() => '(không đọc được trang)')).slice(0, 500);
    throw new Error(
      `[FR-17 setup] Đăng nhập admin thất bại.\n  URL: ${page.url()}\n  Tài khoản: ${ADMIN_ACCOUNT.email}\n` +
        `  Lỗi: ${(e as Error).message}\n  Nội dung trang (500 ký tự đầu):\n${bodyText}`,
    );
  } finally {
    await browser.close();
  }
}

export async function setupFr17(): Promise<void> {
  resetDatabase();
  await loginAndSaveState();
}
