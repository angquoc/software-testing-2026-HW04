**HW04: Tái hiện bằng automation** (23120061, Playwright)

- Script: `tests/B_FR-07_GioHang/07_api_valid.spec.ts`
- Test case: TC-CART-51
- Trình duyệt lỗi: Chrome
- Lần chạy chính thức ngày 17/11/2026 (Windows 11, Playwright 1.65.0, EShop commit `85af3ba`): Chrome 157.0.8103.52 (2026-11-17T17:24:05+07:00). Test API chỉ chạy trên Chrome
- Kết quả assertion:
  - `POST /api/cart {"id":1,"name":"iPhone 15 Pro Max","price":1,"quantity":1}` -> HTTP 200.
  - Dòng mới `{"id":1,"name":"iPhone 15 Pro Max","price":1,"quantity":1}`: `No new line stores the client price 1` (Expected length 0, Received 1) và `A new line uses the catalogue values` (Expected price 30000000, Received 1).

**Ảnh**

**B-FR07_B-20_TC-CART-51_report.png**: SV tự chụp: Report Chrome, test TC-CART-51, annotation "Response" và "New cart lines"

<img width="750" height="337" alt="B-FR07_B-20_TC-CART-51_report.png" src="https://github.com/user-attachments/assets/77d7d994-3b60-45ba-b112-2ff6cd286f89" />
