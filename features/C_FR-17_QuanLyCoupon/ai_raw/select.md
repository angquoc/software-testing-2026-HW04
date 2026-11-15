# FR-17 select: Chọn test case HW02 để tự động hóa (bản AI)

- Bước: `[C-FR17][select]`
- Thời gian tạo: 2026-11-15 23:27 (UTC+07:00)
- Công cụ: Claude Code (VS Code), model Claude Opus 5.5, skill `playwright-automation`
- Căn cứ: `Homeworks/HW04/WORKFLOW.md`; đề `2026.HW04.Automation Testing_En.pdf` mục 5, 6; SRS `Homeworks/eshop-sut/README.md` FR-09, FR-12, FR-17, FR-21 đến FR-23; HW02 của FR-17: `05_final_tc.md` (đọc toàn bộ, 115 test case), `06_results.md` (kết quả chạy tay 21/10/2026), `Homeworks/HW02/bugs/bug_report.md` mục FR-17 (12 bug, issue #55 đến #66); `playwright.config.ts`, `tools/run.mjs`, `tests/support/urls.ts`. Chưa lấy DOM (bước `script` mới lấy)
- Đã sửa trước khi giao: Dòng "Tổng" ở cuối mục 1 sửa số đếm từ `Có` 69, `Có, cần chuẩn bị` 14 thành 68, 15 sau khi đếm bảng bằng script (kiểm tĩnh); `check_automation.py format` không báo lỗi
- Quyết định của sinh viên trước khi viết (trả lời câu hỏi đầu phiên):
  - Tiêu chí chọn: d. Kết hợp (ưu tiên test case đã chạy tay, test case đã ra bug, rồi bù cho phủ lớp hợp lệ, không hợp lệ, biên)
  - Số test case: Khoảng 15 đến 18
  - Test case kiểm qua API: Chỉ tự động hóa qua giao diện Web Admin; fixture `request` chỉ dùng để chuẩn bị, dọn dữ liệu và kiểm chứng phụ (`GET /api/coupons`). Test case chỉ kiểm được ở tầng API ghi vào bảng không tự động hóa
  - Cô lập dữ liệu (D10): a. Reset DB (`node database.js`) trước lượt chạy của mỗi trình duyệt; giữ nguyên mã cố định của HW02 (`FR17TCNN`, `SAVE10`...)

## 1. Toàn bộ test case của feature

Cột "Đã chạy tay" lấy từ `06_results.md` (NR là Not run). Cột "Bug" lấy từ `bug_report.md` của HW02. Ký hiệu GH, A là giới hạn quan sát và giả định ở `05_final_tc.md` mục 11 và các bước HW02.

Quy ước chung cho test case giao diện (không nhắc lại ở từng dòng):

- "Tải lại trang" (K1, K3, K7): Tải lại ở bất kỳ trang nào của Web Admin đều về Dashboard (`06_results.md` mục 6), nên script tải lại rồi bấm menu "Mã Giảm Giá". Việc này tự động hóa được.
- Thông báo lỗi (OUT4) có ba dạng đã thấy ở HW02: Bong bóng của trình duyệt (đo bằng `validity`, không so chữ), hộp thoại `alert` (bắt bằng sự kiện `dialog`), chữ trên trang. Phần "bằng tiếng Việt, đúng nguyên nhân, nằm trên nút" xem CH-01.

### TS-01: Thêm hợp lệ qua giao diện (EP)

| Mã | Tiêu đề (rút gọn) | Loại | Kỹ thuật | Đã chạy tay | Bug | Tự động hóa | Lý do |
|---|---|---|---|---|---|---|---|
| TC-CPN-01 | Thêm hợp lệ cơ sở, loại phần trăm | positive | EP | Pass | | Có | Điền 6 ô, bấm "Tạo mã"; dòng mới có 6 giá trị đo được bằng text của ô, còn sau khi tải lại |
| TC-CPN-02 | Thêm hợp lệ cơ sở, số tiền cố định | positive | EP | Pass | | Có | Như TC-CPN-01; chọn "Số tiền cố định (₫)" trong dropdown |
| TC-CPN-03 | Mã có dấu cách ở đầu | edge | EP | NR | | Có | So text ô "Mã" và lỗi trùng ở K5. GH14: Chỉ kiểm được việc cắt ở phía trang |
| TC-CPN-04 | Mã có dấu cách ở cuối | edge | EP | NR | | Có | Như TC-CPN-03 |
| TC-CPN-05 | Mã có dấu cách ở giữa | edge | EP | NR | | Có | So text ô "Mã" giữ dấu cách; K5 tạo `FR17TC05` thành công |
| TC-CPN-06 | Mã gõ chữ thường | edge | EP | Pass | | Có | Đo được, nhưng ô tự chuyển chữ hoa (GH9) nên chỉ kiểm hành vi trang |
| TC-CPN-07 | Mã chỉ chữ số, có số 0 ở đầu | edge | EP | NR | | Có | So text ô "Mã" |
| TC-CPN-08 | Mã có gạch ngang, gạch dưới | edge | EP | NR | | Có | So text ô "Mã" |
| TC-CPN-09 | Mã có chữ tiếng Việt có dấu | edge | EP | NR | | Có | So text ô "Mã" (chuỗi Unicode) |
| TC-CPN-10 | Mã có thẻ HTML hiển thị dạng chữ | edge | EP | Pass | | Có | Đo được: Text ô là nguyên chuỗi (không phân biệt hoa thường, GH9) và ô không chứa phần tử `<b>` |
| TC-CPN-11 | Mã có ký tự SQL lưu nguyên văn | edge | EP | NR | | Có | So text, đếm 4 mã mẫu còn nguyên, K2 lỗi trùng. R16 chỉ quan sát gián tiếp (GH4) |
| TC-CPN-12 | Mã dài 255 ký tự | edge | EP | NR | | Có | Hai kết quả được chấp nhận (GH5) đều đo được: Dòng có đủ 255 ký tự, hoặc bị từ chối có thông báo; dòng bị cắt cụt là fail |
| TC-CPN-13 | Tạo lại mã trùng mã đã xóa | edge | EP | NR | | Có | 3 bước giao diện (tạo, xóa, tạo lại) trong một test |
| TC-CPN-14 | Phần trăm bằng 100 | edge | EP | NR | | Có | So text `100%` |
| TC-CPN-15 | Phần trăm là số thập phân 12.5 | edge | EP | NR | | Có | Đo được. Nếu ô số chặn số lẻ (GH2) thì test fail; bản dự phòng API (TC-CPN-82) nằm ngoài phạm vi giao diện |
| TC-CPN-16 | Số tiền cố định là 1000.5 | edge | EP | NR | | Có, cần chuẩn bị | Bảng có thể làm tròn (GH1); giá trị lưu (K6) kiểm bằng `GET` (kiểm chứng phụ qua API). GH2 như TC-CPN-15 |
| TC-CPN-17 | Số tiền cố định lớn hơn đơn tối thiểu | positive | EP | NR | | Có | So text ô |
| TC-CPN-18 | Số tiền cố định 10^16 | edge | EP | NR | | Có | GH5: Hai kết quả được chấp nhận, đều đo được |
| TC-CPN-19 | Đơn tối thiểu bằng 0 | edge | EP | NR | | Có | So text `0 ₫` |
| TC-CPN-20 | Đơn tối thiểu là 1000.5 | edge | EP | NR | | Có, cần chuẩn bị | Như TC-CPN-16 |
| TC-CPN-21 | Đơn tối thiểu 10^16 | edge | EP | NR | | Có | Như TC-CPN-18 |
| TC-CPN-22 | Hết hạn là hôm nay | edge | EP | NR | | Có, cần chuẩn bị | Ngày nhập tính lúc chạy (dữ liệu ghi "hôm nay" thay cho ngày cố định); phụ thuộc múi giờ máy (GH6) |
| TC-CPN-23 | Hết hạn trong quá khứ | edge | EP | NR | | Có | Ngày cố định `01/31/2025`; kết quả theo giả định A05, A18 (CH-02) |
| TC-CPN-24 | Hết hạn 29/02 năm nhuận | edge | EP | NR | | Có | So text `2028-02-29` |
| TC-CPN-25 | Số lần dùng tối đa 10^16 | edge | EP | NR | | Có | Như TC-CPN-18 |

### TS-02: Thêm không hợp lệ qua giao diện (EP)

| Mã | Tiêu đề (rút gọn) | Loại | Kỹ thuật | Đã chạy tay | Bug | Tự động hóa | Lý do |
|---|---|---|---|---|---|---|---|
| TC-CPN-30 | Mã để trống | negative | EP | Pass | | Có | Bong bóng trình duyệt: Đo `validity.valueMissing`; không có dòng mới sau khi tải lại |
| TC-CPN-31 | Mã chỉ gồm 3 dấu cách | negative | EP | NR | | Có | Như TC-CPN-30. GH14 |
| TC-CPN-32 | Mã trùng mã mẫu `SAVE10` | negative | EP | Fail | #57 | Có | Cần `SAVE10` nguyên vẹn (có nhờ reset trước mỗi trình duyệt). HW02 thấy thông báo là hộp thoại `alert`, bắt được bằng sự kiện `dialog`; dòng `SAVE10` cũ so được từng ô |
| TC-CPN-33 | Mã trùng mã vừa tạo | negative | EP | NR | | Có | Tạo 2 lần trong một test; đếm số dòng `FR17TC33` |
| TC-CPN-34 | Mã khác mã mẫu ở hoa thường | negative | EP | NR | | Có | GH9: Ô chuyển chữ hoa nên thực chất trùng với TC-CPN-32 |
| TC-CPN-35 | Mã trùng mã mẫu sau khi cắt dấu cách | negative | EP | NR | | Có | GH14 |
| TC-CPN-36 | Mã trùng mã đã hết hạn | negative | EP | NR | | Có | Cần `EXPIRED` còn (chạy trước TC-CPN-55) |
| TC-CPN-37 | Phần trăm là 150 | negative | EP | Khác giả định (A01) | #56 | Có | Đo được (không có dòng mới, có thông báo); kết quả mong đợi dựa trên giả định A01 (CH-02) |
| TC-CPN-38 | Phần trăm bằng 0 | negative | EP | Fail | #55 | Có | Đo được |
| TC-CPN-39 | Số tiền cố định bằng 0 | negative | EP | NR | | Có | Đo được |
| TC-CPN-40 | Giá trị giảm để trống | negative | EP | NR | | Có | Đo được |
| TC-CPN-41 | Đơn tối thiểu âm | negative | EP | NR | | Có | Ô số có thể chặn số âm (GH2); bị chặn bằng bong bóng vẫn tính là bị từ chối (A21) |
| TC-CPN-42 | Đơn tối thiểu để trống | negative | EP | NR | | Có | Phải xóa giá trị có sẵn `0` của ô |
| TC-CPN-43 | Ngày hết hạn để trống | negative | EP | NR | | Có | Đo được |
| TC-CPN-44 | Số lần dùng tối đa bằng 0 | negative | EP | NR | | Có | GH2 như TC-CPN-41 |
| TC-CPN-45 | Số lần dùng tối đa là 1.5 | negative | EP | NR | | Có | GH2 như TC-CPN-41 |
| TC-CPN-46 | Số lần dùng tối đa để trống | negative | EP | NR | | Có | Phải xóa giá trị có sẵn `1` của ô |

### TS-03: Xem và Xóa qua giao diện (EP)

| Mã | Tiêu đề (rút gọn) | Loại | Kỹ thuật | Đã chạy tay | Bug | Tự động hóa | Lý do |
|---|---|---|---|---|---|---|---|
| TC-CPN-50 | Danh sách hiện đúng 4 mã mẫu | positive | EP | Pass | | Có, cần chuẩn bị | Cần đúng 4 mã: Phải chạy ngay sau reset, đầu tiên trong lượt chạy của mỗi trình duyệt (CH-04). So từng ô của 4 dòng, đếm số dòng |
| TC-CPN-51 | Xóa mã vừa tạo | positive | EP | Pass | | Có | Không có hộp thoại xác nhận (HW02 S6); dòng biến mất, K7 tải lại, K8 tạo lại được |
| TC-CPN-52 | Hủy ở hộp thoại xác nhận xóa | positive | EP | Không áp dụng | | Không | Hệ thống không có hộp thoại xác nhận khi xóa (HW02 S6), theo A07 test case không áp dụng |
| TC-CPN-53 | Xóa mã đã bị xóa ở tab khác | edge | EP | NR | | Có | Mở 2 trang trong cùng context; "báo lỗi hoặc tự cập nhật" đo được (có `dialog`, hoặc dòng biến mất ở tab 2) |
| TC-CPN-54 | Xóa mã mẫu còn hạn `BIGBUY` | positive | EP | NR | | Có, cần chuẩn bị | Phá dữ liệu mẫu: Phải chạy cuối lượt |
| TC-CPN-55 | Xóa mã mẫu đã hết hạn `EXPIRED` | positive | EP | NR | | Có, cần chuẩn bị | Như TC-CPN-54; sau TC-CPN-36, TC-CPN-50 |
| TC-CPN-56 | Trang trống khi không còn mã | edge | EP | NR | | Có, cần chuẩn bị | Cần danh sách rỗng: Phải xóa cả mã các test khác vừa tạo (qua API) hoặc reset riêng ngay trước. "Message thân thiện" (OUT6) không đo được bằng máy; chỉ đo có hình minh họa và có chữ |
| TC-CPN-144 | Danh sách 100 mã | edge | EP | Pass | | Có, cần chuẩn bị | Tạo 100 mã bằng API (chuẩn bị); đếm dòng so với `GET`, có mã đầu và mã cuối, nút "Xóa" dòng cuối hiện và bấm được. "Bố cục không vỡ" chỉ đo gián tiếp (hộp bao các cột không chồng nhau) |

### TS-04: Giá trị biên qua giao diện (BVA)

| Mã | Tiêu đề (rút gọn) | Loại | Kỹ thuật | Đã chạy tay | Bug | Tự động hóa | Lý do |
|---|---|---|---|---|---|---|---|
| TC-CPN-100 | Phần trăm -1 | negative | BVA | NR | | Có | GH2 như TC-CPN-41 |
| TC-CPN-101 | Phần trăm 0.01 | edge | BVA | NR | | Có, cần chuẩn bị | GH1, GH2; giá trị lưu kiểm bằng `GET` |
| TC-CPN-102 | Phần trăm 1 | edge | BVA | NR | | Có | So text `1%` |
| TC-CPN-103 | Phần trăm 2 | edge | BVA | NR | | Có | So text `2%` |
| TC-CPN-104 | Phần trăm 99 | edge | BVA | NR | | Có | So text `99%` |
| TC-CPN-105 | Phần trăm 100.01 | negative | BVA | NR | | Có | GH2. Script chỉ thấy "bị từ chối"; phân biệt từ chối vì số lẻ (Khác giả định A02) với vì vượt 100 chỉ được khi thông báo nêu nguyên nhân (CH-01) |
| TC-CPN-106 | Phần trăm 101 | negative | BVA | NR | | Có | Đo được |
| TC-CPN-107 | Số tiền cố định -1 | negative | BVA | NR | | Có | GH2 |
| TC-CPN-108 | Số tiền cố định 0.01 | edge | BVA | NR | | Có, cần chuẩn bị | Như TC-CPN-101 |
| TC-CPN-109 | Số tiền cố định 1 | edge | BVA | NR | | Có | So text `1 ₫` |
| TC-CPN-110 | Số tiền cố định 2 | edge | BVA | NR | | Có | So text `2 ₫` |
| TC-CPN-111 | Số tiền cố định 2^53 + 1 | edge | BVA | NR | | Có, cần chuẩn bị | Kiểm `GET` phải đọc chuỗi thô của response: `JSON.parse` của JavaScript làm tròn `9007199254740993` thành `...992`, đọc bằng `response.json()` thì chính test sai. GH7 |
| TC-CPN-112 | Đơn tối thiểu -0.01 | negative | BVA | NR | | Có | GH2; cách đọc như TC-CPN-105 (A03) |
| TC-CPN-113 | Đơn tối thiểu 1 | edge | BVA | NR | | Có | So text `1 ₫` |
| TC-CPN-114 | Đơn tối thiểu 2^53 + 1 | edge | BVA | NR | | Có, cần chuẩn bị | Như TC-CPN-111 |
| TC-CPN-115 | Số lần dùng tối đa -1 | negative | BVA | NR | | Có | GH2 |
| TC-CPN-116 | Số lần dùng tối đa 1 | edge | BVA | NR | | Có | Gõ lại `1` dù ô có sẵn `1`; so text `1 lần` |
| TC-CPN-117 | Số lần dùng tối đa 2 | edge | BVA | NR | | Có | So text `2 lần` |
| TC-CPN-119 | Số lần dùng tối đa 2^53 + 1 | edge | BVA | NR | | Có, cần chuẩn bị | Như TC-CPN-111 |
| TC-CPN-120 | Mã là 1 dấu cách | negative | BVA | NR | | Có | GH14 |
| TC-CPN-121 | Mã dài 1 ký tự | edge | BVA | NR | | Có | So text `Q` |
| TC-CPN-122 | Mã 1 ký tự có dấu cách hai bên | edge | BVA | NR | | Có | GH14 |
| TC-CPN-123 | Mã là 1 chữ thường | edge | BVA | NR | | Có | GH9 |
| TC-CPN-124 | Mã dài 2 ký tự | edge | BVA | NR | | Có | So text `QZ` |
| TC-CPN-125 | Mã dài 1000 ký tự | edge | BVA | NR | | Có | GH5, GH10 như TC-CPN-12 |
| TC-CPN-126 | Hết hạn 01/01/0001 | edge | BVA | NR | | Có | Ô ngày có thể không nhận năm 0001; `fill` ô `type="date"` (nếu đúng loại ô) dùng dạng `yyyy-mm-dd` |
| TC-CPN-127 | Hết hạn hôm qua | edge | BVA | NR | | Có, cần chuẩn bị | Ngày tính lúc chạy (GH6) |
| TC-CPN-128 | Hết hạn ngày mai | edge | BVA | NR | | Có, cần chuẩn bị | Như TC-CPN-127 |
| TC-CPN-129 | Hết hạn 12/31/9999 | edge | BVA | NR | | Có | So text `9999-12-31` |

### TS-05: API (EP, BVA)

Theo quyết định "chỉ giao diện, API làm phụ", mọi test case nhóm này là `Không`. Lý do chung: Kết quả chỉ quan sát được khi gửi request trực tiếp; đề HW04 mục 5 yêu cầu tự động hóa web frontend. Cột "Lý do" ghi thêm vì sao giao diện không tạo được đúng input đó.

| Mã | Tiêu đề (rút gọn) | Loại | Kỹ thuật | Đã chạy tay | Bug | Tự động hóa | Lý do |
|---|---|---|---|---|---|---|---|
| TC-CPN-60 | API tạo mã hợp lệ | positive | EP | Pass | | Không | Bản giao diện là TC-CPN-01 |
| TC-CPN-61 | API trả danh sách đủ trường | positive | EP | Pass | | Không | Bản giao diện là TC-CPN-50; `GET` vẫn dùng làm kiểm chứng phụ |
| TC-CPN-62 | API xóa mã vừa tạo | positive | EP | Pass | | Không | Bản giao diện là TC-CPN-51 |
| TC-CPN-63 | API nhận Mã là số JSON | edge | EP | Pass | | Không | Ô "Mã" luôn gửi chuỗi; giao diện không tạo được kiểu số |
| TC-CPN-64 | API nhận trường số dạng chuỗi | edge | EP | Pass | | Không | Giao diện không điều khiển kiểu JSON của giá trị gửi đi |
| TC-CPN-65 | API từ chối `type` không hợp lệ | negative | EP | Fail | #61 (dòng A), #62 (dòng B) | Không | Dropdown chỉ có "Phần trăm (%)" và "Số tiền cố định (₫)"; không gửi được `type` khác hay bỏ `type` |
| TC-CPN-66 | API từ chối `null`, chuỗi rỗng | negative | EP | Fail | #61 | Không | `null` chỉ gửi được qua API; bản giao diện "để trống" là TC-CPN-30, 40, 42, 43, 46 |
| TC-CPN-67 | API từ chối trường số không phải số | negative | EP | Fail | #63 | Không | Giao diện không tạo được giá trị `"abc"` trong body cho trường số |
| TC-CPN-68 | API từ chối ngày sai định dạng | negative | EP | Khác giả định (A13) | #66 | Không | Ô chọn ngày không gửi được `12/31/2027`, `2027-02-30`, chuỗi có giờ |
| TC-CPN-69 | API từ chối request không đọc được | negative | EP | Fail | #65 | Không | JSON hỏng, thiếu `Content-Type`, không có body: Trang luôn gửi body hợp lệ |
| TC-CPN-70 | API từ chối body `{}` | negative | EP | Fail | #61 | Không | Như TC-CPN-69 |
| TC-CPN-71 | API xóa với `id` không hợp lệ | negative | EP | Pass | | Không | Giao diện chỉ có nút "Xóa" của dòng đang có, không gửi được `id` tùy ý (gần nhất là TC-CPN-53) |
| TC-CPN-72 | Tạo mã không có header Authorization | negative | EP | Pass | | Không | Web Admin luôn gửi token admin sau khi đăng nhập |
| TC-CPN-73 | Tạo mã khi header thiếu `Bearer` | negative | EP | Pass | | Không | Như TC-CPN-72 |
| TC-CPN-74 | Tạo mã khi token không hợp lệ | negative | EP | Pass | | Không | Như TC-CPN-72 |
| TC-CPN-75 | Tạo mã bằng token user thường | negative | EP | Fail | #60 | Không | Cần token user thường gọi API Admin; vào được Web Admin bằng tài khoản user thường là chuyện của FR-12, không thuộc FR-17 |
| TC-CPN-76 | Xem danh sách không có header | negative | EP | Pass | | Không | Như TC-CPN-72 |
| TC-CPN-77 | Xem danh sách bằng token user thường | negative | EP | Khác giả định (A28) | | Không | Như TC-CPN-75 |
| TC-CPN-78 | Xóa mã không có header | negative | EP | Pass | | Không | Như TC-CPN-72 |
| TC-CPN-79 | Xóa mã bằng token user thường | negative | EP | Fail | #60 | Không | Như TC-CPN-75 |
| TC-CPN-80 | `POST /api/coupons` không header | negative | EP | Pass | | Không | Trang không gọi endpoint này |
| TC-CPN-81 | `DELETE /api/coupons/:id` bằng user thường | negative | EP | Pass | | Không | Như TC-CPN-80 và TC-CPN-75 |
| TC-CPN-82 | Dự phòng API số lẻ, số âm (S3) | negative / edge | EP | NR | | Không | Chỉ chạy khi test case giao diện tương ứng bị trình duyệt chặn, và là request trực tiếp |
| TC-CPN-118 | API nhận `1.0` | edge | BVA | Pass | | Không | Ô số không gửi được JSON `1.0` (GH12) |
| TC-CPN-130 | Dự phòng API điểm biên số lẻ, số âm (S4) | negative / edge | BVA | NR | | Không | Như TC-CPN-82 |
| TC-CPN-131 | Server lưu chính xác 2^53 + 1 | edge | BVA | Fail | #64 | Không | Mục đích là tách phần server; phần giao diện là TC-CPN-111, 114, 119 |
| TC-CPN-140 | API tạo mã có chữ thường | edge | EP | Khác giả định (A04) | | Không | Ô "Mã" tự chuyển chữ hoa (GH9), giao diện không gửi được chữ thường |
| TC-CPN-141 | API từ chối `save10` | negative | EP | Khác giả định (A04) | | Không | Như TC-CPN-140 |
| TC-CPN-142 | API tạo mã là 1 chữ thường | edge | BVA | Pass | | Không | Như TC-CPN-140 |
| TC-CPN-143 | API cắt dấu cách đầu cuối của Mã | negative / edge | EP | Khác giả định (A09) | #61 (dòng C) | Không | Mục đích là tách phần server khỏi phần trang; bản giao diện là TC-CPN-03, 04, 31, 35 |

### TS-06: Checklist giao diện

| Mã | Tiêu đề (rút gọn) | Loại | Kỹ thuật | Đã chạy tay | Bug | Tự động hóa | Lý do |
|---|---|---|---|---|---|---|---|
| TC-CPN-90 | Dấu `*` cạnh trường bắt buộc | positive | Checklist | Fail | #59 | Có | Đo được khi chốt cách đo: Nhãn của mỗi ô chứa `*` (CH-05). HW02 thấy form chỉ có placeholder, không có nhãn |
| TC-CPN-91 | Ngôn ngữ của trang | positive | Checklist | Fail | #57 | Không | Phải đánh giá mọi chữ trên trang là tiếng Việt hay "thuật ngữ kỹ thuật chuẩn"; đặc tả không cho danh sách thuật ngữ nên không có tiêu chí máy đo được |
| TC-CPN-92 | Màu nút "Tạo mã" và "Xóa" | positive | Checklist | Fail | #58 | Có | Đọc được `background-color`; nhưng "xanh dương", "đỏ" cần khoảng màu mà đặc tả không nêu (CH-05) |
| TC-CPN-93 | Định dạng tiền trong bảng | positive | Checklist | Pass | | Có | So text các ô tiền với mẫu có `₫` và phân cách hàng nghìn (CH-03) |
| TC-CPN-94 | Menu "Mã Giảm Giá" được highlight | positive | Checklist | Pass | | Có | So kiểu hiển thị của mục đang chọn với mục khác; "highlight" cần chốt cách đo (CH-05) |
| TC-CPN-95 | Trang có đúng 1 thẻ `<h1>` | positive | Checklist | Pass | | Có | Đếm `h1`; "mô tả nội dung trang" chỉ đo được là có chữ |

Tổng: 115 test case; `Có` 68, `Có, cần chuẩn bị` 15, `Không` 32 (TC-CPN-52, TC-CPN-91 và 30 test case TS-05).

## 2. Test case đề xuất chọn (18 test case)

Cách áp tiêu chí d:

1. Lấy test case giao diện đã chạy tay ở HW02 và đo được bằng máy (có kết quả thật để so): TC-CPN-01, 02, 10, 30, 32, 37, 38, 50, 51, 93, 95. Trong đó TC-CPN-32, 37, 38 là regression cho bug #57, #56, #55. Không lấy TC-CPN-06 (GH9, trùng ý với TC-CPN-10 về hành vi ô "Mã"), TC-CPN-144 (chuẩn bị 100 mã mỗi trình duyệt), TC-CPN-90, 92, 94 (chưa có cách đo, CH-05), TC-CPN-91 (không đo được).
2. Bù cho mỗi trường có lớp hợp lệ, lớp không hợp lệ và giá trị ở sát biên: TC-CPN-14 (phần trăm 100, cận trên hợp lệ), TC-CPN-19 (đơn tối thiểu 0, cận dưới hợp lệ), TC-CPN-41 (đơn tối thiểu -1), TC-CPN-43 (ngày trống), TC-CPN-23 (ngày quá khứ), TC-CPN-44 (số lần dùng 0), TC-CPN-116 (số lần dùng 1, BVA).

| Mã | Loại | Kỹ thuật | Kết quả mong đợi (tóm tắt) | Căn cứ | Phần | Dữ liệu cần chuẩn bị | Vì sao chọn |
|---|---|---|---|---|---|---|---|
| TC-CPN-50 | positive | EP | Đúng 4 dòng `SAVE10`, `BIGBUY`, `VIP100`, `EXPIRED`, đủ 7 cột, giá trị khớp bảng mã mẫu; `EXPIRED` hiện chữ "Hết hạn" | FR-17 (Xem), FR-09 bảng mã mẫu, A18 | P1 | Reset ngay trước; chạy đầu tiên (CH-04) | Đã chạy tay (Pass); phủ thao tác Xem |
| TC-CPN-93 | positive | Checklist | Ô tiền có `₫` và phân cách hàng nghìn | FR-21 | P1 | Như TC-CPN-50 | Đã chạy tay (Pass); đo được bằng mẫu chuỗi |
| TC-CPN-95 | positive | Checklist | Trang có đúng 1 thẻ `<h1>`, có chữ | FR-21 | P1 | Không | Đã chạy tay (Pass); đo được bằng đếm phần tử |
| TC-CPN-01 | positive | EP | OUT1: Dòng `FR17TC01`, "Phần trăm", `15%`, `300,000 ₫`, `2099-12-31`, `3 lần`; còn sau khi tải lại | FR-17 | P2 | Không | Đã chạy tay (Pass); luồng cơ sở |
| TC-CPN-02 | positive | EP | OUT1; cột "Giá trị" `50,000 ₫` | FR-17 (`type` fixed), FR-21 | P2 | Không | Đã chạy tay (Pass); phủ `type` còn lại |
| TC-CPN-10 | edge | EP | OUT1; ô "Mã" hiện nguyên chuỗi `<B>FR17TC10</B>` hoặc `<b>FR17TC10</b>` dạng chữ, không in đậm | R15 (escape, `05_final_tc.md` mục 12) | P2 | Không | Đã chạy tay (Pass); kiểm an toàn hiển thị |
| TC-CPN-14 | edge | EP | OUT1; `100%` | FR-17 (dương), A01 (tối đa 100) | P2 | Không | Cận trên hợp lệ của phần trăm, đối với TC-CPN-37 |
| TC-CPN-19 | edge | EP | OUT1; `0 ₫` | FR-17 (`min_order_amount` >= 0) | P2 | Không | Cận dưới hợp lệ, đối với TC-CPN-41 |
| TC-CPN-23 | edge | EP | OUT1; cột "Hết hạn" hiện chữ "Hết hạn" | FR-17 (`expired_at` bắt buộc), A05, A18 | P2 | Không | Phủ lớp ngày quá khứ của `expired_at` |
| TC-CPN-116 | edge | BVA | OUT1; `1 lần` | FR-17 (`max_uses_per_user` >= 1) | P2 | Không | Cận dưới hợp lệ, đối với TC-CPN-44 |
| TC-CPN-30 | negative | EP | Không có dòng mới (kể cả sau khi tải lại); có thông báo thiếu Mã | FR-17 (`code` bắt buộc), FR-22 | P3 | Không | Đã chạy tay (Pass) |
| TC-CPN-32 | negative | EP | Không có dòng mới; thông báo trùng mã; dòng `SAVE10` cũ giữ nguyên | FR-17 (`code` duy nhất), FR-21, FR-22 | P3 | `SAVE10` nguyên vẹn (reset) | Đã chạy tay (Fail, #57) |
| TC-CPN-37 | negative | EP | Không có dòng mới; thông báo phần trăm vượt 100 | FR-17, A01 | P3 | Không | Đã chạy tay (Khác giả định, #56) |
| TC-CPN-38 | negative | EP | Không có dòng mới; thông báo giá trị phải dương | FR-17 (`discount_value` dương) | P3 | Không | Đã chạy tay (Fail, #55) |
| TC-CPN-41 | negative | EP | Không có dòng mới; thông báo đơn tối thiểu âm | FR-17 (`min_order_amount` >= 0) | P3 | Không | Lớp không hợp lệ của `min_order_amount` |
| TC-CPN-43 | negative | EP | Không có dòng mới; thông báo thiếu ngày hết hạn | FR-17 (`expired_at` bắt buộc) | P3 | Không | Lớp không hợp lệ của `expired_at` |
| TC-CPN-44 | negative | EP | Không có dòng mới; thông báo số lần dùng nhỏ hơn 1 | FR-17 (`max_uses_per_user` >= 1) | P3 | Không | Lớp không hợp lệ của `max_uses_per_user` |
| TC-CPN-51 | positive | EP | OUT8: Dòng `FR17TC51` biến mất, các dòng khác giữ nguyên; K7 tải lại vẫn không còn; K8 tạo lại được | FR-17 (Xóa) | P4 | Không (tự tạo mã trong test) | Đã chạy tay (Pass); phủ thao tác Xóa |

Thống kê: 6 positive, 7 negative, 5 edge; 15 EP, 1 BVA, 2 checklist. 11 test case đã chạy tay ở HW02; 3 test case là regression cho bug (#55, #56, #57). Các test case EP TC-CPN-14, 19, 38, 41, 44 dùng giá trị nằm ngay tại hoặc sát biên (100, 0, -1), nên số điểm biên thực tế nhiều hơn số đếm theo kỹ thuật.

Dự phòng (thay vào nếu sinh viên muốn, hoặc nếu có test case bị loại ở bước review): TC-CPN-03 (cắt dấu cách, GH14), TC-CPN-13 (tạo lại mã đã xóa, cùng luồng P4), TC-CPN-53 (xóa ở tab khác, P4), TC-CPN-106 (phần trăm 101, BVA, P3), TC-CPN-121 (Mã 1 ký tự, BVA, P2), TC-CPN-12 (Mã 255 ký tự, P2), TC-CPN-90 (dấu `*`, #59, cần CH-05).

## 3. Kế hoạch sinh script

Mỗi phần là một lượt ở bước `script`. Tên file có số thứ tự để chạy đúng thứ tự khi `workers: 1` (CH-04).

| Phần | Luồng thao tác | Test case | File spec | File dữ liệu |
|---|---|---|---|---|
| P1 | Đăng nhập, mở "Mã Giảm Giá" ngay sau reset; đọc bảng và trang, không nhập gì | TC-CPN-50, TC-CPN-93, TC-CPN-95 | `tests/C_FR-17_QuanLyCoupon/01_list.spec.ts` | `tests/C_FR-17_QuanLyCoupon/data/list.json` |
| P2 | Điền 6 ô, bấm "Tạo mã"; kiểm dòng mới từng ô; tải lại (về Dashboard, bấm lại menu) và kiểm lại | TC-CPN-01, 02, 10, 14, 19, 23, 116 | `tests/C_FR-17_QuanLyCoupon/02_create_valid.spec.ts` | `tests/C_FR-17_QuanLyCoupon/data/create_valid.json` |
| P3 | Điền 6 ô (một ô vi phạm), bấm "Tạo mã"; kiểm có thông báo (bong bóng, `dialog` hoặc chữ trên trang), không có dòng mới, kể cả sau khi tải lại | TC-CPN-30, 32, 37, 38, 41, 43, 44 | `tests/C_FR-17_QuanLyCoupon/03_create_invalid.spec.ts` | `tests/C_FR-17_QuanLyCoupon/data/create_invalid.json` |
| P4 | Tạo mã, bấm "Xóa" trên dòng đó; kiểm dòng biến mất, các dòng khác còn; tải lại; tạo lại | TC-CPN-51 | `tests/C_FR-17_QuanLyCoupon/04_delete.spec.ts` | `tests/C_FR-17_QuanLyCoupon/data/delete.json` |

Để bước sau (chưa chốt ở đây): Có dùng Page Object Model không (D11); cách đăng nhập (qua form mỗi test hay `storageState`); phạm vi tính ≥ 3 kiểu assertion (D13); selector lấy từ DOM ở bước `script`.

## 4. Test case không tự động hóa được

| Mã | Lý do cụ thể | Cách kiểm thay thế |
|---|---|---|
| TC-CPN-52 | Hệ thống không có hộp thoại xác nhận khi xóa (HW02 S6), nên điều kiện của test case không tồn tại; theo A07 là Không áp dụng | Không cần. Nếu sau này có hộp thoại thì tự động hóa được (bắt `dialog`, chọn hủy) |
| TC-CPN-91 | Phải đánh giá mọi chữ trên trang là tiếng Việt hay "thuật ngữ kỹ thuật chuẩn"; FR-21 không cho danh sách thuật ngữ nên không có tiêu chí máy đo được; một phần chữ (lịch chọn ngày, bong bóng) là của trình duyệt | Kiểm tay như HW02 (`06_results.md` dòng 4) |
| TC-CPN-60 đến TC-CPN-82, TC-CPN-118, TC-CPN-130, TC-CPN-131, TC-CPN-140 đến TC-CPN-143 (30 test case) | Chỉ quan sát được bằng request trực tiếp tới API; giao diện Web Admin không tạo được input tương ứng (lý do từng test case ở mục 1, TS-05). Đề HW04 mục 5 yêu cầu tự động hóa web frontend, sinh viên chốt "chỉ giao diện" | Script Python của HW02 `features/C_FR-17_QuanLyCoupon/scripts/run_api_tests.py` (chạy lại được) |

## 5. Giả định

- GĐ-01: Mã của test case giữ nguyên giá trị HW02 (`FR17TC01`, `SAVE10`...), vì dữ liệu được reset trước lượt chạy của mỗi trình duyệt (D10 phương án a). Chạy lại một test lẻ mà không reset có thể fail vì mã đã tồn tại; đó là lỗi chuẩn bị, không phải bug.
- GĐ-02: "Tải lại trang" trong K1, K3, K7 được thực hiện bằng tải lại rồi bấm menu "Mã Giảm Giá", theo quan sát ở HW02 (`06_results.md` mục 6).
- GĐ-03: Không khẳng định thông báo thành công hay việc form được xóa sau khi tạo (A19 của HW02: Ghi lại, không bắt buộc).
- GĐ-04: Kết quả mong đợi lấy từ `05_final_tc.md` (bản chốt HW02), kể cả chuỗi hiển thị như `15%`, `3 lần`, `300,000 ₫`; câu chữ thông báo lỗi không có trong đặc tả nên không so nguyên văn.

## 6. Câu hỏi cho sinh viên

- CH-01: OUT4 đòi thông báo "bằng tiếng Việt, chỉ ra đúng nguyên nhân, nằm trên nút Tạo mã". Script khẳng định tới đâu? Phương án:
  - a. Chỉ khẳng định bị từ chối: Không có dòng mới (kể cả sau khi tải lại) và có thông báo ở một trong ba dạng (bong bóng: `validity.valid` là `false`; hộp thoại: bắt được `dialog`; chữ trên trang: phần tử mới hiện ra). Ngôn ngữ, nguyên nhân, vị trí ghi là phần không tự động hóa được của các test case P3. Hệ quả: TC-CPN-32 không bắt được phần "không phải tiếng Việt" của bug #57.
  - b. Như a, thêm vị trí: Thông báo là chữ trên trang thì so hộp bao với nút "Tạo mã" (phải nằm trên). Bong bóng và `alert` không có vị trí đo được trên trang, ghi giới hạn.
  - c. Như b, thêm kiểm ngôn ngữ bằng một quy tắc máy (ví dụ thông báo của trang hoặc `dialog` không chứa chuỗi kỹ thuật như `SQLITE`, `constraint`). Lưu ý: Đặc tả không nêu quy tắc này, đây là quy tắc do mình đặt ra để đo FR-21.
- CH-02: Kết quả mong đợi của một số test case dựa trên giả định HW02, không phải câu đặc tả: TC-CPN-37 và TC-CPN-14 (A01, phần trăm tối đa 100), TC-CPN-23 (A05 nhận ngày quá khứ, A18 hiện chữ "Hết hạn"), TC-CPN-50 (A18 với `EXPIRED`). Phương án:
  - a. Khẳng định theo giả định như test case HW02; tên hoặc annotation của test ghi mã giả định; test fail thì phân loại "Khác giả định" ở bước `run` (không sửa assertion).
  - b. Bỏ phần phụ thuộc giả định khỏi assertion (ví dụ TC-CPN-23 chỉ kiểm có dòng mới), ghi phần bỏ vào mục không tự động hóa.
  - c. Thay các test case này bằng test case dự phòng không phụ thuộc giả định.
- CH-03: Định dạng tiền: Test case HW02 ghi `300,000 ₫` (dấu phẩy), FR-21 chỉ nói "ký hiệu `₫` với định dạng phân cách hàng nghìn". Phương án: a. So đúng chuỗi như test case HW02; b. So bằng mẫu chấp nhận dấu `,` hoặc `.` làm dấu phân cách. Có thể để tới bước `data`.
- CH-04: TC-CPN-50 cần đúng 4 mã mẫu, nên phải chạy ngay sau reset; còn `node tools/run.mjs C all` chạy liền 3 trình duyệt, không có chỗ reset ở giữa. Phương án:
  - a. Sinh viên chạy từng trình duyệt: Reset, `node tools/run.mjs C chrome`; reset, `... edge`; reset, `... firefox`. File spec đánh số để P1 chạy đầu.
  - b. Tự động reset trước mỗi lượt (ví dụ `globalSetup` của Playwright hoặc `run.mjs` chạy `node database.js` trong `eshop-sut/backend`; chỉ chạy lệnh, không đọc mã backend).
  - c. Để quyết định ở bước `script`.
- CH-05: Chỉ cần nếu sinh viên đổi sang chọn TC-CPN-90, 92 hoặc 94: Cách đo "có dấu `*` cạnh nhãn" (form không có nhãn), "xanh dương" / "đỏ" (khoảng màu), "highlight" (khác kiểu hiển thị với mục khác). Đặc tả không cho tiêu chí đo; phương án nào cũng là quy ước của sinh viên.
