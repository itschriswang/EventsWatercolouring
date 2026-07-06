# EventsWatercolouring Design System Guide

## Shadow Palette: No Grey Shadows

**Critical Rule: Never use grey, black, or neutral shadows. All shadows must use tinted, editorial colours from the site's palette.**

### Why
The site uses a soft, watercolour-inspired aesthetic (Pastel Aurora: powder blue, azure, dusty periwinkle, soft lilac, blush rose, warm apricot, sage glow). Grey/black shadows break the editorial feel and read as dead pixels against the tinted pastel palette. Token names in code (terracotta, rust, ochre, ...) are legacy slot names — their values now point at the pastel scheme's anchors.

### Approved Shadow Colours

All shadows must use these RGBA values (or derived variants at +15% vibrancy):

| Colour | Use Case | RGBA |
|--------|----------|------|
| **Azure** (token: terracotta) | Primary lift shadows, cards, general elevation | `rgba(61,101,158,0.30)` |
| **Dusty Rose** (token: rust) | Timeline markers, strong shadows | `rgba(122,54,74,0.52)` |
| **Deep Ink** | Deep shadows on overlays, keepsake cards | `rgba(47,52,80,0.58)` |
| **Ink** | Paper shadows, subtle depth | `rgba(47,52,80,0.21)` |
| **Lilac** | Accent shadows (form elements, special cases) | `rgba(94,74,140,0.25)` |

### Component Shadow Reference

**Hero Cards** (primary & accent):
```
shadow-[0_28px_52px_-18px_rgba(61,101,158,0.30),0_6px_16px_-6px_rgba(61,101,158,0.12)]
```

**Timeline Markers**:
```
shadow-[0_2px_12px_rgba(122,54,74,0.52)]  /* Primary marker */
shadow-[0_2px_12px_rgba(122,54,74,0.40)]  /* Numbered dots */
```

**Gallery/Lightbox Images**:
```
shadow-[0_28px_60px_-10px_rgba(61,101,158,0.65)]  /* Strong azure for modal */
```

**Package Cards**:
```
shadow-[0_24px_50px_-20px_rgba(61,101,158,0.32)]  /* Primary shadow */
shadow-[0_24px_50px_-20px_rgba(61,101,158,0.25)]  /* Secondary shadow */
```

**Keepsake Cards** (What You Keep):
```
shadow-[0_10px_30px_-18px_rgba(47,52,80,0.58)]
```

**Enquire Form**:
```
drop-shadow(0 18px 38px rgba(47,52,80,0.21))     /* Paper drop shadow */
drop-shadow(0 2.5px 3px rgba(94,74,140,0.25))    /* Accent shadow */
```

### Adding New Shadows

When adding shadows to new components:

1. **Pick a base colour** from the approved list above
2. **Match the site's aesthetic**: Use azure or dusty rose for most cases
3. **Adjust opacity as needed**, but keep RGB values within the palette
4. **Test on dark backgrounds** (like the rust timeline) to ensure visibility
5. **Never use**: `rgba(0,0,0,...)`, `rgba(128,128,128,...)`, or any neutral greys

### Vibrancy Guidelines

- **+15% increase** for enhanced visual impact (standard for hover/active states)
- **-15% decrease** for subtle background shadows
- Formula: Multiply both RGB and alpha by the percentage (e.g., `0.30 * 1.15 ≈ 0.35`)

### Files Containing Shadows

- `src/components/Hero.jsx`
- `src/components/EveningTimeline.jsx`
- `src/components/SelectedWork.jsx`
- `src/components/Packages.jsx`
- `src/components/WhatYouKeep.jsx`
- `src/components/EnquireForm.jsx`
- `src/components/Footer.jsx`

### Design Philosophy

Shadows in this project serve **editorial depth**, not functional elevation. Every shadow should feel like it belongs in a high-end watercolour or arts publication—warm, organic, and intentional. The tinted tones make elements feel like they're painted on paper rather than floating on glass.
