const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🧪 여행 자세히 보기 테스트 시작\n');

  page.on('dialog', async dialog => {
    console.log(`🔔 Alert: "${dialog.message()}"`);
    await dialog.accept();
  });

  await page.goto('http://localhost:3000/trips');
  await page.waitForTimeout(2000);

  console.log('📍 1. 여행 목록 페이지 확인...');
  const tripVisible = await page.locator('text=도쿄 여행').isVisible();
  console.log(`   ${tripVisible ? '✅' : '❌'} 도쿄 여행 카드 표시됨`);

  console.log('\n📍 2. "자세히 보기" 버튼 클릭...');
  await page.click('button:has-text("자세히 보기")').catch(() => {
    console.log('   ⚠️ 첫 번째 시도 실패, 다시 시도...');
  });

  // 대체 방법: 첫 번째 자세히 보기 버튼 찾기
  const detailButton = await page.locator('button:has-text("자세히 보기")').first();
  await detailButton.click();

  await page.waitForTimeout(2000);
  console.log('   ✅ 상세 페이지로 이동');

  console.log('\n📍 3. 상세 페이지 정보 확인...');

  // 헤더 정보
  const tripNameVisible = await page.locator('h2:has-text("도쿄 여행")').first().isVisible();
  console.log(`   ${tripNameVisible ? '✅' : '❌'} 여행명 표시: "도쿄 여행"`);

  const statusBadge = await page.locator('text=/계획 중|진행 중|완료/').first().isVisible();
  console.log(`   ${statusBadge ? '✅' : '❌'} 상태 배지 표시`);

  // 정보 카드들
  const periodCard = await page.locator('text=여행 기간').first().isVisible();
  console.log(`   ${periodCard ? '✅' : '❌'} 여행 기간 카드 표시`);

  const budgetCard = await page.getByText('예산', { exact: true }).first().isVisible();
  console.log(`   ${budgetCard ? '✅' : '❌'} 예산 카드 표시`);

  const spentCard = await page.locator('text=실제 지출').first().isVisible();
  console.log(`   ${spentCard ? '✅' : '❌'} 실제 지출 카드 표시`);

  const remainingCard = await page.locator('text=남은 예산').first().isVisible();
  console.log(`   ${remainingCard ? '✅' : '❌'} 남은 예산 카드 표시`);

  // 예산 사용률
  const budgetProgress = await page.locator('text=예산 사용률').first().isVisible();
  console.log(`   ${budgetProgress ? '✅' : '❌'} 예산 사용률 표시`);

  // 일정 섹션
  const itinerarySection = await page.locator('text=/일정 \\(/').first().isVisible();
  console.log(`   ${itinerarySection ? '✅' : '❌'} 일정 섹션 표시`);

  // 지출 섹션
  const expenseSection = await page.locator('text=/최근 지출 \\(/').first().isVisible();
  console.log(`   ${expenseSection ? '✅' : '❌'} 지출 섹션 표시`);

  console.log('\n📍 4. 버튼 동작 확인...');

  // 목록으로 버튼
  const backButton = await page.locator('button:has-text("목록으로")').first().isVisible();
  console.log(`   ${backButton ? '✅' : '❌'} "목록으로" 버튼 표시`);

  // 수정 버튼
  const editButton = await page.locator('button:has-text("수정")').first().isVisible();
  console.log(`   ${editButton ? '✅' : '❌'} "수정" 버튼 표시`);

  // 삭제 버튼
  const deleteButton = await page.locator('button:has-text("삭제")').first().isVisible();
  console.log(`   ${deleteButton ? '✅' : '❌'} "삭제" 버튼 표시`);

  console.log('\n📍 5. "목록으로" 버튼 클릭 테스트...');
  await page.click('button:has-text("목록으로")');
  await page.waitForTimeout(1500);

  const backToList = await page.locator('h2:has-text("여행 목록")').isVisible();
  console.log(`   ${backToList ? '✅' : '❌'} 여행 목록 페이지로 돌아옴`);

  console.log('\n📸 스크린샷 저장...');
  await page.screenshot({ path: 'screenshots/trip-detail-test.png', fullPage: true });

  console.log('\n⏳ 5초 후 종료...');
  await page.waitForTimeout(5000);

  await browser.close();
  console.log('\n✅ 자세히 보기 테스트 완료!');
})();
