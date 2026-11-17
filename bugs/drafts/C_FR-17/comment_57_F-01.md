**HW04: Tái hiện bằng automation (23120061)**

Lỗi vẫn còn ở phần thông báo khi Mã trùng (bước 3 của issue): Tạo mã `SAVE10` (trùng mã mẫu) hiện hộp thoại chứa chuỗi lỗi kỹ thuật của CSDL. Phần còn lại của test qua: Không có dòng mới, dòng `SAVE10` giữ nguyên giá trị mẫu, kể cả sau khi tải lại trang.

- Script: `tests/C_FR-17_QuanLyCoupon/03_create_invalid.spec.ts`, test `TC-CPN-32: rejects a code that duplicates sample coupon SAVE10` (Playwright 1.65.0, dữ liệu ở `tests/C_FR-17_QuanLyCoupon/data/create_invalid.json`). Script kiểm chữ của hộp thoại không chứa các chuỗi kỹ thuật hoặc từ tiếng Anh thường gặp trong thông báo lỗi (danh sách ở dòng "Expected pattern" bên dưới)
- Dữ liệu: Mã `SAVE10`, "Phần trăm (%)", Giá trị `15`, Đơn tối thiểu `300000`, ngày `2099-12-31`, Số lần dùng tối đa `3`
- Trình duyệt bị lỗi: Cả 3: Chrome 157.0.8103.52, Edge 157.0.4341.60, Firefox 159.0 (Windows 11)
- Lần chạy: `node tools/run.mjs C all`, DB reset về dữ liệu mẫu trước mỗi trình duyệt. Timestamp: Chrome `2026-11-17T00:27:17+07:00`, Edge `2026-11-17T00:29:18+07:00`, Firefox `2026-11-17T00:30:37+07:00`
- Kết quả assertion (giống nhau ở 3 trình duyệt):

```
Error: Hộp thoại "Lỗi: SQLITE_CONSTRAINT: UNIQUE constraint failed: coupons.code": Không chứa chuỗi cấm
expect(received).not.toMatch(expected)
Expected pattern: not /SQLITE|constraint|coupons\.|TypeError|SyntaxError|undefined|NaN|null|error|failed|invalid|required/i
Received string:      "Lỗi: SQLITE_CONSTRAINT: UNIQUE constraint failed: coupons.code"
```

Các phần khác của issue này (tiêu đề tab, menu "Dashboard", bong bóng và lịch chọn ngày của trình duyệt) không nằm trong phạm vi script nên không tái hiện ở đây.

**Ảnh chụp**

Tự chụp khi tái hiện bằng tay trên Chrome (17/11/2026), vì Playwright tự đóng hộp thoại nên ảnh của report không có hộp thoại.

**C-FR17_F-01_TC-CPN-32_dialog.png**

<img width="1280" height="719" alt="C-FR17_F-01_TC-CPN-32_dialog.png" src="https://github.com/user-attachments/assets/8a5cfaec-5a42-4601-8dac-6b83094d9ec9" />
