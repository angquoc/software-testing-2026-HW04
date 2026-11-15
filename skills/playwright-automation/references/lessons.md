# Checklist tự kiểm và bài học

Đi qua checklist của bước trước khi giao. Mục "Rút từ lần làm thật" ghi lỗi đã gặp thật (kèm feature, ngày); các mục khác là kinh nghiệm chung về Playwright, **chưa** kiểm chứng trên hệ thống đang test.

## Checklist theo bước

### `select`

- [ ] Đọc **toàn bộ** test case của feature trước khi chọn, không chỉ phần đầu file.
- [ ] Mỗi test case chọn có kết quả mong đợi đo được bằng máy; test case "kiểm bằng mắt" không chọn hoặc ghi rõ cách đo.
- [ ] Lý do "không tự động hóa được" cụ thể (thiếu trạng thái gì, cần dịch vụ gì), không ghi "phức tạp".
- [ ] Kế hoạch sinh script: Mỗi phần là một luồng thao tác; không có phần nào gom mọi thứ.
- [ ] Đã hỏi tiêu chí chọn, không tự chọn tiêu chí.

### `data`

- [ ] `id` đúng mã gốc, không trùng; mỗi test case chọn đúng một dòng.
- [ ] Giá trị biên tính lại (độ dài chuỗi, số); có `note` cho biên.
- [ ] Kết quả mong đợi có `oracle`; không chép câu thông báo từ giao diện khi đặc tả không ghi.
- [ ] Giá trị cần duy nhất (email, mã) xử lý theo cách cô lập dữ liệu đã chốt; biên độ dài không bị chuỗi duy nhất làm lệch.
- [ ] Chuỗi có dấu tiếng Việt, khoảng trắng đầu / cuối giữ đúng như test case (JSON giữ được; CSV cần ngoặc kép).

### `script`

- [ ] Import `test`, `expect` từ `../support/fixtures`.
- [ ] Không có dữ liệu test viết thẳng trong spec; vòng lặp đọc từ file.
- [ ] Tên test bắt đầu bằng mã TC.
- [ ] Mỗi test kiểm **đủ** kết quả mong đợi, kể cả phần "không xảy ra".
- [ ] Không `waitForTimeout`, không `networkidle`, không `test.only`.
- [ ] Selector theo thứ tự ưu tiên; không class sinh tự động, không `nth-child`.
- [ ] Hộp thoại (`alert`, `confirm`) được bắt và kiểm chữ.
- [ ] Validation trình duyệt kiểm bằng `validity`, không so chữ bong bóng.
- [ ] Code trong `tests/` giống hệt khối code trong `ai_raw/` (`check_automation.py same`).
- [ ] Không chạy trên giao diện trước khi giao.

### `review`

- [ ] Chạy thử trên **cả 3** trình duyệt, không chỉ Chrome.
- [ ] Đọc cả test **qua**; thử làm hỏng có chủ đích ít nhất một test mỗi phần để chắc assertion bắt được lỗi.
- [ ] Test fail do hệ thống sai đặc tả được giữ nguyên, không sửa assertion cho xanh.
- [ ] Mỗi thay đổi một dòng bảng; cột "Vì sao" bắt đầu đúng giá trị; ghi ai phát hiện.
- [ ] Đánh dấu `★` chỗ sửa sẽ kể trong video.

### `run`

- [ ] Sinh viên chạy, không phải AI.
- [ ] Dữ liệu đúng trạng thái trước mỗi trình duyệt (theo cách đã chốt).
- [ ] `03_results.md` ghi đúng timestamp từng report, phiên bản trình duyệt từ annotation.
- [ ] Mọi test fail có phân loại và bằng chứng.

### `bugs`

- [ ] Tìm issue cũ trước khi tạo; gộp cùng lỗi gốc.
- [ ] Bước tái hiện viết cho người làm tay, không chỉ "chạy script".
- [ ] Ảnh đúng test case và trình duyệt; không chỉnh ảnh.
- [ ] Không đăng gì khi chưa được cho phép.

### `gap`

- [ ] Số liệu đếm bằng script từ bảng thay đổi.
- [ ] Mỗi nhận định có ví dụ cụ thể.
- [ ] Không tự sửa skill; chỉ đề xuất.

## Lỗi Playwright hay gặp (kinh nghiệm chung)

| Hiện tượng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| `strict mode violation: ... resolved to 2 elements` | Selector khớp nhiều phần tử (nút cùng tên ở header và form) | Phạm vi hóa theo vùng (`getByRole('form')`, dòng của bảng) hoặc `exact: true` |
| Test qua dù hệ thống hiện `alert` lỗi | Playwright tự đóng hộp thoại | Bắt `dialog`, kiểm `message()` |
| Chrome qua, Firefox fail ở bước nhập số | `fill` vào `input[type=number]` với chữ | `pressSequentially`, hoặc kiểm validation |
| So chữ thông báo validation fail ở trình duyệt khác | Bong bóng HTML5 khác nhau giữa trình duyệt / ngôn ngữ | Kiểm `validity.valid` và hệ quả |
| Lúc qua lúc fail sau khi submit | Assertion đọc một lần (`textContent`) trước khi cập nhật | Web-first assertion; chờ response |
| Chạy lần 2 fail "email đã tồn tại" | Dữ liệu tạo ở lần chạy trước | Cô lập dữ liệu (`playwright-patterns.md` mục 3) |
| Test giỏ hàng lệch số lượng khi chạy nhiều trình duyệt | Cùng tài khoản, trạng thái dùng chung trên server | Chạy tuần tự + reset, hoặc tài khoản riêng mỗi trình duyệt |
| `page.goto` lỗi kết nối chỉ ở một máy | Server dev nghe trên `::1` / `127.0.0.1` khác với `localhost` phân giải | Dùng đúng host server đang nghe |

## Rút từ lần làm thật

(Chưa có. Bổ sung sau feature thứ nhất: Hiện tượng, feature và ngày, nguyên nhân, cách xử lý, bước của checklist được thêm.)
