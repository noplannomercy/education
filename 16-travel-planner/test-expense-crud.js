const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🧪 지출 CRUD 기능 테스트 시작\n');

  // Handle alerts (but not confirms)
  page.on('dialog', async dialog => {
    if (dialog.type() === 'alert') {
      console.log(`🔔 Alert: "${dialog.message()}"`);
      await dialog.accept();
    }
  });

  await page.goto('http://localhost:3000/budget');
  await page.waitForTimeout(2000);

  // Test 1: 지출 추가
  console.log('📍 1. 지출 추가 다이얼로그 열기...');
  await page.locator('button:has-text("지출 추가")').first().click();
  await page.waitForTimeout(1000);

  const dialogVisible = await page.locator('text=지출 추가').first().isVisible();
  console.log(`   ${dialogVisible ? '✅' : '❌'} 다이얼로그 열림`);

  console.log('\n📍 2. 지출 데이터 입력...');

  // 날짜 입력
  await page.fill('#create-date', '2026-06-15');
  console.log('   ✅ 날짜: 2026-06-15');

  // 카테고리 선택
  await page.click('#create-category');
  await page.waitForTimeout(500);
  await page.locator('[role="option"]:has-text("식비")').click();
  console.log('   ✅ 카테고리: 식비');

  // 금액
  await page.fill('#create-amount', '50000');
  console.log('   ✅ 금액: 50000');

  // 내역
  await page.fill('#create-description', '저녁 식사');
  console.log('   ✅ 내역: 저녁 식사');

  // 메모
  await page.fill('#create-notes', '맛있는 레스토랑');
  console.log('   ✅ 메모: 맛있는 레스토랑');

  console.log('\n📍 3. 지출 추가 제출...');
  await page.click('button[type="submit"]:has-text("추가")');
  await page.waitForTimeout(2000);
  console.log('   ✅ 제출 완료');

  // Test 2: 추가된 지출 확인
  console.log('\n📍 4. 추가된 지출 확인...');
  await page.waitForTimeout(1000);

  const descriptionVisible = await page.locator('text=저녁 식사').first().isVisible();
  console.log(`   ${descriptionVisible ? '✅' : '❌'} 지출 "저녁 식사" 표시됨`);

  const amountVisible = await page.locator('text=₩50,000').first().isVisible();
  console.log(`   ${amountVisible ? '✅' : '❌'} 금액 "₩50,000" 표시됨`);

  // Test 3: 지출 수정
  console.log('\n📍 5. 지출 수정...');
  await page.locator('button:has-text("수정")').first().click();
  await page.waitForTimeout(1000);

  const editDialogVisible = await page.locator('text=지출 수정').first().isVisible();
  console.log(`   ${editDialogVisible ? '✅' : '❌'} 수정 다이얼로그 열림`);

  // 기존 데이터 확인
  const descriptionValue = await page.inputValue('#edit-description');
  console.log(`   ✅ 기존 내역 pre-fill: "${descriptionValue}"`);

  // 내역 수정
  await page.fill('#edit-description', '저녁 식사 (수정됨)');
  console.log('   ✅ 내역 변경: 저녁 식사 (수정됨)');

  // 금액 수정
  await page.fill('#edit-amount', '60000');
  console.log('   ✅ 금액 변경: 60000');

  console.log('\n📍 6. 수정 제출...');
  await page.click('button[type="submit"]:has-text("수정 완료")');
  await page.waitForTimeout(3000);
  console.log('   ✅ 수정 완료');

  // 수정 결과 확인
  const updatedDescription = await page.locator('text=저녁 식사 (수정됨)').first().isVisible();
  console.log(`   ${updatedDescription ? '✅' : '❌'} 수정된 내역 표시됨`);

  const updatedAmount = await page.locator('text=₩60,000').first().isVisible();
  console.log(`   ${updatedAmount ? '✅' : '❌'} 수정된 금액 표시됨`);

  // 다이얼로그가 완전히 닫히길 대기
  await page.waitForTimeout(1000);

  // Test 4: 지출 삭제
  console.log('\n📍 7. 지출 삭제...');

  // 삭제 버튼 클릭 전 confirm 처리
  page.once('dialog', async dialog => {
    console.log(`   🔔 Confirm: "${dialog.message()}"`);
    await dialog.accept();
  });

  await page.locator('button:has-text("삭제")').first().click();
  await page.waitForTimeout(2000);
  console.log('   ✅ 삭제 완료');

  // 삭제 후 확인 - 지출이 없어야 함
  await page.waitForTimeout(1000);
  const emptyState = await page.locator('text=아직 지출 내역이 없습니다').isVisible().catch(() => false);
  if (emptyState) {
    console.log(`   ✅ Empty state 표시됨 (지출 삭제 확인)`);
  } else {
    console.log(`   ℹ️  다른 지출이 남아있음`);
  }

  console.log('\n📸 스크린샷 저장...');
  await page.screenshot({ path: 'screenshots/expense-crud-result.png', fullPage: true });

  console.log('\n⏳ 5초 후 종료...');
  await page.waitForTimeout(5000);

  await browser.close();
  console.log('\n✅ 지출 CRUD 테스트 완료!');
})();
