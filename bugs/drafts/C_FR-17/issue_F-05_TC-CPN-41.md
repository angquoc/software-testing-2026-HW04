### MSSV người báo

23120061

### Feature (mã FR)

FR-17: Quản lý mã giảm giá

### Nền tảng

Web Admin

### Test case phát hiện lỗi

TC-CPN-41 (HW02). Script HW04: `tests/C_FR-17_QuanLyCoupon/03_create_invalid.spec.ts`, test `TC-CPN-41: rejects a negative minimum order amount`

### Mức độ (Severity)

High

### Điều kiện tiên quyết

Đã reset dữ liệu EShop về dữ liệu mẫu (`node database.js` trong `backend`); đăng nhập Web Admin bằng `admin@eshop.com`, mở menu "Mã Giảm Giá"

### Các bước tái hiện

1. Trên form "Tạo mã giảm giá mới", nhập Mã `FR17TC41`, chọn "Phần trăm (%)", Giá trị `15`, Đơn tối thiểu `-1`, ngày `12/31/2099`, Số lần dùng tối đa `3`.
2. Bấm "Tạo mã".
3. Tải lại trang, bấm lại menu "Mã Giảm Giá".

Chạy bằng automation: `node tools/run.mjs C chrome` (hoặc `edge`, `firefox`) trong repo HW04.

### Dữ liệu test

Đơn tối thiểu `-1`

### Kết quả mong đợi (theo đặc tả)

Từ chối, không tạo mã vì `min_order_amount` phải lớn hơn hoặc bằng 0. README của EShop, FR-17:

> - Các trường bắt buộc: `code` (duy nhất), `type` (percent/fixed), `discount_value` (dương), `expired_at`, `min_order_amount` (>= 0), `max_uses_per_user` (>= 1).

### Kết quả thực tế

Không có thông báo nào (không bong bóng, không hộp thoại, không chữ báo lỗi trên trang); ô "Đơn tối thiểu (₫)" không có ràng buộc `min` nên trình duyệt không chặn. Mã `FR17TC41` được tạo, bảng hiện "Phần trăm", `15%`, `-1 ₫`, `2099-12-31`, `3 lần`. Sau khi tải lại trang và bấm lại menu "Mã Giảm Giá", dòng `FR17TC41` vẫn còn với cùng giá trị (tái hiện bằng tay trên Chrome, 17/11/2026).

Kết quả assertion, giống nhau ở Chrome, Edge, Firefox:

```
Error: Có thông báo: Bong bóng của trình duyệt, hộp thoại hoặc chữ mới trên trang
Expected: true
Received: false

Error: Sau khi bấm "Tạo mã": Không có dòng mã FR17TC41
expect(locator).toHaveCount(expected) failed
Expected: 0
Received: 1
```

### Ảnh chụp

**C-FR17_F-05_TC-CPN-41_form.png**

<img width="1055" height="226" alt="C-FR17_F-05_TC-CPN-41_form.png" src="https://github.com/user-attachments/assets/794d5c50-7282-4933-b328-c8bd548da4f7" />

**C-FR17_F-05_TC-CPN-41_row.png**

<img width="1048" height="374" alt="C-FR17_F-05_TC-CPN-41_row.png" src="https://github.com/user-attachments/assets/f42e4d71-78ea-4a37-9be3-f43b826aea49" />

**C-FR17_F-02-05_after_reload.png** (sau khi tải lại trang)

<img width="1280" height="719" alt="C-FR17_F-02-05_after_reload.png" src="https://github.com/user-attachments/assets/516a9773-258f-4b75-bd7f-c2ddffa62808" />

### Môi trường

Windows 11; Chrome 157.0.8103.52, Edge 157.0.4341.60, Firefox 159.0; Playwright 1.65.0; EShop commit `85af3ba`. Lần chạy HW04: Chrome `2026-11-17T00:27:17+07:00`, Edge `2026-11-17T00:29:18+07:00`, Firefox `2026-11-17T00:30:37+07:00`

### Ghi chú

Tìm bằng automation ở HW04; test case TC-CPN-41 của HW02 chưa chạy tay. Cột "Đơn tối thiểu" hiện số âm có ký hiệu tiền (`-1 ₫`).
