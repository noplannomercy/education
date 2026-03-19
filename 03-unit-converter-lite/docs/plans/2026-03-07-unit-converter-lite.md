# Unit Converter Lite Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a single-page unit converter web app with HTML/CSS/JS that persists state via localStorage.

**Architecture:** Three-file structure (index.html + style.css + app.js). All conversion logic in app.js using a conversion-to-base-unit approach. localStorage saves last category, per-category unit selections, and 5-item history.

**Tech Stack:** Vanilla HTML5, CSS3, JavaScript (ES6+), localStorage API

---

### Task 1: Write PRD

**Files:**
- Create: `docs/PRD.md`

**Step 1: Create PRD**

```markdown
# Unit Converter Lite - PRD

## 주요 기능
- 6개 카테고리 단위 환산: 길이, 무게, 온도, 부피, 넓이, 속도
- 실시간 변환 (입력 즉시 결과 표시)
- From/To 단위 스왑 버튼
- 최근 변환 기록 5건 표시

## 화면 구성
- 상단: 카테고리 탭 (길이 / 무게 / 온도 / 부피 / 넓이 / 속도)
- 중앙: From [단위 선택][값 입력] → To [단위 선택][결과]
- 스왑 버튼 (⇄)
- 하단: 최근 변환 기록 목록

## 로컬스토리지 저장 항목
- `uc_lastCategory`: 마지막 선택 카테고리 (string)
- `uc_lastUnits`: 카테고리별 from/to 단위 (JSON object)
- `uc_history`: 최근 5건 변환 기록 (JSON array)
```

**Step 2: Commit**

```bash
git add docs/PRD.md
git commit -m "docs: add PRD"
```

---

### Task 2: HTML Structure

**Files:**
- Create: `index.html`

**Step 1: Create index.html**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unit Converter Lite</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="app">
    <h1 class="app-title">단위 환산기</h1>

    <!-- Category Tabs -->
    <nav class="tabs" id="tabs">
      <button class="tab active" data-category="length">길이</button>
      <button class="tab" data-category="weight">무게</button>
      <button class="tab" data-category="temperature">온도</button>
      <button class="tab" data-category="volume">부피</button>
      <button class="tab" data-category="area">넓이</button>
      <button class="tab" data-category="speed">속도</button>
    </nav>

    <!-- Converter -->
    <div class="converter">
      <div class="converter-row">
        <div class="unit-group">
          <select id="fromUnit" class="unit-select"></select>
          <input id="fromValue" class="unit-input" type="number" placeholder="값 입력">
        </div>
        <button id="swapBtn" class="swap-btn" title="단위 교체">⇄</button>
        <div class="unit-group">
          <select id="toUnit" class="unit-select"></select>
          <div id="toValue" class="unit-result">—</div>
        </div>
      </div>
    </div>

    <!-- History -->
    <section class="history">
      <h2 class="history-title">최근 변환</h2>
      <ul id="historyList" class="history-list"></ul>
    </section>
  </div>

  <script src="app.js"></script>
</body>
</html>
```

**Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add HTML structure"
```

---

### Task 3: CSS Styling

**Files:**
- Create: `style.css`

**Step 1: Create style.css**

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f0f2f5;
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 24px 16px;
}

.app {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  width: 100%;
  max-width: 520px;
  padding: 28px 24px;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 20px;
  text-align: center;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.tab {
  flex: 1 1 auto;
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  color: #555;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.tab:hover { border-color: #4f8ef7; color: #4f8ef7; }
.tab.active { border-color: #4f8ef7; background: #4f8ef7; color: #fff; }

/* Converter */
.converter {
  background: #f7f9fc;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.converter-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.unit-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.unit-select {
  padding: 8px 10px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.875rem;
  background: #fff;
  color: #333;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s;
}

.unit-select:focus { border-color: #4f8ef7; }

.unit-input {
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a2e;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
}

.unit-input:focus { border-color: #4f8ef7; }

.unit-result {
  padding: 10px 12px;
  border: 2px solid #4f8ef7;
  border-radius: 8px;
  font-size: 1.25rem;
  font-weight: 700;
  color: #4f8ef7;
  background: #fff;
  min-height: 48px;
  word-break: break-all;
}

.swap-btn {
  padding: 10px;
  font-size: 1.25rem;
  border: 2px solid #e0e0e0;
  border-radius: 50%;
  background: #fff;
  color: #555;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.swap-btn:hover { border-color: #4f8ef7; color: #4f8ef7; background: #eef3ff; }

/* History */
.history-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 10px;
}

.history-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.history-item {
  background: #f7f9fc;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.875rem;
  color: #555;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.history-item .category-badge {
  font-size: 0.75rem;
  background: #e8eef9;
  color: #4f8ef7;
  border-radius: 4px;
  padding: 2px 6px;
  font-weight: 600;
  flex-shrink: 0;
}

.history-empty {
  color: #bbb;
  font-size: 0.875rem;
  text-align: center;
  padding: 12px 0;
}

@media (max-width: 400px) {
  .converter-row { flex-direction: column; }
  .swap-btn { transform: rotate(90deg); }
}
```

**Step 2: Commit**

```bash
git add style.css
git commit -m "feat: add CSS styling"
```

---

### Task 4: JavaScript Logic

**Files:**
- Create: `app.js`

**Step 1: Create app.js**

```javascript
// ─── Unit Definitions ────────────────────────────────────────────────────────
// All units defined as multiplier to base unit (except temperature, handled separately)

const CATEGORIES = {
  length: {
    label: '길이',
    base: 'm',
    units: {
      mm: 0.001, cm: 0.01, m: 1, km: 1000,
      inch: 0.0254, ft: 0.3048, mile: 1609.344
    }
  },
  weight: {
    label: '무게',
    base: 'g',
    units: {
      mg: 0.001, g: 1, kg: 1000, ton: 1000000,
      lb: 453.592, oz: 28.3495
    }
  },
  temperature: {
    label: '온도',
    base: null, // special handling
    units: { '°C': true, '°F': true, 'K': true }
  },
  volume: {
    label: '부피',
    base: 'ml',
    units: {
      ml: 1, L: 1000, cup: 236.588,
      'fl oz': 29.5735, gallon: 3785.41
    }
  },
  area: {
    label: '넓이',
    base: 'm²',
    units: {
      'cm²': 0.0001, 'm²': 1, 'km²': 1000000,
      'ft²': 0.092903, acre: 4046.86
    }
  },
  speed: {
    label: '속도',
    base: 'm/s',
    units: {
      'm/s': 1, 'km/h': 0.277778, mph: 0.44704, knot: 0.514444
    }
  }
};

// ─── Conversion Logic ─────────────────────────────────────────────────────────

function convertTemperature(value, from, to) {
  if (from === to) return value;
  // Convert to Celsius first
  let celsius;
  if (from === '°C') celsius = value;
  else if (from === '°F') celsius = (value - 32) * 5 / 9;
  else if (from === 'K') celsius = value - 273.15;
  // Convert from Celsius to target
  if (to === '°C') return celsius;
  if (to === '°F') return celsius * 9 / 5 + 32;
  if (to === 'K') return celsius + 273.15;
}

function convert(category, value, fromUnit, toUnit) {
  if (isNaN(value) || value === '') return null;
  const num = parseFloat(value);
  if (category === 'temperature') {
    return convertTemperature(num, fromUnit, toUnit);
  }
  const units = CATEGORIES[category].units;
  const inBase = num * units[fromUnit];
  return inBase / units[toUnit];
}

function formatResult(value) {
  if (value === null) return '—';
  if (!isFinite(value)) return '∞';
  // Show up to 8 significant digits, remove trailing zeros
  const abs = Math.abs(value);
  if (abs === 0) return '0';
  if (abs >= 0.0001 && abs < 1e10) {
    return parseFloat(value.toPrecision(8)).toString();
  }
  return value.toExponential(4);
}

// ─── localStorage ─────────────────────────────────────────────────────────────

const LS_CATEGORY = 'uc_lastCategory';
const LS_UNITS = 'uc_lastUnits';
const LS_HISTORY = 'uc_history';

function lsGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function saveCategory(cat) { lsSet(LS_CATEGORY, cat); }

function saveUnits(cat, from, to) {
  const all = lsGet(LS_UNITS, {});
  all[cat] = { from, to };
  lsSet(LS_UNITS, all);
}

function getUnits(cat) {
  const all = lsGet(LS_UNITS, {});
  return all[cat] || null;
}

function addHistory(entry) {
  const hist = lsGet(LS_HISTORY, []);
  hist.unshift(entry);
  lsSet(LS_HISTORY, hist.slice(0, 5));
}

function getHistory() { return lsGet(LS_HISTORY, []); }

// ─── DOM ──────────────────────────────────────────────────────────────────────

let currentCategory = lsGet(LS_CATEGORY, 'length');

function populateUnits(category) {
  const units = Object.keys(CATEGORIES[category].units);
  const saved = getUnits(category);
  const fromSel = document.getElementById('fromUnit');
  const toSel = document.getElementById('toUnit');

  fromSel.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join('');
  toSel.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join('');

  if (saved) {
    fromSel.value = saved.from;
    toSel.value = saved.to;
  } else {
    // Default: first and second unit
    fromSel.value = units[0];
    toSel.value = units[1] || units[0];
  }
}

function updateResult() {
  const fromVal = document.getElementById('fromValue').value;
  const fromUnit = document.getElementById('fromUnit').value;
  const toUnit = document.getElementById('toUnit').value;
  const result = convert(currentCategory, fromVal, fromUnit, toUnit);
  const formatted = formatResult(result);
  document.getElementById('toValue').textContent = formatted;

  // Save units selection
  saveUnits(currentCategory, fromUnit, toUnit);

  // Add to history if valid
  if (result !== null && fromVal !== '') {
    addHistory({
      category: CATEGORIES[currentCategory].label,
      from: `${fromVal} ${fromUnit}`,
      to: `${formatted} ${toUnit}`
    });
    renderHistory();
  }
}

function renderHistory() {
  const list = document.getElementById('historyList');
  const hist = getHistory();
  if (hist.length === 0) {
    list.innerHTML = '<li class="history-empty">변환 기록이 없습니다</li>';
    return;
  }
  list.innerHTML = hist.map(h => `
    <li class="history-item">
      <span class="category-badge">${h.category}</span>
      <span>${h.from} = ${h.to}</span>
    </li>
  `).join('');
}

function switchCategory(category) {
  currentCategory = category;
  saveCategory(category);

  // Update active tab
  document.querySelectorAll('.tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });

  // Repopulate units
  populateUnits(category);

  // Clear input, recompute
  document.getElementById('fromValue').value = '';
  document.getElementById('toValue').textContent = '—';
}

// ─── Init ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Tab clicks
  document.getElementById('tabs').addEventListener('click', e => {
    if (e.target.classList.contains('tab')) {
      switchCategory(e.target.dataset.category);
    }
  });

  // Input change → convert
  document.getElementById('fromValue').addEventListener('input', updateResult);
  document.getElementById('fromUnit').addEventListener('change', updateResult);
  document.getElementById('toUnit').addEventListener('change', updateResult);

  // Swap
  document.getElementById('swapBtn').addEventListener('click', () => {
    const fromSel = document.getElementById('fromUnit');
    const toSel = document.getElementById('toUnit');
    const fromInput = document.getElementById('fromValue');
    const toValue = document.getElementById('toValue').textContent;

    [fromSel.value, toSel.value] = [toSel.value, fromSel.value];

    // Swap values too if result exists
    if (toValue !== '—' && toValue !== '∞') {
      fromInput.value = toValue;
    }
    updateResult();
  });

  // Restore last category
  switchCategory(currentCategory);
  renderHistory();
});
```

**Step 2: Commit**

```bash
git add app.js
git commit -m "feat: add conversion logic and app bootstrap"
```

---

### Task 5: Verify All Features

Open `index.html` in browser and verify:

- [ ] All 6 category tabs display and switch correctly
- [ ] Selecting a category restores last-used units (after first use)
- [ ] Typing a value shows real-time result
- [ ] Temperature conversion (°C ↔ °F ↔ K) is correct: 0°C = 32°F = 273.15K
- [ ] Swap button exchanges units and fills converted value into input
- [ ] History shows last 5 conversions with category badge
- [ ] Reload page → last category and units restored from localStorage
- [ ] Edge cases: empty input shows "—", very large/small numbers use exponential notation

Fix any issues found before final commit.

**Final commit:**

```bash
git add -A
git commit -m "feat: complete unit converter lite"
```
