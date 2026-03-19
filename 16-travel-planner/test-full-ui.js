const { chromium } = require('playwright');

(async () => {
  console.log('🔍 전체 UI 검사 시작...\n');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // 콘솔 에러 수집
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.error('❌ Console Error:', msg.text());
    }
  });

  // 네트워크 에러 수집
  const networkErrors = [];
  page.on('requestfailed', request => {
    networkErrors.push(`${request.url()}: ${request.failure().errorText}`);
    console.error('❌ Network Error:', request.url(), request.failure().errorText);
  });

  try {
    console.log('1️⃣ 페이지 로드 테스트...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 현재 URL 확인
    console.log('✅ Current URL:', page.url());

    // HTML 소스에서 한글 확인
    const htmlContent = await page.content();
    const hasKorean = /[가-힣]/.test(htmlContent);
    console.log(hasKorean ? '✅ HTML에 한글 포함됨' : '❌ HTML에 한글 없음 - 인코딩 문제!');

    // 페이지 텍스트 샘플 출력
    const pageText = await page.locator('body').textContent();
    console.log('📄 페이지 텍스트 샘플:', pageText.substring(0, 200));

    console.log('\n2️⃣ 버튼 테스트...');

    // "새 여행 만들기" 버튼 찾기
    const createTripButton = page.locator('button:has-text("새 여행 만들기"), button:has-text("여행")').first();
    const isVisible = await createTripButton.isVisible().catch(() => false);
    console.log(isVisible ? '✅ 버튼 발견됨' : '❌ 버튼을 찾을 수 없음');

    if (isVisible) {
      console.log('🖱️ 버튼 클릭 시도...');
      await createTripButton.click({ timeout: 5000 }).catch(err => {
        console.error('❌ 버튼 클릭 실패:', err.message);
      });
      await page.waitForTimeout(1000);
    }

    console.log('\n3️⃣ 네비게이션 탭 테스트...');

    // 모든 링크/버튼 찾기
    const allButtons = await page.locator('button, a').all();
    console.log(`📊 총 ${allButtons.length}개의 클릭 가능한 요소 발견`);

    // 각 탭 클릭 시도
    const tabs = ['일정', '예산', '추천', '인사이트'];
    for (const tab of tabs) {
      try {
        const tabElement = page.locator(`button:has-text("${tab}"), a:has-text("${tab}")`).first();
        const visible = await tabElement.isVisible({ timeout: 2000 }).catch(() => false);

        if (visible) {
          console.log(`✅ "${tab}" 탭 발견`);
          await tabElement.click({ timeout: 3000 });
          await page.waitForTimeout(1000);
          console.log(`✅ "${tab}" 탭 클릭 성공`);
        } else {
          console.log(`❌ "${tab}" 탭을 찾을 수 없음`);
        }
      } catch (err) {
        console.error(`❌ "${tab}" 탭 클릭 실패:`, err.message);
      }
    }

    console.log('\n4️⃣ API 응답 확인...');
    const apiResponse = await page.evaluate(async () => {
      const res = await fetch('/api/trips');
      const data = await res.json();
      return data;
    });
    console.log('📡 API 응답:', JSON.stringify(apiResponse, null, 2).substring(0, 500));

    console.log('\n5️⃣ 데이터베이스 한글 확인...');
    if (apiResponse.data && apiResponse.data.length > 0) {
      const trip = apiResponse.data[0];
      console.log('여행명:', trip.name);
      console.log('목적지:', trip.destination);
      console.log('국가:', trip.country);

      const hasValidKorean = /[가-힣]/.test(trip.name + trip.destination + trip.country);
      console.log(hasValidKorean ? '✅ DB에서 한글 정상' : '❌ DB에서 한글 깨짐!');
    }

    // 스크린샷
    await page.screenshot({ path: 'screenshots/debug-full.png', fullPage: true });
    console.log('📸 스크린샷 저장: screenshots/debug-full.png');

    console.log('\n📊 에러 요약:');
    console.log('Console Errors:', consoleErrors.length);
    console.log('Network Errors:', networkErrors.length);

    if (consoleErrors.length > 0) {
      console.log('\n❌ 콘솔 에러들:');
      consoleErrors.forEach(err => console.log('  -', err));
    }

    if (networkErrors.length > 0) {
      console.log('\n❌ 네트워크 에러들:');
      networkErrors.forEach(err => console.log('  -', err));
    }

    console.log('\n⏳ 10초간 수동 검사를 위해 브라우저를 열어둡니다...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ 테스트 중 에러 발생:', error);
    await page.screenshot({ path: 'screenshots/error-debug.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('🔚 테스트 완료');
  }
})();
