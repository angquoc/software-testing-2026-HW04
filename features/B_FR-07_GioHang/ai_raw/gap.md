# FR-07 Giỏ hàng gap: Gap analysis script AI sinh (bản AI)

- Bước: `[B-FR07][gap]`
- Thời gian tạo: 2026-11-17 23:01 (UTC+07:00)
- Công cụ: Claude Code, model Claude Opus 5.5 (`claude-opus-5-5`), skill `playwright-automation`
- Căn cứ: Bảng "Thay đổi so với bản AI" trong `01_selected_tc.md` (10 dòng) và `02_review.md` (15 dòng), đếm bằng `check_automation.py changes --stats`; `02_review.md` mục 2.3 (4 lượt chạy thử), 2.5; `03_results.md` (21 test fail, đều phân loại Bug); `01_selected_tc.md` mục 4; `ai_raw/select.md`, `data.md`, `script_01` đến `script_07`; `bugs/bug_report.md` (B-06 đến B-21); `lessons.md` hiện tại (để không đề xuất trùng)
- Đã sửa trước khi giao: Không

## 1. Số liệu

Đếm bằng `check_automation.py changes features/B_FR-07_GioHang/01_selected_tc.md features/B_FR-07_GioHang/02_review.md --stats`: 25 dòng thay đổi, trong đó 15 "Quyết định của SV" (cột "Vì sao" để trống) và **10 lỗi của AI** (Sai 3, Thiếu 3, Mơ hồ 4).

Bảng dưới chỉ đếm 10 lỗi của AI:

| Loại lỗi script | Prompt | Giới hạn model | Đặc thù feature | Tổng |
|---|---|---|---|---|
| Selector dễ vỡ | 0 | 0 | 0 | 0 |
| Assertion yếu / thiếu | 0 | 4 | 1 | 5 |
| Thiếu edge case | 0 | 2 | 0 | 2 |
| Wait gây flaky | 0 | 0 | 0 | 0 |
| Dữ liệu | 0 | 3 | 0 | 3 |
| Khác | 0 | 0 | 0 | 0 |
| **Tổng** | **0** | **9** | **1** | **10** |

15 dòng "Quyết định của SV" (không phải lỗi của AI): Assertion yếu / thiếu 9, Khác 3, Wait gây flaky 2, Dữ liệu 1. Đây là các câu hỏi mở AI nêu ra (CH-select, CH-data, CH-script) và sinh viên chọn phương án.

Theo bước phát hiện:

| Bước | Lỗi của AI | Ai phát hiện |
|---|---|---|
| `select` | 3 (TC-CART-90, 94 dữ liệu chuẩn bị; TC-CART-93) | Sinh viên khi review bản AI (TC-CART-94: AI áp nhận xét của SV ở TC-CART-90) |
| `data` | 2 (TC-CART-08 `afterReAdd`; câu định dạng tiền TC-CART-94) | Sinh viên khi review bản AI |
| `script` (P1) | 1 (`checkCartState` bỏ qua ô khi có dòng trùng) | Sinh viên khi đọc code |
| `review` | 4 (S1, S2 khi chạy thử; N1, N2 khi rà test qua) | AI khi chạy thử theo yêu cầu của SV (S1, S2); AI chỉ ra khi SV hỏi (N1, N2) |

Lỗi lọt qua review, lộ ra ở lần chạy chính thức: **Không có**. 21 test fail (F-01 đến F-21) đều phân loại Bug; không có `F-nn` loại Script hay Flaky (`03_results.md` mục 2).

## 2. AI sai hoặc bỏ sót gì, vì sao

### 2.1 Assertion yếu / thiếu (5)

- Ví dụ 1 (S2, ★, Đặc thù feature): `lib/feedback.ts` `startFeedbackRecorder` coi mọi chữ mới ngoài vùng sản phẩm là toast. Khi đã đăng nhập, Header vẽ lại câu chào "Chào, Test User" mỗi khi giỏ đổi, nên OUT15 **qua nhầm** ở TC-CART-01, 101, 02 (hệ thống không có toast, #78) và A31 fail nhầm ở TC-CART-100. Sửa: Chỉ tính chữ chưa có trên trang lúc cài bộ ghi.
  - Vì sao: Snapshot chụp trạng thái tĩnh nên AI không thấy việc vẽ lại; bài học FR-17 cùng loại ("bỏ vùng dữ liệu khi tìm thông báo") không phủ trường hợp chữ cũ được vẽ lại ở vùng khác.
- Ví dụ 2 (S1, ★, Giới hạn model): `lib/money.ts` ghép chuỗi regex thành `\2000`; JavaScript đọc là escape bát phân `\200` + "0", nên TC-CART-104, 105 **fail nhầm** dù hệ thống hiển thị đúng. Sửa: `(?:\2)000`.
- Ví dụ 3 (N1, Giới hạn model): Biên hai đầu `(^|\D)` cho dấu phẩy đứng trước, nên "1,996,000,000 ₫" khớp mẫu của 996,000,000 (assertion qua cả khi giá trị lớn hơn). Sửa: `(^|[^\d.,])`.
- Các dòng còn lại: TC-CART-93 xếp "Có, cần tiêu chí" dù đã biết không có dialog (#72), nên phần màu nút xác nhận chỉ lặp lại #72 (`select`); TC-CART-08 `afterReAdd` chỉ kiểm dòng vừa thêm, không kiểm số dòng và tổng (`data`).
- Vì sao chung: Giới hạn model ở 4 / 5 dòng: AI kiểm "có xảy ra điều mong đợi" nhưng không tự hỏi "assertion này có qua khi hệ thống sai không" (S2, N1, TC-CART-08), và ghép chuỗi regex mà không kiểm cú pháp (S1).
- Lần sau: Với mỗi assertion "không xảy ra" hoặc so khớp mẫu, thử một chuỗi sai có chủ đích ngay ở bước `review` (như lượt rà N1, N2); bộ ghi phản hồi chỉ tính chữ chưa có trước thao tác.

### 2.2 Dữ liệu (3)

- Ví dụ (★): TC-CART-90 ghi "Giỏ 2 dòng" mà không chốt sản phẩm, dù AI đã đọc ảnh `S0_03` của HW02 có giỏ iPhone 15 Pro Max × 1, Samsung Galaxy S24 Ultra × 1 (`01_selected_tc.md` mục 6). Cùng lỗi ở TC-CART-94.
- Ví dụ: Câu định dạng tiền ở `note` của TC-CART-94 ("mỗi nhóm 3 chữ số tính từ phải có một ký tự không phải chữ số đứng trước") không nói nhóm đầu được ít hơn 3 chữ số và nhận cả phân cách trộn lẫn (`02_review.md` mục 3).
- Vì sao: Giới hạn model: AI để ngỏ chi tiết mà test case gốc không ghi, thay vì lấy từ bằng chứng có sẵn hoặc hỏi.
- Lần sau: Checklist bước `select` đã thêm ý "Dữ liệu cần chuẩn bị ghi cụ thể" (`lessons.md`); với câu mô tả quy tắc định dạng, thử bằng 2 đến 3 ví dụ biên (số 7, 8, 10 chữ số) trước khi giao.

### 2.3 Thiếu edge case (2)

- Ví dụ 1 (★): `checkCartState` nhánh `soft` dùng `if ((await row.count()) !== 1) continue`, nên khi có 2 dòng cùng tên (#70) thì bỏ qua mọi ô, mất đúng số liệu chứng minh dòng cũ không tăng số lượng (TC-CART-03). Sửa: `=== 0` thì bỏ qua, còn lại đọc `rows.first()`.
- Ví dụ 2 (N2): TC-CART-54 chỉ kiểm "giỏ admin không có dòng mới", nên qua cả khi bước 1 (`POST` của `test@eshop.com`) thất bại (thử có chủ đích: HTTP 401, 0 dòng mới, test vẫn qua). Sửa: Bước 1 phải thêm đúng 1 dòng, không thì "Chuẩn bị không đạt".
- Vì sao: Giới hạn model: AI đã biết #70 và đã tự nêu CH-script-02 cho nhánh dừng test, nhưng không áp cùng suy nghĩ cho nhánh `soft`; với test bảo mật dạng "không thấy", AI không xét nhánh tiền điều kiện không xảy ra.
- Lần sau: Test "không thấy / không đổi" phải khẳng định thao tác gây ra điều kiện đã xảy ra; bug đã biết làm trùng dòng thì cách đọc dòng phải xử lý cả trường hợp nhiều dòng.

### 2.4 Selector dễ vỡ, Wait gây flaky

Không có lỗi của AI ở hai nhóm này. 2 dòng "Wait gây flaky" là quyết định của SV về khoảng chờ (CH-script-01, 03), không phải lỗi.

## 3. AI làm tốt

- Selector: Không có dòng "Selector dễ vỡ"; ở lượt chạy thử 1 (`02_review.md` mục 2.3) không test nào fail vì không tìm thấy phần tử, trên cả Chrome, Edge, Firefox. Selector lấy từ 4 snapshot ARIA và mã frontend (role, tên truy cập; vị trí cột theo thứ tự FR-07, được TC-CART-90 khóa ở CH-script-04).
- Ổn định: Lượt 4 chạy P1 đến P5 `--repeat-each=3` trên 3 trình duyệt: 0 flaky, mỗi test cùng trạng thái và cùng tập lỗi ở cả 3 lần lặp; lần chạy chính thức khớp hoàn toàn các lượt chạy thử (`03_results.md` mục 1).
- Thiết kế bắt được bug mới: Quy tắc "lần bấm đầu không phản hồi thì bấm thêm" kèm GĐ-09 (TC-CART-100 vẫn bấm lần hai dù mong đợi bị từ chối) làm lộ việc giao diện nhận số lượng 0, báo thành #118 (B-21). Bấm một lần thì test qua nhầm.
- Phân tích lỗi gốc: Automation cho thấy #73 thực chất là "lần bấm đầu không làm gì" ở mọi số lượng (bình luận B-06), làm rõ mô tả của HW02.
- Tránh bẫy hover: GĐ-05 của P5 đưa con trỏ ra khỏi navbar trước khi đọc style (link có `hover:underline`), nên TC-CART-95 không nhận nhầm hiệu ứng hover là highlight.
- Không có lỗi nào lọt tới lần chạy chính thức: 0 `F-nn` loại Script / Flaky.

## 4. Test case không tự động hóa được

Bảng cuối, từ `01_selected_tc.md` mục 4 và các phần chỉ tự động hóa được một phần phát hiện ở bước `script` / `review`:

| Mã | Lý do | Cách kiểm thay thế |
|---|---|---|
| TC-CART-52 | Kết quả mong đợi nằm trên trang Giỏ hàng nhưng dòng thêm qua API không hiện trên giỏ Web (hai giỏ tách nhau, #74); giao diện không có chỗ nhập tên sản phẩm | Kiểm tay sau khi #74 được sửa; trước đó chỉ ghi được việc API lưu nguyên văn `name` |
| TC-CART-50 (phần trang Giỏ hàng) | Như TC-CART-52; phần API tự động hóa ở P7 (qua) | Kiểm tay sau khi #74 được sửa |
| TC-CART-92 | "Toàn bộ tiếng Việt, trừ thuật ngữ kỹ thuật chuẩn" cần người đọc phân biệt; đặc tả không cho tiêu đề tab mong đợi | Kiểm tay theo checklist; HW02 Fail (#81) |
| TC-CART-93 | "Xanh dương", "đỏ" cần ngưỡng màu mà đặc tả không cho (D-05); nút xác nhận xóa không tồn tại vì #72 | Kiểm tay bằng mắt; HW02 Fail (#82); màu nút xác nhận kiểm lại khi #72 được sửa |
| TC-CART-07 (điểm "dòng còn khi dialog mở", nếu là hộp thoại của trình duyệt) | Trang bị chặn khi hộp thoại của trình duyệt mở nên không đọc được DOM (GĐ-04 của P3); với hộp thoại trên trang thì đo được | Ghi annotation "Not measurable"; kiểm tay nếu hệ thống dùng `confirm` sau khi sửa #72 |
| TC-CART-04 đến 06 | Tự động hóa được tới bước tìm nút +/- rồi fail (#71), không kiểm được việc đổi số lượng; sinh viên chọn không tự động hóa (D-07) | Kiểm tay khi #71 được sửa; HW02 Blocked |

## 5. Đề xuất bổ sung skill

Chỉ đề xuất; sinh viên quyết, phiên điều phối sửa skill. Không trùng với 5 mục FR-07 đã có trong `lessons.md` (dữ liệu chuẩn bị mơ hồ, sửa trước khi commit, dòng bảng bị tách, spec API không đủ 3 kiểu, backreference bát phân).

1. **Bộ ghi phản hồi bị lừa bởi chữ vẽ lại** (S2): Thêm vào bảng "Lỗi Playwright hay gặp": Chữ có sẵn được framework vẽ lại (ví dụ câu chào trên Header khi state đổi) bị tính là thông báo mới; cách xử lý: Lưu tập chữ có trước thao tác, chỉ tính chữ chưa có. Bổ sung cho dòng FR-17 về vùng dữ liệu.
2. **Biên của mẫu so số** (N1): Ở `playwright-patterns.md` (hoặc dòng backreference bát phân), thêm: Biên hai đầu phải loại cả dấu phân cách (`[^\d.,]`), không chỉ chữ số.
3. **Test "không thấy / không đổi" phải chứng minh nguyên nhân đã xảy ra** (N2): Checklist bước `script`: Kiểm bước tạo điều kiện (thêm dòng, gửi yêu cầu) có hiệu lực, không thì "Chuẩn bị không đạt".
4. **Đọc dòng khi bug làm trùng dòng** (`checkCartState`): Checklist bước `script`: Khi đã biết bug tạo dòng trùng, `soft` số dòng rồi đọc dòng đầu tiên, không bỏ qua cả dòng.
5. **Chạy thử bằng `--reporter=list` không sinh `results.json`** (bước `review`, lượt 1): Tham số dòng lệnh thay toàn bộ reporter của config; muốn phân loại lỗi từ `results.json` thì dùng reporter mặc định với `RUN_REPORT_DIR` riêng cho từng trình duyệt.
6. **`python -I` bỏ qua `PYTHONIOENCODING`**: Script đọc `results.json` in chữ tiếng Việt trên Windows phải gọi `sys.stdout.reconfigure(encoding='utf-8')`.
7. **Ghép link ảnh GitHub với file** (bước `bugs`): Link ảnh vừa kéo thả chưa xem được công khai (404) cho tới khi đăng; tải bằng `curl -H "Authorization: token $(gh auth token)"` rồi so MD5 với file trên máy. Ảnh HiDPI hiện bằng nửa kích thước gốc trong thẻ `<img>`.
