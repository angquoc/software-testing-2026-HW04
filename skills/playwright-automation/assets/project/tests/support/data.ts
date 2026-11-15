import { readFileSync } from 'node:fs';

// Đọc file dữ liệu test. Spec gọi với đường dẫn tuyệt đối, ví dụ:
//   const rows = loadCsv(path.join(__dirname, 'data', 'cart_quantity.csv'));

export function loadJson<T = Record<string, unknown>>(file: string): T[] {
  const data = JSON.parse(readFileSync(file, 'utf8'));
  if (!Array.isArray(data)) throw new Error(`${file}: Cần một mảng các test case`);
  return data as T[];
}

// CSV theo RFC 4180: Dòng đầu là tên cột; ô có dấu phẩy, ngoặc kép, xuống dòng nằm trong "..."; "" là một dấu ngoặc kép.
// Mọi giá trị là chuỗi (ô trống là ""), spec tự đổi kiểu.
export function loadCsv(file: string): Record<string, string>[] {
  const text = readFileSync(file, 'utf8').replace(/^﻿/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  const [header, ...body] = rows.filter((r) => r.some((c) => c !== ''));
  if (!header) throw new Error(`${file}: File rỗng`);
  return body.map((r, n) => {
    if (r.length !== header.length) throw new Error(`${file}: Dòng ${n + 2} có ${r.length} cột, cần ${header.length}`);
    return Object.fromEntries(header.map((h, k) => [h.trim(), r[k]]));
  });
}
