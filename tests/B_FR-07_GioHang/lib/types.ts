// Kiểu của file dữ liệu FR-07 (schema ở ai_raw/data.md, đã chốt ở 02_review.md mục 1.2).

export interface Product {
  key: string;
  name: string;
  price: number;
  apiId?: number;
  oracle: string;
  note?: string;
}

export interface ExpectedRow {
  product: string;
  unitPrice?: number;
  quantity?: number;
  lineTotal?: number;
}

export interface CartStateExpected {
  rowCount?: number;
  rows?: ExpectedRow[];
  total?: number;
  thousandSeparators?: number;
}

export interface EmptyStateExpected {
  illustration: boolean;
  messageContains: string;
  table: boolean;
}

export interface AddFromDetailCase {
  id: string;
  title: string;
  setup: { cart: string[] };
  input: { product: string; quantity: number; fillQuantity: boolean };
  expected: CartStateExpected & {
    outcome: 'added' | 'rejected';
    feedback?: 'toastOrBadge' | 'noSuccess';
    badge?: number | 'hiddenOrZero' | 'unchanged';
    k1?: { afterReload: boolean; apiCart: boolean };
  };
  oracle: string;
  note?: string;
}

export interface AddToExistingCartCase {
  id: string;
  title: string;
  setup: { cart: string[] };
  input: { from: 'home' | 'detail'; product: string; quantity?: number; fillQuantity?: boolean };
  expected: CartStateExpected & {
    feedback?: 'toastOrBadge';
    badge?: number;
  };
  oracle: string;
  note?: string;
}

export interface RemoveItemCase {
  id: string;
  title: string;
  setup: { cart: string[] };
  input: { remove: string; dialogChoice: 'accept' | 'dismiss'; thenAddFromHome?: string };
  expected: CartStateExpected & {
    dialog: 'shown';
    rowPresentWhileDialogOpen?: string;
    afterRemove?: CartStateExpected;
    afterReAdd?: CartStateExpected;
    emptyState?: EmptyStateExpected;
  };
  oracle: string;
  note?: string;
}

export interface ContinueShoppingCase {
  id: string;
  title: string;
  setup: { cart: string[] };
  input: { button: string; fallbackButton?: string };
  expected: {
    emptyState?: EmptyStateExpected;
    badge?: 'hiddenOrZero';
    continueButton?: 'present';
    home: { path: string; heading: string };
    afterReturn?: CartStateExpected;
  };
  oracle: string;
  note?: string;
}

export interface CartGuiCase {
  id: string;
  title: string;
  setup: { cart: string[] };
  expected: {
    columns?: string[];
    rowCount?: number;
    deleteButtonPerRow?: boolean;
    totalLabel?: string;
    currencySymbol?: string;
    thousandsSeparated?: Array<'unitPrice' | 'lineTotal' | 'total'>;
    navHighlight?: { link: string; ariaCurrent: string; orStyleDiffersFrom: 'home' };
    breadcrumb?: { landmarkNameContains: string; orLinksInOrder: [string, string] };
  };
  oracle: string;
  note?: string;
}

// Test API (P6, P7): Schema ở ai_raw/data.md mục "Test API".
export type ApiAuth = 'user' | 'admin' | 'none' | 'userTampered';

export interface ApiRequestSpec {
  method: 'POST' | 'GET';
  auth: ApiAuth;
  bodyOverride?: Record<string, unknown>;
  bodyOmit?: string[];
}

export interface CartApiBase {
  baseBody: Record<string, unknown>;
  oracle: string;
}

export interface ApiInvalidCase {
  id: string;
  title: string;
  precheck?: { productMissing: number };
  setupPost?: boolean;
  request: ApiRequestSpec;
  expected: { success: boolean; newRowCount?: number; cartData?: boolean };
  oracle: string;
  note?: string;
}

export interface ApiValidCase {
  id: string;
  title: string;
  request: ApiRequestSpec;
  thenGet?: { auth: 'admin'; compare: 'beforeAndAfter' };
  expected: {
    success?: boolean;
    noServerError?: boolean;
    newRowCount?: number;
    newRows?: Record<string, unknown>[];
    noNewRowWithPrice?: number;
    ifAdded?: Record<string, unknown>;
    oldRowsUnchanged?: boolean;
    adminCartNewRowCount?: number;
  };
  oracle: string;
  note?: string;
}
