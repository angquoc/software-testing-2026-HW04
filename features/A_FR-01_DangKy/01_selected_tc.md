# A: FR-01 Đăng ký tài khoản: Test case chọn để tự động hóa

- Bước: `[A-FR01][select]` (bản review). Bản AI: `ai_raw/select.md` (commit `86d8d57`)
- Thời gian: 2026-11-17 23:29 (+07:00)
- Nguồn test case: `Homeworks/HW02/features/A_FR-01_DangKy/05_final_tc.md` (96 test case); kết quả chạy tay: `Homeworks/HW02/features/A_FR-01_DangKy/06_results.md`; bug: issue #42 đến #54 trên repo nhóm; đặc tả: `Homeworks/eshop-sut/README.md` (FR-01, FR-21, FR-22)
- Tiêu chí chọn: Kết hợp a, b, c theo đúng thứ tự: a. Đã chạy tay ở HW02; b. Đã phát hiện bug (Fail ở HW02 và có issue, GĐ-01); c. Phủ lớp tương đương và giá trị biên. Chọn 12 đến 14 test case cộng 2 đến 3 dự phòng. Chỉ tự động hóa qua giao diện web; bỏ test case kiểm qua API
- Điều kiện tiên quyết chung: 3 server EShop đang chạy (backend 3000, Web 5173); DB reset về dữ liệu mẫu trước mỗi lượt chạy (mỗi trình duyệt) trong `globalSetup` của FR-01 (cô lập dữ liệu: Phương án a, giữ đúng email của HW02); chưa đăng nhập; mở `http://localhost:5173/register`

## Giả định đã giữ

- GĐ-01: Tiêu chí b ("đã phát hiện bug") là test case **Fail** ở HW02 và có issue. Test case Blocked ở HW02 vì bug khác (#42 che, #43 thiếu ô) chỉ tính vào tiêu chí a.
- GĐ-02: Bong bóng "bắt buộc nhập" của trình duyệt được tính là thông báo lỗi OUT2 cho ERR1, ERR2, ERR5 (như HW02 chấm Pass TC-REG-30, 32, 49). Đo bằng `validity.valueMissing` của **đúng ô** đó, kèm vẫn ở `/register`.
- GĐ-03: "Trang hiện form đăng nhập" của OUT1 đo bằng: Đường dẫn là `/login`, có ô nhập Email, ô nhập Mật khẩu và nút gửi (`05_final_tc.md` mục 1.2).
- GĐ-04: Reset DB trước mỗi lượt đặt trong `tests/support/globalSetup.ts`, cùng cách FR-17, FR-07; cách viết cụ thể chốt ở bước `script` P1.

## Bug #42 che phần lớn test case qua UI

Giao diện báo "Mật khẩu quá yếu!" với mọi mật khẩu đã thử, kể cả mật khẩu hợp lệ (#42, critical; `06_results.md` QS02). Hệ quả:

1. Test case UI mong đợi OUT1 sẽ fail vì #42; chỉ giữ TC-REG-01, TC-REG-108 làm regression cho #42.
2. Test case kiểm lỗi của trường khác (Email sai định dạng, Email trùng, Họ Tên chỉ có dấu cách) thấy lỗi mật khẩu thay vì lỗi của trường đó, nên chỉ lặp lại #42. Để ở dự phòng (CH-select-07 a).
3. TC-REG-56, TC-REG-107 (ERR6) sẽ qua, nhưng mật khẩu hợp lệ cũng nhận cùng thông báo; phải đọc cùng TC-REG-01, TC-REG-108.
4. Đo được đúng ý: Ô bắt buộc để trống, mật khẩu yếu, checklist giao diện.

## 1. Toàn bộ test case của feature (96)

Cột "Tự động hóa" đánh giá khả năng kỹ thuật theo quyết định "chỉ test qua UI"; ghi chú "fail do #42" là hệ quả dự kiến, không phải lý do không tự động hóa.

| Mã | Tiêu đề | Loại | Kỹ thuật | Đã chạy tay / kết quả | Bug liên quan | Tự động hóa | Lý do |
|---|---|---|---|---|---|---|---|
| TC-REG-01 | Đăng ký thành công với dữ liệu hợp lệ cơ sở | positive | EP | Fail | #42 | Có | OUT1 đo bằng URL và form đăng nhập |
| TC-REG-02 | Thành công khi Họ Tên có chữ tiếng Việt có dấu | positive | EP | Not run | #42 (dự kiến) | Có | Như TC-REG-01; dự kiến fail do #42 |
| TC-REG-03 | Thành công khi Họ Tên có chữ số | positive | EP | Not run | #42 (dự kiến) | Có | Như TC-REG-01; dự kiến fail do #42 |
| TC-REG-04 | Thành công khi Họ Tên có dấu gạch nối | positive | EP | Not run | #42 (dự kiến) | Có | Như TC-REG-01; dự kiến fail do #42 |
| TC-REG-05 | Thành công khi Họ Tên chỉ gồm chữ số | positive | EP | Not run | #42 (dự kiến) | Có | Như TC-REG-01; dự kiến fail do #42 |
| TC-REG-06 | Thành công khi Họ Tên có dấu cách đầu và cuối | positive | EP | Not run | #42 (dự kiến) | Có | OUT1 đo được; việc cắt dấu cách khi lưu không đo được (GH1) |
| TC-REG-07 | Thành công khi Họ Tên có 2 dấu cách liền nhau ở giữa | positive | EP | Not run | #42 (dự kiến) | Có | Như TC-REG-06 (GH1) |
| TC-REG-08 | Thành công khi Họ Tên có thẻ HTML và dấu nháy đơn | positive | EP | Not run | #42 (dự kiến) | Có | OUT1 đo được; "không có lỗi hệ thống" đo bằng mã phản hồi của request đăng ký (GH5) |
| TC-REG-09 | Thành công khi Email có dấu chấm trước `@` và tên miền con | positive | EP | Not run | #42 (dự kiến) | Có | Như TC-REG-01 |
| TC-REG-10 | Thành công khi phần sau `@` không có dấu chấm | positive | EP | Not run | #42 (dự kiến) | Có | Như TC-REG-01 |
| TC-REG-11 | Thành công khi Email có dấu cách đầu và cuối | positive | EP | Not run | #42 (dự kiến) | Có, cần chuẩn bị | 2 bước; bước 2 cần bước 1 tạo được tài khoản, #42 chặn bước 1 |
| TC-REG-12 | Thành công khi Email bắt đầu bằng dấu chấm | positive | EP | Not run | #42 (dự kiến) | Có | Như TC-REG-01 |
| TC-REG-13 | Thành công khi Email có dấu cộng trước `@` | positive | EP | Not run | #42 (dự kiến) | Có | Như TC-REG-01 |
| TC-REG-14 | Thành công khi tên miền có chữ có dấu | positive | EP | Not run | #42 (dự kiến), #50 | Có | Ô Email là `type="text"` (#50) nên trình duyệt không chuyển punycode (GH6); kết quả khác nhau giữa trình duyệt cần ghi rõ |
| TC-REG-15 | Thành công khi Email có dấu nháy đơn | positive | EP | Not run | #42 (dự kiến) | Có | Như TC-REG-08 |
| TC-REG-16 | Thành công khi Mật khẩu có dấu cách ở giữa | positive | EP | Not run | #42 (dự kiến) | Có | OUT1 đo được; mật khẩu lưu đúng hay không cần FR-02 (GH3) |
| TC-REG-17 | Thành công khi Mật khẩu có ký tự ngoài 4 loại | positive | EP | Not run | #42 (dự kiến) | Có | Như TC-REG-01 |
| TC-REG-18 | Thành công khi Mật khẩu đủ 8 ký tự nhờ dấu cách ở cuối | positive | EP | Not run | #42 (dự kiến) | Có | Như TC-REG-16 (GH3) |
| TC-REG-30 | Bị từ chối khi Họ Tên để trống | negative | EP | Pass | | Có | Trình duyệt chặn gửi; đo `validity` của ô Họ Tên (GĐ-02) |
| TC-REG-31 | Bị từ chối khi Họ Tên chỉ gồm 3 dấu cách | negative | EP | Blocked (#42) | #42 | Có | Đo được, nhưng bước "đúng nguyên nhân ERR1" chỉ lặp lại #42 (ghi chú 2) |
| TC-REG-32 | Bị từ chối khi Email để trống | negative | EP | Pass | | Có | Trình duyệt chặn gửi; đo `validity` của ô Email (GĐ-02) |
| TC-REG-33 | Bị từ chối khi Email chỉ gồm 3 dấu cách | negative | EP | Blocked (#42) | #42 | Có | Như TC-REG-31 |
| TC-REG-34 | Bị từ chối khi Email thiếu `@` | negative | EP | Blocked (#42) | #42 | Có | Như TC-REG-31 |
| TC-REG-35 | Bị từ chối khi Email thiếu phần trước `@` | negative | EP | Blocked (#42) | #42 | Có | Như TC-REG-31 |
| TC-REG-36 | Bị từ chối khi Email thiếu phần sau `@` | negative | EP | Blocked (#42) | #42 | Có | Như TC-REG-31 |
| TC-REG-37 | Bị từ chối khi Email có 2 dấu `@` | negative | EP | Blocked (#42) | #42 | Có | Như TC-REG-31 |
| TC-REG-38 | Bị từ chối khi Email có dấu cách ở giữa | negative | EP | Blocked (#42) | #42 | Có | Như TC-REG-31 |
| TC-REG-39 | Bị từ chối khi có dấu chấm ngay sau `@` | negative | EP | Blocked (#42) | #42 | Có | Như TC-REG-31 |
| TC-REG-40 | Bị từ chối khi phần trước `@` có dấu ngoặc | negative | EP | Not run | #42 (dự kiến) | Có | Như TC-REG-31 |
| TC-REG-41 | Bị từ chối khi tên miền có dấu gạch dưới | negative | EP | Not run | #42 (dự kiến) | Có | Như TC-REG-31 |
| TC-REG-42 | Bị từ chối khi nhãn tên miền bắt đầu bằng gạch nối | negative | EP | Not run | #42 (dự kiến) | Có | Như TC-REG-31 |
| TC-REG-43 | Bị từ chối khi nhãn tên miền dài 70 ký tự | negative | EP | Not run | #42 (dự kiến) | Có | Như TC-REG-31 |
| TC-REG-44 | Bị từ chối khi phần trước `@` có chữ có dấu | negative | EP | Not run | #42 (dự kiến) | Có | Như TC-REG-31 |
| TC-REG-45 | Bị từ chối khi Email trùng tài khoản có sẵn | negative | EP | Blocked (#42) | #42 | Có, cần chuẩn bị | Cần `test@eshop.com` có sẵn (reset DB); bước "đúng nguyên nhân ERR4" chỉ lặp lại #42 |
| TC-REG-46 | Bị từ chối khi Email trùng email vừa đăng ký | negative | EP | Not run | #42 | Có, cần chuẩn bị | Lần 1 phải đăng ký thành công qua UI, #42 chặn; không tạo trước bằng API (đã chốt chỉ UI) |
| TC-REG-47 | Bị từ chối khi Email trùng khác hoa thường | negative | EP | Not run | #42 (dự kiến) | Có, cần chuẩn bị | Như TC-REG-45 |
| TC-REG-48 | Bị từ chối khi Email trùng sau khi cắt dấu cách | negative | EP | Not run | #42 (dự kiến) | Có, cần chuẩn bị | Như TC-REG-45 |
| TC-REG-49 | Bị từ chối khi Mật khẩu để trống | negative | EP | Pass | | Có | Trình duyệt chặn gửi; đo `validity` của ô Mật khẩu (GĐ-02) |
| TC-REG-50 | Bị từ chối khi Mật khẩu có 6 ký tự | negative | EP | Pass | | Có | Thông báo của trang đo được (ghi chú 3) |
| TC-REG-51 | Bị từ chối khi Mật khẩu không có chữ hoa | negative | EP | Not run | | Có | Như TC-REG-50 |
| TC-REG-52 | Bị từ chối khi chữ hoa duy nhất là chữ có dấu | negative | EP | Not run | | Có | Như TC-REG-50 |
| TC-REG-53 | Bị từ chối khi Mật khẩu không có chữ thường | negative | EP | Not run | | Có | Như TC-REG-50 |
| TC-REG-54 | Bị từ chối khi chữ thường duy nhất là chữ có dấu | negative | EP | Not run | | Có | Như TC-REG-50 |
| TC-REG-55 | Bị từ chối khi Mật khẩu không có chữ số | negative | EP | Not run | | Có | Như TC-REG-50 |
| TC-REG-56 | Bị từ chối khi Mật khẩu không có ký tự đặc biệt | negative | EP | Pass | | Có | Như TC-REG-50 |
| TC-REG-57 | Bị từ chối khi ký tự đặc biệt nằm ngoài tập cho phép | negative | EP | Not run | | Có | Như TC-REG-50 |
| TC-REG-58 | Bị từ chối khi Mật khẩu chỉ gồm 8 dấu cách | negative | EP | Not run | | Có | Như TC-REG-50; mong đợi ERR6, không phải ERR5 |
| TC-REG-59 | Bị từ chối khi Xác nhận mật khẩu khác Mật khẩu | negative | EP | Blocked (#43) | #43 | Không | Form không có ô Xác nhận mật khẩu (#43): Không thực hiện được bước nhập; test chỉ lặp lại TC-REG-90 |
| TC-REG-60 | Bị từ chối khi Xác nhận mật khẩu để trống | negative | EP | Blocked (#43) | #43 | Không | Như TC-REG-59 |
| TC-REG-61 | Bị từ chối khi Xác nhận mật khẩu khác hoa thường | negative | EP | Blocked (#43) | #43 | Không | Như TC-REG-59 |
| TC-REG-62 | Bị từ chối khi Xác nhận mật khẩu thừa dấu cách cuối | negative | EP | Blocked (#43) | #43 | Không | Như TC-REG-59 |
| TC-REG-101 | Thành công khi Họ Tên dài 1 ký tự | edge | BVA | Blocked (#42) | #42 | Có | OUT1 đo được; dự kiến fail do #42 |
| TC-REG-131 | Thành công khi Họ Tên 1 ký tự có dấu cách hai bên | edge | BVA | Not run | #42 (dự kiến) | Có | Như TC-REG-101 |
| TC-REG-102 | Thành công khi Họ Tên dài 2 ký tự | edge | BVA | Not run | #42 (dự kiến) | Có | Như TC-REG-101 |
| TC-REG-103 | Họ Tên dài 1000 ký tự | edge | BVA | Not run | #42 (dự kiến) | Có | Số ký tự ô nhận đo bằng độ dài giá trị của ô; OUT1 dự kiến fail do #42 (GH7) |
| TC-REG-104 | Bị từ chối khi Họ Tên là 1 dấu cách | edge | BVA | Blocked (#42) | #42 | Có | Như TC-REG-31 |
| TC-REG-106 | Bị từ chối khi Mật khẩu dài 4 ký tự | edge | BVA | Not run | | Có | Như TC-REG-50 |
| TC-REG-107 | Bị từ chối khi Mật khẩu dài 7 ký tự | edge | BVA | Pass | | Có | Như TC-REG-50 |
| TC-REG-108 | Thành công khi Mật khẩu dài 9 ký tự | edge | BVA | Fail | #42 | Có | OUT1 đo được |
| TC-REG-110 | Mật khẩu dài 1000 ký tự | edge | BVA | Not run | #42 (dự kiến) | Có | Như TC-REG-103 (GH3, GH7) |
| TC-REG-111 | Thành công khi Mật khẩu đủ 8 nhờ dấu cách ở đầu | edge | BVA | Not run | #42 (dự kiến) | Có | Như TC-REG-16 (GH3) |
| TC-REG-112 | Thành công khi Mật khẩu có đúng 1 chữ thường | edge | BVA | Not run | #42 (dự kiến) | Có | Như TC-REG-101 |
| TC-REG-113 | Thành công khi Mật khẩu có đúng 2 ký tự mỗi loại | edge | BVA | Not run | #42 (dự kiến) | Có | Như TC-REG-101 |
| TC-REG-114 | Thành công khi phần trước `@` dài 1 ký tự | edge | BVA | Not run | #42 (dự kiến) | Có | Như TC-REG-101; email cố định độ dài, hợp với reset DB |
| TC-REG-115 | Thành công khi phần trước `@` dài 2 ký tự | edge | BVA | Not run | #42 (dự kiến) | Có | Như TC-REG-114 |
| TC-REG-116 | Thành công khi nhãn tên miền dài 1 ký tự | edge | BVA | Not run | #42 (dự kiến) | Có | Như TC-REG-101 |
| TC-REG-117 | Thành công khi nhãn tên miền dài 2 ký tự | edge | BVA | Not run | #42 (dự kiến) | Có | Như TC-REG-101 |
| TC-REG-118 | Thành công khi nhãn tên miền dài 62 ký tự | edge | BVA | Not run | #42 (dự kiến) | Có | Như TC-REG-101 |
| TC-REG-119 | Thành công khi nhãn tên miền dài 63 ký tự | edge | BVA | Not run | #42 (dự kiến) | Có | Như TC-REG-101 |
| TC-REG-120 | Bị từ chối khi nhãn tên miền dài 64 ký tự | edge | BVA | Not run | #42 (dự kiến) | Có | Như TC-REG-31 |
| TC-REG-121 | Thành công khi nhãn tên miền có dấu dài 63 (punycode) | edge | BVA | Not run | #42 (dự kiến), #50 | Có | Như TC-REG-14 (GH6) |
| TC-REG-122 | Bị từ chối khi nhãn tên miền có dấu dài 64 (punycode) | edge | BVA | Not run | #42 (dự kiến), #50 | Có | Như TC-REG-14 (GH6) và TC-REG-31 |
| TC-REG-123 | Email dài 1011 ký tự | edge | BVA | Not run | #42 (dự kiến) | Có | Như TC-REG-103 (GH7) |
| TC-REG-70 | API đăng ký thành công | positive | EP | Pass | | Không | Chỉ kiểm qua API; đã chốt chỉ test qua UI (đề: "automate the web frontend") |
| TC-REG-71 | API từ chối khi `name` rỗng | negative | EP | Fail | #44, #48 | Không | Như TC-REG-70 |
| TC-REG-72 | API từ chối khi `name` chỉ có dấu cách | negative | EP | Fail | #44, #48 | Không | Như TC-REG-70 |
| TC-REG-73 | API từ chối khi `email` rỗng | negative | EP | Fail | #45 | Không | Như TC-REG-70 |
| TC-REG-74 | API từ chối khi `email` thiếu `@` | negative | EP | Fail | #47 | Không | Như TC-REG-70 |
| TC-REG-75 | API từ chối khi `password` rỗng | negative | EP | Fail | #46, #48 | Không | Như TC-REG-70 |
| TC-REG-76 | API từ chối khi `password` có 6 ký tự | negative | EP | Fail | #49, #48 | Không | Như TC-REG-70 |
| TC-REG-77 | API từ chối khi `password` không có ký tự đặc biệt | negative | EP | Fail | #49, #48 | Không | Như TC-REG-70 |
| TC-REG-80 | API từ chối khi `email` chỉ có dấu cách | negative | EP | Fail | #45 | Không | Như TC-REG-70 |
| TC-REG-81 | API lưu email đã cắt dấu cách | positive | EP | Blocked (#42) | #42 | Không | Bước 1 gửi API (đã chốt bỏ); bước 2 bị #42 che |
| TC-REG-82 | API từ chối email trùng sau khi cắt dấu cách | negative | EP | Fail | #48 | Không | Như TC-REG-70 |
| TC-REG-129 | API từ chối khi `password` dài 7 ký tự | edge | BVA | Fail | #49, #48 | Không | Như TC-REG-70 |
| TC-REG-130 | API từ chối khi nhãn tên miền dài 64 ký tự | edge | BVA | Fail | #47 | Không | Như TC-REG-70 |
| TC-REG-78 | Email chứa chuỗi SQL được lưu và so sánh nguyên văn | negative | EP | Blocked (#42) | #42 | Không | Bước 1 gửi API (đã chốt bỏ); làm bước 1 qua UI thì #42 chặn nên bước 2 không còn ý nghĩa |
| TC-REG-79 | Họ Tên chứa `DROP TABLE` không làm hỏng dữ liệu | negative | EP | Blocked (#42) | #42 | Không | Như TC-REG-78; thêm ràng buộc chạy cuối cùng và reset ngay sau đó (`05_final_tc.md` mục 10), khó giữ khi chạy 3 trình duyệt |
| TC-REG-90 | Form Đăng ký có trường Xác nhận mật khẩu | positive | Checklist | Fail | #43 | Có | Đếm ô / tìm nhãn "Xác nhận mật khẩu" |
| TC-REG-91 | Ngôn ngữ trang Đăng ký và tiêu đề tab | positive | Checklist | Fail | #54 | Không | "Toàn bộ tiếng Việt" cần người đọc đánh giá; máy không xác định được ngôn ngữ của mọi chữ, bong bóng trình duyệt không nằm trong DOM |
| TC-REG-92 | Màu nút "Đăng Ký" | positive | Checklist | Fail | #52 | Có | Màu nền đo được (`getComputedStyle`), quy ra sắc độ (hue) theo tiêu chí đã chốt (CH-select-01 a); khoảng hue cụ thể chốt ở bước `data` |
| TC-REG-93 | Trang Đăng ký có đúng 1 thẻ `<h1>` | positive | Checklist | Fail | #53 | Có | Đếm thẻ `h1`; "mô tả nội dung trang" đo bằng chữ trong `h1` chứa "Đăng ký" (CH-select-02 b) |
| TC-REG-94 | Thứ tự focus khi nhấn Tab | positive | Checklist | Pass | (#43) | Có | Nhấn Tab và kiểm phần tử đang focus; bắt đầu từ ô Họ Tên, không tính ô Xác nhận mật khẩu (CH-select-03 a) |
| TC-REG-95 | Dấu `*` cạnh nhãn trường bắt buộc | positive | Checklist | Fail | #51 | Có | Đọc chữ của nhãn |
| TC-REG-96 | Loại ô Email và ô Mật khẩu | positive | Checklist | Fail | #50 | Có | Thuộc tính `type` của 2 ô |
| TC-REG-97 | Vị trí thông báo lỗi | positive | Checklist | Pass | | Có | Dữ liệu của TC-REG-30 cho bong bóng trình duyệt, không nằm trong DOM; dùng dữ liệu của TC-REG-107 để có thông báo của trang rồi so tọa độ với nút (CH-select-04 a) |

Tổng: 96 test case. Có 71; Có, cần chuẩn bị 5 (TC-REG-11, 45, 46, 47, 48); Không 20 (13 test case API gồm cả TC-REG-81, 2 bảo mật, 4 Xác nhận mật khẩu, TC-REG-91).

## 2. Test case được chọn (14 test case)

Cách áp tiêu chí: Lấy test case UI đã chạy tay ở HW02 (tiêu chí a, 31 test case), xếp trước những test case Fail có issue (tiêu chí b), lọc theo khả năng đo đúng ý (mục "Bug #42 che..."), dùng tiêu chí c để chọn giữa các test case cùng mức.

| Mã | Loại | Kỹ thuật | Kết quả mong đợi (tóm tắt) | Căn cứ | Phần | Dữ liệu cần chuẩn bị | Vì sao chọn |
|---|---|---|---|---|---|---|---|
| TC-REG-01 | positive | EP | OUT1: Chuyển tới `/login`, có form đăng nhập | FR-01 ý 1 đến 3, 5 (FR01-R01 đến R10, R13) | P1 | DB vừa reset; email `tc01@domain.com` chưa có | a, b: Fail ở HW02, regression cho #42 (critical); giá trị cơ sở của mọi lớp hợp lệ |
| TC-REG-108 | edge | BVA | OUT1 với mật khẩu 9 ký tự `Abcdefg1!` | FR-01 ý 3, 5 (FR01-R06, R13) | P1 | DB vừa reset; email `tc108@domain.com` chưa có | a, b: Fail ở HW02 (#42); biên LB+1 của độ dài mật khẩu, cặp với TC-REG-107 |
| TC-REG-90 | positive | Checklist | Form có trường Xác nhận mật khẩu | FR-01 ý 4 (FR01-R11) | P4 | Không; mở `/register` khi chưa đăng nhập | a, b: Fail ở HW02, regression cho #43 (high) |
| TC-REG-92 | positive | Checklist | Nút "Đăng Ký" có màu nền xanh dương: Hue của màu nền tính được nằm trong khoảng chốt ở bước `data`, độ bão hòa đủ lớn | FR-21 "Nhất quán màu sắc" (FR01-R15) | P4 | Như TC-REG-90 | a, b: Fail ở HW02 (#52) |
| TC-REG-93 | positive | Checklist | Đúng 1 thẻ `<h1>`, chữ trong đó chứa "Đăng ký" (không phân biệt hoa thường) | FR-21 "Tiêu đề trang" (FR01-R16) | P4 | Như TC-REG-90 | a, b: Fail ở HW02 (#53) |
| TC-REG-95 | positive | Checklist | Nhãn Họ Tên, Email, Mật khẩu có dấu `*`. Chỉ kiểm 3 nhãn đang có trên giao diện; nhãn Xác nhận mật khẩu không kiểm ở đây vì ô này thiếu (#43, đã kiểm ở TC-REG-90) | FR-22 ý 1 (FR01-R18) | P4 | Như TC-REG-90 | a, b: Fail ở HW02 (#51) |
| TC-REG-96 | positive | Checklist | Ô Email `type="email"`; ô Mật khẩu `type="password"` | FR-22 ý 2, 3 (FR01-R19, R20) | P4 | Như TC-REG-90 | a, b: Fail ở HW02 (#50); kết quả giải thích hành vi của các test có Email chứa dấu cách |
| TC-REG-30 | negative | EP | OUT2, ERR1: Ô Họ Tên bị chặn vì trống; vẫn ở `/register` | FR-01 ý 1 (FR01-R01) | P2 | Không | a: Pass ở HW02; c: Lớp không hợp lệ của Họ Tên, đo được đúng nguyên nhân dù có #42 |
| TC-REG-32 | negative | EP | OUT2, ERR2: Ô Email bị chặn vì trống; vẫn ở `/register` | FR-01 ý 1 (FR01-R02) | P2 | Không | a: Pass ở HW02; c: Lớp không hợp lệ của Email |
| TC-REG-49 | negative | EP | OUT2, ERR5: Ô Mật khẩu bị chặn vì trống; vẫn ở `/register` | FR-01 ý 1 (FR01-R03) | P2 | Không | a: Pass ở HW02; c: Lớp không hợp lệ của Mật khẩu (bắt buộc) |
| TC-REG-56 | negative | EP | OUT2, ERR6: Có thông báo của trang chứa "mật khẩu" (không phân biệt hoa thường); vẫn ở `/register` | FR-01 ý 3 (FR01-R10) | P3 | Không | a: Pass ở HW02; c: Quy tắc ký tự đặc biệt, khác quy tắc độ dài của TC-REG-107 |
| TC-REG-107 | edge | BVA | OUT2, ERR6 với mật khẩu 7 ký tự `Abcde1!`, đo như TC-REG-56 | FR-01 ý 3 (FR01-R06) | P3 | Không | a: Pass ở HW02; c: Biên LB-1 của độ dài, cặp với TC-REG-108 |
| TC-REG-94 | positive | Checklist | Bắt đầu từ ô Họ Tên, nhấn Tab lần lượt tới Email, Mật khẩu, nút "Đăng Ký", liên kết "Đăng nhập" (không tính ô Xác nhận mật khẩu) | FR-21 "Tab Order" (FR01-R17) | P5 | Không | a: Pass ở HW02; c: Yêu cầu FR01-R17 không test case nào khác phủ |
| TC-REG-97 | positive | Checklist | Thông báo lỗi của trang nằm phía trên nút "Đăng Ký" (so tọa độ) | FR-22 ý 4 (FR01-R21) | P5 | Dùng dữ liệu của TC-REG-107 (mật khẩu `Abcde1!`) thay dữ liệu TC-REG-30 để có thông báo của trang; đã đổi dữ liệu so với HW02 | a: Pass ở HW02; c: Yêu cầu FR01-R21 không test case nào khác phủ |

Thống kê: 8 positive, 4 negative, 2 edge; 5 EP, 2 BVA, 7 Checklist. Theo kết quả HW02: 7 Fail có issue (TC-REG-01, 108, 90, 92, 93, 95, 96), 7 Pass.

Phủ theo FR-01: Họ Tên (R01) bắt buộc; Email (R02) bắt buộc; Mật khẩu (R03) bắt buộc, độ dài (R06, biên 7 và 9), ký tự đặc biệt (R10); Xác nhận mật khẩu (R11); chuyển trang (R13); giao diện R15 đến R21 trừ R14. Chưa phủ: Email sai định dạng (R04), Email trùng (R05), Họ Tên chỉ có dấu cách; sinh viên chấp nhận vì các test case này chỉ lặp lại #42 (CH-select-07 a).

Dự phòng:

- TC-REG-50 (Mật khẩu 6 ký tự, Pass ở HW02): Thay TC-REG-107 hoặc TC-REG-56 nếu một trong hai không chạy ổn định. Dữ liệu: Không cần chuẩn bị.
- TC-REG-34 (Email thiếu `@`, Blocked ở HW02): Phủ R04; dự kiến fail ở bước "đúng nguyên nhân" do #42. Dữ liệu: Không cần chuẩn bị.
- TC-REG-45 (Email trùng `test@eshop.com`, Blocked ở HW02): Phủ R05; dự kiến fail do #42. Dữ liệu: `test@eshop.com` có sẵn sau khi reset DB.

## 3. Kế hoạch sinh script

| Phần | Luồng thao tác | Test case | File spec | File dữ liệu |
|---|---|---|---|---|
| P1 | Điền đủ form hợp lệ, bấm "Đăng Ký", kiểm chuyển tới `/login` và form đăng nhập | TC-REG-01, TC-REG-108 | `tests/A_FR-01_DangKy/01_register_valid.spec.ts` | `tests/A_FR-01_DangKy/data/register_valid.json` |
| P2 | Để trống một ô bắt buộc, bấm "Đăng Ký", kiểm trình duyệt chặn đúng ô, không gửi request, vẫn ở `/register` | TC-REG-30, TC-REG-32, TC-REG-49 | `tests/A_FR-01_DangKy/02_required_fields.spec.ts` | `tests/A_FR-01_DangKy/data/required_fields.json` |
| P3 | Điền mật khẩu yếu, bấm "Đăng Ký", kiểm thông báo của trang chứa "mật khẩu", vẫn ở `/register` | TC-REG-56, TC-REG-107 | `tests/A_FR-01_DangKy/03_weak_password.spec.ts` | `tests/A_FR-01_DangKy/data/weak_password.json` |
| P4 | Mở `/register`, không gửi form, kiểm cấu trúc form: Ô Xác nhận mật khẩu, màu nút, thẻ `h1`, dấu `*` trên 3 nhãn đang có, loại ô | TC-REG-90, TC-REG-92, TC-REG-93, TC-REG-95, TC-REG-96 | `tests/A_FR-01_DangKy/04_form_checklist.spec.ts` | `tests/A_FR-01_DangKy/data/form_checklist.json` |
| P5 | Focus ô Họ Tên rồi nhấn Tab qua form; gửi dữ liệu của TC-REG-107 rồi so tọa độ thông báo của trang với nút | TC-REG-94, TC-REG-97 | `tests/A_FR-01_DangKy/05_focus_and_error_position.spec.ts` | `tests/A_FR-01_DangKy/data/focus_and_error_position.json` |

Ô Xác nhận mật khẩu ở P1, P3, P5 (CH-select-06 a): Có ô thì nhập theo dữ liệu, không có thì bỏ qua bước nhập và ghi annotation vào report. Chỉ P1 tạo dữ liệu (2 tài khoản nếu #42 được sửa); các phần khác không ghi gì vào DB.

## 4. Test case không tự động hóa được

| Mã | Lý do cụ thể | Cách kiểm thay thế |
|---|---|---|
| TC-REG-70 đến TC-REG-77, TC-REG-80, TC-REG-82, TC-REG-129, TC-REG-130 | Chỉ kiểm qua API `POST /api/register`; dự án chốt chỉ tự động hóa qua giao diện web (đề HW04: "automate the web frontend") | Giữ kết quả chạy API của HW02 (`06_results.md` nhóm E, script `scripts/run_api_tests.py`); bug #44 đến #49 đã có issue |
| TC-REG-81 | Bước 1 gửi API (đã chốt bỏ); bước 2 qua UI bị #42 che | Như dòng trên |
| TC-REG-78 | Bước 1 gửi API (đã chốt bỏ). Làm bước 1 qua UI thì #42 chặn tạo tài khoản, bước 2 (so trùng) không còn ý nghĩa | Chạy tay sau khi #42 được sửa |
| TC-REG-79 | Như TC-REG-78; thêm ràng buộc phải chạy cuối cùng và reset DB ngay sau đó (`05_final_tc.md` mục 10), không giữ được trong một lượt chạy chung với các test khác | Chạy tay riêng, như HW02 (`scripts/run_tc79.py`) |
| TC-REG-59 đến TC-REG-62 | Form không có ô Xác nhận mật khẩu (#43): Bước "nhập Xác nhận mật khẩu" không thực hiện được; test chỉ lặp lại kết luận của TC-REG-90 | TC-REG-90 (đã chọn) giữ regression cho #43; chạy lại 4 test case này khi có ô |
| TC-REG-91 | "Toàn bộ chữ là tiếng Việt" cần người đọc đánh giá; máy không xác định được ngôn ngữ của từng chữ, và bong bóng "Please fill out this field." của trình duyệt không nằm trong DOM | Kiểm tay; ảnh HW02 (`S0_01_form_dang_ky.png`, `S6_TC-REG-30.png`) và issue #54 |

## 5. Câu hỏi và quyết định

| Mã | Câu hỏi | Quyết định của SV |
|---|---|---|
| CH-select-01 | TC-REG-92: Tiêu chí "xanh dương" khi đặc tả không ghi mã màu | a. Đổi màu nền tính được sang sắc độ (hue), xanh dương khi hue nằm trong một khoảng và độ bão hòa đủ lớn. Khoảng cụ thể (bản AI gợi ý 200° đến 250°) ⏳ chốt ở bước `data` |
| CH-select-02 | TC-REG-93: Đo "mô tả nội dung trang" | b. Đúng 1 thẻ `h1` và chữ trong đó chứa "Đăng ký" (không phân biệt hoa thường) |
| CH-select-03 | TC-REG-94: Điểm bắt đầu và ô Xác nhận mật khẩu trong thứ tự | a. Bắt đầu bằng focus vào ô Họ Tên, kiểm thứ tự các phần tử có trên form, không tính ô Xác nhận mật khẩu |
| CH-select-04 | TC-REG-97: Dữ liệu để có thông báo đo được vị trí | a. Dùng dữ liệu của TC-REG-107 để có thông báo của trang; ghi rõ đã đổi dữ liệu so với HW02 |
| CH-select-05 | Đo "đúng nguyên nhân" của ERR6 khi đặc tả không ghi câu thông báo | a. Có thông báo của trang chứa "mật khẩu" (không phân biệt hoa thường), vẫn ở `/register`. Cách tìm vùng thông báo ⏳ chốt ở bước `data` / `script` |
| CH-select-06 | Ô Xác nhận mật khẩu với test case không nhắm vào nó | a. Có ô thì nhập, không có thì bỏ qua và ghi annotation vào report (như HW02 mục 1.4) |
| CH-select-07 | Bộ chọn chưa phủ R04, R05 và Họ Tên chỉ có dấu cách | a. Giữ 14 test case; TC-REG-34, TC-REG-45 ở dự phòng |

## 6. Thay đổi so với bản AI

| Vị trí | Thay đổi | Loại | Loại lỗi script | Vì sao AI sai / bỏ sót | Lý do hoặc căn cứ |
|---|---|---|---|---|---|
| ★ TC-REG-95 (mục 2, kế hoạch P4) | Kết quả mong đợi "Nhãn Họ Tên, Email, Mật khẩu (và Xác nhận mật khẩu) có dấu `*`" → chỉ kiểm dấu `*` trên 3 nhãn đang có trên giao diện; nhãn Xác nhận mật khẩu không kiểm ở TC-REG-95 | Mơ hồ | Assertion yếu / thiếu | Giới hạn model: AI đã biết form thiếu ô Xác nhận mật khẩu (#43) và đã hỏi CH-select-06 cho bước nhập ô, nhưng không áp cùng ý cho nhãn của ô ở TC-REG-95; để nguyên "(và Xác nhận mật khẩu)" thì script có thể fail vì thiếu ô (đã đo ở TC-REG-90) thay vì vì thiếu dấu `*` | Sinh viên tự thấy khi đọc bản AI (2026-11-17); FR-22 ý 1, FR01-R18; tránh một lỗi (#43) làm hai test case fail |
