const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🧪 전체 버튼 동작 테스트 시작...\n');

  // Listen for dialogs (alerts)
  page.on('dialog', async dialog => {
    console.log(`✅ Alert 확인: "${dialog.message()}"`);
    await dialog.accept();
  });

  await page.goto('http://localhost:3000/trips');
  await page.waitForTimeout(1500);

  console.log('📍 여행 목록 페이지 테스트...');

  // Test "새 여행 만들기" button in header
  try {
    await page.click('text=새 여행 만들기');
    await page.waitForTimeout(500);
    console.log('  ✅ 헤더 "새 여행 만들기" 버튼 동작');
  } catch (e) {
    console.log('  ❌ 헤더 "새 여행 만들기" 버튼 실패:', e.message);
  }

  // Test "자세히 보기" button (first trip card)
  try {
    await page.click('text=자세히 보기');
    await page.waitForTimeout(500);
    console.log('  ✅ "자세히 보기" 버튼 동작');
  } catch (e) {
    console.log('  ❌ "자세히 보기" 버튼 실패:', e.message);
  }

  console.log('\n📍 일정 페이지 테스트...');
  await page.click('text=일정');
  await page.waitForTimeout(1500);

  // Test "AI 일정 생성" button in header
  try {
    await page.click('button:has-text("✨ AI 일정 생성")').first();
    await page.waitForTimeout(500);
    console.log('  ✅ 헤더 "AI 일정 생성" 버튼 동작');
  } catch (e) {
    console.log('  ❌ 헤더 "AI 일정 생성" 버튼 실패:', e.message);
  }

  // Test "일정 추가" button in header
  try {
    await page.click('text=일정 추가');
    await page.waitForTimeout(500);
    console.log('  ✅ 헤더 "일정 추가" 버튼 동작');
  } catch (e) {
    console.log('  ❌ 헤더 "일정 추가" 버튼 실패:', e.message);
  }

  console.log('\n📍 예산 페이지 테스트...');
  await page.click('text=예산');
  await page.waitForTimeout(1500);

  // Test "AI 예산 최적화" button
  try {
    await page.click('text=AI 예산 최적화');
    await page.waitForTimeout(500);
    console.log('  ✅ "AI 예산 최적화" 버튼 동작');
  } catch (e) {
    console.log('  ❌ "AI 예산 최적화" 버튼 실패:', e.message);
  }

  // Test "지출 추가" button
  try {
    await page.click('text=지출 추가');
    await page.waitForTimeout(500);
    console.log('  ✅ "지출 추가" 버튼 동작');
  } catch (e) {
    console.log('  ❌ "지출 추가" 버튼 실패:', e.message);
  }

  console.log('\n📍 추천 페이지 테스트...');
  await page.click('text=추천');
  await page.waitForTimeout(1500);

  // Test "AI 추천 받기" button
  try {
    await page.click('text=AI 추천 받기');
    await page.waitForTimeout(500);
    console.log('  ✅ "AI 추천 받기" 버튼 동작');
  } catch (e) {
    console.log('  ❌ "AI 추천 받기" 버튼 실패:', e.message);
  }

  console.log('\n📍 인사이트 페이지 테스트...');
  await page.click('text=인사이트');
  await page.waitForTimeout(1500);

  // Test "AI 인사이트 분석" button
  try {
    await page.click('text=AI 인사이트 분석');
    await page.waitForTimeout(500);
    console.log('  ✅ "AI 인사이트 분석" 버튼 동작');
  } catch (e) {
    console.log('  ❌ "AI 인사이트 분석" 버튼 실패:', e.message);
  }

  console.log('\n📸 스크린샷 저장...');
  await page.screenshot({ path: 'screenshots/button-test-complete.png', fullPage: true });

  console.log('\n⏳ 5초 후 종료...');
  await page.waitForTimeout(5000);

  await browser.close();
  console.log('\n✅ 전체 버튼 테스트 완료!');
})();
