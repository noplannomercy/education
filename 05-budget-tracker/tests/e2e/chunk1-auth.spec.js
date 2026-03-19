// covers: src/lib/auth.ts, src/proxy.ts, src/app/api/auth/, src/app/(auth)/
const { test, expect } = require('@playwright/test');

const BASE = 'http://localhost:3012';
const USER = {
  name: 'E2E유저',
  email: `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.com`,
  password: 'password123',
};

async function register(page, { name, email, password = 'password123' }) {
  await page.goto(`${BASE}/register`);
  await page.getByPlaceholder('이름').fill(name);
  await page.getByPlaceholder('이메일').fill(email);
  await page.getByPlaceholder('비밀번호 (6자 이상)').fill(password);
  await page.getByRole('button', { name: '회원가입' }).click();
  await expect(page).toHaveURL(`${BASE}/dashboard`, { timeout: 10000 });
}

test.describe('AUTH', () => {
  test('비로그인 상태에서 / 접근 시 /login 리다이렉트', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('회원가입 성공 → 대시보드 리다이렉트', async ({ page }) => {
    await register(page, { name: USER.name, email: USER.email, password: USER.password });
    // dashboard page shows year/month heading and summary cards
    await expect(page.getByText('총 수입')).toBeVisible();
  });

  test('회원가입 후 기본 카테고리 4개 자동 생성 (CAT-05)', async ({ page }) => {
    const email = `cat05-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.com`;
    await register(page, { name: '카테고리테스트', email });
    await page.goto(`${BASE}/categories`);
    await expect(page.getByText('급여')).toBeVisible();
    await expect(page.getByText('식비')).toBeVisible();
    await expect(page.getByText('교통')).toBeVisible();
    await expect(page.getByText('주거')).toBeVisible();
  });

  test('회원가입 후 /categories 에서 기본 카테고리 확인 (CAT-06)', async ({ page }) => {
    const email = `cat06-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.com`;
    await register(page, { name: 'CAT06테스트', email });
    await page.goto(`${BASE}/categories`);
    await expect(page).toHaveURL(`${BASE}/categories`);
    await expect(page.getByText('급여')).toBeVisible();
    await expect(page.getByText('식비')).toBeVisible();
    await expect(page.getByText('교통')).toBeVisible();
    await expect(page.getByText('주거')).toBeVisible();
  });

  test('로그인 성공 → 대시보드', async ({ page }) => {
    const email = `login-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.com`;
    await register(page, { name: '로그인테스트', email });

    // 로그아웃
    await page.getByRole('button', { name: '로그아웃' }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });

    // 로그인
    await page.getByPlaceholder('이메일').fill(email);
    await page.getByPlaceholder('비밀번호').fill('password123');
    await page.getByRole('button', { name: '로그인' }).click();
    await expect(page).toHaveURL(`${BASE}/dashboard`, { timeout: 10000 });
    await expect(page.getByText('총 수입')).toBeVisible();
  });

  test('로그아웃 → /login 리다이렉트', async ({ page }) => {
    const email = `logout-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.com`;
    await register(page, { name: '로그아웃테스트', email });
    await page.getByRole('button', { name: '로그아웃' }).click();
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });
});
