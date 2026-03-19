const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🧪 여행 상세 → 일정/지출 페이지 이동 테스트 시작\n');

  page.on('dialog', async dialog => {
    if (dialog.type() === 'alert') {
      console.log(`🔔 Alert: "${dialog.message()}"`);
      await dialog.accept();
    }
  });

  // Test 1: 여행 상세 페이지로 이동
  console.log('📍 1. 여행 목록 페이지로 이동...');
  await page.goto('http://localhost:3000/trips');
  await page.waitForTimeout(2000);
  console.log('   ✅ 여행 목록 페이지 도착');

  console.log('\n📍 2. 첫 번째 여행 상세 페이지로 이동...');
  await page.locator('button:has-text("자세히 보기")').first().click();
  await page.waitForTimeout(2000);

  // 현재 URL에서 tripId 추출
  const currentUrl = page.url();
  const tripId = currentUrl.split('/trips/')[1];
  console.log(`   ✅ 여행 상세 페이지 도착 (tripId: ${tripId})`);

  // Test 2: 전체 일정 보기 버튼 클릭
  console.log('\n📍 3. "전체 일정 보기" 버튼 클릭...');
  await page.locator('button:has-text("전체 일정 보기")').first().click();
  await page.waitForTimeout(2000);

  // URL 확인
  const itineraryUrl = page.url();
  console.log(`   현재 URL: ${itineraryUrl}`);

  const hasItineraryTripId = itineraryUrl.includes(`tripId=${tripId}`);
  console.log(`   ${hasItineraryTripId ? '✅' : '❌'} URL에 tripId 포함됨`);

  // 페이지에서 해당 여행이 선택되었는지 확인
  await page.waitForTimeout(1000);
  const itineraryPageTitle = await page.locator('h2:has-text("여행 일정")').isVisible();
  console.log(`   ${itineraryPageTitle ? '✅' : '❌'} 일정 페이지 표시됨`);

  // Test 3: 다시 여행 상세로 돌아가기
  console.log('\n📍 4. 브라우저 뒤로가기...');
  await page.goBack();
  await page.waitForTimeout(2000);
  console.log('   ✅ 여행 상세 페이지로 돌아옴');

  // Test 4: 전체 지출 보기 버튼 클릭
  console.log('\n📍 5. "전체 지출 보기" 버튼 클릭...');
  await page.locator('button:has-text("전체 지출 보기")').first().click();
  await page.waitForTimeout(2000);

  // URL 확인
  const budgetUrl = page.url();
  console.log(`   현재 URL: ${budgetUrl}`);

  const hasBudgetTripId = budgetUrl.includes(`tripId=${tripId}`);
  console.log(`   ${hasBudgetTripId ? '✅' : '❌'} URL에 tripId 포함됨`);

  // 페이지에서 해당 여행이 선택되었는지 확인
  await page.waitForTimeout(1000);
  const budgetPageTitle = await page.locator('h2:has-text("예산 추적")').isVisible();
  console.log(`   ${budgetPageTitle ? '✅' : '❌'} 예산 페이지 표시됨`);

  // Test 5: Empty state 버튼 테스트 (일정이 없는 경우)
  console.log('\n📍 6. Empty state 버튼 테스트 (일정 추가하기)...');
  await page.goto(`http://localhost:3000/trips/${tripId}`);
  await page.waitForTimeout(2000);

  // 일정 섹션에서 "일정 추가하기" 버튼 찾기 (empty state인 경우)
  const emptyItineraryButton = await page.locator('text=일정 추가하기').isVisible().catch(() => false);
  if (emptyItineraryButton) {
    console.log('   📝 Empty state 감지: "일정 추가하기" 버튼 클릭...');
    await page.locator('button:has-text("일정 추가하기")').click();
    await page.waitForTimeout(2000);

    const emptyItineraryUrl = page.url();
    const hasEmptyItineraryTripId = emptyItineraryUrl.includes(`tripId=${tripId}`);
    console.log(`   ${hasEmptyItineraryTripId ? '✅' : '❌'} Empty state 버튼도 tripId 전달함`);

    await page.goBack();
    await page.waitForTimeout(1000);
  } else {
    console.log('   ℹ️  일정이 이미 존재함 (Empty state 테스트 스킵)');
  }

  // Test 6: Empty state 버튼 테스트 (지출이 없는 경우)
  console.log('\n📍 7. Empty state 버튼 테스트 (지출 추가하기)...');
  const emptyExpenseButton = await page.locator('text=지출 추가하기').isVisible().catch(() => false);
  if (emptyExpenseButton) {
    console.log('   📝 Empty state 감지: "지출 추가하기" 버튼 클릭...');
    await page.locator('button:has-text("지출 추가하기")').click();
    await page.waitForTimeout(2000);

    const emptyExpenseUrl = page.url();
    const hasEmptyExpenseTripId = emptyExpenseUrl.includes(`tripId=${tripId}`);
    console.log(`   ${hasEmptyExpenseTripId ? '✅' : '❌'} Empty state 버튼도 tripId 전달함`);
  } else {
    console.log('   ℹ️  지출이 이미 존재함 (Empty state 테스트 스킵)');
  }

  console.log('\n📸 스크린샷 저장...');
  await page.screenshot({ path: 'screenshots/trip-detail-navigation.png', fullPage: true });

  console.log('\n⏳ 5초 후 종료...');
  await page.waitForTimeout(5000);

  await browser.close();
  console.log('\n✅ 여행 상세 → 일정/지출 페이지 이동 테스트 완료!');
})();
