**HW04: Tái hiện bằng automation** (23120061, Playwright)

- Script: `tests/B_FR-07_GioHang/06_api_invalid.spec.ts`
- Test case: TC-CART-31 (0), TC-CART-32 (1.5), TC-CART-33 ("abc"), TC-CART-34 (thiếu), TC-CART-102 (-1)
- Trình duyệt lỗi: Chrome
- Lần chạy chính thức ngày 17/11/2026 (Windows 11, Playwright 1.65.0, EShop commit `85af3ba`): Chrome 157.0.8103.52 (2026-11-17T17:24:05+07:00). Test API chỉ chạy trên Chrome
- Kết quả assertion:
  - Cả 5 request `POST /api/cart` -> HTTP 200 `{"message":"Added to cart"}`: `KQ-KH-API: request is rejected (not 2xx), got HTTP 200`.
  - Giỏ có dòng mới với `quantity` 0, 1.5, "abc", không có `quantity`, -1: `Cart unchanged` (Expected length 0, Received 1).

**Ảnh**

**B-FR07_B-19_TC-CART-31_report.png**: SV tự chụp: Report Chrome, TC-CART-31 (`quantity` 0), annotation "Response" và lỗi

<img width="749" height="304" alt="B-FR07_B-19_TC-CART-31_report.png" src="https://github.com/user-attachments/assets/a7ee0f99-9a81-44f5-8897-1f83d5b6942e" />

**B-FR07_B-19_TC-CART-32_report.png**: SV tự chụp: Report Chrome, TC-CART-32 (`quantity` 1.5), annotation "Response" và lỗi

<img width="769" height="309" alt="B-FR07_B-19_TC-CART-32_report.png" src="https://github.com/user-attachments/assets/535591d9-cafd-4908-979e-8e85239308da" />

**B-FR07_B-19_TC-CART-33_report.png**: SV tự chụp: Report Chrome, TC-CART-33 (`quantity` "abc"), annotation "Response" và lỗi

<img width="751" height="307" alt="B-FR07_B-19_TC-CART-33_report.png" src="https://github.com/user-attachments/assets/afa88b16-c530-4388-beb1-1a3e997484d6" />

**B-FR07_B-19_TC-CART-34_report.png**: SV tự chụp: Report Chrome, TC-CART-34 (`quantity` thiếu), annotation "Response" và lỗi

<img width="749" height="284" alt="B-FR07_B-19_TC-CART-34_report.png" src="https://github.com/user-attachments/assets/8887ea1d-e5b5-4d78-8a64-73e452ecf537" />

**B-FR07_B-19_TC-CART-102_report.png**: SV tự chụp: Report Chrome, TC-CART-102 (`quantity` -1), annotation "Response" và lỗi

<img width="763" height="305" alt="B-FR07_B-19_TC-CART-102_report.png" src="https://github.com/user-attachments/assets/7a93c9ce-5044-4712-93b9-45134f6afed9" />
