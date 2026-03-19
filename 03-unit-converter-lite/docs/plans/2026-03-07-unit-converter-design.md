# Unit Converter Lite - Design Doc

## Architecture

Multi-file structure:
- `index.html` — markup and layout
- `style.css` — styling
- `app.js` — all conversion logic and localStorage handling

No build tools, no dependencies, runs directly in browser.

## Categories & Units

| Category | Units |
|----------|-------|
| 길이 | mm, cm, m, km, inch, ft, mile |
| 무게 | mg, g, kg, ton, lb, oz |
| 온도 | °C, °F, K |
| 부피 | ml, L, cup, fl oz, gallon |
| 넓이 | cm², m², km², ft², acre |
| 속도 | m/s, km/h, mph, knot |

## Screen Layout

- Top: category tabs (6)
- Center: [From unit select] [input] → [To unit select] [result]
- Bottom: recent history (last 5 conversions)

## Data Flow

1. User selects category → load units for that category
2. User types value in From input → compute result in real-time
3. Result displays immediately (no submit button)
4. Swap button exchanges From/To units

## localStorage Schema

```json
{
  "lastCategory": "length",
  "lastUnits": {
    "length": { "from": "m", "to": "km" },
    "weight": { "from": "kg", "to": "lb" }
  },
  "history": [
    { "category": "length", "from": "1 m", "to": "0.001 km", "ts": 1234567890 }
  ]
}
```

- `lastCategory`: restore last active tab on reload
- `lastUnits`: per-category from/to unit memory
- `history`: last 5 conversions, shown at bottom
