from playwright.sync_api import sync_playwright
import time


def inspect_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to app...")
        page.goto('http://localhost:3005')
        page.wait_for_load_state('networkidle')
        time.sleep(2)

        # Take screenshot
        page.screenshot(path='test-screenshots/inspect-01.png', full_page=True)
        print("Screenshot saved: test-screenshots/inspect-01.png")

        # Get page content
        html = page.content()

        # Find all buttons
        buttons = page.locator('button').all()
        print(f"\nFound {len(buttons)} buttons:")
        for i, btn in enumerate(buttons[:10]):  # First 10
            try:
                text = btn.inner_text()
                print(f"  {i}: {text[:50]}...")
            except:
                pass

        # Find all tabs
        tabs = page.locator('[role="tab"]').all()
        print(f"\nFound {len(tabs)} tabs:")
        for i, tab in enumerate(tabs):
            try:
                text = tab.inner_text()
                value = tab.get_attribute('data-state')
                print(f"  {i}: {text} (state: {value})")
            except:
                pass

        # Print some of the HTML to understand structure
        print("\n--- HTML snippet (TabsList area) ---")
        tablist = page.locator('[role="tablist"]').first
        if tablist.count() > 0:
            print(tablist.inner_html()[:2000])

        browser.close()

if __name__ == "__main__":
    import os
    os.makedirs('test-screenshots', exist_ok=True)
    inspect_app()
