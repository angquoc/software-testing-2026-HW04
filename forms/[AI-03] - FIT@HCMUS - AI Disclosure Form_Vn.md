> Bản text-based của `[AI-03] - FIT@HCMUS - AI Disclosure Form_Vn.docx` (bản binary: .docx / .pdf cùng tên).

Khoa Công nghệ Thông tin (FIT) – Trường Đại học Khoa học Tự nhiên (HCMUS)

CS423 / CSC15003 – Kiểm chứng Phần mềm (AI-augmented · 2026)

CHÍNH SÁCH AI · BIỂU MẪU — 2026 v1.0

# Biểu mẫu Khai báo Sử dụng AI

Đính kèm cho mọi bài tập có dùng AI ở bất kỳ mức nào.

Tài liệu được biên soạn lại từ Med Kharbach, PhD (2026) — Mẫu Chính sách Sử dụng AI cho Giáo dục Đại học. Giấy phép CC BY-NC-SA 4.0. Phiên bản này được FIT@HCMUS điều chỉnh cho môn CS423 / CSC15003 Kiểm chứng Phần mềm.

## 1. Thông tin Môn học & Sinh viên

| Mục | Giá trị |
|---|---|
| Môn học: | CS423 / CSC13003 – Kiểm chứng Phần mềm |
| Mã bài tập: | HW04-AI |
| Tên bài tập: | Automation Testing on EShop (Playwright data-driven, đa trình duyệt Chrome, Edge, Firefox cho FR-01 Đăng ký, FR-07 Giỏ hàng, FR-17 Quản lý mã giảm giá; video demo; Agent Skill playwright-automation) |
| Cấp độ AI (1–5): | Cấp 4 – AI hỗ trợ sản xuất |
| Ngày: | 18/11/2026 |
| Họ tên sinh viên: | Nguyễn Thị Ánh Ngọc |
|  |  |
| MSSV: | 23120061 |

## 2. Câu hỏi Khai báo

### 1. Công cụ AI đã dùng:

Liệt kê mọi công cụ AI dùng cho bài tập này (ví dụ AI Tool (e.g., ChatGPT, Claude, Gemini), ChatGPT, GitHub Copilot, Cursor, Gemini).

Claude Code (Anthropic, claude-opus-5-5), chạy trong VS Code: 1 phiên điều phối (27ccb594), 1 phiên làm FR-17 (051b68d8), 1 phiên làm FR-07 (8897e5a5), 1 phiên làm FR-01 và quay video Agent Skill (8a6f8ed4). Không dùng công cụ AI nào khác. Công cụ kiểm thử: Playwright 1.65.0 và Playwright HTML reporter.

### 2. Giai đoạn nào của bài tập có dùng AI:

Tick tất cả: [x] brainstorm  [x] outline  [x] viết nháp  [x] phản hồi  [x] sửa chữa  [x] code  [x] phân tích dữ liệu  [ ] thiết kế đồ hoạ  [x] khác (ghi rõ).

Khác: Dẫn AI qua từng bước của Agent Skill playwright-automation cho cả 3 feature (chọn test case, sinh dữ liệu, sinh spec từng phần; bản gốc của AI lưu trong features/<feature>/ai_raw/); chạy thử trên 3 trình duyệt khi tôi nhờ, thử làm hỏng có chủ đích; soạn và đăng bình luận, issue lên GitHub sau khi tôi duyệt; viết gap analysis; một phiên riêng điều phối, kiểm từng bước và sửa skill theo đề xuất tôi duyệt. Code: Dự án Playwright (3 trình duyệt, fixture "Run by", tools/run.mjs), 16 spec và page object, Agent Skill và script kiểm check_automation.py, script xuất prompt log, script hỗ trợ quay video. Phân tích dữ liệu: Tóm tắt results.json, đếm bảng "Thay đổi so với bản AI".

### 3. Prompt / nhiệm vụ chính cho AI:

Dán nguyên văn 2–3 prompt quan trọng nhất. Để xem đầy đủ, đính kèm Phụ lục A (prompt_log.md).

(1) C01 – Claude Code – 15:31 15/11/2026 (phân tích đề): "Đọc kỹ đề bài của HW04, cùng với các nội dung liên quan (yêu cầu, template, slide,...) rồi tổng hợp cho tôi đề bài yêu cầu những gì, cần chuẩn bị những gì, sẽ nộp những gì thật chi tiết. [...]"

(2) C59 – Claude Code – 13:13 17/11/2026 (review dữ liệu FR-07): "Trả lời câu hỏi: CH-data-01: a; CH-data-02: a; CH-data-03: a; CH-data-04: b. Ngoài ra, cập nhật giúp tôi 2 điểm nhỏ trong các file JSON trước khi chốt bước data: 1. Trong TC-CART-08, nên bổ sung "rowCount": 2 và "total": 58000000 vào object afterReAdd để kiểm tra đủ trạng thái giỏ sau khi thêm lại Samsung, để có thể phát hiện được lỗi nếu thao tác thêm lại vô tình ghi đè mất dòng iPhone. [...]"

(3) C126 – Claude Code – 00:12 18/11/2026 (review script FR-01): "Về câu hỏi: 3 câu chọn a. Ngoài ra: Ở fieldByLabel.ts, nếu trong <form> có thẻ div bọc chung bên ngoài các trường thì scope.locator('div').filter(...) sẽ khớp cả thẻ div ngoài đó, làm .locator('input') dính nhiều ô và báo lỗi strict mode. Bạn kiểm tra và cân nhắc đổi nếu cần."

Toàn bộ prompt có timestamp, nguyên văn: Phụ lục A (prompt_log.md).

### 4. Phần cụ thể AI đóng góp:

Càng cụ thể càng tốt. Ví dụ: 'AI sinh TC01–TC15 ở Mục 3.2; tôi viết lại TC04 và TC11; AI KHÔNG đóng góp vào Mục 1, 2, 4, hoặc AI Critique.'

Task 1: AI viết bản gốc chọn test case, file dữ liệu, spec và page object của cả 3 feature (lưu nguyên văn trong features/<feature>/ai_raw/), các bản review soạn theo quyết định của tôi (01_selected_tc.md, 02_review.md), phần chạy thử trên 3 trình duyệt và thử làm hỏng có chủ đích khi tôi nhờ, 03_results.md tóm tắt từ results.json, 04_gap.md, bugs/bug_report.md, nội dung 3 issue mới (#114, #115, #118) và 24 bình luận HW04 cùng việc đăng bằng gh sau khi tôi duyệt. Dự án Playwright (playwright.config.ts, fixture, tools/run.mjs). Task 2: Sườn kịch bản quay và lồng tiếng, script tools/demo_task2.ps1 chỉ điều khiển thao tác. Agent Skill: Toàn bộ skills/playwright-automation/ và 17 lần sửa theo đề xuất tôi duyệt. Chung: WORKFLOW.md, README, report.md, các form, Appendix B, tools/ (xuất prompt log, xuất PDF, đóng gói).

AI KHÔNG đóng góp vào: Các quyết định chọn test case, tiêu chí, câu trả lời cho mọi câu hỏi mở (CH-...) và việc giữ / sửa / bỏ từng chỗ trong bản AI; 9 lần chạy chính thức sinh HTML report (tôi tự chạy trên máy mình); tái hiện bug bằng tay và ảnh chụp; việc tải ảnh lên GitHub; quay, chọn đoạn, thuyết minh và dựng hai video; điểm tự chấm. Chi tiết từng artifact: AI Audit Report (Appendix B của report.md).

### 5. Cách tôi rà soát / chỉnh sửa / xác minh đầu ra AI:

Mô tả phương pháp xác minh (chạy test, kiểm tra spec, hỏi TA, tra RFC, đối chiếu ISTQB syllabus, v.v.).

Mỗi bước, bản AI được commit riêng trước khi tôi sửa; mọi chỗ sửa ghi vào bảng "Thay đổi so với bản AI" (Loại: Sai, Thiếu, Thừa, Mơ hồ, Quyết định của SV; loại lỗi script; vì sao AI sai: Prompt, Giới hạn model, Đặc thù feature) và đếm bằng check_automation.py changes --stats. Đối chiếu kết quả mong đợi với SRS của EShop và test case HW02; kiểm tĩnh (tsc, check_automation.py spec, same, data); chạy thử trên Chrome, Edge, Firefox, đọc cả test qua và thử làm hỏng có chủ đích để chắc assertion bắt được lỗi; tự chạy lần chính thức và đối chiếu results.json; duyệt nội dung bình luận, issue trước khi AI đăng và kiểm lại trên GitHub. Một phiên Claude riêng điều phối, kiểm từng bước của phiên làm bài (file đã đọc, commit, số liệu). Kết quả rà soát: Appendix B (VALID, INCOMPLETE, INVALID).

### 6. Trích dẫn (nếu môn yêu cầu):

Môn Kiểm chứng Phần mềm dùng phong cách IEEE. Ví dụ: Anthropic. (2026). AI Tool (e.g., ChatGPT, Claude, Gemini) [Large language model]. https://claude.ai

[1] Anthropic, "Claude Code (claude-opus-5-5)," [Large language model], 2026. [Online]. Available: https://claude.ai

## 3. Cam đoan Trung thực

Bằng việc ký tên dưới đây, tôi cam đoan thông tin khai báo ở trên là chính xác và đầy đủ. Tôi hiểu rằng việc không khai báo hoặc khai báo sai lệch về việc dùng AI sẽ bị coi là vi phạm liêm chính học thuật và có thể dẫn đến điểm 0 cho bài tập cùng việc bị chuyển lên hội đồng kỷ luật.

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

Kharbach, M. (2026). AI Use Policy Templates for Higher Education. CC BY-NC-SA 4.0.

ISTQB Foundation Level Syllabus (latest version).

Hardman, P. (2025). A Post-AI Learning Taxonomy.

Fuster Rabella, M. (2025). OECD Education Working Paper No. 338.

Perkins, M., Roe, J., & Furze, L. (2025). AI Assessment Scale.

Anthropic (2025). Building reliable AI test agents — engineering blog.

DeepEval & Promptfoo documentation — testing frameworks for LLM systems.
