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
      lb: 453.59237, oz: 28.349523125
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
      ml: 1, L: 1000, cup: 236.5882365,
      'fl oz': 29.5735295625, gallon: 3785.411784
    }
  },
  area: {
    label: '넓이',
    base: 'm²',
    units: {
      'cm²': 0.0001, 'm²': 1, 'km²': 1000000,
      'ft²': 0.09290304, acre: 4046.8564224
    }
  },
  speed: {
    label: '속도',
    base: 'm/s',
    units: {
      'm/s': 1, 'km/h': 1/3.6, mph: 0.44704, knot: 1852/3600
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
