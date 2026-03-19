const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🧪 새 여행 만들기 기능 테스트\n');

  // Listen for dialogs
  page.on('dialog', async dialog => {
    console.log(`🔔 Alert: "${dialog.message()}"`);
    await dialog.accept();
  });

  await page.goto('http://localhost:3000/trips');
  await page.waitForTimeout(2000);

  console.log('📍 1. "새 여행 만들기" 버튼 클릭...');
  await page.click('text=새 여행 만들기');
  await page.waitForTimeout(1000);

  console.log('   ✅ 모달 열림 확인');

  // 모달이 열렸는지 확인
  const modalVisible = await page.locator('text=새 여행 만들기').nth(1).isVisible();
  console.log(`   ${modalVisible ? '✅' : '❌'} 모달 제목 표시됨`);

  console.log('\n📍 2. 폼 입력...');

  // 폼 필드 입력
  await page.fill('#name', '파리 여행');
  console.log('   ✅ 여행명 입력');

  await page.fill('#destination', '파리');
  console.log('   ✅ 목적지 입력');

  await page.fill('#country', '프랑스');
  console.log('   ✅ 국가 입력');

  await page.fill('#travelers', '2');
  console.log('   ✅ 여행자 수 입력');

  await page.fill('#startDate', '2026-03-01');
  console.log('   ✅ 시작일 입력');

  await page.fill('#endDate', '2026-03-07');
  console.log('   ✅ 종료일 입력');

  await page.fill('#budget', '3000000');
  console.log('   ✅ 예산 입력');

  console.log('\n📍 3. 폼 제출...');
  await page.click('button[type="submit"]:has-text("여행 만들기")');
  await page.waitForTimeout(2000);

  console.log('   ✅ 제출 완료');

  console.log('\n📍 4. 새 여행 목록에 표시 확인...');
  await page.waitForTimeout(1000);

  const newTripVisible = await page.locator('text=파리 여행').isVisible();
  console.log(`   ${newTripVisible ? '✅' : '❌'} "파리 여행" 카드 표시됨`);

  const franceVisible = await page.locator('text=/파리.*프랑스/').isVisible();
  console.log(`   ${franceVisible ? '✅' : '❌'} 목적지 "파리, 프랑스" 표시됨`);

  console.log('\n📸 스크린샷 저장...');
  await page.screenshot({ path: 'screenshots/create-trip-result.png', fullPage: true });

  console.log('\n⏳ 5초 후 종료...');
  await page.waitForTimeout(5000);

  await browser.close();
  console.log('\n✅ 새 여행 만들기 테스트 완료!');
})();
