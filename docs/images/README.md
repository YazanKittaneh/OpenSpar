# 📸 Screenshots & Media Guide

This directory contains all visual assets for the Debate Arena project.

## 📁 File Structure

```
docs/images/
├── banner.svg              # Source SVG banner (edit this)
├── banner.png              # Exported banner for README (2400x600)
├── setup-interface.png     # Screenshot of setup page
├── debate-arena.png        # Screenshot of live debate
├── winner-banner.png       # Screenshot of winner announcement
├── dark-mode.png           # Screenshot in dark mode
├── light-mode.png          # Screenshot in light mode
├── mobile-view.png         # Mobile responsive view
└── README.md               # This file
```

---

## 🎨 Banner Design

The banner follows the **Neo-Swiss Design System**:

- **Colors**: Black (#000000), White (#FFFFFF), Signal Orange (#FF4500)
- **Typography**: Bold grotesque sans-serif, monospace for technical labels
- **Layout**: Asymmetric with "heavy" left side, "light" right side
- **Elements**: Grid patterns, geometric shapes, minimal ornamentation

### How to Export

```bash
# Using Inkscape (free)
inkscape docs/images/banner.svg --export-filename=docs/images/banner.png --export-width=2400

# Or open in Figma/Illustrator and export as PNG
```

**Recommended Sizes:**
- **GitHub Social Preview**: 1280×640px
- **README Header**: 2400×600px (retina)
- **Twitter Card**: 1200×600px

---

## 📷 Taking Screenshots

### Setup Interface
1. Start the dev server: `npm run dev`
2. Open http://localhost:3000
3. Fill in example data:
   - Topic: "Should AI be regulated?"
   - Models: Claude 3.5 Sonnet vs GPT-4
   - Max turns: 10
4. Screenshot the full page
5. Save as: `setup-interface.png`

### Live Debate Arena
1. Start a debate
2. Let it run for 3-4 turns
3. Capture the debate in progress
4. Make sure to show:
   - Both debater cards
   - Current speaker highlighting
   - Moderator controls
   - Scrollable history
5. Save as: `debate-arena.png`

### Winner Banner
1. Let a debate complete
2. Screenshot the winner announcement
3. Ensure it shows:
   - Winner name prominently
   - Victory reasoning
   - "New Debate" link
4. Save as: `winner-banner.png`

### Dark/Light Mode
1. Toggle theme using the theme switcher
2. Take screenshots of the same view in both modes
3. Save as: `dark-mode.png` and `light-mode.png`

### Mobile View
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl/Cmd + Shift + M)
3. Select iPhone 12 Pro or similar
4. Navigate through setup → debate → winner
5. Save mobile screenshot as: `mobile-view.png`

---

## 🛠️ Tools

**Free Screenshot Tools:**
- **macOS**: Cmd + Shift + 4 (selection), Cmd + Shift + 5 (window)
- **Windows**: Win + Shift + S (Snipping Tool)
- **Linux**: flameshot, gnome-screenshot
- **Browser DevTools**: Full page capture

**Image Optimization:**
```bash
# Using pngquant (install: brew install pngquant)
pngquant --quality=65-80 setup-interface.png

# Or use TinyPNG.com for web optimization
```

---

## 📝 Best Practices

1. **Clean Browser**: Hide bookmarks bar, use clean browser profile
2. **Consistent Size**: Use 1440×900 or 1920×1080 viewport
3. **Example Data**: Use realistic, engaging debate topics
4. **Privacy**: No real API keys visible in screenshots
5. **Retina**: Export at 2x resolution for crisp display

---

## 🎥 Video Demo

For the video thumbnail:
1. Create a frame from your demo video
2. Or design a custom thumbnail (1280×720)
3. Upload video to YouTube
4. Update README.md with your video link

---

## 🚀 Contributing Screenshots

Have a great debate you want to showcase?

1. Take screenshots following the guide above
2. Save to this directory with descriptive names
3. Submit a PR with your images
4. We'll feature the best debates in the README!

**Filename Format:**
- `debate-[topic]-[model-a]-vs-[model-b].png`
- Example: `debate-ai-ethics-claude-vs-gpt4.png`

---

## 📐 Design Tokens Reference

When creating additional assets:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-black` | #000000 | Backgrounds, text |
| `--color-white` | #FFFFFF | Text on dark |
| `--color-signal` | #FF4500 | CTAs, accents, highlights |
| `--font-display` | System sans-serif | Headers |
| `--font-mono` | SF Mono, monospace | Labels, code |
| `--spacing-unit` | 8px | Grid baseline |

See `DESIGN.md` for complete design system documentation.
