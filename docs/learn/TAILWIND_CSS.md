# Tailwind CSS Guide

This guide teaches Tailwind CSS, a utility-first CSS framework, to developers who are new to modern CSS or coming from traditional stylesheet approaches.

---

## Table of Contents

1. [What is Tailwind CSS?](#what-is-tailwind-css)
2. [Utility-First Philosophy](#utility-first-philosophy)
3. [Getting Started](#getting-started)
4. [Core Concepts](#core-concepts)
5. [Layout Utilities](#layout-utilities)
6. [Spacing](#spacing)
7. [Typography](#typography)
8. [Colors](#colors)
9. [Borders and Shadows](#borders-and-shadows)
10. [Responsive Design](#responsive-design)
11. [Dark Mode](#dark-mode)
12. [Hover and States](#hover-and-states)
13. [Common Component Patterns](#common-component-patterns)
14. [This Project's Usage](#this-projects-usage)
15. [Practice Exercises](#practice-exercises)

---

## What is Tailwind CSS?

Tailwind is a **utility-first** CSS framework. Instead of writing custom CSS, you compose styles using pre-built utility classes directly in your HTML/JSX.

### Traditional CSS vs Tailwind

```html
<!-- Traditional CSS Approach -->
<style>
.card {
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.card-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 8px;
}
</style>

<div class="card">
  <h2 class="card-title">Hello</h2>
</div>
```

```html
<!-- Tailwind Approach -->
<div class="bg-white rounded-lg p-6 shadow-md">
  <h2 class="text-2xl font-bold text-gray-900 mb-2">Hello</h2>
</div>
```

### Why Tailwind?

| Benefit | Description |
|---------|-------------|
| No naming | No need to invent `.card-wrapper-inner` class names |
| Constrained design | Built-in design system with consistent spacing/colors |
| Small bundle | Only used utilities are included in production |
| Rapid development | Style without context-switching to CSS files |
| Easy responsiveness | Mobile-first responsive utilities built-in |

---

## Utility-First Philosophy

### The Mental Shift

```
Traditional CSS                 Tailwind CSS
───────────────                 ────────────

1. Think of component           1. Build directly in HTML
2. Name it (.sidebar-nav)       2. Apply utility classes
3. Write CSS rules              3. No separate file needed
4. Link to HTML                 4. Instantly see results

Files:                          Files:
- component.html                - component.html (that's it!)
- component.css
- component.module.css
```

### Reading Tailwind Classes

```html
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Click me
</button>
```

Breaking it down:
- `bg-blue-500` → Background color: blue, shade 500
- `hover:bg-blue-700` → On hover: darker blue
- `text-white` → Text color: white
- `font-bold` → Font weight: bold
- `py-2` → Padding Y-axis (top/bottom): 0.5rem
- `px-4` → Padding X-axis (left/right): 1rem
- `rounded` → Border radius: small

---

## Getting Started

### Installation (Next.js)

```bash
# Already configured in this project
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',  // Scan these files for classes
  ],
  theme: {
    extend: {
      // Custom theme extensions
    },
  },
  plugins: [],
}
```

### globals.css

```css
@tailwind base;       /* Reset and base styles */
@tailwind components; /* Component classes (like .btn) */
@tailwind utilities;  /* Utility classes (like .flex, .p-4) */
```

---

## Core Concepts

### Class Naming Pattern

Most Tailwind classes follow this pattern:

```
{property}-{value}
{property}-{size}
{property}-{color}-{shade}
```

Examples:
- `text-center` → text-align: center
- `p-4` → padding: 1rem
- `bg-red-500` → background-color: red (shade 500)

### Spacing Scale

Tailwind uses a consistent spacing scale:

| Class | Value | Pixels |
|-------|-------|--------|
| `-0` | 0 | 0px |
| `-1` | 0.25rem | 4px |
| `-2` | 0.5rem | 8px |
| `-3` | 0.75rem | 12px |
| `-4` | 1rem | 16px |
| `-5` | 1.25rem | 20px |
| `-6` | 1.5rem | 24px |
| `-8` | 2rem | 32px |
| `-10` | 2.5rem | 40px |
| `-12` | 3rem | 48px |
| `-16` | 4rem | 64px |

---

## Layout Utilities

### Display

```html
<div class="block">Block element</div>
<span class="inline">Inline element</span>
<div class="inline-block">Inline-block element</div>
<div class="hidden">Hidden element</div>
<div class="flex">Flex container</div>
<div class="grid">Grid container</div>
```

### Flexbox

```html
<!-- Basic flex row -->
<div class="flex">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Flex with options -->
<div class="flex flex-col items-center justify-between gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Flex classes -->
<!-- flex-row (default), flex-col (column) -->
<!-- items-start, items-center, items-end (cross-axis) -->
<!-- justify-start, justify-center, justify-end, justify-between (main-axis) -->
<!-- gap-{size} (spacing between items) -->
```

### Grid

```html
<!-- 3-column grid -->
<div class="grid grid-cols-3 gap-4">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</div>
```

### Width and Height

```html
<!-- Fixed sizes -->
<div class="w-64">256px width</div>
<div class="h-32">128px height</div>

<!-- Relative sizes -->
<div class="w-full">100% width</div>
<div class="w-1/2">50% width</div>
<div class="w-1/3">33.33% width</div>

<!-- Screen-relative -->
<div class="h-screen">100vh</div>
<div class="min-h-screen">At least 100vh</div>

<!-- Auto and max -->
<div class="w-auto">Auto width</div>
<div class="max-w-md">Max-width: 28rem</div>
```

---

## Spacing

### Margin (m) and Padding (p)

```html
<!-- All sides -->
<div class="m-4">Margin 1rem all sides</div>
<div class="p-4">Padding 1rem all sides</div>

<!-- Specific sides -->
<div class="mt-4">Margin-top</div>
<div class="mr-4">Margin-right</div>
<div class="mb-4">Margin-bottom</div>
<div class="ml-4">Margin-left</div>

<!-- Axis (x = left/right, y = top/bottom) -->
<div class="mx-4">Margin left and right</div>
<div class="my-4">Margin top and bottom</div>
<div class="px-4">Padding left and right</div>
<div class="py-4">Padding top and bottom</div>

<!-- Negative margin -->
<div class="-mt-4">Negative margin-top</div>

<!-- Auto margin (centering) -->
<div class="mx-auto">Center horizontally</div>
```

### Space Between Children

```html
<!-- Instead of adding margin to each child -->
<div class="flex flex-col space-y-4">
  <div>No margin needed</div>
  <div>Space is automatic</div>
  <div>Between siblings</div>
</div>
```

---

## Typography

### Font Size

```html
<p class="text-xs">Extra small (0.75rem)</p>
<p class="text-sm">Small (0.875rem)</p>
<p class="text-base">Base (1rem)</p>
<p class="text-lg">Large (1.125rem)</p>
<p class="text-xl">Extra large (1.25rem)</p>
<p class="text-2xl">2XL (1.5rem)</p>
<p class="text-3xl">3XL (1.875rem)</p>
<p class="text-4xl">4XL (2.25rem)</p>
```

### Font Weight

```html
<p class="font-thin">Thin (100)</p>
<p class="font-light">Light (300)</p>
<p class="font-normal">Normal (400)</p>
<p class="font-medium">Medium (500)</p>
<p class="font-semibold">Semibold (600)</p>
<p class="font-bold">Bold (700)</p>
```

### Text Alignment and Decoration

```html
<p class="text-left">Left aligned</p>
<p class="text-center">Center aligned</p>
<p class="text-right">Right aligned</p>

<p class="underline">Underlined</p>
<p class="line-through">Strikethrough</p>
<p class="no-underline">No underline</p>

<p class="uppercase">UPPERCASE</p>
<p class="lowercase">lowercase</p>
<p class="capitalize">Capitalize</p>
```

### Line Height and Letter Spacing

```html
<p class="leading-none">Line height: 1</p>
<p class="leading-tight">Line height: 1.25</p>
<p class="leading-normal">Line height: 1.5</p>
<p class="leading-relaxed">Line height: 1.625</p>
<p class="leading-loose">Line height: 2</p>

<p class="tracking-tight">Tight letter spacing</p>
<p class="tracking-normal">Normal letter spacing</p>
<p class="tracking-wide">Wide letter spacing</p>
```

---

## Colors

### Color Palette

Tailwind includes a complete color palette with shades from 50 (lightest) to 950 (darkest):

```
gray, red, orange, amber, yellow, lime, green, emerald,
teal, cyan, sky, blue, indigo, violet, purple, fuchsia,
pink, rose
```

### Using Colors

```html
<!-- Text color -->
<p class="text-gray-900">Dark gray text</p>
<p class="text-blue-500">Blue text</p>
<p class="text-red-600">Red text</p>

<!-- Background color -->
<div class="bg-white">White background</div>
<div class="bg-gray-100">Light gray background</div>
<div class="bg-blue-500">Blue background</div>

<!-- Border color -->
<div class="border border-gray-300">Gray border</div>
<div class="border-2 border-red-500">Red border</div>
```

### Color Shades

```html
<!-- 50 = lightest, 950 = darkest -->
<div class="bg-blue-50">Very light blue</div>
<div class="bg-blue-100">Light blue</div>
<div class="bg-blue-200">...</div>
<div class="bg-blue-500">Default blue</div>
<div class="bg-blue-700">Dark blue</div>
<div class="bg-blue-900">Very dark blue</div>
```

### Opacity

```html
<!-- Background opacity -->
<div class="bg-black/50">50% opacity black</div>
<div class="bg-blue-500/75">75% opacity blue</div>

<!-- Text opacity -->
<p class="text-gray-900/80">80% opacity text</p>
```

---

## Borders and Shadows

### Borders

```html
<!-- Border width -->
<div class="border">1px border</div>
<div class="border-2">2px border</div>
<div class="border-4">4px border</div>

<!-- Specific sides -->
<div class="border-t">Top border only</div>
<div class="border-b-2">2px bottom border</div>

<!-- Border radius -->
<div class="rounded">Small radius (4px)</div>
<div class="rounded-md">Medium radius (6px)</div>
<div class="rounded-lg">Large radius (8px)</div>
<div class="rounded-xl">Extra large (12px)</div>
<div class="rounded-full">Full/circular</div>
```

### Shadows

```html
<div class="shadow-sm">Small shadow</div>
<div class="shadow">Default shadow</div>
<div class="shadow-md">Medium shadow</div>
<div class="shadow-lg">Large shadow</div>
<div class="shadow-xl">Extra large shadow</div>
<div class="shadow-none">No shadow</div>
```

---

## Responsive Design

Tailwind is **mobile-first**. Breakpoint prefixes apply from that breakpoint and up.

### Breakpoints

| Prefix | Min Width | CSS |
|--------|-----------|-----|
| `sm:` | 640px | `@media (min-width: 640px)` |
| `md:` | 768px | `@media (min-width: 768px)` |
| `lg:` | 1024px | `@media (min-width: 1024px)` |
| `xl:` | 1280px | `@media (min-width: 1280px)` |
| `2xl:` | 1536px | `@media (min-width: 1536px)` |

### Usage

```html
<!-- Stack on mobile, row on desktop -->
<div class="flex flex-col md:flex-row">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Different columns at breakpoints -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <div>1</div>
  <div>2</div>
  <div>3</div>
  <div>4</div>
</div>

<!-- Hide/show at breakpoints -->
<div class="hidden md:block">Only visible on md and up</div>
<div class="block md:hidden">Only visible below md</div>

<!-- Different padding at breakpoints -->
<div class="p-2 sm:p-4 lg:p-8">
  Responsive padding
</div>
```

---

## Dark Mode

### Enabling Dark Mode

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',  // or 'media' for system preference
  // ...
}
```

### Using Dark Mode

```html
<!-- Styles for both modes -->
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  This adapts to dark mode
</div>

<!-- Card example -->
<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
  <h2 class="text-gray-900 dark:text-white font-bold">Title</h2>
  <p class="text-gray-600 dark:text-gray-300">Description</p>
</div>
```

### Toggle Dark Mode (React)

```tsx
function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  return (
    <button onClick={() => setDark(!dark)}>
      {dark ? 'Light' : 'Dark'} Mode
    </button>
  );
}
```

---

## Hover and States

### State Prefixes

```html
<!-- Hover -->
<button class="bg-blue-500 hover:bg-blue-700">
  Darkens on hover
</button>

<!-- Focus -->
<input class="border focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />

<!-- Active (while clicking) -->
<button class="bg-blue-500 active:bg-blue-800">
  Even darker when clicked
</button>

<!-- Disabled -->
<button class="bg-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed">
  Disabled state
</button>

<!-- Group hover (parent hover affects child) -->
<div class="group hover:bg-gray-100">
  <p class="text-gray-500 group-hover:text-gray-900">
    Changes when parent is hovered
  </p>
</div>
```

### First/Last/Odd/Even

```html
<ul>
  {items.map((item, i) => (
    <li key={i} class="first:pt-0 last:pb-0 py-4 border-b last:border-0">
      {item}
    </li>
  ))}
</ul>

<!-- Zebra striping -->
<tr class="odd:bg-white even:bg-gray-50">...</tr>
```

---

## Common Component Patterns

### Button

```html
<!-- Primary button -->
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Primary
</button>

<!-- Secondary button -->
<button class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded">
  Secondary
</button>

<!-- Outline button -->
<button class="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white py-2 px-4 rounded">
  Outline
</button>

<!-- Danger button -->
<button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
  Delete
</button>
```

### Card

```html
<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
    Card Title
  </h3>
  <p class="text-gray-600 dark:text-gray-300">
    Card content goes here.
  </p>
</div>
```

### Input

```html
<input
  type="text"
  class="w-full px-3 py-2 border border-gray-300 rounded-md
         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
         dark:bg-gray-700 dark:border-gray-600 dark:text-white"
  placeholder="Enter text..."
/>
```

### Badge

```html
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
  Badge
</span>

<!-- Status badges -->
<span class="px-2 py-1 text-xs rounded bg-green-100 text-green-800">Active</span>
<span class="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">Pending</span>
<span class="px-2 py-1 text-xs rounded bg-red-100 text-red-800">Error</span>
```

### Modal Overlay

```html
<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
    <h2 class="text-xl font-bold mb-4">Modal Title</h2>
    <p class="text-gray-600 dark:text-gray-300 mb-4">Modal content</p>
    <button class="bg-blue-500 text-white px-4 py-2 rounded">
      Close
    </button>
  </div>
</div>
```

---

## This Project's Usage

Personal OS uses Tailwind CSS for all styling.

### Location: `web/frontend/`

### Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### Example: Report Card

```tsx
// src/components/ReportCard.tsx
function ReportCard({ report }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4
                    hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className={`px-2 py-1 text-xs rounded ${
          report.content_type === 'youtube'
            ? 'bg-red-100 text-red-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {report.content_type}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {report.created_at}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white
                     line-clamp-2 mb-2">
        {report.title}
      </h3>

      {/* Summary */}
      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
        {report.summary}
      </p>
    </div>
  );
}
```

### Example: Sidebar Navigation

```tsx
// src/components/Sidebar.tsx
function Sidebar() {
  return (
    <nav className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="text-xl font-bold mb-8">Personal OS</div>

      <ul className="space-y-2">
        {navItems.map(item => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`block px-4 py-2 rounded-lg transition-colors
                ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

---

## Practice Exercises

### Exercise 1: Build a Profile Card

Create a profile card with:
- Avatar (rounded-full)
- Name (bold)
- Title (muted color)
- Stats row (followers, posts)
- Follow button

### Exercise 2: Responsive Grid

Create a grid that shows:
- 1 column on mobile
- 2 columns on tablet
- 4 columns on desktop
- Cards with hover effect

### Exercise 3: Dark Mode Toggle

Implement:
- Light/dark mode button
- All components respect dark mode
- Smooth transition on toggle

### Exercise 4: Form Styling

Style a form with:
- Text input with focus ring
- Select dropdown
- Checkbox
- Submit button
- Error state styling

---

## Summary

| Category | Example Classes |
|----------|----------------|
| Layout | `flex`, `grid`, `hidden`, `block` |
| Spacing | `p-4`, `m-2`, `gap-4`, `space-y-2` |
| Sizing | `w-full`, `h-64`, `max-w-md` |
| Typography | `text-lg`, `font-bold`, `text-center` |
| Colors | `bg-blue-500`, `text-gray-900`, `border-red-300` |
| Borders | `border`, `rounded-lg`, `shadow-md` |
| Responsive | `md:flex`, `lg:grid-cols-3` |
| Dark mode | `dark:bg-gray-800`, `dark:text-white` |
| States | `hover:bg-blue-700`, `focus:ring-2` |

### Quick Reference

```html
<!-- A well-styled card -->
<div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6
            hover:shadow-lg transition-shadow">
  <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
    Title
  </h2>
  <p class="text-gray-600 dark:text-gray-300">
    Content
  </p>
</div>
```

---

*Learning Guide - Tailwind CSS*

*Built with [Claude Code](https://claude.ai/code) powered by Claude Opus 4.5*
