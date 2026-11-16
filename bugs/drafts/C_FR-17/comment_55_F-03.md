**HW04: Tái hiện bằng automation (23120061)**

Lỗi vẫn còn: Form "Tạo mã giảm giá mới" vẫn tạo được mã loại "Phần trăm (%)" có giá trị giảm `0`, không có thông báo nào.

- Script: `tests/C_FR-17_QuanLyCoupon/03_create_invalid.spec.ts`, test `TC-CPN-38: rejects a percent discount of 0` (Playwright 1.65.0, dữ liệu ở `tests/C_FR-17_QuanLyCoupon/data/create_invalid.json`)
- Dữ liệu: Mã `FR17TC38`, "Phần trăm (%)", Giá trị `0`, Đơn tối thiểu `300000`, ngày `2099-12-31`, Số lần dùng tối đa `3`
- Trình duyệt bị lỗi: Cả 3: Chrome 157.0.8103.52, Edge 157.0.4341.60, Firefox 159.0 (Windows 11)
- Lần chạy: `node tools/run.mjs C all`, DB reset về dữ liệu mẫu trước mỗi trình duyệt. Timestamp: Chrome `2026-11-17T00:27:17+07:00`, Edge `2026-11-17T00:29:18+07:00`, Firefox `2026-11-17T00:30:37+07:00`
- Kết quả assertion (giống nhau ở 3 trình duyệt):

```
Error: Có thông báo: Bong bóng của trình duyệt, hộp thoại hoặc chữ mới trên trang
Expected: true
Received: false

Error: Sau khi bấm "Tạo mã": Không có dòng mã FR17TC38
expect(locator).toHaveCount(expected) failed
Expected: 0
Received: 1
```

**Ảnh chụp**

<!-- ⏳ Chèn ảnh tự chụp khi tái hiện bằng tay: Dòng FR17TC38 trên bảng (và sau khi tải lại trang) -->
