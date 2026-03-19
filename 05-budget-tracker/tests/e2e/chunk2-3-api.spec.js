// covers: src/app/api/transactions/, src/app/api/categories/, src/app/api/summary/, src/lib/services/
const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:3012';

async function registerAndLogin(page) {
  const email = `api-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.com`;
  await page.goto(`${BASE}/register`);
  await page.getByPlaceholder('이름').fill('API테스트');
  await page.getByPlaceholder('이메일').fill(email);
  await page.getByPlaceholder('비밀번호 (6자 이상)').fill('password123');
  await page.getByRole('button', { name: '회원가입' }).click();
  await expect(page).toHaveURL(`${BASE}/dashboard`, { timeout: 10000 });
  return email;
}

test.describe('거래 API', () => {
  test('거래 생성 → 목록 표시', async ({ page }) => {
    await registerAndLogin(page);
    await page.goto(`${BASE}/transactions`);

    await page.getByPlaceholder('금액').fill('50000');
    await page.getByPlaceholder('메모 (선택사항)').fill('테스트 급여');
    await page.getByRole('button', { name: '거래 추가' }).click();

    await expect(page.getByText('테스트 급여')).toBeVisible({ timeout: 5000 });
  });

  test('거래 생성 후 대시보드 잔액 반영', async ({ page }) => {
    await registerAndLogin(page);
    await page.goto(`${BASE}/transactions`);

    // 수입 추가
    await page.locator('form').getByRole('button', { name: '수입' }).click();
    await page.getByPlaceholder('금액').fill('100000');
    await page.getByPlaceholder('메모 (선택사항)').fill('월급');
    await page.getByRole('button', { name: '거래 추가' }).click();
    await expect(page.getByText('월급')).toBeVisible({ timeout: 5000 });

    // 대시보드에서 잔액 확인
    await page.goto(`${BASE}/dashboard`);
    await expect(page.getByText('100,000원', { exact: true })).toBeVisible({ timeout: 5000 });
  });

  test('거래 유형 URL 필터', async ({ page }) => {
    await registerAndLogin(page);
    await page.goto(`${BASE}/transactions`);

    // 수입 추가
    await page.locator('form').getByRole('button', { name: '수입' }).click();
    await page.getByPlaceholder('금액').fill('50000');
    await page.getByPlaceholder('메모 (선택사항)').fill('수입거래');
    await page.getByRole('button', { name: '거래 추가' }).click();
    await expect(page.getByText('수입거래')).toBeVisible({ timeout: 5000 });

    // 지출 추가
    await page.locator('form').getByRole('button', { name: '지출' }).click();
    await page.getByPlaceholder('금액').fill('10000');
    await page.getByPlaceholder('메모 (선택사항)').fill('지출거래');
    await page.getByRole('button', { name: '거래 추가' }).click();
    await expect(page.getByText('지출거래')).toBeVisible({ timeout: 5000 });

    // URL ?type=income 필터 — 수입만 표시
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    await page.goto(`${BASE}/transactions?year=${year}&month=${month}&type=income`);
    await expect(page.getByText('수입거래')).toBeVisible();
    await expect(page.getByText('지출거래')).not.toBeVisible();

    // URL ?type=expense 필터 — 지출만 표시
    await page.goto(`${BASE}/transactions?year=${year}&month=${month}&type=expense`);
    await expect(page.getByText('지출거래')).toBeVisible();
    await expect(page.getByText('수입거래')).not.toBeVisible();
  });

  test('거래 삭제', async ({ page }) => {
    await registerAndLogin(page);
    await page.goto(`${BASE}/transactions`);

    await page.getByPlaceholder('금액').fill('5000');
    await page.getByPlaceholder('메모 (선택사항)').fill('삭제할거래');
    await page.getByRole('button', { name: '거래 추가' }).click();
    await expect(page.getByText('삭제할거래')).toBeVisible({ timeout: 5000 });

    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: '삭제' }).first().click();
    await expect(page.getByText('삭제할거래')).not.toBeVisible({ timeout: 5000 });
  });
});

test.describe('카테고리', () => {
  test('카테고리 생성', async ({ page }) => {
    await registerAndLogin(page);
    await page.goto(`${BASE}/categories`);

    await page.getByPlaceholder('카테고리 이름').fill('외식비');
    await page.getByRole('button', { name: '카테고리 추가' }).click();
    await expect(page.getByText('외식비')).toBeVisible({ timeout: 5000 });
  });

  test('카테고리 삭제', async ({ page }) => {
    await registerAndLogin(page);
    await page.goto(`${BASE}/categories`);

    await page.getByPlaceholder('카테고리 이름').fill('삭제카테고리');
    // Register dialog handler before any action that might trigger confirm()
    page.on('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: '카테고리 추가' }).click();
    await expect(page.getByText('삭제카테고리')).toBeVisible({ timeout: 5000 });

    // Click the last 삭제 button (the newly added category is last in its section)
    const deleteButtons = page.getByRole('button', { name: '삭제' });
    await deleteButtons.last().click();
    await expect(page.getByText('삭제카테고리')).not.toBeVisible({ timeout: 5000 });
  });
});
