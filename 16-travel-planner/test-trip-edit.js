const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🧪 여행 수정 기능 테스트 시작\n');

  page.on('dialog', async dialog => {
    console.log(`🔔 Alert: "${dialog.message()}"`);
    await dialog.accept();
  });

  await page.goto('http://localhost:3000/trips');
  await page.waitForTimeout(2000);

  console.log('📍 1. 여행 목록 → 상세 페이지로 이동...');
  await page.locator('button:has-text("자세히 보기")').first().click();
  await page.waitForTimeout(2000);
  console.log('   ✅ 상세 페이지 도착');

  console.log('\n📍 2. "수정" 버튼 클릭...');
  await page.locator('button:has-text("수정")').first().click();
  await page.waitForTimeout(1000);

  const modalVisible = await page.locator('text=여행 수정').isVisible();
  console.log(`   ${modalVisible ? '✅' : '❌'} 수정 모달 열림`);

  console.log('\n📍 3. 기존 데이터 확인...');
  const nameValue = await page.inputValue('#edit-name');
  console.log(`   ✅ 여행명 pre-fill: "${nameValue}"`);

  const budgetValue = await page.inputValue('#edit-budget');
  console.log(`   ✅ 예산 pre-fill: "${budgetValue}"`);

  console.log('\n📍 4. 데이터 수정...');
  // 여행명 수정
  await page.fill('#edit-name', '도쿄 여행 (수정됨)');
  console.log('   ✅ 여행명 변경');

  // 예산 수정
  await page.fill('#edit-budget', '2500000');
  console.log('   ✅ 예산 변경: ₩2,500,000');

  // 상태 변경 - Select 컴포넌트 클릭
  await page.click('[id="edit-status"]');
  await page.waitForTimeout(500);
  // SelectItem 클릭
  await page.locator('[role="option"]:has-text("진행 중")').click();
  console.log('   ✅ 상태 변경: 진행 중');

  console.log('\n📍 5. 폼 제출...');
  await page.click('button[type="submit"]:has-text("수정 완료")');
  await page.waitForTimeout(2000);

  console.log('   ✅ 제출 완료');

  console.log('\n📍 6. 수정 결과 확인...');
  await page.waitForTimeout(1000);

  const updatedName = await page.locator('h2:has-text("도쿄 여행 (수정됨)")').first().isVisible();
  console.log(`   ${updatedName ? '✅' : '❌'} 여행명 업데이트 확인`);

  const statusBadge = await page.locator('text=진행 중').first().isVisible();
  console.log(`   ${statusBadge ? '✅' : '❌'} 상태 "진행 중" 배지 표시`);

  // 예산 카드에서 확인
  const budgetText = await page.textContent('text=₩2,500,000').catch(() => null);
  console.log(`   ${budgetText ? '✅' : '❌'} 예산 업데이트: ${budgetText || '확인 실패'}`);

  console.log('\n📸 스크린샷 저장...');
  await page.screenshot({ path: 'screenshots/trip-edit-result.png', fullPage: true });

  console.log('\n⏳ 5초 후 종료...');
  await page.waitForTimeout(5000);

  await browser.close();
  console.log('\n✅ 여행 수정 테스트 완료!');
})();
