// Mẫu so số tiền hiển thị với số nguyên trong dữ liệu (quyết định của SV: Số tiền ghi bằng số nguyên).
// Không kèm ký tự phân cách: Chữ số đúng thứ tự, giữa hai chữ số có thể có một ký tự phân cách; hai đầu không dính chữ số.
// Có số phân cách (TC-CART-104, 105): Nhóm 3 chữ số từ phải sang, cùng một ký tự "," hoặc "." giữa các nhóm.
export function moneyPattern(value: number, thousandSeparators?: number): RegExp {
  const digits = String(value);
  if (thousandSeparators === undefined) {
    return new RegExp(`(^|\\D)${digits.split('').join('[.,\\s\\u00a0]?')}(\\D|$)`);
  }
  const groups: string[] = [];
  for (let end = digits.length; end > 0; end -= 3) groups.unshift(digits.slice(Math.max(0, end - 3), end));
  if (groups.length - 1 !== thousandSeparators) {
    throw new Error(`Test data error: ${value} has ${groups.length - 1} thousands separators, data says ${thousandSeparators}`);
  }
  const [first, ...rest] = groups;
  const tail = rest.map((g, k) => (k === 0 ? `([.,])${g}` : `\\2${g}`)).join('');
  return new RegExp(`(^|\\D)${first}${tail}(\\D|$)`);
}

// Định dạng tiền của TC-CART-94 (không xét giá trị): Nhóm đầu 1 đến 3 chữ số, các nhóm sau đúng 3 chữ số,
// cùng một ký tự "," hoặc "." giữa các nhóm; ký hiệu tiền đứng trước hoặc sau số (GĐ-04 của ai_raw/script_05_cart_gui.md).
// whole: Chuỗi chỉ gồm số tiền (ô của bảng); không whole: Chứa một số tiền đúng định dạng (khối tổng có cả nhãn).
export function currencyFormatPattern(symbol: string, whole: boolean): RegExp {
  const sym = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const sp = '[\\s\\u00a0]*';
  const before = `${sym}${sp}\\d{1,3}(?:([.,])\\d{3}(?:\\1\\d{3})*)?`;
  const after = `\\d{1,3}(?:([.,])\\d{3}(?:\\2\\d{3})*)?${sp}${sym}`;
  const body = `(?:${before}|${after})`;
  return whole
    ? new RegExp(`^${sp}${body}${sp}$`)
    : new RegExp(`(?:^|[^\\d.,${sym}])${body}(?:$|[^\\d.,${sym}])`);
}
