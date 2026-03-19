const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🧪 AI 일정 생성 기능 테스트 시작\n');

  // Handle alerts
  page.on('dialog', async dialog => {
    console.log(`🔔 ${dialog.type()}: "${dialog.message()}"`);
    await dialog.accept();
  });

  // Console logs
  page.on('console', msg => {
    if (msg.type() === 'log' && msg.text().includes('AI')) {
      console.log(`   📝 ${msg.text()}`);
    }
  });

  await page.goto('http://localhost:3000/itinerary');
  await page.waitForTimeout(2000);

  // Test 1: AI 일정 생성 버튼 클릭
  console.log('📍 1. "AI 일정 생성" 버튼 클릭...');
  await page.locator('button:has-text("AI 일정 생성")').first().click();
  await page.waitForTimeout(1000);

  const dialogVisible = await page.locator('text=AI 일정 자동 생성').first().isVisible();
  console.log(`   ${dialogVisible ? '✅' : '❌'} AI 생성 다이얼로그 열림`);

  // Test 2: 여행 정보 확인
  console.log('\n📍 2. 선택된 여행 정보 확인...');
  await page.waitForTimeout(500);

  const destinationVisible = await page.locator('text=목적지:').isVisible().catch(() => false);
  if (destinationVisible) {
    console.log('   ✅ 목적지 정보 표시됨');
  }

  const periodVisible = await page.locator('text=기간:').isVisible().catch(() => false);
  if (periodVisible) {
    console.log('   ✅ 기간 정보 표시됨');
  }

  const budgetVisible = await page.locator('text=예산:').isVisible().catch(() => false);
  if (budgetVisible) {
    console.log('   ✅ 예산 정보 표시됨');
  }

  // Test 3: AI 일정 생성 실행
  console.log('\n📍 3. AI 일정 생성 실행...');
  console.log('   ⏳ AI가 일정을 생성하는 중... (10-20초 소요 예상)');

  // AI 일정 생성 버튼 클릭
  await page.locator('button:has-text("AI 일정 생성")').nth(1).click();
  await page.waitForTimeout(2000);

  // 로딩 표시 확인
  const loadingVisible = await page.locator('text=AI 생성 중').isVisible().catch(() => false);
  if (loadingVisible) {
    console.log('   ✅ 로딩 상태 표시됨');
  }

  // AI 생성 완료 대기 (최대 30초)
  try {
    await page.waitForSelector('text=AI 생성 중', { state: 'hidden', timeout: 30000 });
    console.log('   ✅ AI 생성 완료');
  } catch (e) {
    console.log('   ⚠️  AI 생성이 아직 진행 중이거나 오류 발생');
  }

  // 추가로 대기
  await page.waitForTimeout(5000);

  // Test 4: 생성된 일정 확인
  console.log('\n📍 4. 생성된 일정 확인...');
  await page.waitForTimeout(2000);

  // 타임라인에 일정이 표시되는지 확인
  const timelineVisible = await page.locator('.space-y-8').isVisible().catch(() => false);
  if (timelineVisible) {
    console.log('   ✅ 타임라인 표시됨');
  }

  // 활동이 표시되는지 확인
  const hasActivities = await page.locator('[class*="CardTitle"]').count();
  console.log(`   ${hasActivities > 0 ? '✅' : '❌'} ${hasActivities}개의 일정 카드 표시됨`);

  console.log('\n📸 스크린샷 저장...');
  await page.screenshot({ path: 'screenshots/ai-itinerary-result.png', fullPage: true });

  console.log('\n⏳ 5초 후 종료...');
  await page.waitForTimeout(5000);

  await browser.close();
  console.log('\n✅ AI 일정 생성 테스트 완료!');
  console.log('\n💡 참고: AI 생성은 실제 API 키가 필요하며, 오류가 발생할 수 있습니다.');
})();
