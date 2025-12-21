# EduHub UI Refactor - Quick Reference Guide

## 🎨 Color Palette Quick Reference

### Primary Colors
```
Primary Green:        #0d7f3a (Tailwind: [primary])
Accent Green:        #1bb357 (Tailwind: [accent])
Dark Background:     #161616 (Tailwind: bg-slate-950)
Card Background:     #1f1f1f (Tailwind: bg-slate-900)
```

### Text Colors
```
Primary Text:        #f2f2f2 (Tailwind: text-white/slate-50)
Secondary Text:      #b0b0b0 (Tailwind: text-slate-400)
Muted Text:          #808080 (Tailwind: text-slate-500)
```

### Component Usage
```tsx
// Header
className="bg-slate-950 border-slate-800"

// Sidebar
className="bg-slate-900 border-slate-800"

// Main Content
className="bg-slate-950"

// Cards
className="bg-slate-900 border-slate-800"

// Buttons
className="bg-primary text-white hover:bg-accent"

// Links
className="text-primary hover:text-accent"
```

---

## 📐 Layout Classes

### Main Layout Grid
```tsx
<div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] min-h-screen">
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
className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-slate-900"
```

### Header (Fixed)
```tsx
className="sticky top-0 z-40 h-16 bg-slate-950 border-b border-slate-800"
```

---

## 🔤 Typography Classes

### Headings
```tsx
// H1 - Page/Article Titles
<h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">

// H2 - Major Sections
<h2 className="text-3xl md:text-4xl font-bold text-white leading-snug mt-8 mb-4">

// H3 - Subsections
<h3 className="text-2xl md:text-3xl font-semibold text-white leading-snug mt-6 mb-3">

// H4 - Minor Headings
<h4 className="text-xl md:text-2xl font-semibold text-slate-100 mt-5 mb-2">
```

### Body Text
```tsx
// Regular paragraph
<p className="text-base leading-relaxed text-slate-300 mb-4">

// Small text
<span className="text-sm text-slate-400">

// Very small (metadata)
<span className="text-xs text-slate-500">
```

### Code & Pre
```tsx
// Inline code
<code className="bg-slate-800 text-slate-100 px-2 py-1 rounded text-sm">

// Code block
<pre className="bg-slate-900 border border-slate-700 rounded-lg p-4">
  <code>...</code>
</pre>
```

---

## 🔗 Interactive Elements

### Buttons
```tsx
// Primary (Green)
<Button className="bg-primary hover:bg-accent text-white">

// Secondary (Dark)
<Button variant="secondary" className="bg-slate-800 hover:bg-slate-700 text-white">

// Ghost (Text only)
<Button variant="ghost" className="text-primary hover:text-accent hover:bg-white/10">
```

### Links
```tsx
// Default
<a className="text-primary hover:text-accent transition-colors">

// Within paragraphs
<a className="text-primary underline hover:text-accent">
```

### Input Fields
```tsx
<Input className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-primary/50 focus:ring-1 focus:ring-primary/20">
```

### Badges & Tags
```tsx
// Primary tag
<Badge className="bg-primary text-white">

// Outline tag
<Badge variant="outline" className="border-slate-700 text-slate-300 hover:bg-primary/20">
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
className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-slate-950"
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
  <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
    Section Title
  </h3>
  <div className="space-y-1">
    {/* Items */}
  </div>
</div>
```

### Card Component
```tsx
<div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
  {/* Content */}
</div>
```

### Navigation Item
```tsx
<Link
  href="/"
  className={cn(
    'flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all',
    isActive
      ? 'bg-primary text-white font-medium'
      : 'text-slate-300 hover:bg-slate-800'
  )}
>
  <Icon className="h-5 w-5" />
  <span>Label</span>
</Link>
```

### Search Input
```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
  <Input
    placeholder="Search..."
    className="pl-9 bg-slate-800 border-slate-700 text-white"
  />
</div>
```

---

## 🎨 Common Component Combinations

### Alert/Info Box
```tsx
<div className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-300">
  <h4 className="font-semibold text-white mb-2">Note</h4>
  <p>Information text here</p>
</div>
```

### Empty State
```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div className="text-5xl mb-4">📚</div>
  <h3 className="text-xl font-semibold text-white mb-2">No lessons yet</h3>
  <p className="text-slate-400">Add some content to get started</p>
</div>
```

### Loading Skeleton
```tsx
<div className="space-y-3">
  <div className="h-4 bg-slate-800 rounded animate-pulse w-3/4" />
  <div className="h-4 bg-slate-800 rounded animate-pulse w-full" />
  <div className="h-4 bg-slate-800 rounded animate-pulse w-4/5" />
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
/* Primary - Educational Green */
--primary: 147 78% 38%;          /* #0d7f3a */
--primary-foreground: 0 0% 100%;  /* white */

/* Accent - Bright Green */
--accent: 147 78% 48%;           /* #1bb357 */
--accent-foreground: 0 0% 100%;

/* Backgrounds */
--background: 0 0% 9%;           /* #161616 */
--foreground: 0 0% 95%;          /* #f2f2f2 */
--card: 0 0% 12%;                /* #1f1f1f */

/* Borders & Input */
--border: 0 0% 20%;              /* #333 */
--input: 0 0% 20%;
--ring: 147 78% 38%;             /* green focus ring */

/* Text Levels */
--muted: 0 0% 30%;               /* #4d4d4d */
--muted-foreground: 0 0% 70%;

/* Status */
--destructive: 0 84.2% 60.2%;    /* #f87171 (red) */
```

---

## 🚀 Implementation Tips

### When Creating New Pages
1. Use `max-w-4xl mx-auto px-4` for centered content
2. Use `text-white` for primary headings
3. Use `text-slate-300` for body text
4. Use `bg-primary` for action buttons
5. Use `text-primary` for links
6. Use `bg-slate-900 border-slate-800` for cards
7. Use `bg-slate-800` for secondary backgrounds

### When Styling Components
```tsx
// DO - Use Tailwind utilities
className="bg-slate-900 text-white border border-slate-800"

// DON'T - Use inline styles
style={{ backgroundColor: '#1f1f1f' }}

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

- **Primary Green:** #0d7f3a (W3Schools standard)
- **Dark Background:** #161616 (reduces eye strain)
- **Max Content Width:** 1024px (optimal reading width)
- **Header Height:** 64px (h-16, increased from 56px)
- **Sidebar Width:** 320px (increased from 288px, better readability)
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
  --primary: 123 45% 67%;  /* New color */
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

## 📞 Need Help?

Refer to the full documentation:
- `UI_REFACTOR_ANALYSIS.md` - Detailed analysis
- `IMPLEMENTATION_SUMMARY.md` - Complete implementation log
- `ARCHITECTURE_CHANGES.md` - Design system details

