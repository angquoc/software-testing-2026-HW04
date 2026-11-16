// Ghi mã giả định HW02 vào annotation của test (CH-select-02 a); fail ở các chỗ này phân loại "Khác giả định" ở bước run.
export const assumptionNotes = (assumptions: string[]) =>
  assumptions.map((a) => ({ type: 'Assumption', description: `${a} (giả định HW02)` }));
