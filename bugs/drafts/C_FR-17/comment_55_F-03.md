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

Tự chụp khi tái hiện bằng tay trên Chrome (17/11/2026). Sau khi tải lại trang và bấm lại menu "Mã Giảm Giá", dòng `FR17TC38` vẫn còn với cùng giá trị.

**C-FR17_F-03_TC-CPN-38_row.png**

<img width="1059" height="293" alt="C-FR17_F-03_TC-CPN-38_row.png" src="https://github.com/user-attachments/assets/e9352d50-dc3f-4661-97e0-a7c3ea9b8872" />

**C-FR17_F-02-05_after_reload.png**

<img width="1280" height="719" alt="C-FR17_F-02-05_after_reload.png" src="https://github.com/user-attachments/assets/516a9773-258f-4b75-bd7f-c2ddffa62808" />
