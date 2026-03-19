from playwright.sync_api import sync_playwright
import time


def test_ai():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Capture console messages
        console_messages = []
        page.on("console", lambda msg: console_messages.append(f"{msg.type}: {msg.text}"))
        
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
        
        page.screenshot(path='test-screenshots/ai-insights-1.png', full_page=True)
        print("Screenshot 1 saved")
        
        # Click analyze button if exists
        analyze_btns = page.locator('button:has-text("분석")').all()
        print(f"Found {len(analyze_btns)} analyze buttons")
        
        if len(analyze_btns) > 0:
            print("Clicking first analyze button...")
            analyze_btns[0].click()
            print("Waiting for AI analysis (10 seconds)...")
            time.sleep(10)
            page.screenshot(path='test-screenshots/ai-insights-2.png', full_page=True)
            print("Screenshot 2 saved")
        
        # Check console for errors
        errors = [msg for msg in console_messages if 'error' in msg.lower()]
        if errors:
            print(f"\nConsole errors: {len(errors)}")
            for err in errors[:5]:
                print(f"  {err[:200]}")
        else:
            print("\nNo console errors")
        
        browser.close()

if __name__ == "__main__":
    test_ai()
