---
name: Lumina AI
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464555'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006591'
  on-secondary: '#ffffff'
  secondary-container: '#39b8fd'
  on-secondary-container: '#004666'
  tertiary: '#571ac0'
  on-tertiary: '#ffffff'
  tertiary-container: '#6f3dd9'
  on-tertiary-container: '#e3d5ff'
  error: '#EF4444'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#c9e6ff'
  secondary-fixed-dim: '#89ceff'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#004c6e'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  surface-glass-light: rgba(255, 255, 255, 0.7)
  surface-glass-dark: rgba(15, 23, 42, 0.8)
  ai-accent: '#22D3EE'
  success: '#10B981'
  warning: '#F59E0B'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.2'
  button-text:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  2xl: 64px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The design system is engineered for a modern, AI-powered educational environment. It balances the high-tech capabilities of generative AI with the reliability required for academic progress. The personality is **intelligent, supportive, and focused**.

The visual direction follows a **Modern SaaS** aesthetic with heavy **Glassmorphism** influences. This style utilizes semi-transparent surfaces, subtle backdrop blurs, and luminous accents to signify the "intelligence" behind the platform. The UI is clean and professional, prioritizing high legibility for complex learning materials while using vibrant indigo and blue tones to maintain student engagement.

Key characteristics:
- **Clarity:** Uncluttered layouts that prioritize instructional content.
- **Luminosity:** Use of soft glows and gradients to highlight AI-driven insights.
- **Trust:** A structured, grid-based foundation that feels stable and authoritative.

## Colors

The palette is anchored in **Indigo (Primary)** and **Sky Blue (Secondary)**, creating a professional yet energetic atmosphere. The color system is designed to function across two modes:

- **Light Mode:** Uses a "Frosted White" foundation (`#F8FAFC` backgrounds) with high-contrast typography. Glassmorphism is achieved through `surface-glass-light` combined with a `20px` backdrop blur.
- **Dark Mode:** Transitions to a deep "Space Blue" foundation (`#0F172A`). Glass effects utilize `surface-glass-dark` with subtle border highlights to define edges.

**Named Colors** are utilized for functional feedback:
- **AI-Accent:** Used exclusively for AI-generated suggestions and the tutor interface.
- **Success/Warning/Error:** Standardized semantic colors for quiz results and progress tracking.

## Typography

This design system employs a three-font strategy to differentiate between structure, content, and data.

1.  **Manrope (Headlines):** A modern, geometric sans-serif that conveys technical sophistication. Used for all primary headings and dashboard titles.
2.  **Inter (Body):** The workhorse for educational content. Highly legible at small sizes, optimized for reading long-form lesson notes and AI explanations.
3.  **JetBrains Mono (Labels/Data):** Used for metadata, quiz statistics, and code snippets. The monospaced nature helps students parse quantitative data in their progress reports.

**Responsive Rules:** Headlines scale down by ~25% on mobile devices to maintain readability without excessive scrolling.

## Layout & Spacing

The design system utilizes a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 

- **Layout Model:** Dashboards utilize a "Pinned Sidebar" layout. The sidebar remains fixed (280px), while the main content area utilizes a fluid grid with a maximum container width of 1280px to prevent line lengths from becoming unreadable on ultra-wide monitors.
- **Rhythm:** An 8px linear scale (represented by `base * n`) governs all spatial relationships. 
- **Padding:** Content cards use `lg` (24px) padding, while smaller UI components like input fields use `md` (16px) horizontal padding.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Backdrop Blurs** rather than traditional heavy shadows.

- **Level 0 (Background):** The base canvas color.
- **Level 1 (Cards/Sidebar):** Uses a semi-transparent glass effect. In light mode, this is a white tint with 70% opacity and 20px blur. In dark mode, it is a dark navy tint with 80% opacity.
- **Level 2 (Modals/Popovers):** Higher opacity (90%) with a subtle `primary_color` tinted shadow (`0px 10px 30px rgba(79, 70, 229, 0.1)`) to create a sense of floating.
- **Borders:** Every glass surface must have a 1px solid border. For light mode, use `rgba(255, 255, 255, 0.4)`. For dark mode, use `rgba(255, 255, 255, 0.1)`. This "inner glow" border is essential for the glassmorphism effect.

## Shapes

The shape language is **Rounded**, reflecting a friendly and accessible educational tool.

- **Standard Elements:** Buttons, input fields, and small cards use a **0.5rem (8px)** corner radius.
- **Large Containers:** Dashboard widgets and main content areas use **1rem (16px)**.
- **Interaction States:** When an item is "Active" or "Focused," the roundedness remains constant, but the border thickness increases or a glow effect is added.
- **AI Elements:** AI chat bubbles and tutor suggestions should use slightly more exaggerated rounding (up to 1.5rem) to distinguish them from standard system messages.

## Components

### Buttons
- **Primary:** Solid indigo background with white text. High-contrast and prominent.
- **Secondary:** Ghost style with the primary color border and text. 
- **AI Action:** A gradient button (Primary to Secondary) with a subtle "pulse" animation for AI-related triggers.

### Cards (The "Glass" Card)
- The primary container for courses and quiz results. Must feature a `20px` backdrop blur and a thin `1px` translucent border. On hover, the border opacity should increase.

### Data Visualizations
- Progress bars should use a "Track and Fill" pattern. The track is a low-opacity version of the color (10%), and the fill is a solid gradient of the secondary color.
- Charts should use `secondary` and `tertiary` colors for data series to ensure distinction.

### Input Fields
- Understated. A light gray background (`#F1F5F9` in light mode) that transitions to the glass effect on focus. The focus state is indicated by a 2px `primary_color` ring.

### Sidebar
- A vertical navigation element. Use `label-md` for navigation items. The active state should be marked by a vertical pill on the left edge and a subtle background tint.

### AI Tutor Chat
- Messages should be grouped visually. The AI's responses always sit on a slightly different colored glass surface (tinted with `ai-accent`) to provide immediate visual context.