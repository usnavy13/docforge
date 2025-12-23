# DocForge Implementation Plan

## Overview
Complete Phase 0 tooling setup, then implement all remaining phases (1-5) meeting Must-Have and Should-Have requirements.

---

## Phase 0: Development Tooling (Immediate)

### Files to Create

| File | Purpose |
|------|---------|
| `eslint.config.js` | ESLint flat config (TypeScript + React) |
| `.prettierrc` | Formatting rules |
| `.prettierignore` | Skip dist, node_modules, lock files |
| `.editorconfig` | Editor-agnostic settings |
| `vitest.workspace.ts` | Monorepo test workspace |
| `packages/*/vitest.config.ts` | Per-package test config (5 files) |
| `packages/*/tsup.config.ts` | Per-package build config (5 files) |
| `.github/workflows/ci.yml` | Lint, test, build on PR/push |

### Root Dependencies to Add
```
eslint, @eslint/js, typescript-eslint, eslint-plugin-react, eslint-plugin-react-hooks, globals, prettier
```

### Exit Criteria
- `pnpm lint` passes
- `pnpm format:check` passes
- `pnpm test` runs
- `pnpm build` succeeds
- GitHub Actions CI passes

---

## Phase 1: Spreadsheet MVP

### Milestone 1.1: FortuneSheet Integration
- Fork FortuneSheet into `packages/spreadsheet/vendor/`
- Simplify UI (minimal toolbar, remove unneeded features)
- Create `SpreadsheetEditor` React component wrapper
- Implement theming via CSS custom properties

### Milestone 1.2: AI Command Handlers
Implement in `packages/spreadsheet/src/handlers/`:
- `sheet.create` - Create new workbook
- `sheet.getData` - Read cell data from range
- `sheet.setCells` - Write values to cells
- `sheet.format` - Apply cell formatting
- `sheet.insertChart` - Insert chart from data range
- `sheet.export` - Export to XLSX/CSV

### Milestone 1.3: File I/O
Implement in `packages/file-io/src/`:
- `xlsx.ts` - SheetJS integration for XLSX read/write
- `csv.ts` - CSV import/export

### Milestone 1.4: Demo App
- Create `apps/spreadsheet-demo/` (Vite + React)
- Full-page editor with file open/save
- AI command testing panel

### Exit Criteria
- Create, edit, navigate cells
- All 6 AI commands work
- XLSX/CSV import/export round-trips
- 80%+ test coverage on handlers

---

## Phase 2: Presentation Editor

### Milestone 2.1: Canvas Rendering Engine
- `CanvasRenderer.ts` - Main render loop
- `ViewportManager.ts` - Pan/zoom
- `SelectionManager.ts` - Selection state

### Milestone 2.2: Shape System
Base `Shape` class + implementations:
- TextBox, Rectangle, Ellipse, Line, Arrow, Image
- ShapeFactory for instantiation

### Milestone 2.3: Slide Management
- Slide data model with layouts (blank, title, two-column)
- Slide thumbnail panel with drag-to-reorder
- Add/delete/duplicate slides

### Milestone 2.4: Shape Manipulation
- Click-to-select, multi-select
- Resize handles (8-point)
- Rotation handle
- Drag to move
- Z-order controls

### Milestone 2.5: UI Components
- Toolbar (shape insertion)
- Property panel (fill, stroke, text formatting)
- `PresentationEditor` React component

### Milestone 2.6: AI Command Handlers
- `slide.create`, `slide.addSlide`, `slide.addShape`
- `slide.addText`, `slide.addImage`, `slide.export`

### Milestone 2.7: PPTX Export
- Implement in `packages/file-io/src/pptx.ts`
- Map shapes to PptxGenJS elements

### Milestone 2.8: Demo App
- Create `apps/presentation-demo/`

### Exit Criteria
- Create slides, add all shape types
- Selection/manipulation works
- All 6 AI commands function
- PPTX export produces valid files
- 80%+ test coverage

---

## Phase 3: File Format Completeness

### Milestone 3.1: PPTX Import
- Parse PPTX files
- Map elements to DocForge shapes
- Preserve layout best-effort

### Milestone 3.2: PDF Export
- Spreadsheet: Paginated cell rendering
- Presentation: Slides as pages
- Use jspdf or pdf-lib

### Milestone 3.3: Formula Engine
- Integrate HyperFormula (300+ functions)
- Wire to calculation engine

### Milestone 3.4: Advanced Spreadsheet Features
- Conditional formatting
- Data validation (dropdowns, ranges)
- Freeze rows/columns
- Named ranges

### Exit Criteria
- PPTX import works for basic presentations
- PDF export works for both editors
- Excel-compatible formula support
- Conditional formatting and validation work

---

## Phase 4: LibreChat Integration

### Milestone 4.1: Plugin Package
- Create `packages/librechat-plugin/`
- Tool definitions for AI agents

### Milestone 4.2: Tool Definitions
Spreadsheet: `docforge_spreadsheet_create`, `_set_cells`, `_format`, `_insert_chart`, `_export`
Presentation: `docforge_presentation_create`, `_add_slide`, `_add_shape`, `_add_text`, `_export`

### Milestone 4.3: Communication Layer
- Implement `PostMessageTransport` in ai-bridge
- Command/response serialization
- Origin validation

### Milestone 4.4: E2E Testing
- Playwright tests with LibreChat
- Full AI command flow testing

### Exit Criteria
- LibreChat embeds DocForge editors
- AI agents issue commands via tools
- E2E tests pass in CI

---

## Phase 5: Polish and Community

### Milestone 5.1: Documentation Site
- `apps/docs/` with Docusaurus
- API reference, getting started, embedding guide

### Milestone 5.2: Performance Optimization
- Canvas dirty rect tracking
- Virtual scrolling for large spreadsheets
- Bundle size reduction
- Lazy loading

### Milestone 5.3: Accessibility
- Keyboard navigation (Tab, arrows, shortcuts)
- ARIA roles and labels
- Focus indicators
- WCAG 2.1 AA compliance

### Milestone 5.4: Internationalization
- i18n string extraction
- Locale file structure
- RTL support consideration

### Exit Criteria
- Documentation site deployed
- Lighthouse performance 90+
- Keyboard navigation complete
- Screen reader support
- WCAG 2.1 AA verified

---

## Phase Dependencies

```
Phase 0 ──> Phase 1 ──┬──> Phase 3 ──> Phase 4 ──> Phase 5
                      │
           Phase 2 ───┘
```

- Phase 0 required before all others
- Phase 1 and Phase 2 can run in parallel
- Phase 3 requires both 1 and 2
- Phase 4 requires Phase 3
- Phase 5 can begin incrementally after Phase 2

---

## Critical Files Reference

**Phase 0:**
- `package.json` - Add ESLint/Prettier devDependencies
- `tsconfig.base.json` - Already configured (no changes)

**Phase 1:**
- `packages/spreadsheet/src/Spreadsheet.ts` - Main component
- `packages/file-io/src/xlsx.ts` - SheetJS wrapper
- `packages/ai-bridge/src/CommandRegistry.ts` - Handler registration

**Phase 2:**
- `packages/presentation/src/PresentationEditor.ts` - Main component
- `packages/file-io/src/pptx.ts` - PptxGenJS wrapper

**Phase 4:**
- `packages/ai-bridge/src/transports.ts` - postMessage implementation
