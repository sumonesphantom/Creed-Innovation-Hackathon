# ShockPlan UI Theme Reference

Inspired by the Crextio HR dashboard design — clean, minimal, modern productivity aesthetic.

---

## Color Palette

### Primary Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-accent` | `#F5C518` | Primary yellow accent — CTAs, highlights, active states, progress fills |
| `--color-dark` | `#1A1A1A` | Near-black — dark cards, dark nav elements, dark badges |
| `--color-white` | `#FFFFFF` | Card backgrounds, panels |

### Background Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg-base` | `#EFEFEF` | Outer page background (light cool gray) |
| `--color-bg-surface` | `#FAFAFA` | Main app container / inner surface |
| `--color-bg-card` | `#FFFFFF` | Widget/card backgrounds |
| `--color-bg-dark-card` | `#222222` | Dark-mode cards (e.g. onboarding task panel) |
| `--color-bg-accent-tint` | `#FEFAE8` | Subtle yellow-tinted background (top-right gradient area) |

### Text Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-text-primary` | `#111111` | Main headings, large numbers |
| `--color-text-secondary` | `#666666` | Subheadings, labels, secondary info |
| `--color-text-muted` | `#AAAAAA` | Placeholder text, inactive items |
| `--color-text-on-dark` | `#FFFFFF` | Text on dark cards |
| `--color-text-on-accent` | `#FFFFFF` | Text on yellow accent backgrounds |

### State / Semantic Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | `#F5C518` | Completed tasks (reuse accent yellow) |
| `--color-inactive` | `#C8C8C8` | Incomplete tasks, empty progress |
| `--color-dark-pill` | `#333333` | Dark pill/badge background |

---

## Typography

### Font Family
- **Primary**: `Inter`, `Poppins`, or any clean geometric sans-serif
- **Fallback**: `system-ui`, `-apple-system`, `sans-serif`

### Scale
| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Hero number (stat counters) | `56–72px` | `300–400` (light/regular) | 1.0 |
| Section heading | `22–28px` | `500` (medium) | 1.2 |
| Card title | `18–20px` | `500` | 1.3 |
| Body / label | `13–15px` | `400` | 1.5 |
| Caption / meta | `11–12px` | `400` | 1.4 |
| Highlighted value (e.g. "6.1h") | `36–42px` | `300–400` | 1.0 |

### Notes
- Large stat numbers use **light to regular** weight for an airy, modern feel
- No italic usage; all text is upright
- Letter spacing: slightly negative (`-0.02em`) on large headings

---

## Spacing & Layout

### Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| `--radius-card` | `10px` | Main cards / widget containers |
| `--radius-pill` | `999px` | Progress bars, badges, nav active states |
| `--radius-button` | `8px` | Buttons |
| `--radius-icon-bg` | `8px` | Small icon containers |
| `--radius-app` | `12px` | Outer app container |

### Border
- Color: `#E8E8E8` — very light, barely-there border
- Width: `1px`
- Use `border` only for structural separation; never as decoration
- On white cards over `#EFEFEF` background, a `1px #E8E8E8` border is enough — no shadow needed

### Shadow
| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-card` | `0 1px 4px rgba(0,0,0,0.05)` | Cards (very subtle) |
| `--shadow-elevated` | `0 4px 16px rgba(0,0,0,0.08)` | Modals, tooltips |
| `--shadow-none` | `none` | Flat elements inside cards |

### Grid / Padding
- Page padding: `24px` horizontal
- Card internal padding: `16px`
- Gap between cards: `12px`
- Dashboard uses a **4-column grid** at large breakpoints
- Cards span 1–2 columns depending on content width

---

## Component Patterns

### Navigation Bar
- Horizontal top nav, full width
- Logo on far left (rounded outline pill style)
- Nav items centered, plain text, no underline
- **Active state**: Dark pill/badge background (`#1A1A1A`) with white text, rounded `999px`
- Right icons: gear (settings), bell (notifications), user avatar

### Stat Counter Cards (KPI numbers)
- Large number in light weight (`56–72px`)
- Small icon above the number (gray, `20px`)
- Label below in muted text (`12px`)
- No card border, sits directly on background

### Progress Bars
- Pill shape (`border-radius: 999px`)
- Dark variant: dark background (`#1A1A1A`), white text label inside
- Yellow variant: yellow fill (`#F5C518`), dark text inside
- Gray variant: light gray fill, gray text
- Height: `32–36px` for prominent bars

### Cards / Widgets
- White background, `border-radius: 10px`
- `1px` border in `#E8E8E8` — very light, just enough for definition
- Minimal shadow (`--shadow-card`) or no shadow if border is present
- Arrow icon (`↗`) top-right for expand/navigate
- Internal padding: `16px`

### Bar Chart
- Bars are rounded pill-shaped (`border-radius: 999px`)
- Default bar color: dark gray / charcoal `#333333`
- Active/current bar: yellow accent `#F5C518` with a floating label above
- Dots below each bar for day labels
- Minimal axis — no gridlines, no borders

### Circular Progress (Time Tracker)
- Large circular ring, thick stroke (~`10–14px`)
- Yellow fill arc on gray/light track
- Center: large time value, small label below
- Play / Pause buttons below with rounded backgrounds
- Dark alarm/timer button on far right

### Dark Card (Onboarding Task Panel)
- Background: `#222222`
- White text for titles
- Task items in a list with icon on left, date below, status dot/check on right
- Completed items: yellow checkmark `#F5C518`
- Incomplete items: gray dot
- Strikethrough text on completed items

### Calendar Widget
- Month label centered, prev/next month as muted side labels
- Days of week row in muted caps
- Date numbers plain, current date slightly bold
- Event cards: dark background (`#1A1A1A`), white text, rounded `12px`, avatar cluster on right
- Events span columns based on duration

### Accordion / Expandable Rows
- Flat rows with label on left, chevron icon on right
- No background, just a bottom border separator
- Expanded state shows child content below

### Profile Card
- Full-height image with a dark gradient overlay at bottom
- Name in white bold text, role below in lighter weight
- Pill badge at bottom-right: white background, dark text, `border-radius: 999px`

---

## Tailwind CSS Tokens (for `tailwind.config.ts`)

```ts
theme: {
  extend: {
    colors: {
      accent: '#F5C518',
      dark: '#1A1A1A',
      surface: '#FAFAFA',
      card: '#FFFFFF',
      'card-dark': '#222222',
      'bg-tint': '#FEFAE8',
      muted: '#AAAAAA',
    },
    borderRadius: {
      card: '10px',
      app: '12px',
    },
    fontFamily: {
      sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
    },
    boxShadow: {
      card: '0 1px 4px rgba(0,0,0,0.05)',
      elevated: '0 4px 16px rgba(0,0,0,0.08)',
    },
  },
}
```

---

## Design Principles

1. **Light borders** — Cards use a `1px #E8E8E8` border; barely visible, just enough to define edges
2. **Yellow = action** — Yellow is reserved for the single primary accent; never used decoratively
3. **Big numbers, light weight** — Stats use large type in light/regular weight (not bold) for an airy feel
4. **Dark & light contrast** — Dark cards are used sparingly for emphasis (task lists, nav active states)
5. **Gently rounded** — `border-radius: 10px` on cards, `8px` on buttons/icons; rounded but not pill-shaped
6. **Compact layout** — `16px` card padding, `12px` gaps; content-dense without feeling cramped
7. **Monochrome base + one accent** — The entire palette is black/white/gray + yellow only
