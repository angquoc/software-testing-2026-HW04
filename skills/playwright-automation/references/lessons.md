# Checklist tự kiểm và bài học

Đi qua checklist của bước trước khi giao. Mục "Rút từ lần làm thật" ghi lỗi đã gặp thật (kèm feature, ngày); các mục khác là kinh nghiệm chung về Playwright, **chưa** kiểm chứng trên hệ thống đang test.

## Checklist theo bước

### `select`

- [ ] Đọc **toàn bộ** test case của feature trước khi chọn, không chỉ phần đầu file.
- [ ] Mỗi test case chọn có kết quả mong đợi đo được bằng máy; test case "kiểm bằng mắt" không chọn hoặc ghi rõ cách đo.
- [ ] Lý do "không tự động hóa được" cụ thể (thiếu trạng thái gì, cần dịch vụ gì), không ghi "phức tạp".
- [ ] Kế hoạch sinh script: Mỗi phần là một luồng thao tác; không có phần nào gom mọi thứ.
- [ ] Đã hỏi tiêu chí chọn, không tự chọn tiêu chí.
- [ ] Ràng buộc áp chung cho nhiều giá trị của trường khác (ví dụ "giá trị dương" cho cả loại phần trăm và loại cố định): Có ít nhất một test case cho mỗi giá trị; ưu tiên test case cùng lớp với bug đã biết.
- [ ] Có mục "Điều kiện tiên quyết" chung (server, trạng thái dữ liệu, tài khoản); dự phòng 2 đến 3 mã, mỗi mã một lý do.
- [ ] "Dữ liệu cần chuẩn bị" ghi cụ thể (tên sản phẩm, số lượng, mã), không để chung chung như "giỏ 2 dòng"; test case gốc không ghi thì lấy từ ảnh hoặc kết quả chạy tay của bài trước, không có thì hỏi. Dự phòng cũng ghi dữ liệu.
- [ ] Test case cần một phần tử mà bug đã biết làm mất (hộp thoại xác nhận không hiện, nút không có): Ghi hệ quả là test chỉ lặp lại bug đó, không đo được phần còn lại; đề xuất "Không" tự động hóa hoặc nêu rõ phần đo được.

### `data`

- [ ] `id` đúng mã gốc, không trùng; mỗi test case chọn đúng một dòng.
- [ ] Giá trị biên tính lại (độ dài chuỗi, số); có `note` cho biên.
- [ ] Kết quả mong đợi có `oracle`; không chép câu thông báo từ giao diện khi đặc tả không ghi.
- [ ] Giá trị cần duy nhất (email, mã) xử lý theo cách cô lập dữ liệu đã chốt; biên độ dài không bị chuỗi duy nhất làm lệch.
- [ ] Chuỗi có dấu tiếng Việt, khoảng trắng đầu / cuối giữ đúng như test case (JSON giữ được; CSV cần ngoặc kép).
- [ ] Test nhiều bước: Kết quả mong đợi sau **mỗi** bước ghi đủ trạng thái (số dòng, tổng, các dòng không đổi), không chỉ dòng vừa thay đổi; thiếu thì lỗi ghi đè hoặc mất dòng khác lọt qua.

### `script`

- [ ] Import `test`, `expect` từ `../support/fixtures`.
- [ ] Không có dữ liệu test viết thẳng trong spec; vòng lặp đọc từ file.
- [ ] Tên test bắt đầu bằng mã TC.
- [ ] Mỗi test kiểm **đủ** kết quả mong đợi, kể cả phần "không xảy ra".
- [ ] Không `waitForTimeout`, không `networkidle`, không `test.only`.
- [ ] Selector theo thứ tự ưu tiên; không class sinh tự động, không `nth-child`.
- [ ] Hộp thoại (`alert`, `confirm`) được bắt và kiểm chữ.
- [ ] Validation trình duyệt kiểm bằng `validity`, không so chữ bong bóng.
- [ ] Test kiểm "bị từ chối" có xét nhánh hệ thống nhận nhầm: Chữ mới trên trang có thể là dữ liệu vừa tạo, form có thể tự xóa; kiểm quan sát (thông báo) đặt trước và dùng `soft` để report ghi đủ. Bước "sau khi tải lại" là bằng chứng quan trọng thì cân nhắc cho bước "ngay sau khi bấm" là `soft` để bước tải lại vẫn chạy.
- [ ] Code trong `tests/` giống hệt khối code trong `ai_raw/` (`check_automation.py same`).
- [ ] Không chạy trên giao diện trước khi giao.

### `review`

- [ ] Chạy thử trên **cả 3** trình duyệt, không chỉ Chrome.
- [ ] Đọc cả test **qua**; thử làm hỏng có chủ đích ít nhất một test mỗi phần để chắc assertion bắt được lỗi.
- [ ] Test fail do hệ thống sai đặc tả được giữ nguyên, không sửa assertion cho xanh.
- [ ] Mỗi thay đổi một dòng bảng; cột "Vì sao" bắt đầu đúng giá trị; ghi ai phát hiện.
- [ ] Đánh dấu `★` chỗ sửa sẽ kể trong video.
- [ ] Thêm dòng vào bảng có sẵn: Chèn ngay sau dòng cuối của bảng, không để dòng trống chen giữa (`check_automation.py changes` báo "dòng bảng không thuộc bảng nào").

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
| Test ghi nhận "có bong bóng" dù hệ thống đã nhận dữ liệu (FR-17, 16/11/2026) | Đọc `validity` **sau** khi bấm gửi; gửi thành công thì form tự xóa, ô trống có `required` báo không hợp lệ | Đọc `validity` của ô vi phạm **trước** khi bấm gửi: Ô không hợp lệ lúc bấm thì trình duyệt chặn gửi và hiện bong bóng |
| Test kẹt tới hết thời gian của test (30 giây) thay vì fail ở assertion (FR-17, 16/11/2026) | Gọi `boundingBox()`, `getAttribute()`, `textContent()` trên locator không khớp phần tử nào: Các hàm này chờ phần tử xuất hiện, không theo thời gian chờ của `expect` | Kiểm `count()` (hoặc web-first assertion có thời gian chờ) trước; không có phần tử thì ghi lỗi `soft` rõ ràng và bỏ qua bước đo |
| Mẫu so số dựng bằng `new RegExp(...)` không khớp dù chuỗi đúng (FR-07, 17/11/2026) | Backreference đứng liền chữ số khi ghép chuỗi (`\\2` + `000` thành `\2000`): JavaScript đọc thành escape bát phân `\200` rồi chữ `0`, không còn là backreference | Bọc backreference: `(?:\\2)000`; có thể thử riêng mẫu bằng `node -e` với vài chuỗi đúng và sai có chủ đích (không chạy giao diện), vì `tsc` không bắt được lỗi này |
| Test ghi nhận "có thông báo" dù hệ thống không báo gì (FR-17, 16/11/2026) | Tìm chữ mới trên trang mà không bỏ vùng dữ liệu (bảng, danh sách): Hệ thống tạo nhầm dữ liệu thì dòng vừa tạo cũng là chữ mới | Bỏ chữ của vùng dữ liệu khi tìm thông báo; đọc chữ của trang và của vùng dữ liệu trong cùng một lần `page.evaluate` để không lệch thời điểm |

## Rút từ lần làm thật

Mỗi mục: Hiện tượng, feature và ngày, nguyên nhân, cách xử lý.

- **Setup project chạy cả khi lọc feature khác** (FR-17, 16/11/2026, bước `script` P1). Project `setup` khai báo làm `dependencies` của 3 trình duyệt vẫn chạy khi lệnh chỉ lọc thư mục của feature khác (`npx playwright test tests/<feature khác>/ --project=chrome`), vì Playwright luôn chạy project phụ thuộc. Phần chuẩn bị riêng của một feature (reset DB, đăng nhập) vì vậy chạy cả khi chạy feature khác, và hiện thành một test trong report của feature đó. Cách xử lý: Dùng `globalSetup` chung, trong đó chỉ gọi phần chuẩn bị của feature khi lượt chạy là feature đó (theo `RUN_LABEL` của `run.mjs` hoặc tham số đường dẫn trên dòng lệnh). Lỗi chuẩn bị ném lỗi rõ ràng kèm log, vì `globalSetup` không hiện trong report. Muốn thử nhanh thì dựng cấu hình tạm và chạy `--list`.
- **Phần sau sửa file dùng chung của phần trước** (FR-17, 16/11/2026, bước `script` P2). P2 mở rộng page object và hàm hỗ trợ do P1 sinh, nên `check_automation.py same` với bản P1 từng báo khác. Cách xử lý: Bản AI của phần sau chép **đủ** file dùng chung đã sửa và ghi ở đầu file là đã đổi gì so với phần trước; `same` coi bản AI mới nhất (xếp theo tên file) là bản để so.
- **Không chạy lặp được test có dữ liệu cố định** (FR-17, 16/11/2026, bước `review`). Bước review yêu cầu `--repeat-each=3` để bắt flaky, nhưng test tạo coupon mã cố định và xóa coupon có sẵn; DB chỉ reset một lần trong `globalSetup` mỗi lượt, nên lần lặp thứ 2 chắc chắn fail vì dữ liệu của lần 1. Cách xử lý: Chạy lại nguyên lượt (có reset) trên từng trình duyệt thay cho `--repeat-each`; ghi số lần chạy trong bảng chạy thử của `02_review.md`.
- **Ảnh Playwright chụp khi fail không làm được bằng chứng** (FR-17, 17/11/2026, bước `bugs`). `screenshot: 'only-on-failure'` chỉ chụp khung nhìn (dòng dữ liệu sai ở cuối bảng nằm ngoài ảnh) và chụp sau khi hộp thoại đã bị Playwright tự đóng, nên cả 5 ảnh fail đều không thấy lỗi. Cách xử lý: Sinh viên tái hiện bằng tay và tự chụp (đồng thời kiểm những bước test không chạy tới, như sau khi tải lại trang); ở bước `setup` có thể chọn `screenshot: { mode: 'only-on-failure', fullPage: true }`. Chữ của hộp thoại vẫn phải lấy từ annotation hoặc ảnh tự chụp.
- **Dữ liệu chuẩn bị mơ hồ và test case bị bug chặn điều kiện** (FR-07, 17/11/2026, bước `select`). Bản AI ghi TC-CART-90 cần "giỏ 2 dòng" mà không chốt sản phẩm (dù đã đọc ảnh HW02 có giỏ cụ thể), bước sau có thể tự chọn hoặc bịa; TC-CART-93 (màu nút xác nhận xóa) ghi "Có, cần tiêu chí" dù đã biết hộp thoại xác nhận không hiện (#72), nên test chỉ lặp lại #72. Cả hai do sinh viên phát hiện khi review. Cách xử lý: Hai ý tương ứng trong checklist bước `select`.
- **Sửa dữ liệu trước khi bản AI được commit** (FR-07, 17/11/2026, bước `data`). Sinh viên trả lời câu hỏi và nhờ sửa 2 điểm khi bản AI chưa commit; AI sửa thẳng 4 file JSON, rồi mới nhận ra commit "(AI draft)" sẽ lẫn phần đã sửa. Phải đưa `tests/` về bản AI và để bản đã sửa ở scratchpad cho sinh viên chép lại sau. Cách xử lý: Kiểm trạng thái commit trước khi sửa (`rules.md` mục 8). Cùng bước: Bản AI của TC-CART-08 chỉ ghi dòng Samsung sau khi thêm lại, không ghi số dòng và tổng (sinh viên thêm `rowCount`, `total`); thêm ý vào checklist bước `data`.
- **Dòng thay đổi mới bị tách khỏi bảng** (FR-07, 17/11/2026, bước `script` P1). Khi ghi 3 dòng thay đổi của P1 vào bảng mục 3 của `02_review.md` (đã có 4 dòng của bước `data`), AI thay đoạn văn ngay sau bảng bằng các dòng mới nên còn một dòng trống ở giữa. Khối 3 dòng không có tiêu đề: Không hiện thành bảng, `changes --stats` không đếm mà không báo gì. Phiên điều phối phát hiện khi số liệu không đổi. Cách xử lý: `changes` báo ERROR cho khối dòng bảng không có tiêu đề; checklist bước `review` thêm 1 ý.
- **Spec API không đủ 3 kiểu assertion** (FR-07, 17/11/2026, bước `script` P6). Phạm vi "mỗi spec ≥ 3 kiểu" chốt trước P1 chỉ nghĩ tới spec giao diện; spec P6 chỉ gọi API nên chỉ có phản hồi mạng và giá trị so sánh. AI để nguyên ERROR của `spec` và hỏi (đúng, không thêm assertion ngoài test case), nhưng đầu bản AI vẫn ghi "Đã sửa trước khi giao: Không" mà không nói còn lỗi. Cách xử lý: `step-script.md` hỏi ngoại lệ cho spec API từ đầu, và ghi "Lỗi kiểm còn lại" ở đầu bản AI.
