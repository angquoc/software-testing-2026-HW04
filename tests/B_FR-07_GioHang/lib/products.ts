import products from '../data/products.json';
import type { Product } from './types';

// Tra sản phẩm theo khóa trong data/products.json; khóa sai là lỗi dữ liệu.
export function productByKey(key: string): Product {
  const p = (products as Product[]).find((x) => x.key === key);
  if (!p) throw new Error(`Unknown product key in test data: ${key}`);
  return p;
}
