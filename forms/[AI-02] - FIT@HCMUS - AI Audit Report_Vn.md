> Bản text-based của `[AI-02] - FIT@HCMUS - AI Audit Report_Vn.docx` (bản binary: .docx / .pdf cùng tên).

Khoa Công nghệ Thông tin (FIT) – Trường Đại học Khoa học Tự nhiên (HCMUS)

CS423 / CSC13003 – Kiểm chứng Phần mềm (AI-augmented · 2026)

CHÍNH SÁCH AI · BIỂU MẪU — 2026 v1.0

# AI Audit Report — Mẫu 5 mục cho mỗi Artifact

Phụ lục bắt buộc đính kèm cho mọi bài tập có dùng AI (HW#01–HW#06, Seminar).

Tài liệu được biên soạn lại từ Med Kharbach, PhD (2026) — Mẫu Chính sách Sử dụng AI cho Giáo dục Đại học. Giấy phép CC BY-NC-SA 4.0. Phiên bản này được FIT@HCMUS điều chỉnh cho môn CS423 / CSC15003 Kiểm chứng Phần mềm.

## 1. Thông tin Sinh viên

| Mục | Giá trị |
|---|---|
| Họ tên sinh viên (in hoa): | NGUYỄN THỊ ÁNH NGỌC |
| MSSV: | 23120061 |
| Lớp / Khoá: | Kiểm thử phần mềm - CQ2023/3 |
| Mã bài tập (ví dụ HW#00, HW#02): | HW04-AI |
| Ngày làm bài: | 15/11/2026 đến 18/11/2026 |
| Công cụ AI đã dùng: | Claude Code (Anthropic, claude-opus-5-5) |
| Công cụ AI đã dùng: | [x] Có  [ ] Không |

## 2. Hướng dẫn (đọc trước khi điền)

- Thêm 1 hàng cho mỗi artifact AI sinh (test case, script, checklist, OpenAPI spec, JMeter plan…).

- Dán nguyên văn prompt — KHÔNG paraphrase.

- Dán nguyên văn output AI (hoặc kèm screenshot có chú thích trong báo cáo).

- Gắn nhãn: VALID / INVALID / INCOMPLETE.

- Lý do phải dẫn chiếu slide, mục ISTQB, hoặc RFC kỹ thuật.

- Hiển thị bản sửa với phần thay đổi được tô sáng.

- Hàng mẫu in nghiêng — thay trước khi nộp.

## 3. Bảng Audit — 1 hàng / artifact

| (1) Prompt + Công cụ | (2) Output AI | (3) Verdict | (4) Lý do (ISTQB) | (5) Bản SV sửa |
|---|---|---|---|---|
| B01: Phân tích đề, kế hoạch, tracker, WORKFLOW.md, dự án Playwright <br> Claude Code, phiên điều phối 27ccb594, C01 đến C09, 15/11/2026 | Tóm tắt yêu cầu, danh sách việc và file nộp, quy trình 8 bước; playwright.config.ts 3 project, fixture "Run by" + annotation Browser, tools/run.mjs, JSON reporter | INCOMPLETE | Đề không yêu cầu hộp đen; sinh viên chốt nới quy ước (được đọc DOM và mã frontend để lấy selector). Ghép "A x Chrome, B x Edge, C x Firefox" bị loại vì mỗi feature phải chạy cả 3 trình duyệt | Sinh viên chốt D1 đến D17 (repo cá nhân, Issues ở repo nhóm HW02, 2 video riêng, FR-17 để sửa skill, FR-01 quay video) |
| B02: Agent Skill playwright-automation bản đầu <br> Phiên 27ccb594, C05 đến C07, 15/11/2026 (commit bb8687a) | SKILL.md, 12 file references/, mẫu, 3 script kiểm | INCOMPLETE | Viết trước khi làm thật; 17 lần sửa sau khi dùng (mục 7) | Sinh viên duyệt từng lần sửa |
| B03: FR-17 select, data <br> Phiên FR-17 051b68d8, C10 đến C20, 15/11 đến 16/11/2026 | ai_raw/select.md (115 test case, 18 chọn), ai_raw/data.md (4 file JSON) | INCOMPLETE | select: 4 lỗi (thiếu TC-CPN-39, lời biện minh thừa, 7 mã dự phòng không lọc, thiếu tiền điều kiện đăng nhập); AI đếm tay sai dòng tổng. data: Không lỗi, 2 quyết định | Sinh viên thay TC-CPN-95 bằng TC-CPN-39, chọn CH-select-01 đến 05, CH-data-01 b, CH-data-03 c (thêm từ tiếng Anh vào chuỗi cấm) |
| B04: FR-17 script P1 đến P4 (kèm _v2 P1, P2) <br> Phiên 051b68d8, C21 đến C32, 16/11/2026 | 4 spec, AdminCouponsPage, globalSetup reset DB và đăng nhập, lib/expectCell.ts | INCOMPLETE | Câu hỏi phạm vi 3 kiểu và expect.soft đến sau P1 nên P1, P2 phải sinh lại _v2 | Sinh viên chọn CH-script-01 b, 02 b, 04 b (mỗi spec đủ 3 kiểu, soft cho từng ô) |
| B05: FR-17 review (chạy thử 3 trình duyệt) <br> Phiên 051b68d8, C33 đến C37, 16/11/2026 | 5 lượt chạy thử, phân loại test fail, 3 đề xuất sửa P3 | INCOMPLETE | Bản AI P3 có 3 lỗi chỉ lộ khi chạy (mục 3.2) | Sinh viên duyệt 3 chỗ sửa ★, bỏ --repeat-each vì dữ liệu cố định |
| B06: FR-17 run, bugs, gap <br> Phiên 051b68d8, C40 đến C51, 17/11/2026 | 03_results.md từ results.json; bản nháp 3 bình luận, 2 issue; đăng sau khi duyệt; 04_gap.md | VALID | Số liệu khớp results.json; đăng chỉ sau khi sinh viên bảo "đăng đi" | Sinh viên tự chạy chính thức, chốt phân loại, tự chụp ảnh tái hiện |
| B07: FR-07 select, data <br> Phiên FR-07 8897e5a5, C53 đến C61, 17/11/2026 | ai_raw/select.md (38 test case, 15 giao diện + 12 API), ai_raw/data.md (9 file JSON) | INCOMPLETE | select: "Giỏ 2 dòng" mơ hồ, TC-CART-93 bị #72 chặn điều kiện. data: TC-CART-08 thiếu số dòng và tổng sau khi thêm lại; AI sửa JSON trước khi bản AI được commit | Sinh viên chốt sản phẩm (D-08), bỏ TC-CART-93, thêm rowCount, total |
| B08: FR-07 script P1 đến P7 <br> Phiên 8897e5a5, C62 đến C90, 17/11/2026 | 7 spec, 4 page object, lib/ (feedback, money, cartChecks, cartApi, removeDialog) | INCOMPLETE | P1 bỏ qua ô khi có dòng trùng (#70); spec API chỉ 2 kiểu assertion (AI để nguyên lỗi và hỏi) | Sinh viên góp ý row.first(), chọn CH-script-01 đến 06 (kiểu trong lib/ tính cho spec, ngoại lệ spec API) |
| B09: FR-07 review <br> Phiên 8897e5a5, C91 đến C101, 17/11/2026 | 4 lượt chạy thử, S1, S2 sửa khi chạy, N1, N2 khi rà test qua, --repeat-each=3 cho P1 đến P5 | INCOMPLETE | S1 (bát phân), S2 (chữ vẽ lại), N1 (biên mẫu số), N2 (TC-CART-54 qua không chứng minh gì) | Sinh viên duyệt S1, S2, N1, N2; để TC-CART-100 tới bước bugs |
| B10: FR-07 run, bugs, gap <br> Phiên 8897e5a5, C102 đến C113, 17/11/2026 | 03_results.md; 15 bình luận và issue #118; 04_gap.md (7 đề xuất skill) | VALID | Số liệu khớp results.json; chỉ dùng 9 ảnh Playwright thấy được lỗi; đăng sau khi sinh viên bảo "Đăng cả hai" | Sinh viên tự chạy chính thức, reset DB, tái hiện TC-CART-100 bằng tay |
| B11: FR-01 select, data <br> Phiên FR-01 8a6f8ed4, C115 đến C124, 17/11/2026 | ai_raw/select.md (96 test case, 14 chọn), ai_raw/data.md (5 file JSON) | INCOMPLETE | select: Kết quả mong đợi TC-REG-95 tính cả nhãn của ô bị thiếu (#43); thiếu mục "Điều kiện tiên quyết chung" | Sinh viên sửa TC-REG-95 (3 nhãn), chọn CH-select-01 đến 07, CH-data-01 đến 03 |
| B12: FR-01 script P1 đến P5 <br> Phiên 8a6f8ed4, C125 đến C138, 18/11/2026 | 5 spec, RegisterPage, LoginPage, fieldByLabel, lib/color.ts, reset DB | INCOMPLETE | fieldByLabel lọc mọi div chứa nhãn (strict mode); recordTexts thiếu lọc hiển thị như newTexts | Sinh viên tự phát hiện 2 lỗi khi đọc bản AI, đổi quyết định so chữ đúng hoa thường (CH-script-04) |
| B13: FR-01 review, run, bugs, gap <br> Phiên 8a6f8ed4, C138 đến C152, 18/11/2026 | Chạy thử 3 trình duyệt; thử làm hỏng M1 đến M8; 03_results.md; 6 bình luận; 04_gap.md | VALID | M4 cho thấy test P3 qua cả với mật khẩu hợp lệ vì #42, được ghi thành annotation "Giới hạn quan sát" | Sinh viên chọn CH-review-01 b, tự chạy chính thức |
| B14: Phiên điều phối: Kiểm tra phiên làm bài, sửa skill, commit message, prompt log <br> Phiên 27ccb594, từ C11, 16/11/2026 đến 18/11/2026 | Kiểm từng bước (tsc, check_automation.py, đối chiếu results.json, GitHub), 17 lần sửa skill, lệnh commit, xuất log | INCOMPLETE | Bắt được: Dòng bảng bị tách, commit thiếu 4 file JSON, đổi thứ tự commit, câu ghi cũ; sinh viên duyệt mọi lần sửa skill. Ước tính thời gian còn lại thường dư | Sinh viên duyệt từng đề xuất skill, tự commit và push |
| B15: Kịch bản và script quay video Task 2, báo cáo này <br> Phiên 27ccb594, C153 đến C165, 18/11/2026 | Kịch bản quay và lồng tiếng (sườn), tools/demo_task2.ps1 (chỉ điều khiển thao tác: Chạy lệnh thật, mở file và report thật), report.md, README, đóng gói | INCOMPLETE | Script chỉ thao tác, không tạo hay sửa kết quả. Nhưng bước khôi phục report sau khi quay chỉ dùng git restore, không tính tới trace bị .gitignore chặn, nên trace của lần chạy chính thức FR-17 bị mất (phát hiện khi kiểm bản tải về). Bảng mục 2 bug_report.md và danh sách lồng nhau vỡ khi xuất PDF, sửa sau khi sinh viên phát hiện | Sinh viên chọn FR-17, quyết định quay đoạn nào, tinh chỉnh lời thuyết minh, tự lồng tiếng và dựng video, phát hiện bảng vỡ trong PDF, tải bản nộp về kiểm, chọn điểm tự chấm |

## 4. Tổng kết Độ chính xác AI

Tổng hợp verdict từ Mục 3 và điền vào bảng dưới.

| Chỉ số | Số lượng | Tỉ lệ |
|---|---|---|
| Tổng artifact AI sinh đã audit | 15 | 100% |
| VALID (đúng, dùng nguyên) | 3 | 20,0% |
| INVALID (sai; loại bỏ) | 0 | 0,0% |
| INCOMPLETE (chấp nhận sau khi sửa) | 12 | 80,0% |

## 5. Kết luận — Khi nào nên / không nên dùng AI?

Viết 80–150 chữ mô tả pattern quan sát được. AI mạnh ở đâu? AI sai ở đâu? Khuyến nghị của bạn cho việc dùng AI trong loại công việc này?

Nên dùng AI để sinh khung script data-driven, page object và file dữ liệu từ test case có sẵn, chạy thử nhiều trình duyệt, đọc `results.json`, và soạn các bản ghi lặp lại (bảng kết quả, bình luận bug); những việc này nhanh hơn nhiều so với làm tay và ít sai về cú pháp. Không nên tin AI ở chỗ quyết định script có kiểm đúng hay không: AI viết theo nhánh hệ thống làm đúng, nên assertion có thể qua cả khi hệ thống sai; phải chạy thử, đọc cả test qua và thử làm hỏng có chủ đích. Kết quả chính thức, ảnh bằng chứng và các quyết định về oracle phải do người làm.

## 6. Mandatory Disclosure (dán nguyên văn)

"Tôi dùng AI (Claude Code, Anthropic, claude-opus-5-5) cho các việc sau: Phân tích đề và lập kế hoạch, dựng dự án Playwright (cấu hình 3 trình duyệt, fixture "Run by", script chạy), viết Agent Skill `playwright-automation` và sửa skill 17 lần theo góp ý của tôi; ở cả 3 feature: Đề xuất test case chọn, sinh file dữ liệu, sinh spec và page object (bản gốc lưu nguyên văn trong `ai_raw/`), chạy thử trên 3 trình duyệt khi tôi nhờ, thử làm hỏng có chủ đích, soạn bảng thay đổi, tóm tắt `results.json`, soạn và đăng bình luận, issue lên GitHub sau khi tôi duyệt, viết gap analysis; kiểm tra phiên làm bài, xuất prompt log, soạn commit message, script hỗ trợ quay video, và soạn báo cáo này. Tôi tự quyết định test case, tiêu chí và mọi câu hỏi mở, review và quyết định từng chỗ sửa, tự chạy chính thức 9 lần trên máy mình để sinh HTML report, tự tái hiện bug bằng tay và chụp ảnh, tự quay và thuyết minh hai video, và tự commit, push. Tôi chịu trách nhiệm về toàn bộ nội dung nộp."

## Chữ ký

| Họ tên sinh viên (in hoa): | NGUYỄN THỊ ÁNH NGỌC |
|---|---|
| MSSV: | 23120061 |
| Lớp / Khoá: | Kiểm thử phần mềm - CQ2023/3 |
| Môn học: | CS423 / CSC13003 – Kiểm chứng Phần mềm |
| Giảng viên: | Lâm Quang Vũ <br> Hồ Tuấn Thanh <br> Trương Phước Lộc |
| Ngày: | 18/11/2026 |
| Chữ ký: | *(Ảnh chữ ký: Xem bản PDF)* |

## Tham khảo

- Kharbach, M. (2026). AI Use Policy Templates for Higher Education. CC BY-NC-SA 4.0.

- ISTQB Foundation Level Syllabus (latest version).

- Hardman, P. (2025). A Post-AI Learning Taxonomy.

- Fuster Rabella, M. (2025). OECD Education Working Paper No. 338.

- Perkins, M., Roe, J., & Furze, L. (2025). AI Assessment Scale.

- Anthropic (2025). Building reliable AI test agents — engineering blog.

- DeepEval & Promptfoo documentation — testing frameworks for LLM systems.
