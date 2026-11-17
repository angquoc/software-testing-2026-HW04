import { spawnSync } from 'node:child_process';
import path from 'node:path';

// Reset DB EShop về dữ liệu mẫu: Chạy `node database.js` trong eshop-sut/backend (WORKFLOW.md mục 4.1).
// Logic chép từ resetDatabase của tests/C_FR-17_QuanLyCoupon/setup/globalSetup.ts; lỗi ném rõ ràng kèm log vì globalSetup không hiện trong report.
const BACKEND_DIR = path.resolve(__dirname, '../../../eshop-sut/backend');

export function resetDatabase(tag: string): void {
  const r = spawnSync(process.execPath, ['database.js'], { cwd: BACKEND_DIR, encoding: 'utf8', timeout: 60_000 });
  const log = [
    `  Lệnh: node database.js`,
    `  Thư mục: ${BACKEND_DIR}`,
    `  Mã thoát: ${r.status}${r.signal ? ` (signal ${r.signal})` : ''}`,
    `  stdout:\n${(r.stdout ?? '').trim() || '(trống)'}`,
    `  stderr:\n${(r.stderr ?? '').trim() || '(trống)'}`,
  ].join('\n');
  if (r.error || r.status !== 0) {
    throw new Error(`[${tag} setup] Reset DB thất bại.\n${log}${r.error ? `\n  Lỗi: ${r.error.message}` : ''}`);
  }
  console.log(`[${tag} setup] Reset DB xong.\n${log}`);
}
