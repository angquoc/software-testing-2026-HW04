# Bước `maintain`: Bảo trì script

**Khi nào:** Giao diện đổi (selector hỏng), đặc tả đổi (kết quả mong đợi đổi), dữ liệu mẫu đổi, thêm test case mới vào suite, hoặc test trở nên flaky.

**Đầu ra:** Spec / dữ liệu đã sửa; dòng mới trong bảng thay đổi của `02_review.md` (hoặc mục "Bảo trì" riêng); lần chạy lại.

## Cách làm

1. **Xác định nguyên nhân trước khi sửa.** Chạy thử test hỏng trên trình duyệt hỏng, đọc lỗi, ảnh, trace. Phân biệt:
   - Selector không còn khớp (giao diện đổi): Cập nhật selector theo thứ tự ưu tiên; nếu dùng POM thì chỉ sửa page object.
   - Kết quả mong đợi đổi: **Chỉ** sửa khi đặc tả đổi (dẫn câu đặc tả mới). Hệ thống làm khác đặc tả thì đó là bug, không phải bảo trì.
   - Dữ liệu không còn hợp lệ (trùng, hết hạn): Sửa file dữ liệu hoặc cách cô lập dữ liệu.
   - Flaky: Tìm chỗ chờ sai (assertion không web-first, chờ thứ không liên quan, phụ thuộc thứ tự test); sửa bằng cách chờ đúng điều kiện, không tăng timeout chung.
2. Đề xuất sửa **nhỏ nhất** cho đúng nguyên nhân; sinh viên duyệt.
3. Thêm test case mới: Đi lại `select` (thêm dòng), `data` (thêm dòng dữ liệu), `script` (nếu cần luồng mới; luồng cũ thì chỉ thêm dữ liệu là đủ, đó là lợi ích của data-driven).
4. Chạy lại trên **cả 3 trình duyệt** (chạy thử trước, chạy chính thức nếu cần report mới).
5. Ghi bảng thay đổi: Nguyên nhân, sửa gì, ai phát hiện.

**Dừng** sau mỗi lần đề xuất và sau khi chạy lại. Commit message ví dụ: `[A-FR01][review] Update cart selectors after header change`.
