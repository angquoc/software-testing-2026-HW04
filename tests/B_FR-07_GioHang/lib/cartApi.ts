import type { APIRequestContext, APIResponse } from '@playwright/test';
import { API_URL } from '../../support/urls';

export type CartApiRow = Record<string, unknown>;

// Kết quả gọi API: Giữ response gốc (cho toBeOK), mã HTTP, body đã parse (nếu là JSON) và chữ gốc.
export interface ApiResult {
  response: APIResponse;
  status: number;
  body: unknown;
  text: string;
}

async function toResult(response: APIResponse): Promise<ApiResult> {
  const text = await response.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    // Không phải JSON: Giữ chữ gốc.
  }
  return { response, status: response.status(), body, text };
}

function authHeaders(token: string | undefined): Record<string, string> {
  return token === undefined ? {} : { Authorization: `Bearer ${token}` };
}

export async function loginToken(api: APIRequestContext, account: { email: string; password: string }): Promise<string> {
  const res = await api.post(`${API_URL}/api/login`, { data: account });
  if (!res.ok()) throw new Error(`POST /api/login for ${account.email}: HTTP ${res.status()}`);
  const body = await res.json();
  if (typeof body?.token !== 'string') throw new Error(`POST /api/login for ${account.email}: No token in response`);
  return body.token;
}

// token undefined: Không gửi header Authorization (TC-CART-35).
export async function postCart(api: APIRequestContext, token: string | undefined, body: Record<string, unknown>): Promise<ApiResult> {
  return toResult(await api.post(`${API_URL}/api/cart`, { data: body, headers: authHeaders(token) }));
}

export async function getCart(api: APIRequestContext, token: string | undefined): Promise<ApiResult> {
  return toResult(await api.get(`${API_URL}/api/cart`, { headers: authHeaders(token) }));
}

export async function getProduct(api: APIRequestContext, id: number): Promise<ApiResult> {
  return toResult(await api.get(`${API_URL}/api/products/${id}`));
}

// Mảng dòng của giỏ trong body: Body là mảng, hoặc object có một trường là mảng (API spec không mô tả body phản hồi).
// null: Không có dữ liệu giỏ.
export function cartRowsOf(body: unknown): CartApiRow[] | null {
  if (Array.isArray(body)) return body as CartApiRow[];
  if (body && typeof body === 'object') {
    const list = Object.values(body).find(Array.isArray);
    if (list) return list as CartApiRow[];
  }
  return null;
}

// GET /api/cart bằng token hợp lệ; không phải 2xx hoặc không có mảng dòng là lỗi (không phải kết quả của test case).
export async function getCartRows(api: APIRequestContext, token: string): Promise<CartApiRow[]> {
  const res = await getCart(api, token);
  if (!res.response.ok()) throw new Error(`GET /api/cart: HTTP ${res.status}`);
  const rows = cartRowsOf(res.body);
  if (!rows) throw new Error(`GET /api/cart: No cart lines in response ${res.text.slice(0, 200)}`);
  return rows;
}

// Dòng có trong `after` mà không có trong `before`, so theo nội dung và đếm theo bội.
export function newRows(before: CartApiRow[], after: CartApiRow[]): CartApiRow[] {
  const left = new Map<string, number>();
  for (const r of before) left.set(JSON.stringify(r), (left.get(JSON.stringify(r)) ?? 0) + 1);
  const added: CartApiRow[] = [];
  for (const r of after) {
    const k = JSON.stringify(r);
    const n = left.get(k) ?? 0;
    if (n > 0) left.set(k, n - 1);
    else added.push(r);
  }
  return added;
}

// Body cơ sở ghép phần đổi, rồi bỏ các trường trong omit (giữ đúng kiểu JSON của dữ liệu).
export function buildBody(
  base: Record<string, unknown>,
  override: Record<string, unknown> = {},
  omit: string[] = [],
): Record<string, unknown> {
  const body: Record<string, unknown> = { ...base, ...override };
  for (const k of omit) delete body[k];
  return body;
}

// Token bị sửa một ký tự: Đổi ký tự ở giữa phần cuối (chữ ký) của token (GĐ-05 của ai_raw/data.md).
export function tamperToken(token: string): string {
  const parts = token.split('.');
  const sig = parts[parts.length - 1];
  const i = Math.floor(sig.length / 2);
  const replacement = sig[i] === 'A' ? 'B' : 'A';
  parts[parts.length - 1] = sig.slice(0, i) + replacement + sig.slice(i + 1);
  return parts.join('.');
}
