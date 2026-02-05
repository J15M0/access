# Accessibility Widget

A self-contained, drop-in accessibility overlay for any website. Single JavaScript file, zero dependencies.

## Usage

Add one line before `</body>`:

```html
<script src="accessibility-widget.js"></script>
```

That's it. No build step, no config, no CDN account needed.

## Features

| Feature | Modes | Description |
|---------|-------|-------------|
| Contrast + | 3 | Invert colors, dark contrast, light contrast |
| Highlight Links | 1 | Outline and highlight all links |
| Bigger Text | 4 | Progressive text enlargement (112.5% - 175%) |
| Text Spacing | 3 | Letter and word spacing increase |
| Pause Animations | 1 | Stop all CSS animations and transitions |
| Hide Images | 1 | Remove all images from the page |
| Dyslexia Friendly | 2 | Dyslexia-optimized or legible font |
| Cursor | 3 | Big cursor, reading mask, reading guide |
| Tooltips | 1 | Enhanced tooltip display on hover |
| Line Height | 3 | 1.5x, 1.75x, 2x line height |
| Text Align | 4 | Left, right, center, justify |
| Saturation | 3 | Low saturation, high saturation, desaturate |

## Other Capabilities

- **Auto-contrast trigger button** - Samples the page background on load and scroll, picks a contrasting color so it never blends in
- **28px semi-transparent button** - 30% opacity at rest, fully opaque on hover
- **Alt+A** keyboard shortcut to open/close
- **localStorage** persistence across page loads
- **Move widget** left or right, or hide it (with an "Accessibility" tab to bring it back)
- **Oversized mode** for larger buttons
- **Reset all** button
- **Focus trap** in the panel dialog
- **Counter-filters** so the panel stays readable even when page colors are inverted

## Demo

Open `demo.html` in a browser or visit [brandt.pw/access](https://brandt.pw/access/).

## License

MIT
