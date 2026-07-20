# UX/UI Design Plan — Namlah Superapp

## 1. Current State Audit

| Aspect | Status | Notes |
|--------|--------|-------|
| **Stack** | Next.js 15 + React 19 + TypeScript + PWA | Production-ready |
| **Themes** | `modern` + `game` (ant-colony) | Both live; `game` uses heavy CSS branch |
| **Navigation** | Bottom tab bar (4–5 tabs) | Role-filtered tabs; `ratu` hidden for non-admin |
| **Auth** | PIN-4-digit + Semut-ID creation | Portal login auto-generated; email optional |
| **Map** | OpenStreetMap embed + partner GPS pins | Cirebon hardcoded bounds; needs dynamic region |
| **Data** | Real Odoo bridge (xmlrpc) | Write-gated by `NAMLAH_BRIDGE_WRITES` |
| **CSS** | Single `globals.css` (~1,800 lines) | Monolithic; theme branches duplicated |

### Component Inventory
- `AuthGate` — login/create with PIN pad
- `RoleContextBar` — role switcher + koloni + source-of-truth badge
- `ConceptMap` — OSM map + partner pins + activity strip
- `StorePanel` — catalog + kasir POS + template activation
- `ForumPanel` — forum.post read/write from Odoo
- `RatuSemutPanel` — admin kanban + sales + milestones + balance sheet
- `ScanPanel` — scan frame + proof workflow + SOP stage
- `AccountPanel` — profile + role management + GPS location + theme switch
- `BottomNav` — role-aware tab navigation

## 2. Design System Standardization

### 2.1 Token Architecture
Move from CSS custom properties scattered in `globals.css` to a **token layer** that both themes consume.

**Proposed tokens** (add to `lib/designTokens.ts` or `tailwind.config` if Tailwind is added):
```ts
export const tokens = {
  color: {
    ink: '#142018',
    muted: '#627064',
    surface: '#fffdf7',
    field: '#f6f3ea',
    line: 'rgba(20,32,24,0.14)',
    danger: '#b4373e',
    warning: '#a76720',
    shadow: '0 18px 50px rgba(20,32,24,0.16)',
  },
  radius: { sm: 6, md: 8, lg: 12, full: 9999 },
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  type: {
    xs: 11, sm: 12, base: 13, md: 14, lg: 18, xl: 28, xxl: 54,
    weight: { normal: 400, bold: 800, black: 900 },
  },
  touch: { min: 44, comfortable: 48, large: 58 },
};
```

### 2.2 Theme Contracts
Both `modern` and `game` must map to the same token names. Extract theme-specific values into:
- `lib/themes/modern.ts`
- `lib/themes/game.ts`

This eliminates the 900-line `game` branch in `globals.css` and replaces it with class toggles that swap token values.

### 2.3 Typography Scale
Current font sizes are ad-hoc (`11px`–`54px`). Standardize to:
- Display: `xxl / 54px / black / 1.0`
- H1: `xl / 28px / bold / 1.12`
- H2: `lg / 18px / bold / 1.2`
- Body: `md / 14px / normal / 1.5`
- Caption: `sm / 12px / bold / 1.4` (uppercase for labels)

## 3. Layout & Navigation Improvements

### 3.1 Top Dock → Role Context Bar
Current `RoleContextBar` is a horizontal strip that overflows on small screens.
- **Mobile**: Collapse to icon-only chips + expandable drawer
- **Tablet+**: Keep horizontal chips
- Add `aria-label` per chip and `title` tooltip

### 3.2 Bottom Nav
- Add **haptic-like** scale animation on press (`transform: scale(0.94)`)
- Active indicator: pill background + icon + label (already done)
- Add `SafeArea` padding for iOS notch
- Consider **FAB** for role-specific primary action (e.g., Kasir = "Buat Order", Kurir = "Ambil Pickup")

### 3.3 Screen Panel Model
All panels use `.screen-panel { inset: ... }` absolute positioning. Refactor to:
- **Mobile**: Full-bleed panels with `padding: env(safe-area-inset-top) env(safe-area-inset-right) ...`
- **Tablet/Desktop**: Side-by-side master-detail for `map` + `store` + `ratu`

## 4. Component UX Patterns

### 4.1 Empty / Loading / Error States
Every data-fetching panel currently has inline loading/error text. Standardize with:
- `components/feedback/StateCard.tsx` — unified skeleton / spinner / retry / empty pattern
- Use skeleton shimmer for catalog, forum, activity lists
- Retry button on every error card
- Bridge status banner (already exists) → move to global `BridgeStatusBar`

### 4.2 Buttons
Current classes: `.primary-action`, `.icon-action`, `.role-menu-card`, `.keypad button`.
Create `components/ui/Button.tsx` with variants:
- `variant="primary" | "secondary" | "ghost" | "danger"`
- `size="sm" | "md" | "lg"`
- Enforce `min-height: 44px` for touch
- Add `:active` scale feedback

### 4.3 Cards
Standardize card internals:
- `components/ui/Card.tsx`
- Consistent padding (`--space-lg`), border (`--line`), shadow (`--shadow`)
- Optional `variant="elevated" | "outlined" | "filled"`

### 4.4 Forms
- All inputs: `height: 48px`, `border-radius: var(--radius-md)`, focus ring `3px color-mix`
- Error state: border `--danger`, helper text below
- Labels: `12px / bold / uppercase / --muted`

### 4.5 PIN Pad
- Already exists (`PinPad.tsx`)
- Add **shake animation** on wrong PIN
- Add **success flash** on correct PIN
- Ensure 44px minimum touch target per key

## 5. Responsive & Adaptive Layout

### 5.1 Breakpoints
| Breakpoint | Width | Layout Change |
|-----------|-------|---------------|
| `xs` | < 520 | Single column, compact nav, hide non-essential cards |
| `sm` | 520–900 | Stacked panels, scrollable role menu |
| `md` | 900–1200 | Side panel + main content for map/store/ratu |
| `lg` | > 1200 | Max-width container `1200px` centered, multi-column dashboard |

### 5.2 Map Responsive
- Current: absolute-positioned overlays on OSM iframe
- Tablet+: split view — OSM left (60%), partner list / activity right (40%)
- Mobile: full-bleed OSM with bottom sheet (already done) + swipe-up panel

### 5.3 Ratu Dashboard
- Current: single column scroll
- Tablet+: 2-column metrics + kanban board
- Desktop: 3-column kanban + sticky sidebar for templates/audit

## 6. Accessibility

### 6.1 Contrast
- Verify all text meets **WCAG AA** (4.5:1 body, 3:1 large)
- `--muted` on `--surface` is currently borderline; darken to `#4a5c4e`
- Game theme: `--game-cream` on `--game-dark` needs validation

### 6.2 Touch Targets
- Bottom nav tabs: `58px` ✅
- Role chips: `54px` ✅
- Keypad buttons: `58px` ✅
- Menu cards: `74px` ✅
- **Gap**: `.primary-action` is `48px` — bump to `52px` for comfort

### 6.3 Screen Reader
- Add `aria-live="polite"` to status banners
- Add `role="status"` to bridge status cards
- Ensure all icon-only buttons have `aria-label`

### 6.4 Focus Management
- Focus trap on PIN pad modal (if made modal)
- Focus visible ring: `2px solid var(--role)` offset `2px`

## 7. Motion & Micro-interactions

### 7.1 Transition Policy
- **Page/tab switches**: `opacity` + `transform: translateY(8px)` fade (200ms ease-out)
- **Cards appear**: staggered fade-up (50ms delay per child)
- **Button press**: `scale(0.96)` (100ms ease-out)
- **Skeleton shimmer**: `translateX` gradient loop (1.5s infinite)

### 7.2 Game Theme Motion
- Queen mascot idle bob ✅
- Ant squad march ✅
- Resource node bob ✅
- Add **pin pulse** for urgent status ✅ (already exists)
- Add **card flip** for role switch (optional)

## 8. Error & Bridge UX

### 8.1 Odoo Bridge States
Current: inline text in each panel.
- **Global banner** at top of `.superapp`:
  - Green: "Odoo live — data real-time"
  - Yellow: "Odoo bridge in read-only mode"
  - Red: "Odoo unreachable — check bridge config"
- Auto-dismiss success after 4s
- Collapsible details (endpoint, last sync time)

### 8.2 Write Gate UX
When `NAMLAH_BRIDGE_WRITES=false`:
- Disable write buttons with `disabled` + `title="Odoo write bridge inactive"`
- Show locked icon + tooltip: "Menunggu bridge tulis aktif"

## 9. Auth Flow UX

### 9.1 Onboarding
- First launch → `create` mode (already default)
- Show **3-step progress**: 1) Buat Semut-ID → 2) Pilih Koloni → 3) Set PIN
- After creation → auto-redirect to map with **welcome tooltip** on role badge

### 9.2 Login
- Show last login time if available
- "Lupa PIN?" → reset device session (already in AccountPanel)

## 10. Content & Empty States

### 10.1 Illustrations
Replace text-only empty states with:
- **SVG illustrations** per context (map, catalog, forum, scan)
- Use existing `auth-map` art style for consistency
- Keep under `40KB` each (inline SVG)

### 10.2 Copy Guidelines
- Error: "Odoo belum tersambung" → "Bridge Odoo lagi cuti. Cek koneksi atau hubungi Ratu Koloni."
- Empty: "Belum ada data" → "Kolonimu lagi sepi. Ayo aktifkan template project pertama."

## 11. Implementation Tasks (Ordered)

### Phase 1: Foundation
1. Extract design tokens to `lib/designTokens.ts`
2. Extract theme values to `lib/themes/modern.ts` + `game.ts`
3. Create `components/ui/Button.tsx`, `Card.tsx`, `Input.tsx`
4. Replace inline button/input classes with UI components in 1 panel (e.g., `ScanPanel`)

### Phase 2: Feedback
5. Create `components/feedback/StateCard.tsx`
6. Create `components/feedback/BridgeStatusBar.tsx`
7. Add skeleton shimmer to `StorePanel` catalog grid
8. Add skeleton shimmer to `ForumPanel` thread list

### Phase 3: Layout
9. Refactor `RoleContextBar` to responsive chip + drawer
10. Refactor `.screen-panel` inset logic with safe-area env vars
11. Add FAB component + hook into role `featuredActions[0]`

### Phase 4: Accessibility
12. Audit color contrast (all themes)
13. Add `aria-label` to all icon buttons
14. Add focus-visible ring globally
15. Ensure 44px minimum touch target everywhere

### Phase 5: Polish
16. Add tab transition animations
17. Add button press scale feedback
18. Replace text empty states with inline SVG illustrations
19. Add global Odoo bridge banner
20. Write gate UX (disabled states + tooltips)

## 12. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Theme branch duplication in CSS | Token extraction + CSS-in-JS or Tailwind utility merge |
| Component rewrite breaks existing layouts | Incremental migration (1 panel at a time), keep old classes until verified |
| Odoo bridge latency affects UX perception | Skeleton screens + optimistic local state for non-write actions |
| Game theme visual regression | Visual regression tests per theme (Playwright screenshots) |
| Mobile Safari safe-area issues | Test on iOS simulators; use `env()` + `constant()` fallbacks |

## 13. Validation Plan

1. **Typecheck**: `npm run typecheck` — zero errors after each phase
2. **Build**: `npm run build` — successful production build
3. **Visual regression**: Screenshot auth, map, store, forum, ratu, scan, account in both themes at `xs`, `md`, `lg`
4. **Accessibility**: Run `@axe-core/playwright` or Lighthouse accessibility audit; target score > 90
5. **Performance**: Lighthouse performance > 85 on mobile (reduce CSS bloat from token extraction)
6. **Odoo bridge**: Manual test with `NAMLAH_BRIDGE_WRITES=false` and `true`

## 14. Out of Scope

- Full design tooling (Figma/Sketch) — plan delivers code-ready specs only
- Backend Odoo adapter changes
- New feature functionality beyond UX/UI shell
- Internationalization (i18n) beyond current Indonesian copy
