# Design-to-Dev Notes — Procurement MVP

_Last updated: 2025-02-18_

## Artefact Links
- Wireframes (Story 1.3): `docs/uiux/wireframes/README.md`
- High-Fidelity Mockups (Story 2.3): `docs/uiux/mockups/README.md`
- Design Tokens (Story 1.2): `docs/uiux/design-tokens.md`
- UI Kit Guidelines (Story 2.1): `docs/uiux/ui-kit-notes.md`

## Implementation Checklist
1. Use `AppLayout` shell (top bar, sidebar, bottom nav) for every primary page.
2. Reference UI kit primitives for buttons, inputs, selects, cards, tables, badges, tabs, modals.
3. Apply spacing/typography per tokens (`space-y-5`, `font-size-base`, etc.).
4. Observe annotations in high-fi mockups for responsive behaviours and state handling.
5. Confirm focus-visible outlines and contrast match design spec before handoff.

## Review Summary
- 2025-01-24: PO + Engineering review completed. Adjustments: navigation iconography, bottom nav label spacing, PR dashboard filter alignment.
- 2025-02-18: Authentication & header alignment review (Remember Me/OTP, logo-driven branding, MR + RFQ layout tweaks). Updates reflected in Figma v1.1 and story backlogs (2.4 Authentication, 1.9 Admin wizard, RFQ/Quote refresh).
- All updates applied to current Figma version (see mockup README).

## Outstanding Items
- ✅ Create OTP input + project selector components in the UI kit (dependency for Story 2.4) - **COMPLETED**
- ✅ Create AvatarMenu component for header profile management - **COMPLETED**
- ✅ Create StatusChip component for inbox tables (MR, RFQ) - **COMPLETED**
- ✅ Create Stepper component for RFQ wizard multi-step flow - **COMPLETED**
- ✅ Update UI Kit Showcase with new components - **COMPLETED**
- ✅ Implement role-based access control for navigation items - **COMPLETED**
- ✅ Create UserProfileDropdown component for header menu - **COMPLETED**
- ✅ Create profile page for user management - **COMPLETED**
- ✅ Implement change role functionality with password verification - **COMPLETED**
- ✅ Fix Admin Dashboard API endpoints and access control - **COMPLETED**

## Implementation Status
All outstanding UI kit components and access control features have been successfully implemented. The project now includes:

### UI Kit Components
- **OtpInput**: 6-digit OTP input with auto-focus and validation
- **AvatarMenu**: User avatar with dropdown menu for profile actions
- **StatusChip**: Status indicators for tables with color coding
- **Stepper**: Multi-step wizard component for complex flows

### Access Control Features
- **Role-based Navigation**: Users only see navigation items appropriate for their role
- **Admin Access Control**: Admin and UI Kit sections are always visible but only accessible to admin users
- **User Profile Management**: Complete profile page with update functionality
- **Role Change**: Secure role change with password verification
- **Profile Dropdown**: Header dropdown with Profile, Change Role, and Sign Out options

### API Endpoints
- **Admin Dashboard**: `/api/admin/dashboard` with role-based access
- **MR Field Configuration**: `/api/admin/mr-fields` for field management
- **Authorization Matrix**: `/api/admin/authorization-matrix` for approval workflows
- **Currency Configuration**: `/api/admin/currency` for currency settings
- **Role Change**: `/api/auth/change-role` with password verification

All components are fully integrated into the UI Kit Showcase and follow the established design patterns.
