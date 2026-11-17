import type { APIRequestContext } from '@playwright/test';
import { API_URL } from '../../support/urls';

export type CartApiRow = Record<string, unknown>;

export async function loginToken(api: APIRequestContext, account: { email: string; password: string }): Promise<string> {
  const res = await api.post(`${API_URL}/api/login`, { data: account });
  if (!res.ok()) throw new Error(`POST /api/login for ${account.email}: HTTP ${res.status()}`);
  const body = await res.json();
  if (typeof body?.token !== 'string') throw new Error(`POST /api/login for ${account.email}: No token in response`);
  return body.token;
}

// GET /api/cart: API spec không mô tả body phản hồi; nhận mảng dòng hoặc object có một trường là mảng.
export async function getCartRows(api: APIRequestContext, token: string): Promise<CartApiRow[]> {
  const res = await api.get(`${API_URL}/api/cart`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok()) throw new Error(`GET /api/cart: HTTP ${res.status()}`);
  const body = await res.json();
  if (Array.isArray(body)) return body;
  const list = body && typeof body === 'object' ? Object.values(body).find(Array.isArray) : undefined;
  if (!list) throw new Error(`GET /api/cart: No cart lines in response ${JSON.stringify(body).slice(0, 200)}`);
  return list as CartApiRow[];
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
