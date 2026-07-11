# UI/UX & Design Guidelines

This guidelines document specifies the design tokens, component standards, typography, accessibility constraints, and motion parameters to maintain a premium visual experience across the Prarthna applications.

## Design Tokens & Color Palette

We utilize a premium, dark-mode first design system:

- **Background:** Core background is `#09090B` (zinc 950). Sidebar / elevated headers use `#0C0C0E` (custom neutral black).
- **Cards/Containers:** `#18181B` (zinc 900) with thin `#1F1F23` (zinc 850) or `#27272A` (zinc 800) borders.
- **Brand Accents:** `#F97316` (orange 500) and `#EAB308` (yellow/gold 500).
- **Text:** White for headings (`#FFFFFF`), Zinc 300/400 for copy, and Zinc 500 (`#71717A`) for labels/metadata.

## Typography Guidelines

- **Sanskrit/Hindi Texts:** Sanskrit shlokas and Devanagari text must use fonts that render ligatures correctly, such as _Rozha One_, _Yatra One_, or _Martel_ from Google Fonts, or system fallbacks like _Lohit Devanagari_ or _Mangal_.
- **Latin Fonts:** Standard application copy uses clean modern sans-serif typefaces such as _Inter_ or _Outfit_.
- **Formatting:** Shlokas should be centered, have high line spacing (1.8), and be wrapped in a visually distinct elevated container.

## Accessibility (A11y)

- **Contrast:** Maintain a minimum contrast ratio of 4.5:1 for standard text and 3:1 for large text or icons.
- **Dynamic Text Scaling:** Flutter mobile widgets must wrap text overflow fields in `Flexible` or `SingleChildScrollView` to prevent layout overflows when the user scales system text sizes.
- **Screen Reader Support:** Use `Semantics` widgets in Flutter and semantic HTML5 tags (`<main>`, `<header>`, `<nav>`) in Next.js.
