import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { request } from '@playwright/test';
import { USER_ACCOUNT } from '../../support/accounts';
import { WEB_URL } from '../../support/urls';
import { loginToken } from '../lib/cartApi';

// Trạng thái đăng nhập test@eshop.com cho các test giao diện của FR-07 (thư mục .auth/ bị .gitignore chặn).
export const USER_STATE = path.resolve(__dirname, '../../../.auth/user.json');

// Đăng nhập bằng API rồi ghi token vào storageState: Web đọc token từ localStorage khóa "token".
// Không mở trình duyệt; storageState dùng được cho cả Chrome, Edge, Firefox.
export async function setupFr07(): Promise<void> {
  const api = await request.newContext();
  try {
    const token = await loginToken(api, USER_ACCOUNT);
    const state = {
      cookies: [],
      origins: [{ origin: WEB_URL, localStorage: [{ name: 'token', value: token }] }],
    };
    mkdirSync(path.dirname(USER_STATE), { recursive: true });
    writeFileSync(USER_STATE, JSON.stringify(state, null, 2));
  } catch (err) {
    throw new Error(`FR-07 globalSetup: Cannot log in ${USER_ACCOUNT.email} (is the backend running?): ${String(err)}`);
  } finally {
    await api.dispose();
  }
}
