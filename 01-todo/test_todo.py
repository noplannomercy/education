from playwright.sync_api import sync_playwright
import time

FILE_URL = "file:///C:/workspace/prj20060203/1.1.test-todo/index.html"

results = []

def log(label, ok, detail=""):
    status = "PASS" if ok else "FAIL"
    msg = f"[{status}] {label}"
    if detail:
        msg += f" — {detail}"
    results.append((ok, msg))
    print(msg)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context()

    # ── 1. 기본 페이지 로드 ──────────────────────────────────────────
    page = ctx.new_page()
    page.goto(FILE_URL)
    page.wait_for_load_state("networkidle")

    title = page.locator("h1").inner_text()
    log("페이지 로드", "Todo" in title, f"h1={title!r}")

    # ── 2. Todo 추가 (Enter 키) ───────────────────────────────────────
    page.locator("#todo-input").fill("첫 번째 할 일")
    page.locator("#todo-input").press("Enter")
    page.wait_for_timeout(400)
    items = page.locator(".todo-item").all()
    log("Todo 추가 (Enter)", len(items) == 1, f"items={len(items)}")

    # 버튼 클릭으로 추가
    page.locator("#todo-input").fill("두 번째 할 일")
    page.locator("#add-btn").click()
    page.wait_for_timeout(400)
    items = page.locator(".todo-item").all()
    log("Todo 추가 (버튼)", len(items) == 2, f"items={len(items)}")

    # 세 번째 항목도 추가 (필터/카운트 테스트용)
    page.locator("#todo-input").fill("세 번째 할 일")
    page.locator("#todo-input").press("Enter")
    page.wait_for_timeout(400)

    # ── 3. 완료 체크 (취소선) ────────────────────────────────────────
    first_check = page.locator(".custom-check").first
    first_check.click()
    page.wait_for_timeout(500)
    first_item = page.locator(".todo-item").first
    has_done = first_item.evaluate("el => el.classList.contains('done')")
    log("완료 체크 (done 클래스)", has_done)

    # 취소선 pseudo-element width는 JS로 확인
    strikethrough = first_item.evaluate("""el => {
        const span = el.querySelector('.todo-text');
        const style = window.getComputedStyle(span, '::after');
        return style.width;
    }""")
    log("취소선 애니메이션 (::after width)", strikethrough not in ("0px", "auto", ""), f"width={strikethrough}")

    # ── 4. 남은 항목 카운트 ──────────────────────────────────────────
    remaining = page.locator("#remaining").inner_text()
    # 3개 중 1개 완료 → 남은 2개
    log("남은 항목 카운트", remaining == "2", f"remaining={remaining!r}")

    # ── 5. 필터: Active ───────────────────────────────────────────────
    page.locator(".filter-btn[data-filter='active']").click()
    page.wait_for_timeout(300)
    active_items = page.locator(".todo-item").all()
    log("필터 Active (미완료만)", len(active_items) == 2, f"count={len(active_items)}")

    # ── 6. 필터: Done ─────────────────────────────────────────────────
    page.locator(".filter-btn[data-filter='done']").click()
    page.wait_for_timeout(300)
    done_items = page.locator(".todo-item").all()
    log("필터 Done (완료만)", len(done_items) == 1, f"count={len(done_items)}")

    # ── 7. 필터: All ──────────────────────────────────────────────────
    page.locator(".filter-btn[data-filter='all']").click()
    page.wait_for_timeout(300)
    all_items = page.locator(".todo-item").all()
    log("필터 All (전체)", len(all_items) == 3, f"count={len(all_items)}")

    # ── 8. 삭제 버튼 (hover → 나타남 → 클릭) ──────────────────────────
    before_count = len(page.locator(".todo-item").all())
    # hover로 삭제 버튼 활성화
    second_item = page.locator(".todo-item").nth(1)
    second_item.hover()
    page.wait_for_timeout(300)
    del_btn = second_item.locator(".delete-btn")
    opacity = del_btn.evaluate("el => window.getComputedStyle(el).opacity")
    log("삭제 버튼 hover 노출", float(opacity) > 0, f"opacity={opacity}")
    del_btn.click()
    page.wait_for_timeout(500)
    after_count = len(page.locator(".todo-item").all())
    log("삭제 후 항목 수 감소", after_count == before_count - 1, f"{before_count} → {after_count}")

    # ── 9. 완료 항목 일괄 삭제 ───────────────────────────────────────
    clear_btn = page.locator("#clear-btn")
    is_enabled = not clear_btn.is_disabled()
    log("완료 항목 존재 시 삭제 버튼 활성", is_enabled)
    clear_btn.click()
    page.wait_for_timeout(500)
    remaining_after_clear = page.locator("#remaining").inner_text()
    done_after_clear = page.locator(".todo-item.done").all()
    log("완료 항목 일괄 삭제", len(done_after_clear) == 0, f"done_remaining={len(done_after_clear)}")

    # ── 10. 로컬스토리지 저장 (새로고침 후 유지) ─────────────────────
    # 현재 항목 수 기록
    count_before_reload = len(page.locator(".todo-item").all())
    page.reload()
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(300)
    count_after_reload = len(page.locator(".todo-item").all())
    log("로컬스토리지 저장 (새로고침 후 유지)", count_after_reload == count_before_reload,
        f"before={count_before_reload}, after={count_after_reload}")

    browser.close()

# ── 결과 요약 ─────────────────────────────────────────────────────────
print("\n" + "="*55)
total = len(results)
passed = sum(1 for ok, _ in results if ok)
print(f"결과: {passed}/{total} 통과")
for ok, msg in results:
    print(msg)

if passed < total:
    exit(1)
