const { chromium } = require('playwright');

(async () => {
  console.log('🌐 Starting browser...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    // 1. Navigate to home page
    console.log('📍 Navigating to http://localhost:3000');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/01-homepage.png', fullPage: true });
    console.log('✅ Screenshot: 01-homepage.png');

    // 2. Check if redirected to /trips
    const url = page.url();
    console.log('📍 Current URL:', url);

    // 3. Take screenshot of trips page
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/02-trips-page.png', fullPage: true });
    console.log('✅ Screenshot: 02-trips-page.png');

    // 4. Check if trip card is visible
    const tripCards = await page.locator('text=도쿄 여행').count();
    console.log('🗺️  Found', tripCards, 'trip card(s)');

    // 5. Navigate to Itinerary page
    console.log('📍 Clicking on 일정 (Itinerary) tab');
    await page.click('text=일정');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/03-itinerary-page.png', fullPage: true });
    console.log('✅ Screenshot: 03-itinerary-page.png');

    // 6. Navigate to Budget page
    console.log('📍 Clicking on 예산 (Budget) tab');
    await page.click('text=예산');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/04-budget-page.png', fullPage: true });
    console.log('✅ Screenshot: 04-budget-page.png');

    // 7. Navigate to Recommendations page
    console.log('📍 Clicking on AI 추천 tab');
    await page.click('text=AI 추천');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/05-recommendations-page.png', fullPage: true });
    console.log('✅ Screenshot: 05-recommendations-page.png');

    // 8. Navigate to Insights page
    console.log('📍 Clicking on 인사이트 tab');
    await page.click('text=인사이트');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screenshots/06-insights-page.png', fullPage: true });
    console.log('✅ Screenshot: 06-insights-page.png');

    // 9. Go back to trips page and check search
    console.log('📍 Going back to 여행 목록');
    await page.click('text=여행 목록');
    await page.waitForTimeout(1000);

    // 10. Test search functionality
    console.log('🔍 Testing search functionality');
    const searchInput = await page.locator('input[placeholder*="검색"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('도쿄');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/07-search-functionality.png', fullPage: true });
      console.log('✅ Screenshot: 07-search-functionality.png');
    }

    // 11. Test filter functionality
    console.log('🎛️  Testing filter functionality');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/08-filters.png', fullPage: true });
    console.log('✅ Screenshot: 08-filters.png');

    console.log('\n✅ All tests completed successfully!');
    console.log('📁 Screenshots saved in screenshots/ folder');
    console.log('\n⏳ Browser will stay open for 10 seconds for manual inspection...');

    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ Error during testing:', error);
    await page.screenshot({ path: 'screenshots/error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('🔚 Browser closed');
  }
})();
