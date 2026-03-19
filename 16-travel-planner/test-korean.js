const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🔍 한글 표시 테스트...\n');

  await page.goto('http://localhost:3000/trips');
  await page.waitForTimeout(2000);

  // 페이지 텍스트 추출
  const tripName = await page.locator('text=/도쿄|여행/').first().textContent().catch(() => null);
  const destination = await page.locator('text=/도쿄|일본/').first().textContent().catch(() => null);

  console.log('✅ 여행명 표시:', tripName);
  console.log('✅ 목적지 표시:', destination);

  await page.screenshot({ path: 'screenshots/korean-test.png', fullPage: true });
  console.log('📸 스크린샷 저장됨\n');

  // 일정 페이지 확인
  await page.click('text=일정');
  await page.waitForTimeout(1500);

  const activity = await page.locator('text=/타워|방문/').first().textContent().catch(() => null);
  console.log('✅ 일정 표시:', activity);

  await page.screenshot({ path: 'screenshots/itinerary-korean.png', fullPage: true });

  // 예산 페이지 확인
  await page.click('text=예산');
  await page.waitForTimeout(1500);

  const expense = await page.locator('text=/리무진|버스/').first().textContent().catch(() => null);
  console.log('✅ 지출 표시:', expense);

  await page.screenshot({ path: 'screenshots/budget-korean.png', fullPage: true });

  console.log('\n⏳ 확인을 위해 5초간 브라우저 유지...');
  await page.waitForTimeout(5000);

  await browser.close();
  console.log('✅ 테스트 완료!');
})();
