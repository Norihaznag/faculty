# iTunes-Inspired UI Design System

## Color Palette Reference

### Primary Colors
```
Background:    #fafafa (RGB: 250, 250, 250)   - Off-white background
Foreground:    #212121 (RGB: 33, 33, 33)      - Near-black text
Primary:       #0085ff (RGB: 0, 133, 255)     - iTunes blue accent
```

### Secondary Colors
```
Secondary:     #f3f3f3 (RGB: 243, 243, 243)   - Subtle background
Border:        #e5e5e5 (RGB: 229, 229, 229)   - Borders & dividers
Muted:         #737373 (RGB: 115, 115, 115)   - Secondary text
```

## CSS Variables (from app/globals.css)

```css
:root {
  --primary: 213 100% 52%;        /* iTunes Blue */
  --primary-foreground: 0 0% 100%;
  
  --background: 0 0% 98%;         /* Off-white */
  --foreground: 0 0% 13%;         /* Near-black */
  
  --secondary: 0 0% 95%;          /* Light gray */
  --secondary-foreground: 0 0% 13%;
  
  --border: 0 0% 90%;             /* Border gray */
  --input: 0 0% 90%;              /* Input border */
  --ring: 213 100% 52%;           /* Focus ring (blue) */
  
  --muted: 0 0% 45%;              /* Muted text */
  
  --destructive: 0 84.2% 60.2%;   /* Red for errors */
  --radius: 8px;                  /* Rounded corners */
}
```

## Typography Scale

### Headings
- **H1**: 2.5rem (40px) - Page titles
- **H2**: 2rem (32px) - Section titles
- **H3**: 1.5rem (24px) - Subsections
- **H4**: 1.25rem (20px) - Minor headings

### Body Text
- **Regular**: 1rem (16px)
- **Small**: 0.875rem (14px)
- **Smaller**: 0.75rem (12px)

### Font Families
- **Headings**: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
- **Body**: Same system font stack for consistency

## Component Sizes

### Spacing (Tailwind scale)
```
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 2.5rem (40px)
```

### Border Radius
- Small: 4px (rounded)
- Default: 8px (slightly rounded, iTunes-style)
- Large: 12px (more rounded)

### Box Shadows
```
sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
md: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
```

## Component Styling Guide

### Header
```
Background: bg-white/80 (semi-transparent white)
Border: border-b border-border (light gray divider)
Text: text-foreground (dark text)
Input: bg-secondary (light gray background)
Accent: text-primary (blue buttons and icons)
```

### Sidebar
```
Background: bg-white (white)
Border: border-r border-border (light divider)
Active Item: bg-primary/10 text-primary (light blue background with blue text)
Hover: bg-secondary (light gray on hover)
Text: text-foreground (dark, muted on secondary)
```

### Cards
```
Background: bg-white (white)
Border: border border-border (light gray)
Padding: p-4 to p-6 (comfortable spacing)
Shadow: shadow-sm (subtle depth)
Hover: hover:shadow-md (slightly more shadow)
```

### Buttons
```
Primary:
  - Background: bg-primary (#0085ff)
  - Text: text-white
  - Hover: hover:bg-blue-600
  - Focus: focus:ring-2 ring-primary/50

Secondary:
  - Background: bg-secondary
  - Text: text-foreground
  - Hover: hover:bg-border
  - Border: border border-border

Ghost:
  - Background: transparent
  - Text: text-foreground
  - Hover: hover:bg-secondary
```

### Inputs & Forms
```
Background: bg-white or bg-secondary
Border: border border-border
Text: text-foreground
Placeholder: text-muted
Focus: focus:border-primary focus:ring-2 ring-primary/20
```

### Links
```
Default: text-primary (blue)
Hover: hover:underline
Active: text-primary font-medium
```

## Responsive Breakpoints
```
Mobile:   < 640px  (sm)
Tablet:   640px    - 1024px (md, lg)
Desktop:  ≥ 1024px (lg, xl)
```

## Layout Patterns

### Main Grid Layout
```
Desktop: grid-cols-[320px_1fr]  (320px sidebar + flexible main)
Mobile:  grid-cols-1            (full-width, sidebar toggleable)
```

### Component Spacing
```
Container padding: px-4 sm:px-6 lg:px-8
Section margin: mb-6 sm:mb-8
Content max-width: max-w-4xl (896px)
```

## Interactive States

### Normal
- Foreground text color
- Subtle border
- No shadow

### Hover
- Slightly lighter background or darker text
- Smooth transition (duration-200)

### Focus
- Ring outline (primary blue)
- Ring offset for visibility

### Active/Selected
- Primary blue background with text
- Medium emphasis

### Disabled
- Reduced opacity (opacity-50)
- Cursor not-allowed

## Motion & Transitions

### Standard Transition
```css
transition-all duration-200 ease-out
```

### Durations
- Quick: 150ms (very fast interactions)
- Standard: 200ms (normal interactions)
- Slow: 300ms (important transitions)

### Easing
```
ease-out: Feels responsive
ease-in-out: Feels smooth
linear: For technical animations
```

## Accessibility Guidelines

### Color Contrast
- Text on background: 12:1+ (AAA standard)
- Interactive elements: 3:1+ (AA standard)
- Focus indicators: Always visible

### Typography
- Line-height: 1.5-1.6 for body text (readable)
- Font-size: Minimum 16px for touch targets
- Letter-spacing: Normal (default) for readability

### Interactive Elements
- Minimum touch target: 44x44px
- Keyboard navigation: Logical tab order
- Focus indicators: Visible at all times

## Dark Mode Consideration
Currently implemented as light theme. Dark mode can be added by:
1. Toggling `dark` class on `<html>` element
2. Creating dark color variables in CSS
3. Using conditional Tailwind classes: `dark:bg-slate-900`

## Brand Alignment
✅ iTunes-inspired minimal design
✅ Professional educational platform
✅ Modern, clean aesthetic
✅ Apple-like simplicity and elegance
✅ Focus on content hierarchy

---

**Design System Version**: 1.0
**Last Updated**: Today
**Theme**: iTunes-Inspired Light
