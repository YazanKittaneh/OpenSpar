# Neo-Swiss Design System
**A structural design language for focus and clarity**

## Core Philosophy

- **Structural certainty over decorative clutter** - Guide the eye through hierarchy and geometry, not color and shadow
- **Industrial precision** - Every element aligned to an 8px baseline grid
- **Intentional asymmetry** - Strict alignment with bold composition choices
- **ADHD-optimized** - Reduce cognitive load through clear hierarchy and generous white space

---

## Typography

### Type Scale
- **Display Headers**: 32-48px, Line-height 1.1 (tight and architectural)
- **Body**: 14-16px, Line-height 1.5
- **Labels**: 10-12px All-caps Monospace, Letter-spacing 0.05em

### Font Pairing
- **Display/Headings**: Bold Grotesque Sans (geometric, neutral)
- **Body**: Regular Grotesque Sans
- **Technical/Labels**: Monospace (for tags, codes, system messages)

**Never use**: Inter, Roboto, Arial, system fonts

---

## Color System

### Primary Palette
```
Black: #000000         (Primary actions, headers)
White: #FFFFFF         (Text on dark, backgrounds)
Signal Orange: #FF4500 (Active states, CTAs, alerts)
```

### Utility Colors
```
Inactive: 40% opacity of Black (#000000 @ 0.4)
Borders: 1px solid Black or White
```

### Rules
- **No gradients** (except as intentional background textures)
- **No shadows** (flat depth hierarchy only)
- **High contrast** at all times

---

## Components

### Buttons

**Primary**
- Solid background (Black or Signal Orange)
- White bold sans text
- No shadows, no border-radius (or max 4px)
- Padding: 24px horizontal × 12px vertical

**Secondary**
- 1px border (Black or White)
- Transparent background
- Same padding as Primary

**Tertiary/Text**
- All-caps Monospace
- Prefix: `>` or `+`
- No background or border

---

### Inputs

**Style: "Invisible Field"**
- Single 1px hairline at bottom (no box)
- Label: 10pt All-caps Monospace above field (`TASK_NAME`)
- **Active state**: Bottom line → Signal Orange or 2px thickness
- **Validation**: Text signals like `[ERROR: REQUIRED]` (no icons)

---

### Toggles & Selection

**Style: "Mechanical Switch"**
- Segmented control (not iOS thumb slider)
- 1px box split into segments
- Active: Solid Black fill
- Inactive: Transparent with thin border
- Labels: Text inside box (`[ON]` `[OFF]`)

---

## Layout & Spacing

### The 8px Baseline Grid
Every element must align to multiples of 8px.

**Standard Gaps**
```
Small:     16px  (Between related items)
Medium:    32px  (Between sections)
Large:     64px  (Between major sections)
```

### Asymmetric Composition

**The "Heavy" Side** (Left)
- Largest text (Headers)
- Primary content
- Bold, dominant elements

**The "Light" Side** (Right)
- Small data points
- Monospace tags
- Metadata

**White Space Rule**
- Single-task screens: Anchor top, leave bottom 70% empty
- Reduces choice paralysis
- Never force-center lone elements

---

## CSS/Technical Constraints

| Property | Value | Rationale |
|----------|-------|-----------|
| `border-radius` | `0px` to `4px` | Industrial, engineered feel |
| `letter-spacing` | `0.05em` (all-caps) | Legibility for technical labels |
| `box-shadow` | `none` | Flat depth hierarchy only |
| `opacity` | `0.4` for inactive | Clear differentiation |
| `line-height` | `1.1` (headers)<br>`1.5` (body) | Architectural solidity vs readability |

---

## Backgrounds & Atmosphere

Instead of solid colors, create depth through:

- **Geometric patterns** (Swiss grid overlays)
- **Noise textures** (subtle grain at 3-5% opacity)
- **Diagonal divisions** (split screens with hard edges)
- **Layered transparencies** (overlapping panels with opacity)

**Never**: Drop shadows, glows, 3D effects

---

## Motion & Interaction

### Animation Principles
- **CSS-only** where possible
- **High-impact moments** > scattered micro-interactions
- **Staggered reveals** on page load (use `animation-delay`)

### Effects
- Hover: Color inversion or border color change (instant, no transition)
- Active: 2px bottom border or background fill
- Loading: Horizontal bar progress (not spinners)

---

## Accessibility

- **Minimum contrast**: 4.5:1 for body text, 3:1 for large text
- **Focus indicators**: 2px solid Signal Orange outline
- **Motion**: Respect `prefers-reduced-motion`
- **Screen readers**: Semantic HTML, proper ARIA labels

---

## Anti-Patterns

**Never use:**
- Rounded pill buttons
- Centered layouts for sparse content
- Multiple competing accent colors
- Decorative icons without function
- Soft shadows or blurs
- Generic sans-serif system fonts

---

## Implementation Files

- **Tailwind Config**: `tailwind.neo-swiss.config.js`
- **CSS Variables**: `neo-swiss.css`
