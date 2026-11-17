import type { Locator, Page } from '@playwright/test';
import { expect } from '../../support/fixtures';
import type { NavBar } from '../../support/pages/NavBar';
import type { ProductDetailPage } from '../../support/pages/ProductDetailPage';

// Khoảng chờ: Lần bấm đầu 1,5 giây; "có phản hồi" và "không có phản hồi" cùng đo trên 2 giây (CH-script-01).
export const FIRST_CLICK_WINDOW_MS = 1_500;
export const FEEDBACK_WINDOW_MS = 2_000;

declare global {
  interface Window {
    __fr07Feedback?: string[];
  }
}

// Ghi chữ mới xuất hiện ngoài vùng thông tin sản phẩm (phần tử con trực tiếp của main chứa nút bấm), D-02 b.
// "Mới" là chưa có trên trang lúc cài: Chữ cũ được vẽ lại (câu chào trên Header khi giỏ đổi) không tính.
// Cài trước khi bấm để bắt cả toast tự ẩn.
export async function startFeedbackRecorder(clicked: Locator): Promise<void> {
  await clicked.evaluate((button) => {
    const region = button.closest('main > *') ?? button;
    const textNodesOf = (root: Node): string[] => {
      if (root.nodeType === Node.TEXT_NODE) return [(root.textContent ?? '').trim()].filter(Boolean);
      const out: string[] = [];
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const t = (n.textContent ?? '').trim();
        if (t) out.push(t);
      }
      return out;
    };
    const existing = new Set<string>();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (region.contains(n)) continue;
      const t = (n.textContent ?? '').trim();
      if (t) existing.add(t);
    }
    const texts: string[] = [];
    window.__fr07Feedback = texts;
    new MutationObserver((mutations) => {
      for (const m of mutations) {
        const nodes = m.type === 'characterData' ? [m.target] : Array.from(m.addedNodes);
        for (const n of nodes) {
          if (region.contains(n)) continue;
          for (const t of textNodesOf(n)) if (!existing.has(t)) texts.push(t);
        }
      }
    }).observe(document.body, { subtree: true, childList: true, characterData: true });
  });
}

export async function readFeedback(page: Page): Promise<string[]> {
  return page.evaluate(() => [...(window.__fr07Feedback ?? [])]);
}

// true nếu điều kiện đúng trong khoảng thời gian; false nếu hết thời gian (dùng cho quan sát "không xảy ra").
export async function becomesTrueWithin(check: () => Promise<boolean>, timeout: number): Promise<boolean> {
  try {
    await expect.poll(check, { timeout, intervals: [100, 250] }).toBe(true);
    return true;
  } catch {
    return false;
  }
}

// Có phản hồi sau khi bấm: Chữ mới ngoài vùng sản phẩm, hoặc badge khác lúc trước khi bấm.
export function feedbackSeen(page: Page, nav: NavBar, badgeBefore: number | null): () => Promise<boolean> {
  return async () => (await readFeedback(page)).length > 0 || (await nav.badgeCount()) !== badgeBefore;
}

// Bấm "Thêm vào giỏ hàng"; lần bấm đầu không có thay đổi nào (kể cả nhãn nút) trong FIRST_CLICK_WINDOW_MS thì bấm thêm một lần.
// Trả về lần bấm đầu có phản hồi không; spec quyết định có ghi lỗi hay không.
export async function clickAddWithRetry(
  page: Page,
  detail: ProductDetailPage,
  nav: NavBar,
  badgeBefore: number | null,
): Promise<{ firstClickResponded: boolean }> {
  await startFeedbackRecorder(detail.addButton);
  await detail.addButton.click();
  const seen = feedbackSeen(page, nav, badgeBefore);
  const firstClickResponded = await becomesTrueWithin(
    async () => (await seen()) || (await detail.addButton.count()) === 0,
    FIRST_CLICK_WINDOW_MS,
  );
  if (!firstClickResponded) await detail.addButton.click();
  return { firstClickResponded };
}
