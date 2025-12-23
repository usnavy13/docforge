# DocForge Roadmap

## Overview

This roadmap outlines the development phases for DocForge. Each phase has specific goals and deliverables that build toward a complete, production-ready document editing platform.

## Phase 0: Foundation

**Goal**: Establish the project infrastructure and development environment.

### Deliverables

- [ ] **Repository Setup**
  - [x] Create GitHub repository
  - [x] Configure pnpm workspaces
  - [ ] Set up TypeScript base configuration
  - [ ] Configure ESLint and Prettier
  - [ ] Add EditorConfig for consistent formatting

- [ ] **CI/CD Pipeline**
  - [ ] GitHub Actions for lint/test on PR
  - [ ] GitHub Actions for build verification
  - [ ] Dependabot for dependency updates
  - [ ] Release automation with changesets

- [ ] **@docforge/core Package**
  - [ ] TypeScript types and interfaces
  - [ ] Utility functions (ID generation, color parsing)
  - [ ] Event emitter base class
  - [ ] Unit tests

- [ ] **Development Tooling**
  - [ ] Vitest configuration
  - [ ] Playwright setup for E2E tests
  - [ ] Hot reload development server
  - [ ] Package build scripts (Rollup)

### Exit Criteria

- All packages can be built successfully
- Tests run in CI
- Development server starts without errors

---

## Phase 1: Spreadsheet MVP

**Goal**: Deliver a functional spreadsheet editor with AI integration.

### Deliverables

- [ ] **FortuneSheet Integration**
  - [ ] Fork FortuneSheet to @docforge/spreadsheet
  - [ ] Remove unnecessary features/dependencies
  - [ ] Update build configuration for monorepo
  - [ ] Verify core functionality works

- [ ] **UI Customization**
  - [ ] Create minimal toolbar configuration
  - [ ] Implement custom theme system
  - [ ] Design clean, modern UI components
  - [ ] Remove or hide advanced features

- [ ] **AI Command Handlers**
  - [ ] `sheet.create` - Create new spreadsheet
  - [ ] `sheet.setCells` - Set cell values
  - [ ] `sheet.getData` - Read cell data
  - [ ] `sheet.format` - Apply formatting
  - [ ] `sheet.insertChart` - Add charts
  - [ ] `sheet.addSheet` / `sheet.deleteSheet`
  - [ ] `sheet.export` - Export document

- [ ] **File I/O**
  - [ ] XLSX export via SheetJS
  - [ ] XLSX import via SheetJS
  - [ ] CSV export

- [ ] **Demo Application**
  - [ ] Standalone spreadsheet demo
  - [ ] AI command testing interface
  - [ ] Basic documentation

### Exit Criteria

- Spreadsheet editor renders and is interactive
- AI can create, populate, and format a spreadsheet
- XLSX export opens correctly in Excel
- XLSX import loads correctly

---

## Phase 2: Presentation Editor

**Goal**: Build a canvas-based presentation editor from scratch.

### Deliverables

- [ ] **Canvas Rendering Engine**
  - [ ] Base canvas setup with React
  - [ ] Shape rendering system
  - [ ] Text rendering with formatting
  - [ ] Image rendering
  - [ ] Hit testing for selection

- [ ] **Shape System**
  - [ ] Base Shape class
  - [ ] TextBox shape with rich text
  - [ ] Rectangle shape
  - [ ] Ellipse shape
  - [ ] Line and arrow shapes
  - [ ] Image shape

- [ ] **Slide Management**
  - [ ] Slide data model
  - [ ] Add/delete/duplicate slides
  - [ ] Reorder slides (drag-and-drop)
  - [ ] Slide thumbnails panel
  - [ ] Slide layouts (title, content, blank)

- [ ] **Selection and Manipulation**
  - [ ] Single shape selection
  - [ ] Multi-select (Shift+click, drag select)
  - [ ] Move shapes (drag)
  - [ ] Resize shapes (corner handles)
  - [ ] Z-order controls

- [ ] **UI Components**
  - [ ] Toolbar with shape tools
  - [ ] Property panel for formatting
  - [ ] Color picker
  - [ ] Font selector

- [ ] **AI Command Handlers**
  - [ ] `slide.create` - Create presentation
  - [ ] `slide.addSlide` - Add slides
  - [ ] `slide.addShape` - Add shapes
  - [ ] `slide.addText` - Add text boxes
  - [ ] `slide.addImage` - Add images
  - [ ] `slide.format` - Format shapes
  - [ ] `slide.getData` - Read presentation
  - [ ] `slide.export` - Export document

- [ ] **PPTX Export**
  - [ ] Integrate PptxGenJS
  - [ ] Map shapes to PPTX elements
  - [ ] Export text formatting
  - [ ] Export images

- [ ] **Demo Application**
  - [ ] Standalone presentation demo
  - [ ] AI command testing interface

### Exit Criteria

- Presentation editor renders slides
- Users can add and edit shapes/text
- AI can create and populate presentations
- PPTX export opens correctly in PowerPoint

---

## Phase 3: File Format Completeness

**Goal**: Full file format support including import and additional formats.

### Deliverables

- [ ] **PPTX Import**
  - [ ] Parse PPTX structure
  - [ ] Import slide layouts
  - [ ] Import shapes and text
  - [ ] Import images
  - [ ] Handle unsupported elements gracefully

- [ ] **PDF Export**
  - [ ] Spreadsheet to PDF
  - [ ] Presentation to PDF
  - [ ] Configurable page settings

- [ ] **ODF Support** (Optional)
  - [ ] ODS import/export
  - [ ] ODP import/export

- [ ] **Enhanced Formulas**
  - [ ] Expand formula coverage to 300+ functions
  - [ ] Improve formula parsing/display
  - [ ] Array formula support

- [ ] **Advanced Spreadsheet Features**
  - [ ] Conditional formatting
  - [ ] Data validation (dropdowns)
  - [ ] Freeze rows/columns
  - [ ] Comments/notes

### Exit Criteria

- PPTX files can be imported and edited
- PDF exports maintain visual fidelity
- Formula coverage matches common use cases

---

## Phase 4: LibreChat Integration

**Goal**: Seamless integration with LibreChat as primary target.

### Deliverables

- [ ] **@docforge/librechat-plugin Package**
  - [ ] React components for LibreChat
  - [ ] Document panel integration
  - [ ] Tool definitions for AI agents

- [ ] **Tool Implementation**
  - [ ] Port ZetaOffice tool patterns
  - [ ] Spreadsheet tools (create, edit, format, chart)
  - [ ] Presentation tools (create, slides, shapes)
  - [ ] Export tools

- [ ] **Communication Layer**
  - [ ] Polling/command queue system
  - [ ] Ready signal coordination
  - [ ] Error handling and recovery

- [ ] **File Storage Integration**
  - [ ] Save to LibreChat storage
  - [ ] Load from LibreChat storage
  - [ ] Document attachment flow

- [ ] **Testing**
  - [ ] E2E tests with LibreChat
  - [ ] AI agent workflow tests
  - [ ] Performance testing

### Exit Criteria

- DocForge works in LibreChat
- AI can create and edit documents
- Documents save and load correctly
- No regressions from ZetaOffice functionality

---

## Phase 5: Polish and Community

**Goal**: Production-ready release with community support.

### Deliverables

- [ ] **Documentation Site**
  - [ ] Set up Docusaurus or similar
  - [ ] API reference documentation
  - [ ] Getting started guides
  - [ ] Example integrations
  - [ ] Embedding tutorials

- [ ] **Performance Optimization**
  - [ ] Profile and optimize rendering
  - [ ] Reduce bundle size
  - [ ] Lazy loading for large features
  - [ ] Virtual scrolling for large spreadsheets

- [ ] **Accessibility**
  - [ ] Keyboard navigation audit
  - [ ] Screen reader testing
  - [ ] High contrast mode
  - [ ] WCAG 2.1 AA compliance review

- [ ] **Internationalization**
  - [ ] i18n infrastructure
  - [ ] English and one additional language
  - [ ] RTL support

- [ ] **Community Enablement**
  - [ ] Issue templates
  - [ ] PR templates
  - [ ] Contributing guide updates
  - [ ] Code of conduct
  - [ ] Discord/community channel

### Exit Criteria

- Documentation site is live
- Performance benchmarks published
- Accessibility audit passed
- First external contribution merged

---

## Future Considerations (Post v1)

These features are explicitly out of scope for v1 but may be considered later:

- **Real-time Collaboration**: Multi-user editing with OT/CRDT
- **Mobile Support**: Native mobile apps or responsive improvements
- **Word Processor**: Document/text editing component
- **Advanced Features**: Pivot tables, macros, animations
- **Plugin System**: Third-party extensions
- **Self-hosted Backend**: Optional server for collaboration/storage

---

## Milestone Summary

| Phase | Key Milestone | Dependencies |
|-------|---------------|--------------|
| Phase 0 | Build infrastructure ready | None |
| Phase 1 | Spreadsheet MVP with AI | Phase 0 |
| Phase 2 | Presentation editor with AI | Phase 0 |
| Phase 3 | Full file format support | Phases 1, 2 |
| Phase 4 | LibreChat integration complete | Phases 1, 2 |
| Phase 5 | Production release | Phases 3, 4 |

---

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for how to contribute to specific roadmap items.
