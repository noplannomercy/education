from playwright.sync_api import sync_playwright
import time


def test_ai():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        print("Navigating to app...")
        page.goto('http://localhost:3006')
        page.wait_for_load_state('networkidle')
        time.sleep(2)
        
        # Go to AI Insights tab
        print("Going to AI Insights tab...")
        insights_tab = page.locator('[id*="trigger-insights"]')
        insights_tab.click()
        page.wait_for_load_state('networkidle')
        time.sleep(2)
        
        # Click analyze button
        analyze_btn = page.locator('button:has-text("분석 실행")').first
        if analyze_btn.count() > 0:
            print("Clicking AI analyze button...")
            analyze_btn.click()
            
            # Wait for loading to complete (up to 30 seconds)
            print("Waiting for AI analysis to complete...")
            for i in range(15):
                time.sleep(2)
                # Check if still loading
                loading = page.locator('button:has-text("분석 중")').count()
                if loading == 0:
                    print(f"Analysis completed after {(i+1)*2} seconds")
                    break
                print(f"  Still loading... ({(i+1)*2}s)")
            
            time.sleep(2)
            page.screenshot(path='test-screenshots/ai-result.png', full_page=True)
            print("Result screenshot saved")
        else:
            print("Analyze button not found")
        
        browser.close()

if __name__ == "__main__":
    test_ai()
