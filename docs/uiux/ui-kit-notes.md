# UI Kit Notes — Procurement Application

_Last updated: 2025-01-24_

This guide documents the shared component library introduced in Story 2.1. It references the design tokens (`docs/uiux/design-tokens.md`) and audit remediation plan so teams can align on implementation and usage.

## 1. Component Inventory

| Component | File | Props Summary | Notes |
|-----------|------|---------------|-------|
| `Button` | `src/components/ui/Button.tsx` | `variant` (`primary`, `secondary`, `ghost`, `danger`), `size` (`sm`, `md`, `lg`), `isLoading` | Applies brand tokens, focus ring, disabled state. |
| `Input` | `src/components/ui/Input.tsx` | `label`, `hint`, `error`, `required` | Wraps native input with tokenized styling + accessibility helpers. |
| `Select` | `src/components/ui/Select.tsx` | `label`, `hint`, `error`, native select props | Token-styled select with focus-visible outlines and optional hints. |
| `Badge` | `src/components/ui/Badge.tsx` | `variant` (`primary`, `success`, `warning`, `danger`, `neutral`), `soft` | Status/label pill supporting solid/soft palettes. |
| `Card` | `src/components/ui/Card.tsx` | `header`, `actions` | Surface container for forms/panels. Used in MR form & dashboards. |
| `Table` + helpers | `src/components/ui/Table.tsx` | `TableHead`, `TableBody`, `TableRow`, `TableCell`, `TableHeaderCell` | Token-aligned table scaffolding with hover/focus states. |
| `Tabs` | `src/components/ui/Tabs.tsx` | `tabs: { id, label, content }[]`, `defaultTabId` | Lightweight tab component with keyboard/focus support. |
| `Modal` | `src/components/ui/Modal.tsx` | `isOpen`, `title`, `description`, `footer` | Portal-based modal overlay with accessible aria bindings. |

## 2. Usage Examples

- `/src/app/ui-kit/page.tsx` provides an interactive showcase (“UI Kit Showcase”) that mirrors Storybook usage: buttons, inputs, select, badges, tabs, modal, and table examples.
- `src/app/page.tsx` (navigation shell) now consumes the `Button` primitive for active/ghost states.
- `src/components/MaterialRequestForm.tsx` adopts `Card`, `Button`, `Input`, and `Select` to align with tokens.
- `src/components/ProcurementDashboard.tsx` uses `Card`, `Table`, `Button`, and `Badge` for inbox/status presentation.
- `src/components/PRDashboard.tsx` uses UI kit `Badge`, `Select`, and `Table` for consistent styling.

## 3. Accessibility & Responsive Validation

- Contrast validated via Stark for primary/secondary/status combinations (meets WCAG AA per spec).
- Focus states confirmed for Button, Input, Tabs, and Modal with keyboard navigation.
- Responsive checks performed at 1280px, 1024px, 768px, 375px across MR Form and Procurement Dashboard to ensure spacing tokens maintain layout.

## 4. Integration Checklist

1. Import from `@/components/ui` to enforce shared primitives.
2. Remove ad-hoc Tailwind color classes in favor of tokens (`bg-brand-primary`, `text-brand-text` etc.).
3. Capture before/after screenshots when migrating modules (stored in design handoff folder).
4. Update relevant stories (Epics 2 & 3) to reference the UI kit rather than writing bespoke components.

## 5. Next Steps

- Extend UI kit with `Badge`, `Tooltip`, and `Stepper` components for RFQ wizard work.
- Expand the UI Kit Showcase with Storybook integration when package installation is available; current `/ui-kit` route acts as interim preview.
- Collaborate with design to attach Figma component references (IDs TBD) to each primitive.

## 6. Wireframe References

- Low-fidelity wireframes for the MR → RFQ → Quote Approval → PR → PO journey live under `docs/uiux/wireframes/` with index and Figma link (see `README.md`).
- Ensure component annotations in the wireframes map back to the UI kit primitives listed above.

---
*Sources: `docs/front-end.md`, `docs/uiux/ui-audit-report.md`, `docs/uiux/design-tokens.md`, `docs/uiux/ui-gap-checklist.csv`*
