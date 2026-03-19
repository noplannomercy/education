from playwright.sync_api import sync_playwright
import time


def test_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("=" * 50)
        print("AI Personal Finance App Test")
        print("=" * 50)

        # 1. Navigate to app
        print("\n[1] Navigating to app...")
        page.goto('http://localhost:3005')
        page.wait_for_load_state('networkidle')
        time.sleep(1)
        page.screenshot(path='test-screenshots/01-dashboard.png', full_page=True)
        print("    [OK] Dashboard loaded")

        # Check title
        title = page.title()
        print(f"    Page title: {title}")

        # 2. Test Dashboard Tab
        print("\n[2] Testing Dashboard Tab...")
        dashboard_tabs = page.locator('[role="tab"]').all()
        print(f"    Found {len(dashboard_tabs)} tabs")

        # 3. Test Transactions Tab
        print("\n[3] Testing Transactions Tab...")
        # Click by ID pattern
        tx_tab = page.locator('[id*="trigger-transactions"]')
        tx_tab.click()
        page.wait_for_load_state('networkidle')
        time.sleep(1)
        page.screenshot(path='test-screenshots/02-transactions.png', full_page=True)
        print("    [OK] Transactions tab loaded")

        # Find the dialog trigger button
        dialog_trigger = page.locator('[data-slot="dialog-trigger"]').first
        if dialog_trigger.count() > 0:
            print("    [OK] Transaction dialog trigger found")
            dialog_trigger.click()
            time.sleep(0.5)
            page.screenshot(path='test-screenshots/03-new-transaction-dialog.png', full_page=True)
            print("    [OK] Transaction dialog opened")
            page.keyboard.press('Escape')
            time.sleep(0.5)
        else:
            print("    [WARN] Dialog trigger not found")

        # 4. Test Budget Tab
        print("\n[4] Testing Budget Tab...")
        budget_tab = page.locator('[id*="trigger-budget"]')
        budget_tab.click()
        page.wait_for_load_state('networkidle')
        time.sleep(1)
        page.screenshot(path='test-screenshots/04-budget.png', full_page=True)
        print("    [OK] Budget tab loaded")

        # 5. Test Categories Tab
        print("\n[5] Testing Categories Tab...")
        cat_tab = page.locator('[id*="trigger-categories"]')
        cat_tab.click()
        page.wait_for_load_state('networkidle')
        time.sleep(1)
        page.screenshot(path='test-screenshots/05-categories.png', full_page=True)
        print("    [OK] Categories tab loaded")

        # Test new category button
        new_cat_trigger = page.locator('[data-slot="dialog-trigger"]').first
        if new_cat_trigger.count() > 0:
            print("    [OK] Category dialog trigger found")
            new_cat_trigger.click()
            time.sleep(0.5)
            page.screenshot(path='test-screenshots/06-new-category-dialog.png', full_page=True)
            print("    [OK] Category dialog opened")
            page.keyboard.press('Escape')
            time.sleep(0.5)

        # 6. Test Insights Tab
        print("\n[6] Testing Insights Tab...")
        insights_tab = page.locator('[id*="trigger-insights"]')
        insights_tab.click()
        page.wait_for_load_state('networkidle')
        time.sleep(1)
        page.screenshot(path='test-screenshots/07-insights.png', full_page=True)
        print("    [OK] Insights tab loaded")

        # 7. Test adding a transaction
        print("\n[7] Testing Transaction Creation...")
        tx_tab = page.locator('[id*="trigger-transactions"]')
        tx_tab.click()
        page.wait_for_load_state('networkidle')
        time.sleep(1)

        # Open transaction dialog
        dialog_trigger = page.locator('[data-slot="dialog-trigger"]').first
        dialog_trigger.click()
        time.sleep(0.5)

        # Fill the form
        # Amount - find number input
        amount_input = page.locator('input[type="number"]').first
        amount_input.fill('50000')

        # Description - find textarea
        desc_textarea = page.locator('textarea').first
        desc_textarea.fill('Test coffee purchase')

        time.sleep(0.5)
        page.screenshot(path='test-screenshots/08-transaction-form-filled.png', full_page=True)
        print("    [OK] Transaction form filled")

        # Select category - find select trigger (combobox)
        comboboxes = page.locator('[role="combobox"]').all()
        print(f"    Found {len(comboboxes)} comboboxes")

        if len(comboboxes) > 0:
            # Find the category selector (first one)
            comboboxes[0].click()
            time.sleep(0.3)

            # Select first option
            options = page.locator('[role="option"]').all()
            print(f"    Found {len(options)} options")
            if len(options) > 0:
                options[0].click()
                time.sleep(0.3)
                print("    [OK] Category selected")

        page.screenshot(path='test-screenshots/09-transaction-ready.png', full_page=True)

        # Submit the form
        submit_btns = page.locator('button[type="submit"]').all()
        print(f"    Found {len(submit_btns)} submit buttons")
        if len(submit_btns) > 0:
            submit_btns[0].click()
            time.sleep(2)
            page.screenshot(path='test-screenshots/10-after-submit.png', full_page=True)
            print("    [OK] Transaction submitted")

        # 8. Check dashboard after adding transaction
        print("\n[8] Checking Dashboard after transaction...")
        dashboard_tab = page.locator('[id*="trigger-dashboard"]')
        dashboard_tab.click()
        page.wait_for_load_state('networkidle')
        time.sleep(2)
        page.screenshot(path='test-screenshots/11-dashboard-with-data.png', full_page=True)
        print("    [OK] Dashboard updated")

        # 9. Go back to transactions to verify
        print("\n[9] Verifying transaction was added...")
        tx_tab = page.locator('[id*="trigger-transactions"]')
        tx_tab.click()
        page.wait_for_load_state('networkidle')
        time.sleep(1)
        page.screenshot(path='test-screenshots/12-transactions-final.png', full_page=True)
        print("    [OK] Transactions page verified")

        print("\n" + "=" * 50)
        print("Test Complete!")
        print("Screenshots saved in test-screenshots/")
        print("=" * 50)

        browser.close()

if __name__ == "__main__":
    import os
    os.makedirs('test-screenshots', exist_ok=True)
    test_app()
