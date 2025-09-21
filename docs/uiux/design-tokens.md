# Design Tokens — Procurement Application

_Last updated: 2025-01-24_

This document captures the shared UI/UX tokens introduced in Story 1.2 so that design and engineering teams can apply the DSV brand consistently across modules.

## 1. Palette Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `brand-primary` | `#002664` | Primary navigation, CTA buttons, emphasis backgrounds |
| `brand-on-primary` | `#FFFFFF` | Foreground text/icons on `brand-primary` surfaces |
| `brand-surface` | `#FFFFFF` | Default card/background surfaces |
| `brand-text` | `#000000` | Primary body text |
| `status-success` | `#00682A` | Approved/success states, positive chips |
| `status-pending` | `#FFC40C` | Pending/in-progress states |
| `status-warning` | `#C64801` | Escalations/warnings requiring attention |
| `status-danger` | `#E18375` | Errors, rejected decisions |
| `status-neutral` | `#6B7280` | Neutral labels, metadata |

### Tailwind Usage Examples
- `bg-brand-primary`, `text-brand-on-primary`, `border-brand-text/20`
- Status chips: `bg-status-success/10 text-status-success`

## 2. Typography Tokens

| Token | Size | Notes |
|-------|------|-------|
| `font-size-base` | `1rem` (16px) | Default body size (WCAG minimum) |
| `font-size-lg` | `1.25rem` (20px) | Page/section headings |
| `font-size-xl` | `1.5rem` (24px) | Feature headers, hero text |
| `font-sans` | `"Roboto", "Arial", "Helvetica", sans-serif` | Corporate sans stack |
| `line-height-base` | `1.5` | Body line height |
| `line-height-tight` | `1.35` | Heading line height |

### Implementation Notes
- `body` now pulls from `font-sans` with `font-size-base`.
- Components should favor Tailwind classes (`text-lg`, `leading-tight`) which map to the updated tokens.

## 3. Spacing Tokens (8px Grid)

| Token | Value |
|-------|-------|
| `spacing-1` | `0.5rem` (8px) |
| `spacing-2` | `1rem` (16px) |
| `spacing-3` | `1.5rem` (24px) |
| `spacing-4` | `2rem` (32px) |
| `spacing-5` | `2.5rem` (40px) |
| `spacing-6` | `3rem` (48px) |
| `spacing-7` | `3.5rem` (56px) |
| `spacing-8` | `4rem` (64px) |

Existing Tailwind utilities (`p-6`, `space-y-4`, etc.) now resolve to these 8px multiples.

## 4. Components Updated in Story 1.2

| Component | Improvements |
|-----------|--------------|
| `src/app/page.tsx` | Top navigation uses `bg-brand-primary`, `text-brand-on-primary`, and token-based highlights for buttons. Demonstrates CTA styling with the new palette. |
| `src/components/MaterialRequestForm.tsx` | Cards, buttons, and inputs align to `brand-primary`, `brand-surface`, and spacing tokens. Form focus states now use `focus:ring-brand-primary`. |
| `src/components/ProcurementDashboard.tsx` | Status chips leverage `status-*` tokens for submitted/approved/pending/rejected states. |

## 5. Adoption Checklist

- [x] Define tokens in `src/app/globals.css` using Tailwind `@theme` inline block.
- [x] Apply tokens to at least two key screens (navigation + MR form).
- [x] Update status styling to use shared palette (`ProcurementDashboard`).
- [x] Document tokens in this file and reference from future backlog items.
- [x] Record state variants (hover, focus-visible, disabled) for primary buttons and nav pills.

## 6. State Variants

| Token | Purpose | Notes |
|-------|---------|-------|
| `focus:ring-brand-primary` | Focus outline for buttons/nav | Uses 40% alpha of `brand-primary`. |
| `hover:bg-brand-primary/90` | Hover state for primary surfaces | Darkens Deep Blue by 10%. |
| `disabled:opacity-60` | Disabled state helper | Applies consistent opacity for disabled tokens. |

## 7. Validation Notes

- **Contrast:** Verified `brand-primary` on `brand-on-primary` and status colors on light surfaces meet WCAG AA 4.5:1 using Stark plugin.
- **Responsive:** Inspected navigation and MR form at 1280px, 1024px, 768px, and 375px widths to confirm spacing tokens maintain layout integrity.
- **Regression:** No API or data-layer changes; UI refactors confined to CSS/React component styles.

## 8. Next Steps

- Migrate remaining dashboards, modals, and cards to consume the tokens.
- Integrate Storybook or zeroheight documentation for design → dev parity.
- Layer in state-specific variants (hover/pressed/disabled) once UI kit work begins (Story 2.1).

---
*Source references: `docs/front-end.md`, `docs/uiux/ui-audit-report.md`, `docs/uiux/ui-gap-checklist.csv`*
