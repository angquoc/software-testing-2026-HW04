// Thông tin "Run by" cho HTML report (đề §6, §11; quyết định D9).
export const STUDENT_ID = '23120061';

// Timestamp ISO 8601 theo giờ máy, có độ lệch múi giờ, ví dụ 2026-11-15T20:04:25+07:00.
export function localIsoNow(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}` +
    `${sign}${pad(Math.floor(Math.abs(off) / 60))}:${pad(Math.abs(off) % 60)}`
  );
}
