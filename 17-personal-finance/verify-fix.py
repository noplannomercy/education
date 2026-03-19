from playwright.sync_api import sync_playwright
import time


def verify_fix():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Capture console messages
        console_messages = []
        page.on("console", lambda msg: console_messages.append(f"{msg.type}: {msg.text}"))
        
        print("Navigating to app...")
        page.goto('http://localhost:3005')
        page.wait_for_load_state('networkidle')
        time.sleep(3)
        
        # Check for errors
        errors = [msg for msg in console_messages if 'error' in msg.lower()]
        print(f"\nConsole errors: {len(errors)}")
        for err in errors[:5]:
            print(f"  {err[:100]}")
        
        # Take screenshot
        page.screenshot(path='test-screenshots/verify-chart-fix.png', full_page=True)
        print("\nScreenshot saved: test-screenshots/verify-chart-fix.png")
        
        browser.close()

if __name__ == "__main__":
    verify_fix()
