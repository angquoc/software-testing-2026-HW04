import { test as base } from '@playwright/test';
import { STUDENT_ID } from './runInfo';

// Mọi spec import `test`, `expect` từ file này (không import `test` thẳng từ '@playwright/test'),
// để trang chi tiết của từng test trong HTML report có annotation "Run by: 23120061 | <ISO>" (D9).
// RUN_STARTED_AT do playwright.config.ts đặt một lần ở tiến trình chính; worker kế thừa.
export const test = base.extend<{ runBy: void }>({
  runBy: [
    async ({}, use, testInfo) => {
      testInfo.annotations.push({
        type: 'Run by',
        description: `${STUDENT_ID} | ${process.env.RUN_STARTED_AT ?? 'unknown'}`,
      });
      await use();
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
