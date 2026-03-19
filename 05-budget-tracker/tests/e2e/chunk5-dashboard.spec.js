// covers: src/app/(dashboard)/dashboard/page.tsx, src/components/layout/MonthNav.tsx, src/lib/services/summary.service.ts
const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:3012';

async function registerAndLogin(page) {
  const email = `dash-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.com`;
  await page.goto(`${BASE}/register`);
  await page.getByPlaceholder('이름').fill('대시보드테스트');
  await page.getByPlaceholder('이메일').fill(email);
  await page.getByPlaceholder('비밀번호 (6자 이상)').fill('password123');
  await page.getByRole('button', { name: '회원가입' }).click();
  await expect(page).toHaveURL(`${BASE}/dashboard`, { timeout: 10000 });
}

test.describe('대시보드', () => {
  test('수입/지출/잔액 요약 카드 표시', async ({ page }) => {
    await registerAndLogin(page);
    await expect(page.getByText('총 수입')).toBeVisible();
    await expect(page.getByText('총 지출')).toBeVisible();
    await expect(page.getByText('잔액')).toBeVisible();
  });

  test('월 이동 — 이전달/다음달', async ({ page }) => {
    await registerAndLogin(page);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    await expect(page.getByText(`${year}년 ${month}월`)).toBeVisible();

    // 이전달
    await page.getByRole('link', { name: '←' }).click();
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    await expect(page.getByText(`${prevYear}년 ${prevMonth}월`)).toBeVisible();

    // 다음달 (두 번) — URL 변경을 기다려 MonthNav 재렌더 보장
    await page.getByRole('link', { name: '→' }).click();
    await page.waitForURL(url => url.toString().includes(`month=${month}`), { timeout: 5000 });
    await page.getByRole('link', { name: '→' }).click();
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    await expect(page.getByText(`${nextYear}년 ${nextMonth}월`)).toBeVisible({ timeout: 5000 });
  });

  test('거래 없을 때 "거래 내역이 없습니다." 표시', async ({ page }) => {
    await registerAndLogin(page);
    await expect(page.getByText('거래 내역이 없습니다.')).toBeVisible();
  });
});
