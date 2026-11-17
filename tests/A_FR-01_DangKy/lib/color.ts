// Đổi màu CSS tính được (getComputedStyle) dạng rgb()/rgba() sang HSL để so với khoảng "xanh dương" của TC-REG-92.
export interface Hsl {
  hue: number; // 0 đến 360 độ
  saturationPercent: number; // 0 đến 100
  lightnessPercent: number; // 0 đến 100
  alpha: number; // 0 đến 1
}

// Nhận cả cú pháp có dấu phẩy "rgb(239, 68, 68)" và không dấu phẩy "rgb(239 68 68 / 0.5)". Trả về null nếu không phải rgb()/rgba().
export function cssRgbToHsl(css: string): Hsl | null {
  const m = css.trim().match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i);
  if (!m) return null;
  const [r, g, b] = [m[1], m[2], m[3]].map((v) => Number(v) / 255);
  let alpha = 1;
  if (m[4] !== undefined) alpha = m[4].endsWith('%') ? Number(m[4].slice(0, -1)) / 100 : Number(m[4]);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  return { hue: h, saturationPercent: s * 100, lightnessPercent: l * 100, alpha };
}
