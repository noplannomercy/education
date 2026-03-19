# Unit Converter Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 단일 `index.html` 파일로 12개 카테고리 단위환산, 즐겨찾기, 히스토리를 제공하는 대시보드형 웹앱 구현

**Architecture:** Vanilla JS 네임스페이스 패턴(UnitData / Converter / Storage / UI / App)을 단일 HTML 파일 인라인으로 구성. 외부 의존성 없이 브라우저 직접 오픈 가능. 상태는 메모리 객체로 관리하고 변경 시 LocalStorage에 동기 저장.

**Tech Stack:** HTML5, CSS3 (CSS Variables + Grid/Flexbox), Vanilla JavaScript (ES6+), LocalStorage API

---

## 테스트 방법 안내

빌드 도구·테스트 프레임워크 없는 순수 HTML 프로젝트이므로, 각 태스크의 검증은 두 가지 방법으로 진행:

1. **브라우저 콘솔 테스트**: `index.html`을 열고 DevTools Console에서 테스트 함수 실행
2. **시각적 검증**: 브라우저에서 직접 UI 동작 확인

각 태스크에 콘솔에서 실행할 검증 스니펫을 명시한다.

---

## Task 1: HTML 골격 + CSS 변수 시스템

**Files:**
- Create: `index.html`

**Step 1: HTML 기본 골격 작성**

```html
<!DOCTYPE html>
<html lang="ko" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>단위환산기</title>
  <style>
    /* === CSS Variables === */
    :root {
      --color-bg: #f8f9fa;
      --color-surface: #ffffff;
      --color-sidebar: #1e293b;
      --color-sidebar-text: #cbd5e1;
      --color-sidebar-active: #3b82f6;
      --color-sidebar-hover: #334155;
      --color-text: #1e293b;
      --color-text-muted: #64748b;
      --color-border: #e2e8f0;
      --color-input-bg: #f1f5f9;
      --color-accent: #3b82f6;
      --color-accent-hover: #2563eb;
      --color-success: #10b981;
      --color-danger: #ef4444;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
      --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
      --radius-sm: 6px;
      --radius-md: 10px;
      --radius-lg: 16px;
      --sidebar-width: 240px;
      --transition: 0.2s ease;
    }

    [data-theme="dark"] {
      --color-bg: #0f172a;
      --color-surface: #1e293b;
      --color-sidebar: #0f172a;
      --color-sidebar-text: #94a3b8;
      --color-sidebar-active: #60a5fa;
      --color-sidebar-hover: #1e293b;
      --color-text: #e2e8f0;
      --color-text-muted: #94a3b8;
      --color-border: #334155;
      --color-input-bg: #0f172a;
    }

    /* === Reset & Base === */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--color-bg);
      color: var(--color-text);
      height: 100vh;
      overflow: hidden;
      transition: background var(--transition), color var(--transition);
    }

    /* === Layout === */
    .app {
      display: flex;
      height: 100vh;
    }

    /* Sidebar */
    .sidebar {
      width: var(--sidebar-width);
      background: var(--color-sidebar);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      overflow-y: auto;
      transition: transform var(--transition);
    }

    /* Main */
    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* Topbar */
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      border-bottom: 1px solid var(--color-border);
      background: var(--color-surface);
    }

    /* Content area */
    .content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* Mobile overlay */
    .sidebar-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 99;
    }

    /* === Responsive === */
    @media (max-width: 767px) {
      .sidebar {
        position: fixed;
        top: 0; left: 0;
        height: 100vh;
        z-index: 100;
        transform: translateX(-100%);
      }
      .sidebar.open {
        transform: translateX(0);
      }
      .sidebar-overlay.visible {
        display: block;
      }
      body { overflow: auto; }
      .app { flex-direction: column; height: auto; min-height: 100vh; }
      .main { height: 100vh; }
    }
  </style>
</head>
<body>
  <div class="app">
    <aside class="sidebar" id="sidebar"><!-- Task 2에서 채움 --></aside>
    <div class="sidebar-overlay" id="sidebarOverlay"></div>
    <main class="main">
      <div class="topbar" id="topbar"><!-- Task 2에서 채움 --></div>
      <div class="content" id="content"><!-- Task 3~8에서 채움 --></div>
    </main>
  </div>
  <script>
    // JS modules here (Task 3~8)
  </script>
</body>
</html>
```

**Step 2: 브라우저에서 열어 레이아웃 확인**

`index.html`을 브라우저에서 직접 열기.
- 좌측 240px 사이드바(어두운 배경), 우측 메인 영역이 보이면 정상.

**Step 3: 다크/라이트 테마 변수 동작 확인**

브라우저 콘솔에서:
```js
document.documentElement.setAttribute('data-theme', 'dark')
// 배경이 어두워지면 정상
document.documentElement.setAttribute('data-theme', 'light')
```

---

## Task 2: UnitData — 12개 카테고리 데이터 정의

**Files:**
- Modify: `index.html` — `<script>` 블록에 추가

**Step 1: UnitData 객체 작성**

`<script>` 블록 맨 앞에 추가:

```js
const UnitData = {
  categories: [
    {
      id: 'length', label: '길이', icon: '📏',
      units: [
        { id: 'mm',  label: '밀리미터 (mm)',  factor: 0.001 },
        { id: 'cm',  label: '센티미터 (cm)',  factor: 0.01 },
        { id: 'm',   label: '미터 (m)',        factor: 1 },
        { id: 'km',  label: '킬로미터 (km)',   factor: 1000 },
        { id: 'in',  label: '인치 (in)',       factor: 0.0254 },
        { id: 'ft',  label: '피트 (ft)',       factor: 0.3048 },
        { id: 'yd',  label: '야드 (yd)',       factor: 0.9144 },
        { id: 'mi',  label: '마일 (mi)',       factor: 1609.344 },
      ]
    },
    {
      id: 'weight', label: '무게', icon: '⚖️',
      units: [
        { id: 'mg',  label: '밀리그램 (mg)', factor: 0.000001 },
        { id: 'g',   label: '그램 (g)',      factor: 0.001 },
        { id: 'kg',  label: '킬로그램 (kg)', factor: 1 },
        { id: 't',   label: '톤 (t)',        factor: 1000 },
        { id: 'oz',  label: '온스 (oz)',     factor: 0.0283495 },
        { id: 'lb',  label: '파운드 (lb)',   factor: 0.453592 },
      ]
    },
    {
      id: 'temperature', label: '온도', icon: '🌡️',
      special: true,  // 선형 계수 방식이 아닌 특수 처리
      units: [
        { id: 'C', label: '섭씨 (°C)' },
        { id: 'F', label: '화씨 (°F)' },
        { id: 'K', label: '켈빈 (K)' },
      ]
    },
    {
      id: 'volume', label: '부피', icon: '🧴',
      units: [
        { id: 'ml',    label: '밀리리터 (ml)',  factor: 0.001 },
        { id: 'L',     label: '리터 (L)',       factor: 1 },
        { id: 'm3',    label: '세제곱미터 (m³)', factor: 1000 },
        { id: 'floz',  label: '플루이드온스',    factor: 0.0295735 },
        { id: 'pt',    label: '파인트 (pt)',     factor: 0.473176 },
        { id: 'qt',    label: '쿼트 (qt)',       factor: 0.946353 },
        { id: 'gal',   label: '갤런 (gal)',      factor: 3.78541 },
      ]
    },
    {
      id: 'area', label: '넓이', icon: '📐',
      units: [
        { id: 'mm2',  label: '제곱밀리미터 (mm²)', factor: 0.000001 },
        { id: 'cm2',  label: '제곱센티미터 (cm²)', factor: 0.0001 },
        { id: 'm2',   label: '제곱미터 (m²)',       factor: 1 },
        { id: 'km2',  label: '제곱킬로미터 (km²)', factor: 1000000 },
        { id: 'in2',  label: '제곱인치 (in²)',      factor: 0.00064516 },
        { id: 'ft2',  label: '제곱피트 (ft²)',      factor: 0.092903 },
        { id: 'ac',   label: '에이커 (ac)',         factor: 4046.86 },
      ]
    },
    {
      id: 'speed', label: '속도', icon: '💨',
      units: [
        { id: 'ms',    label: '미터/초 (m/s)',    factor: 1 },
        { id: 'kmh',   label: '킬로미터/시 (km/h)', factor: 0.277778 },
        { id: 'mph',   label: '마일/시 (mph)',     factor: 0.44704 },
        { id: 'knot',  label: '노트 (knot)',       factor: 0.514444 },
      ]
    },
    {
      id: 'time', label: '시간', icon: '⏱️',
      units: [
        { id: 'ms',     label: '밀리초 (ms)',   factor: 0.001 },
        { id: 's',      label: '초 (s)',        factor: 1 },
        { id: 'min',    label: '분 (min)',      factor: 60 },
        { id: 'h',      label: '시간 (h)',      factor: 3600 },
        { id: 'day',    label: '일 (day)',      factor: 86400 },
        { id: 'week',   label: '주 (week)',     factor: 604800 },
        { id: 'month',  label: '월 (month)',    factor: 2629800 },
        { id: 'year',   label: '년 (year)',     factor: 31557600 },
      ]
    },
    {
      id: 'pressure', label: '압력', icon: '🔵',
      units: [
        { id: 'Pa',   label: '파스칼 (Pa)',   factor: 1 },
        { id: 'hPa',  label: '헥토파스칼 (hPa)', factor: 100 },
        { id: 'kPa',  label: '킬로파스칼 (kPa)', factor: 1000 },
        { id: 'bar',  label: '바 (bar)',      factor: 100000 },
        { id: 'atm',  label: '기압 (atm)',    factor: 101325 },
        { id: 'psi',  label: 'PSI',           factor: 6894.76 },
      ]
    },
    {
      id: 'data', label: '데이터', icon: '💾',
      units: [
        { id: 'bit',  label: '비트 (bit)',  factor: 1 },
        { id: 'B',    label: '바이트 (B)', factor: 8 },
        { id: 'KB',   label: '킬로바이트 (KB)', factor: 8192 },
        { id: 'MB',   label: '메가바이트 (MB)', factor: 8388608 },
        { id: 'GB',   label: '기가바이트 (GB)', factor: 8589934592 },
        { id: 'TB',   label: '테라바이트 (TB)', factor: 8796093022208 },
        { id: 'PB',   label: '페타바이트 (PB)', factor: 9007199254740992 },
      ]
    },
    {
      id: 'energy', label: '에너지', icon: '⚡',
      units: [
        { id: 'J',    label: '줄 (J)',      factor: 1 },
        { id: 'kJ',   label: '킬로줄 (kJ)', factor: 1000 },
        { id: 'cal',  label: '칼로리 (cal)', factor: 4.184 },
        { id: 'kcal', label: '킬로칼로리 (kcal)', factor: 4184 },
        { id: 'Wh',   label: '와트시 (Wh)', factor: 3600 },
        { id: 'kWh',  label: '킬로와트시 (kWh)', factor: 3600000 },
        { id: 'BTU',  label: 'BTU',         factor: 1055.06 },
      ]
    },
    {
      id: 'angle', label: '각도', icon: '📐',
      units: [
        { id: 'deg',  label: '도 (°)',      factor: 1 },
        { id: 'rad',  label: '라디안 (rad)', factor: 57.2958 },
        { id: 'grad', label: '그라디안 (grad)', factor: 0.9 },
        { id: 'turn', label: '회전 (turn)', factor: 360 },
      ]
    },
    {
      id: 'currency', label: '화폐', icon: '💱',
      special: true,
      rateDate: '2026-03-07',
      // 기준: KRW 1000 = ?
      units: [
        { id: 'KRW', label: '한국 원 (₩)',    toKRW: 1 },
        { id: 'USD', label: '미국 달러 ($)',   toKRW: 1430 },
        { id: 'EUR', label: '유로 (€)',        toKRW: 1560 },
        { id: 'JPY', label: '일본 엔 (¥)',     toKRW: 9.5 },
        { id: 'GBP', label: '영국 파운드 (£)', toKRW: 1820 },
        { id: 'CNY', label: '중국 위안 (¥)',   toKRW: 197 },
      ]
    },
  ],

  getCategory(id) {
    return this.categories.find(c => c.id === id);
  },

  getUnit(categoryId, unitId) {
    const cat = this.getCategory(categoryId);
    return cat?.units.find(u => u.id === unitId);
  }
};
```

**Step 2: 브라우저 콘솔 검증**

```js
// 12개 카테고리 확인
console.assert(UnitData.categories.length === 12, 'FAIL: 카테고리 12개 아님');

// 길이 카테고리 미터 단위 확인
const m = UnitData.getUnit('length', 'm');
console.assert(m.factor === 1, 'FAIL: 미터 factor 1 아님');

// 온도 special 플래그 확인
const temp = UnitData.getCategory('temperature');
console.assert(temp.special === true, 'FAIL: 온도 special 아님');

console.log('UnitData OK');
```

---

## Task 3: Converter — 환산 로직

**Files:**
- Modify: `index.html` — UnitData 아래에 추가

**Step 1: Converter 객체 작성**

```js
const Converter = {
  convert(categoryId, fromId, toId, value) {
    if (value === '' || value === null || isNaN(value)) return '';
    const num = parseFloat(value);
    const cat = UnitData.getCategory(categoryId);
    if (!cat) return '';

    if (cat.id === 'temperature') {
      return this._convertTemp(fromId, toId, num);
    }
    if (cat.id === 'currency') {
      return this._convertCurrency(cat, fromId, toId, num);
    }
    // 일반: factor 기반 (모두 기준 단위로 변환 후 목표 단위로)
    const fromUnit = UnitData.getUnit(categoryId, fromId);
    const toUnit   = UnitData.getUnit(categoryId, toId);
    if (!fromUnit || !toUnit) return '';
    const baseValue = num * fromUnit.factor;
    return baseValue / toUnit.factor;
  },

  _convertTemp(from, to, val) {
    // 섭씨로 통일 후 목표로 변환
    let celsius;
    if (from === 'C') celsius = val;
    else if (from === 'F') celsius = (val - 32) * 5 / 9;
    else if (from === 'K') celsius = val - 273.15;

    if (to === 'C') return celsius;
    if (to === 'F') return celsius * 9 / 5 + 32;
    if (to === 'K') return celsius + 273.15;
  },

  _convertCurrency(cat, from, to, val) {
    const fromUnit = cat.units.find(u => u.id === from);
    const toUnit   = cat.units.find(u => u.id === to);
    const inKRW = val * fromUnit.toKRW;
    return inKRW / toUnit.toKRW;
  },

  format(value, maxDecimals = 8) {
    if (value === '' || value === null) return '';
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    // 유효숫자 제한 후 불필요한 0 제거
    return parseFloat(num.toPrecision(10)).toString();
  }
};
```

**Step 2: 브라우저 콘솔 검증**

```js
// 길이: 1m = 100cm
console.assert(Converter.convert('length', 'm', 'cm', 1) === 100, 'FAIL: 1m != 100cm');

// 길이: 1km = 1000m
console.assert(Converter.convert('length', 'km', 'm', 1) === 1000, 'FAIL: 1km != 1000m');

// 온도: 0°C = 32°F
console.assert(Converter.convert('temperature', 'C', 'F', 0) === 32, 'FAIL: 0C != 32F');

// 온도: 100°C = 373.15K
console.assert(Math.abs(Converter.convert('temperature', 'C', 'K', 100) - 373.15) < 0.001, 'FAIL: 100C K 오류');

// 무게: 1kg = 1000g
console.assert(Converter.convert('weight', 'kg', 'g', 1) === 1000, 'FAIL: 1kg != 1000g');

// 같은 단위 변환
console.assert(Converter.convert('length', 'm', 'm', 5) === 5, 'FAIL: 5m != 5m');

// 빈 값
console.assert(Converter.convert('length', 'm', 'cm', '') === '', 'FAIL: 빈값 처리 오류');

console.log('Converter OK');
```

---

## Task 4: Storage — LocalStorage CRUD

**Files:**
- Modify: `index.html` — Converter 아래에 추가

**Step 1: Storage 객체 작성**

```js
const Storage = {
  KEYS: { HISTORY: 'uc_history', FAVORITES: 'uc_favorites', THEME: 'uc_theme' },
  MAX_HISTORY: 50,

  // --- Favorites ---
  getFavorites() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.FAVORITES)) || []; }
    catch { return []; }
  },
  saveFavorites(list) {
    localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(list));
  },
  addFavorite(item) {
    const list = this.getFavorites();
    const exists = list.some(f => f.category === item.category && f.from === item.from && f.to === item.to);
    if (exists) return false;
    list.unshift(item);
    this.saveFavorites(list);
    return true;
  },
  removeFavorite(item) {
    const list = this.getFavorites().filter(
      f => !(f.category === item.category && f.from === item.from && f.to === item.to)
    );
    this.saveFavorites(list);
  },
  isFavorite(item) {
    return this.getFavorites().some(
      f => f.category === item.category && f.from === item.from && f.to === item.to
    );
  },
  toggleFavorite(item) {
    if (this.isFavorite(item)) { this.removeFavorite(item); return false; }
    else { this.addFavorite(item); return true; }
  },

  // --- History ---
  getHistory() {
    try { return JSON.parse(localStorage.getItem(this.KEYS.HISTORY)) || []; }
    catch { return []; }
  },
  addHistory(item) {
    const list = this.getHistory();
    // 동일한 최신 항목 중복 방지 (연속 동일 입력)
    const last = list[0];
    if (last && last.category === item.category && last.from === item.from &&
        last.to === item.to && last.fromVal === item.fromVal) return;
    list.unshift({ ...item, id: Date.now(), ts: Date.now() });
    if (list.length > this.MAX_HISTORY) list.splice(this.MAX_HISTORY);
    localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(list));
  },
  clearHistory() {
    localStorage.removeItem(this.KEYS.HISTORY);
  },

  // --- Theme ---
  getTheme() { return localStorage.getItem(this.KEYS.THEME) || 'auto'; },
  setTheme(theme) { localStorage.setItem(this.KEYS.THEME, theme); },
};
```

**Step 2: 브라우저 콘솔 검증**

```js
// 즐겨찾기 추가/중복/삭제
Storage.saveFavorites([]); // 초기화
const item = { category: 'length', from: 'm', to: 'ft' };
console.assert(Storage.addFavorite(item) === true, 'FAIL: 즐겨찾기 추가 실패');
console.assert(Storage.addFavorite(item) === false, 'FAIL: 중복 추가 허용됨');
console.assert(Storage.isFavorite(item) === true, 'FAIL: 즐겨찾기 확인 실패');
Storage.removeFavorite(item);
console.assert(Storage.isFavorite(item) === false, 'FAIL: 즐겨찾기 삭제 실패');

// 히스토리 FIFO 50건 제한
Storage.clearHistory();
for (let i = 0; i < 55; i++) {
  Storage.addHistory({ category: 'length', from: 'm', to: 'cm', fromVal: i, toVal: i*100 });
}
console.assert(Storage.getHistory().length === 50, 'FAIL: 히스토리 50건 초과');

Storage.clearHistory();
console.assert(Storage.getHistory().length === 0, 'FAIL: 히스토리 삭제 실패');

console.log('Storage OK');
```

---

## Task 5: UI — 사이드바 & 상단바 렌더링

**Files:**
- Modify: `index.html` — HTML 사이드바/상단바 마크업 + CSS + JS UI 객체 추가

**Step 1: 사이드바 HTML 구조 추가**

`<aside class="sidebar">` 내용:

```html
<div class="sidebar-header">
  <span class="sidebar-logo">Unit</span>
  <button class="sidebar-close" id="sidebarClose" aria-label="닫기">✕</button>
</div>
<div class="sidebar-search">
  <input type="search" id="categorySearch" placeholder="카테고리 검색..." aria-label="카테고리 검색">
</div>
<nav class="sidebar-nav" id="categoryNav" role="navigation" aria-label="단위 카테고리"></nav>
<div class="sidebar-favorites" id="sidebarFavorites">
  <div class="sidebar-section-title">즐겨찾기</div>
  <ul class="fav-list" id="favList"></ul>
</div>
```

**Step 2: 상단바 HTML 구조**

`<div class="topbar">` 내용:

```html
<div class="topbar-left">
  <button class="hamburger" id="hamburger" aria-label="메뉴">☰</button>
  <h1 class="topbar-title" id="topbarTitle">길이</h1>
</div>
<div class="topbar-right">
  <button class="fav-toggle" id="favToggle" aria-label="즐겨찾기 토글" title="즐겨찾기">☆</button>
  <button class="theme-toggle" id="themeToggle" aria-label="테마 전환">🌙</button>
</div>
```

**Step 3: 사이드바/상단바 CSS 추가**

```css
/* Sidebar Header */
.sidebar-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 16px 12px;
}
.sidebar-logo { color: #fff; font-size: 18px; font-weight: 700; }
.sidebar-close { background: none; border: none; color: var(--color-sidebar-text);
  cursor: pointer; font-size: 18px; display: none; }

/* Sidebar Search */
.sidebar-search { padding: 0 12px 12px; }
.sidebar-search input {
  width: 100%; padding: 8px 12px; border-radius: var(--radius-sm);
  border: 1px solid #334155; background: #0f172a; color: var(--color-sidebar-text);
  font-size: 13px; outline: none;
}
.sidebar-search input:focus { border-color: var(--color-sidebar-active); }

/* Category Nav */
.sidebar-nav { flex: 1; padding: 0 8px; }
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: var(--radius-sm);
  cursor: pointer; color: var(--color-sidebar-text);
  font-size: 14px; transition: background var(--transition), color var(--transition);
  list-style: none;
}
.nav-item:hover { background: var(--color-sidebar-hover); color: #fff; }
.nav-item.active { background: var(--color-sidebar-active); color: #fff; font-weight: 600; }
.nav-item .icon { font-size: 16px; }

/* Sidebar Favorites */
.sidebar-favorites { padding: 12px 12px 16px; border-top: 1px solid #334155; }
.sidebar-section-title { color: #64748b; font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
.fav-list { list-style: none; }
.fav-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 6px 8px; border-radius: var(--radius-sm);
  cursor: pointer; color: var(--color-sidebar-text); font-size: 13px;
}
.fav-item:hover { background: var(--color-sidebar-hover); color: #fff; }
.fav-item .fav-label { flex: 1; }
.fav-item .fav-del { background: none; border: none; color: #64748b;
  cursor: pointer; font-size: 14px; padding: 0 2px; }
.fav-item .fav-del:hover { color: var(--color-danger); }

/* Topbar */
.topbar { min-height: 60px; }
.topbar-left, .topbar-right { display: flex; align-items: center; gap: 8px; }
.topbar-title { font-size: 20px; font-weight: 700; }
.hamburger { background: none; border: none; font-size: 22px; cursor: pointer;
  color: var(--color-text); display: none; padding: 4px 8px; }
.fav-toggle, .theme-toggle {
  background: none; border: 1px solid var(--color-border);
  border-radius: var(--radius-sm); padding: 6px 10px;
  cursor: pointer; font-size: 16px; color: var(--color-text);
  transition: background var(--transition);
}
.fav-toggle:hover, .theme-toggle:hover { background: var(--color-input-bg); }
.fav-toggle.active { color: #f59e0b; border-color: #f59e0b; }

@media (max-width: 767px) {
  .hamburger { display: block; }
  .sidebar-close { display: block; }
}
```

**Step 4: UI.renderSidebar() 작성**

```js
const UI = {
  state: {
    category: 'length',
    fromUnit: 'm',
    toUnit: 'cm',
    theme: 'auto',
  },

  renderSidebar(filter = '') {
    const nav = document.getElementById('categoryNav');
    const cats = UnitData.categories.filter(c =>
      !filter || c.label.includes(filter) || c.id.includes(filter.toLowerCase())
    );
    nav.innerHTML = cats.map(c => `
      <li class="nav-item ${c.id === this.state.category ? 'active' : ''}"
          data-category="${c.id}" role="menuitem" tabindex="0"
          aria-current="${c.id === this.state.category ? 'page' : 'false'}">
        <span class="icon">${c.icon}</span>
        <span>${c.label}</span>
      </li>
    `).join('');

    nav.querySelectorAll('.nav-item').forEach(el => {
      el.addEventListener('click', () => this.selectCategory(el.dataset.category));
      el.addEventListener('keydown', e => { if (e.key === 'Enter') this.selectCategory(el.dataset.category); });
    });
  },

  renderFavoritesSidebar() {
    const list = document.getElementById('favList');
    const favs = Storage.getFavorites();
    if (!favs.length) {
      list.innerHTML = '<li style="color:#475569;font-size:12px;padding:4px 8px;">없음</li>';
      return;
    }
    list.innerHTML = favs.map((f, i) => {
      const cat = UnitData.getCategory(f.category);
      const fromU = UnitData.getUnit(f.category, f.from);
      const toU   = UnitData.getUnit(f.category, f.to);
      return `
        <li class="fav-item" data-index="${i}">
          <span class="fav-label" data-category="${f.category}" data-from="${f.from}" data-to="${f.to}">
            ${cat?.icon} ${fromU?.label?.split(' ')[0]} → ${toU?.label?.split(' ')[0]}
          </span>
          <button class="fav-del" data-index="${i}" aria-label="즐겨찾기 삭제">✕</button>
        </li>
      `;
    }).join('');

    list.querySelectorAll('.fav-label').forEach(el => {
      el.addEventListener('click', () => {
        this.selectCategory(el.dataset.category);
        this.state.fromUnit = el.dataset.from;
        this.state.toUnit   = el.dataset.to;
        this.renderConverter();
        this.closeSidebar();
      });
    });
    list.querySelectorAll('.fav-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const f = Storage.getFavorites()[parseInt(btn.dataset.index)];
        Storage.removeFavorite(f);
        this.renderFavoritesSidebar();
        this.updateFavToggle();
      });
    });
  },

  selectCategory(id) {
    this.state.category = id;
    const cat = UnitData.getCategory(id);
    this.state.fromUnit = cat.units[0].id;
    this.state.toUnit   = cat.units[1]?.id || cat.units[0].id;
    document.getElementById('topbarTitle').textContent = cat.label;
    this.renderSidebar();
    this.renderConverter();
    this.updateFavToggle();
    if (window.innerWidth < 768) this.closeSidebar();
  },

  openSidebar() {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sidebarOverlay').classList.add('visible');
  },
  closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('visible');
  },

  updateFavToggle() {
    const btn = document.getElementById('favToggle');
    const isFav = Storage.isFavorite({
      category: this.state.category,
      from: this.state.fromUnit,
      to: this.state.toUnit
    });
    btn.textContent = isFav ? '★' : '☆';
    btn.classList.toggle('active', isFav);
    btn.setAttribute('aria-pressed', isFav);
  },

  initSidebarEvents() {
    document.getElementById('hamburger').addEventListener('click', () => this.openSidebar());
    document.getElementById('sidebarClose').addEventListener('click', () => this.closeSidebar());
    document.getElementById('sidebarOverlay').addEventListener('click', () => this.closeSidebar());

    document.getElementById('categorySearch').addEventListener('input', e => {
      this.renderSidebar(e.target.value.trim());
    });

    document.getElementById('favToggle').addEventListener('click', () => {
      const item = { category: this.state.category, from: this.state.fromUnit, to: this.state.toUnit };
      Storage.toggleFavorite(item);
      this.updateFavToggle();
      this.renderFavoritesSidebar();
    });
  },
};
```

**Step 5: 브라우저에서 시각 확인**

- 사이드바에 12개 카테고리 목록이 보임
- 카테고리 클릭 시 active 스타일 전환
- 모바일 폭(< 768px)에서 햄버거 버튼, 클릭 시 사이드바 슬라이드

---

## Task 6: UI — 환산 패널 렌더링

**Files:**
- Modify: `index.html` — `<div class="content">` 내용 + CSS + UI.renderConverter()

**Step 1: 환산 패널 HTML 마크업 (JS로 동적 생성)**

`content` 영역을 두 영역으로 분리:

```html
<div class="content" id="content">
  <div class="converter-panel" id="converterPanel"></div>
  <div class="bottom-panel">
    <div class="panel-tabs">
      <button class="tab-btn active" data-tab="history">히스토리</button>
      <button class="tab-btn" data-tab="favorites">즐겨찾기</button>
    </div>
    <div class="tab-content" id="tabContent"></div>
  </div>
</div>
```

**Step 2: 환산 패널 CSS**

```css
.converter-panel {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 28px;
  box-shadow: var(--shadow-sm);
}
.converter-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: end;
  gap: 16px;
}
.unit-box { display: flex; flex-direction: column; gap: 8px; }
.unit-box label { font-size: 12px; font-weight: 600; color: var(--color-text-muted);
  text-transform: uppercase; letter-spacing: 0.05em; }
.unit-select {
  width: 100%; padding: 10px 12px; border-radius: var(--radius-sm);
  border: 1px solid var(--color-border); background: var(--color-input-bg);
  color: var(--color-text); font-size: 14px; cursor: pointer; outline: none;
}
.unit-select:focus { border-color: var(--color-accent); }
.unit-input {
  width: 100%; padding: 14px 16px; border-radius: var(--radius-sm);
  border: 2px solid var(--color-border); background: var(--color-input-bg);
  color: var(--color-text); font-size: 24px; font-weight: 600;
  outline: none; transition: border-color var(--transition);
}
.unit-input:focus { border-color: var(--color-accent); }
.unit-input[readonly] { cursor: default; color: var(--color-accent); }
.swap-btn {
  background: var(--color-input-bg); border: 1px solid var(--color-border);
  border-radius: 50%; width: 40px; height: 40px; cursor: pointer;
  font-size: 18px; display: flex; align-items: center; justify-content: center;
  transition: background var(--transition), transform var(--transition);
  margin-bottom: 4px;
}
.swap-btn:hover { background: var(--color-accent); color: #fff; transform: rotate(180deg); }
.copy-row { display: flex; justify-content: flex-end; margin-top: 12px; }
.copy-btn {
  background: none; border: 1px solid var(--color-border);
  border-radius: var(--radius-sm); padding: 6px 14px;
  cursor: pointer; font-size: 13px; color: var(--color-text-muted);
  transition: all var(--transition);
}
.copy-btn:hover { background: var(--color-accent); color: #fff; border-color: var(--color-accent); }
.currency-note { font-size: 11px; color: var(--color-text-muted); margin-top: 8px; }

/* Bottom Panel */
.bottom-panel {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  flex: 1;
}
.panel-tabs { display: flex; border-bottom: 1px solid var(--color-border); }
.tab-btn {
  flex: 1; padding: 14px; background: none; border: none;
  cursor: pointer; font-size: 14px; color: var(--color-text-muted);
  font-weight: 500; transition: color var(--transition);
  border-bottom: 2px solid transparent;
}
.tab-btn.active { color: var(--color-accent); border-bottom-color: var(--color-accent); }
.tab-content { padding: 16px; max-height: 280px; overflow-y: auto; }

@media (max-width: 767px) {
  .converter-row { grid-template-columns: 1fr; }
  .swap-btn { width: 100%; border-radius: var(--radius-sm); margin: 0; }
  .unit-input { font-size: 20px; }
}
```

**Step 3: UI.renderConverter() 작성**

```js
// UI 객체에 추가
renderConverter() {
  const panel = document.getElementById('converterPanel');
  const cat = UnitData.getCategory(this.state.category);
  const unitOptions = (selectedId) => cat.units.map(u =>
    `<option value="${u.id}" ${u.id === selectedId ? 'selected' : ''}>${u.label}</option>`
  ).join('');

  const currencyNote = cat.id === 'currency'
    ? `<p class="currency-note">* 고정 환율 기준일: ${cat.rateDate}</p>` : '';

  panel.innerHTML = `
    <div class="converter-row">
      <div class="unit-box">
        <label for="fromSelect">변환 전</label>
        <select class="unit-select" id="fromSelect" aria-label="변환 전 단위">${unitOptions(this.state.fromUnit)}</select>
        <input class="unit-input" id="fromInput" type="number" placeholder="0" aria-label="변환 전 값">
      </div>
      <button class="swap-btn" id="swapBtn" aria-label="단위 교체">⇄</button>
      <div class="unit-box">
        <label for="toSelect">변환 후</label>
        <select class="unit-select" id="toSelect" aria-label="변환 후 단위">${unitOptions(this.state.toUnit)}</select>
        <input class="unit-input" id="toInput" type="number" placeholder="0" readonly aria-label="변환 결과" aria-live="polite">
      </div>
    </div>
    ${currencyNote}
    <div class="copy-row">
      <button class="copy-btn" id="copyBtn">결과 복사</button>
    </div>
  `;

  this._bindConverterEvents();
  this.updateFavToggle();
},

_bindConverterEvents() {
  const fromInput = document.getElementById('fromInput');
  const toInput   = document.getElementById('toInput');
  const fromSelect = document.getElementById('fromSelect');
  const toSelect   = document.getElementById('toSelect');

  const doConvert = () => {
    const val = fromInput.value;
    const result = Converter.convert(this.state.category, this.state.fromUnit, this.state.toUnit, val);
    toInput.value = result !== '' ? Converter.format(result) : '';
    // 히스토리 저장 (유효한 숫자일 때)
    if (val !== '' && result !== '') {
      Storage.addHistory({
        category: this.state.category,
        from: this.state.fromUnit,
        to: this.state.toUnit,
        fromVal: parseFloat(val),
        toVal: parseFloat(result),
      });
      if (document.querySelector('.tab-btn.active')?.dataset.tab === 'history') {
        this.renderHistoryTab();
      }
    }
  };

  fromInput.addEventListener('input', doConvert);

  fromSelect.addEventListener('change', () => {
    this.state.fromUnit = fromSelect.value;
    doConvert();
    this.updateFavToggle();
  });
  toSelect.addEventListener('change', () => {
    this.state.toUnit = toSelect.value;
    doConvert();
    this.updateFavToggle();
  });

  document.getElementById('swapBtn').addEventListener('click', () => {
    [this.state.fromUnit, this.state.toUnit] = [this.state.toUnit, this.state.fromUnit];
    const prevFrom = fromInput.value;
    this.renderConverter();
    document.getElementById('fromInput').value = document.getElementById('toInput').value || prevFrom;
    document.getElementById('fromInput').dispatchEvent(new Event('input'));
  });

  document.getElementById('copyBtn').addEventListener('click', () => {
    const val = toInput.value;
    if (!val) return;
    navigator.clipboard.writeText(val).then(() => {
      const btn = document.getElementById('copyBtn');
      btn.textContent = '복사됨!';
      setTimeout(() => { btn.textContent = '결과 복사'; }, 1500);
    });
  });
},
```

**Step 4: 브라우저 시각 확인**

- 두 개의 단위 선택 + 입력 박스가 가로로 배치됨
- From에 숫자 입력 시 To 결과가 실시간 업데이트
- 교체(⇄) 버튼 클릭 시 From/To 단위가 바뀜
- 결과 복사 버튼 동작

---

## Task 7: UI — 히스토리 & 즐겨찾기 탭

**Files:**
- Modify: `index.html` — UI에 탭 렌더링 함수 추가

**Step 1: 탭 전환 및 렌더링 함수 작성**

```js
// UI 객체에 추가
renderHistoryTab() {
  const content = document.getElementById('tabContent');
  const history = Storage.getHistory();
  if (!history.length) {
    content.innerHTML = '<p style="color:var(--color-text-muted);font-size:14px;">변환 기록이 없습니다.</p>';
    return;
  }
  content.innerHTML = `
    <div style="display:flex;justify-content:flex-end;margin-bottom:10px;">
      <button id="clearHistoryBtn" style="background:none;border:1px solid var(--color-border);
        padding:4px 10px;border-radius:4px;cursor:pointer;font-size:12px;color:var(--color-text-muted);">
        전체 삭제
      </button>
    </div>
    <ul style="list-style:none;display:flex;flex-direction:column;gap:6px;">
      ${history.map(h => {
        const cat = UnitData.getCategory(h.category);
        const fromU = UnitData.getUnit(h.category, h.from);
        const toU   = UnitData.getUnit(h.category, h.to);
        return `
          <li class="history-item" data-id="${h.id}" style="
            display:flex;align-items:center;justify-content:space-between;
            padding:10px 12px;background:var(--color-input-bg);
            border-radius:var(--radius-sm);cursor:pointer;
            font-size:13px;transition:background var(--transition);">
            <span>${cat?.icon} <b>${Converter.format(h.fromVal)}</b> ${fromU?.label?.split(' ')[0]}
              → <b>${Converter.format(h.toVal)}</b> ${toU?.label?.split(' ')[0]}</span>
            <span style="color:var(--color-text-muted);font-size:11px;">${this._relativeTime(h.ts)}</span>
          </li>`;
      }).join('')}
    </ul>
  `;

  content.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('mouseenter', () => el.style.background = 'var(--color-border)');
    el.addEventListener('mouseleave', () => el.style.background = 'var(--color-input-bg)');
    el.addEventListener('click', () => {
      const h = Storage.getHistory().find(x => x.id == el.dataset.id);
      if (!h) return;
      this.selectCategory(h.category);
      this.state.fromUnit = h.from;
      this.state.toUnit   = h.to;
      this.renderConverter();
      document.getElementById('fromInput').value = h.fromVal;
      document.getElementById('fromInput').dispatchEvent(new Event('input'));
    });
  });

  document.getElementById('clearHistoryBtn')?.addEventListener('click', () => {
    Storage.clearHistory();
    this.renderHistoryTab();
  });
},

renderFavoritesTab() {
  const content = document.getElementById('tabContent');
  const favs = Storage.getFavorites();
  if (!favs.length) {
    content.innerHTML = '<p style="color:var(--color-text-muted);font-size:14px;">즐겨찾기가 없습니다.</p>';
    return;
  }
  content.innerHTML = `
    <ul style="list-style:none;display:flex;flex-direction:column;gap:6px;">
      ${favs.map((f, i) => {
        const cat = UnitData.getCategory(f.category);
        const fromU = UnitData.getUnit(f.category, f.from);
        const toU   = UnitData.getUnit(f.category, f.to);
        return `
          <li style="display:flex;align-items:center;justify-content:space-between;
            padding:10px 12px;background:var(--color-input-bg);
            border-radius:var(--radius-sm);font-size:13px;">
            <span class="fav-tab-item" data-category="${f.category}" data-from="${f.from}" data-to="${f.to}"
              style="cursor:pointer;flex:1;">
              ${cat?.icon} ${fromU?.label?.split(' ')[0]} → ${toU?.label?.split(' ')[0]}
            </span>
            <button class="fav-tab-del" data-index="${i}"
              style="background:none;border:none;cursor:pointer;color:var(--color-text-muted);font-size:16px;">✕</button>
          </li>`;
      }).join('')}
    </ul>
  `;

  content.querySelectorAll('.fav-tab-item').forEach(el => {
    el.addEventListener('click', () => {
      this.selectCategory(el.dataset.category);
      this.state.fromUnit = el.dataset.from;
      this.state.toUnit   = el.dataset.to;
      this.renderConverter();
    });
  });
  content.querySelectorAll('.fav-tab-del').forEach(btn => {
    btn.addEventListener('click', () => {
      const f = Storage.getFavorites()[parseInt(btn.dataset.index)];
      Storage.removeFavorite(f);
      this.renderFavoritesTab();
      this.renderFavoritesSidebar();
      this.updateFavToggle();
    });
  });
},

initTabEvents() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (btn.dataset.tab === 'history') this.renderHistoryTab();
      else this.renderFavoritesTab();
    });
  });
},

_relativeTime(ts) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1)  return '방금 전';
  if (min < 60) return `${min}분 전`;
  const h = Math.floor(min / 60);
  if (h < 24)   return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 7)    return `${d}일 전`;
  return new Date(ts).toLocaleDateString('ko-KR');
},
```

**Step 2: 브라우저 시각 확인**

- 하단 히스토리 탭: 환산 후 기록이 쌓임
- 항목 클릭 시 해당 환산 복원
- 즐겨찾기 탭: 별 버튼으로 추가한 항목 목록 표시

---

## Task 8: UI — 다크모드 & App 초기화

**Files:**
- Modify: `index.html` — 테마 로직 + App 객체 + DOMContentLoaded 초기화

**Step 1: 테마 시스템 작성**

```js
// UI 객체에 추가
initTheme() {
  const saved = Storage.getTheme();
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = saved === 'dark' || (saved === 'auto' && prefersDark);
  this._applyTheme(isDark ? 'dark' : 'light');

  document.getElementById('themeToggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    this._applyTheme(next);
    Storage.setTheme(next);
  });

  // 시스템 테마 변경 감지
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (Storage.getTheme() === 'auto') {
      this._applyTheme(e.matches ? 'dark' : 'light');
    }
  });
},

_applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('themeToggle').textContent = theme === 'dark' ? '☀️' : '🌙';
},
```

**Step 2: App 초기화 객체 작성**

```js
const App = {
  init() {
    // 사이드바 렌더링
    UI.renderSidebar();
    UI.renderFavoritesSidebar();
    UI.initSidebarEvents();

    // 환산 패널
    UI.renderConverter();

    // 하단 탭
    UI.renderHistoryTab();
    UI.initTabEvents();

    // 테마
    UI.initTheme();

    // 초기 카테고리 타이틀
    document.getElementById('topbarTitle').textContent =
      UnitData.getCategory(UI.state.category).label;
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
```

**Step 3: 브라우저 콘솔 검증**

```js
// 테마 전환 확인
document.getElementById('themeToggle').click();
console.assert(document.documentElement.getAttribute('data-theme') === 'dark', 'FAIL: 다크모드 전환 실패');
document.getElementById('themeToggle').click();
console.assert(document.documentElement.getAttribute('data-theme') === 'light', 'FAIL: 라이트모드 전환 실패');

// LocalStorage 테마 저장 확인
console.assert(Storage.getTheme() === 'light', 'FAIL: 테마 저장 실패');

console.log('Theme OK');
```

**Step 4: 전체 통합 시각 검증**

체크리스트:
- [ ] 12개 카테고리 사이드바에 표시
- [ ] 카테고리 클릭 → 환산 패널 단위 목록 변경
- [ ] From 입력 → To 실시간 계산
- [ ] 교체 버튼 동작
- [ ] 별 버튼으로 즐겨찾기 추가/삭제
- [ ] 히스토리 자동 기록 및 클릭 복원
- [ ] 다크모드 토글
- [ ] 페이지 새로고침 후 히스토리·즐겨찾기 유지
- [ ] 모바일 폭(< 768px)에서 햄버거 메뉴 동작

---

## Task 9: 마무리 검증 & 정리

**Step 1: 온도 환산 정확도 재확인**

```js
// 브라우저 콘솔
const checks = [
  [Converter.convert('temperature','C','F',0), 32],
  [Converter.convert('temperature','C','F',100), 212],
  [Converter.convert('temperature','F','C',32), 0],
  [Converter.convert('temperature','C','K',0), 273.15],
  [Converter.convert('length','mi','km',1), 1.609344],
];
checks.forEach(([got, expected], i) => {
  const ok = Math.abs(got - expected) < 0.0001;
  console.log(`Check ${i+1}: ${ok ? 'OK' : 'FAIL'} (got ${got}, expected ${expected})`);
});
```

**Step 2: 히스토리 50건 FIFO 재확인**

```js
Storage.clearHistory();
for (let i = 0; i < 60; i++) {
  Storage.addHistory({ category:'length', from:'m', to:'cm', fromVal: i, toVal: i*100 });
}
const hist = Storage.getHistory();
console.assert(hist.length === 50, `FAIL: ${hist.length}건`);
console.assert(hist[0].fromVal === 59, 'FAIL: 최신 항목이 맨 앞이 아님');
console.log('History FIFO OK');
```

**Step 3: 접근성 최종 점검**

- 키보드만으로 카테고리 탐색 가능 (Tab + Enter)
- 각 인터랙티브 요소에 `aria-label` 존재 확인
- 색상 대비 확인 (DevTools → Lighthouse 접근성 점수 90+ 목표)

---

## 완성 기준 체크리스트

- [ ] `index.html` 단일 파일로 서버 없이 실행
- [ ] 12개 카테고리 전체 환산 정확도 OK
- [ ] 즐겨찾기 추가/삭제/복원 동작
- [ ] 히스토리 50건 FIFO + 클릭 복원
- [ ] 다크모드 시스템 감지 + 수동 토글
- [ ] 반응형: 모바일(< 768px) 드로어 사이드바 + 데스크탑 2컬럼
- [ ] 새로고침 후 데이터 유지 (LocalStorage)
- [ ] 키보드 탐색 가능
