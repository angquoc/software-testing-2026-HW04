import { resetDatabase } from '../../support/resetDb';

// Chuẩn bị cho mỗi lượt chạy FR-01 (một trình duyệt): Reset DB về dữ liệu mẫu, để email của HW02 (tc01@domain.com...)
// chưa tồn tại và test@eshop.com có sẵn (01_selected_tc.md: Cô lập dữ liệu phương án a). FR-01 không cần đăng nhập.
export async function setupFr01(): Promise<void> {
  resetDatabase('FR-01');
}
