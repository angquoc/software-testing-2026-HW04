import { setupFr17 } from '../C_FR-17_QuanLyCoupon/setup/globalSetup';

// globalSetup chung của dự án: Chỉ chạy phần chuẩn bị của feature có trong lượt chạy hiện tại.
// tools/run.mjs chạy mỗi trình duyệt bằng một lệnh riêng, nên hàm này chạy một lần trước mỗi trình duyệt.
const FEATURE_SETUPS: Record<string, () => Promise<void>> = {
  'C_FR-17_QuanLyCoupon': setupFr17,
};

// Tham số đường dẫn trên dòng lệnh (bỏ tùy chọn và giá trị của tùy chọn viết tách, ví dụ `--project chrome`).
function pathFilters(): string[] {
  const args = process.argv.slice(2);
  const filters: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === 'test') continue;
    if (a.startsWith('-')) {
      if (!a.includes('=') && args[i + 1] && !args[i + 1].startsWith('-')) i++;
      continue;
    }
    filters.push(a.replace(/\\/g, '/'));
  }
  return filters;
}

function isTargeted(featureDir: string): boolean {
  const label = process.env.RUN_LABEL;
  if (label) return label.startsWith(`${featureDir} x `);
  const filters = pathFilters();
  return filters.length === 0 || filters.some((f) => f.includes(featureDir));
}

export default async function globalSetup(): Promise<void> {
  for (const [featureDir, setup] of Object.entries(FEATURE_SETUPS)) {
    if (isTargeted(featureDir)) await setup();
  }
}
