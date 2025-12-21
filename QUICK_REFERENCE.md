# EduHub iTunes-Inspired Light Theme - Quick Reference Guide

## 🎨 Color Palette Quick Reference

### Primary Colors
```
Primary Blue:         #0085ff (Tailwind: [primary] bg-primary text-primary)
Background:           #fafafa (Tailwind: bg-background)
Foreground (Text):    #212121 (Tailwind: text-foreground)
Secondary Gray:       #f3f3f3 (Tailwind: bg-secondary)
Border:               #e5e5e5 (Tailwind: border-border)
```

### Text Colors
```
Primary Text:         #212121 (Tailwind: text-foreground)
Secondary Text:       #737373 (Tailwind: text-muted)
Accent Text:          #0085ff (Tailwind: text-primary)
```

### Component Usage
```tsx
// Header
className="bg-white/80 border-b border-border"

// Sidebar
className="bg-white border-r border-border"

// Main Content
className="bg-background"

// Cards
className="bg-white border border-border rounded-lg p-6"

// Buttons
className="bg-primary text-white hover:bg-blue-600"

// Links
className="text-primary hover:underline"

// Active States
className="bg-primary/10 text-primary"

// Hover States
className="hover:bg-secondary transition-colors"
```

---

## 📐 Layout Classes

### Main Layout Grid
```tsx
<div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] min-h-screen bg-background">
  {/* Sidebar: 320px on desktop, hidden on mobile */}
  {/* Main: full width on mobile, flex on desktop */}
</div>
```

### Reading Column (Centered Content)
```tsx
<div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
  {/* Content automatically centered and constrained */}
</div>
```

### Sidebar Container
```tsx
className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-white border-r border-border"
```

### Header (Fixed)
```tsx
className="sticky top-0 z-40 h-16 bg-white/80 border-b border-border"
```

---

## 🔤 Typography Classes

### Headings (Light Theme)
```tsx
// H1 - Page/Article Titles
<h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">

// H2 - Major Sections
<h2 className="text-3xl md:text-4xl font-bold text-foreground leading-snug mt-8 mb-4">

// H3 - Subsections
<h3 className="text-2xl md:text-3xl font-semibold text-foreground leading-snug mt-6 mb-3">

// H4 - Minor Headings
<h4 className="text-xl md:text-2xl font-semibold text-foreground mt-5 mb-2">
```

### Body Text
```tsx
// Regular paragraph
<p className="text-base leading-relaxed text-foreground mb-4">

// Small text
<span className="text-sm text-muted">

// Very small (metadata)
<span className="text-xs text-muted">
```

### Code & Pre
```tsx
// Inline code
<code className="bg-secondary text-foreground px-2 py-1 rounded text-sm">

// Code block
<pre className="bg-secondary border border-border rounded-lg p-4">
  <code>...</code>
</pre>
```

---

## 🔗 Interactive Elements

### Buttons
```tsx
// Primary (Blue)
<Button className="bg-primary hover:bg-blue-600 text-white">

// Secondary (Light)
<Button variant="secondary" className="bg-secondary hover:bg-border text-foreground border border-border">

// Ghost (Text only)
<Button variant="ghost" className="text-primary hover:text-accent hover:bg-secondary">
```

### Links
```tsx
// Default
<a className="text-primary hover:underline transition-colors">

// Within paragraphs
<a className="text-primary underline hover:text-blue-600">
```

### Input Fields
```tsx
<Input className="bg-white border-border text-foreground placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary/20">
```

### Badges & Tags
```tsx
// Primary tag
<Badge className="bg-primary text-white">

// Outline tag
<Badge variant="outline" className="border-border text-foreground hover:bg-secondary">
```

---

## 📱 Responsive Breakpoints

```tsx
// Mobile first
<div className="px-4 py-4">  // Mobile: 16px padding

// Tablet+
<div className="sm:px-6">    // 640px+

// Desktop+
<div className="lg:px-8">    // 1024px+

// Extra large
<div className="xl:...">     // 1280px+
<div className="2xl:...">    // 1536px+
```

---

## ♿ Accessibility Classes

### Focus Ring
```tsx
className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
```

### Screen Reader Only
```tsx
className="sr-only" // Tailwind built-in
```

### Visual Focus Indicator
```tsx
className="focus-visible:ring-2 focus-visible:ring-primary"
```

---

## 🧩 Component Patterns

### Sidebar Section
```tsx
<div>
  <h3 className="px-3 text-xs font-semibold text-muted uppercase tracking-wide mb-2">
    Section Title
  </h3>
  <div className="space-y-1">
    {/* Items */}
  </div>
</div>
```

### Card Component
```tsx
<div className="bg-white border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
  {/* Content */}
</div>
```

### Navigation Item
```tsx
<Link
  href="/"
  className={cn(
    'flex items-center space-x-3 px-3 py-2 rounded transition-all text-sm',
    isActive
      ? 'bg-primary/10 text-primary font-medium'
      : 'text-foreground hover:bg-secondary'
  )}
>
  <Icon className="h-4 w-4" />
  <span>Label</span>
</Link>
```

### Search Input
```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
  <Input
    placeholder="Search..."
    className="pl-9 bg-secondary border-border text-foreground"
  />
</div>
```

---

## 🎨 Common Component Combinations

### Alert/Info Box
```tsx
<div className="bg-secondary border border-border rounded-lg p-4 text-foreground">
  <h4 className="font-semibold text-foreground mb-2">Note</h4>
  <p>Information text here</p>
</div>
```

### Empty State
```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="text-5xl mb-4">📚</div>
  <h3 className="text-xl font-semibold text-foreground mb-2">No lessons yet</h3>
  <p className="text-muted">Add some content to get started</p>
</div>
```

### Loading Skeleton
```tsx
<div className="space-y-3">
  <div className="h-4 bg-secondary rounded animate-pulse w-3/4" />
  <div className="h-4 bg-secondary rounded animate-pulse w-full" />
  <div className="h-4 bg-secondary rounded animate-pulse w-4/5" />
</div>
```

---

## 📚 Updated Component Files

### Files You Can Use in Your Pages

#### 1. LessonHeader Component
```tsx
import { LessonHeader } from '@/components/lessons/lesson-header';

<LessonHeader
  title="Advanced Calculus"
  author={{ full_name: 'Dr. Smith' }}
  views={1234}
  semester="Fall 2024"
  tags={[
    { id: '1', name: 'Mathematics', slug: 'mathematics' },
    { id: '2', name: 'Calculus', slug: 'calculus' }
  ]}
/>
```

---

## 🔄 Theme Color CSS Variables

All available in your Tailwind config:

```css
/* Primary - iTunes Blue */
--primary: 213 100% 52%;          /* #0085ff */
--primary-foreground: 0 0% 100%;  /* white */

/* Backgrounds */
--background: 0 0% 98%;           /* #fafafa */
--foreground: 0 0% 13%;           /* #212121 */
--secondary: 0 0% 95%;            /* #f3f3f3 */

/* Borders & Input */
--border: 0 0% 90%;               /* #e5e5e5 */
--input: 0 0% 90%;
--ring: 213 100% 52%;             /* blue focus ring */

/* Text Levels */
--muted: 0 0% 45%;                /* #737373 */
--muted-foreground: 0 0% 45%;

/* Status */
--destructive: 0 84.2% 60.2%;     /* #f87171 (red) */
```

---

## 🚀 Implementation Tips

### When Creating New Pages
1. Use `max-w-4xl mx-auto px-4` for centered content
2. Use `text-foreground` for primary headings
3. Use `text-foreground` for body text (muted for secondary)
4. Use `bg-primary` for action buttons
5. Use `text-primary` for links
6. Use `bg-white border border-border` for cards
7. Use `bg-secondary` for secondary backgrounds

### When Styling Components
```tsx
// DO - Use Tailwind utilities
className="bg-white text-foreground border border-border"

// DON'T - Use inline styles
style={{ backgroundColor: '#ffffff' }}

// DO - Use cn() for conditional classes
className={cn(
  'base classes',
  isActive && 'active-classes'
)}
```

### When Adding New Colors
Edit `app/globals.css` CSS variables, NOT Tailwind config. This keeps colors consistent and centralized.

---

## 📊 Quick Stats

- **Primary Blue:** #0085ff (iTunes standard)
- **Light Background:** #fafafa (minimal and clean)
- **Max Content Width:** 1024px (optimal reading width)
- **Header Height:** 64px (h-16)
- **Sidebar Width:** 320px (w-80, optimal navigation width)
- **Typography Scale:** 12px → 40px (covers all content sizes)
- **Spacing Unit:** 8px (0.5rem)

---

## ✅ Testing Your Changes

```bash
# Check for TypeScript errors
npm run type-check

# Check for Tailwind issues
npx tailwind check

# Build for production
npm run build

# Run Lighthouse audit
npm install -g lighthouse
lighthouse https://your-site.com

# Check accessibility
# Use axe DevTools browser extension
# Use WAVE browser extension
```

---

## 🎯 Common Modifications

### Change Primary Color
```css
/* In app/globals.css */
:root {
  --primary: 213 100% 52%;  /* Blue #0085ff */
}
```

### Adjust Header Height
```tsx
/* In header.tsx */
className="h-16"  // Change to h-20, etc.

/* Also update sidebar */
className="top-16"  // Match header height
```

### Change Sidebar Width
```tsx
/* In layout: grid-cols-[320px_1fr] */
/* In sidebar: w-80 */
/* In grid: lg:grid-cols-[420px_1fr] */
```

### Adjust Content Max-Width
```tsx
/* In main-layout.tsx */
<div className="max-w-4xl">  // Change to max-w-2xl, max-w-5xl, etc.
```

---

## 🐛 Troubleshooting

### Sidebar Not Showing
- Check `top-16` matches header height
- Check `z-50` for mobile overlay
- Check media query: `lg:` for desktop visibility

### Content Not Centered
- Add `mx-auto` to container
- Add `max-w-4xl` (or desired width)
- Check padding: `px-4 sm:px-6 lg:px-8`

### Colors Not Applying
- Clear `.next` cache: `rm -rf .next`
- Restart dev server: `npm run dev`
- Check CSS variable names in globals.css

### Text Hard to Read
- Add `leading-relaxed` to body text
- Increase font size
- Add more space between lines
- Check color contrast (use axe DevTools)

---

## 📞 Questions?
See `ITUNES_THEME_IMPLEMENTATION.md` and `DESIGN_SYSTEM.md` for detailed documentation.

Refer to the full documentation:
- `UI_REFACTOR_ANALYSIS.md` - Detailed analysis
- `IMPLEMENTATION_SUMMARY.md` - Complete implementation log
- `ARCHITECTURE_CHANGES.md` - Design system details

