const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🧪 일정 CRUD 기능 테스트 시작\n');

  // Handle alerts (but not confirms)
  page.on('dialog', async dialog => {
    if (dialog.type() === 'alert') {
      console.log(`🔔 Alert: "${dialog.message()}"`);
      await dialog.accept();
    }
  });

  await page.goto('http://localhost:3000/itinerary');
  await page.waitForTimeout(2000);

  // Test 1: 일정 추가
  console.log('📍 1. 일정 추가 다이얼로그 열기...');
  await page.locator('button:has-text("일정 추가")').first().click();
  await page.waitForTimeout(1000);

  const dialogVisible = await page.locator('text=일정 추가').first().isVisible();
  console.log(`   ${dialogVisible ? '✅' : '❌'} 다이얼로그 열림`);

  console.log('\n📍 2. 일정 데이터 입력...');

  // 날짜 입력
  await page.fill('#create-date', '2026-06-15');
  console.log('   ✅ 날짜: 2026-06-15');

  // 시작 시간
  await page.fill('#create-start-time', '09:00');
  console.log('   ✅ 시작 시간: 09:00');

  // 종료 시간
  await page.fill('#create-end-time', '12:00');
  console.log('   ✅ 종료 시간: 12:00');

  // 활동
  await page.fill('#create-activity', '에펠탑 관광');
  console.log('   ✅ 활동: 에펠탑 관광');

  // 메모
  await page.fill('#create-notes', '사진 촬영 필수');
  console.log('   ✅ 메모: 사진 촬영 필수');

  // 우선순위 선택
  await page.click('#create-priority');
  await page.waitForTimeout(500);
  await page.locator('[role="option"]:has-text("높음")').click();
  console.log('   ✅ 우선순위: 높음');

  console.log('\n📍 3. 일정 추가 제출...');
  await page.click('button[type="submit"]:has-text("추가")');
  await page.waitForTimeout(2000);
  console.log('   ✅ 제출 완료');

  // Test 2: 추가된 일정 확인
  console.log('\n📍 4. 추가된 일정 확인...');
  await page.waitForTimeout(1000);

  const activityVisible = await page.locator('text=에펠탑 관광').first().isVisible();
  console.log(`   ${activityVisible ? '✅' : '❌'} 일정 "에펠탑 관광" 표시됨`);

  const priorityBadge = await page.locator('text=높음').first().isVisible();
  console.log(`   ${priorityBadge ? '✅' : '❌'} 우선순위 "높음" 배지 표시됨`);

  const timeVisible = await page.locator('text=09:00').first().isVisible();
  console.log(`   ${timeVisible ? '✅' : '❌'} 시간 "09:00" 표시됨`);

  // Test 3: 일정 완료 토글
  console.log('\n📍 5. 일정 완료 토글...');
  const checkbox = await page.locator('[role="checkbox"]').first();
  await checkbox.click();
  await page.waitForTimeout(1500);
  console.log('   ✅ 완료 체크박스 클릭');

  const completedBadge = await page.locator('.bg-green-100.text-green-800:has-text("완료")').first().isVisible();
  console.log(`   ${completedBadge ? '✅' : '❌'} "완료" 배지 표시됨`);

  // Test 4: 일정 수정
  console.log('\n📍 6. 일정 수정...');
  await page.locator('button:has-text("수정")').first().click();
  await page.waitForTimeout(1000);

  const editDialogVisible = await page.locator('text=일정 수정').first().isVisible();
  console.log(`   ${editDialogVisible ? '✅' : '❌'} 수정 다이얼로그 열림`);

  // 기존 데이터 확인
  const activityValue = await page.inputValue('#edit-activity');
  console.log(`   ✅ 기존 활동 pre-fill: "${activityValue}"`);

  // 활동 수정
  await page.fill('#edit-activity', '에펠탑 관광 (수정됨)');
  console.log('   ✅ 활동 변경: 에펠탑 관광 (수정됨)');

  // 메모 수정
  await page.fill('#edit-notes', '저녁 시간에 방문');
  console.log('   ✅ 메모 변경: 저녁 시간에 방문');

  console.log('\n📍 7. 수정 제출...');
  await page.click('button[type="submit"]:has-text("수정 완료")');
  await page.waitForTimeout(2000);
  console.log('   ✅ 수정 완료');

  // 수정 결과 확인
  const updatedActivity = await page.locator('text=에펠탑 관광 (수정됨)').first().isVisible();
  console.log(`   ${updatedActivity ? '✅' : '❌'} 수정된 활동명 표시됨`);

  // Test 5: 일정 삭제
  console.log('\n📍 8. 일정 삭제...');

  // 삭제 버튼 클릭 전 confirm 처리
  page.once('dialog', async dialog => {
    console.log(`   🔔 Confirm: "${dialog.message()}"`);
    await dialog.accept();
  });

  await page.locator('button:has-text("삭제")').first().click();
  await page.waitForTimeout(2000);
  console.log('   ✅ 삭제 완료');

  // 삭제 후 확인 - 일정이 없어야 함
  const emptyState = await page.locator('text=아직 일정이 없습니다').isVisible();
  console.log(`   ${emptyState ? '✅' : '❌'} Empty state 표시됨 (일정 삭제 확인)`);

  console.log('\n📸 스크린샷 저장...');
  await page.screenshot({ path: 'screenshots/itinerary-crud-result.png', fullPage: true });

  console.log('\n⏳ 5초 후 종료...');
  await page.waitForTimeout(5000);

  await browser.close();
  console.log('\n✅ 일정 CRUD 테스트 완료!');
})();
