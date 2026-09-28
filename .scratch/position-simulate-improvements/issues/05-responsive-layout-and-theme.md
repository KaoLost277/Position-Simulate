# 05: Responsive layout and theme

**What to build:** A trader can use the whole calculator comfortably on a phone down to 320px wide and on desktop. The two cards stack vertically on narrow screens and sit side by side on wide screens, with no fixed pixel heights or widths that clip content. Light and dark modes both render correctly across the inputs, outputs, history table, and controls. The visual identity and two-card layout are retained.

**Blocked by:** 03: Trade sequence with live equity curve

**Status:** ready-for-agent

- [ ] The layout is usable from 320px wide through desktop; no horizontally clipped or overlapping content.
- [ ] The Setting and Output cards stack on narrow screens and sit side by side on wide screens.
- [ ] All fixed pixel heights/widths that cause clipping are removed in favor of responsive sizing.
- [ ] Light and dark modes both render legibly across inputs, outputs, history, and buttons.
- [ ] The two-card layout and overall visual identity are preserved.
- [ ] No React or console warnings attributable to layout changes.
- [ ] `CI=true npm run build` stays warning-free.
