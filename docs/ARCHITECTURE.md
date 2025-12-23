# DocForge Architecture

## System Overview

DocForge is designed as a modular, embeddable document editing platform. The architecture prioritizes:

1. **Modularity**: Each component can be used independently
2. **Embeddability**: Easy integration into host applications
3. **AI-First**: Built-in protocol for AI assistant collaboration
4. **Performance**: Canvas-based rendering for large datasets
5. **Portability**: Runs entirely client-side in modern browsers

```
┌─────────────────────────────────────────────────────────────────┐
│                      Host Application                            │
│                  (LibreChat, Standalone, etc.)                   │
├─────────────────────────────────────────────────────────────────┤
│                       @docforge/ai-bridge                        │
│              Command Protocol & Message Handling                 │
├──────────────────────────┬──────────────────────────────────────┤
│   @docforge/spreadsheet  │      @docforge/presentation          │
│   (FortuneSheet fork)    │      (Custom canvas-based)           │
├──────────────────────────┴──────────────────────────────────────┤
│                        @docforge/core                            │
│              Shared utilities, types, constants                  │
├─────────────────────────────────────────────────────────────────┤
│                       @docforge/file-io                          │
│              SheetJS + PptxGenJS + Custom parsers                │
└─────────────────────────────────────────────────────────────────┘
```

## Package Architecture

### @docforge/core

The foundation package providing shared utilities and types.

**Contents:**

```typescript
// Types
export interface Point { x: number; y: number; }
export interface Rect { x: number; y: number; width: number; height: number; }
export interface Color { r: number; g: number; b: number; a?: number; }

// Document types
export type DocumentType = 'spreadsheet' | 'presentation';

export interface Document {
  id: string;
  type: DocumentType;
  title: string;
  createdAt: Date;
  modifiedAt: Date;
}

// Utilities
export function generateId(): string;
export function parseColor(color: string): Color;
export function rectContains(rect: Rect, point: Point): boolean;

// Event system
export class EventEmitter<T extends Record<string, any>> {
  on<K extends keyof T>(event: K, handler: (data: T[K]) => void): void;
  off<K extends keyof T>(event: K, handler: (data: T[K]) => void): void;
  emit<K extends keyof T>(event: K, data: T[K]): void;
}
```

### @docforge/file-io

File format handling for import/export operations.

**Structure:**

```
file-io/
├── src/
│   ├── xlsx/           # XLSX read/write (SheetJS wrapper)
│   │   ├── reader.ts
│   │   ├── writer.ts
│   │   └── types.ts
│   ├── pptx/           # PPTX handling
│   │   ├── reader.ts   # Custom PPTX parser
│   │   ├── writer.ts   # PptxGenJS wrapper
│   │   └── types.ts
│   ├── pdf/            # PDF export
│   │   ├── spreadsheet.ts
│   │   └── presentation.ts
│   ├── odf/            # ODS/ODP support (future)
│   │   ├── reader.ts
│   │   └── writer.ts
│   └── index.ts
```

**API:**

```typescript
// Spreadsheet I/O
export async function readXlsx(file: File | ArrayBuffer): Promise<Workbook>;
export async function writeXlsx(workbook: Workbook): Promise<Blob>;

// Presentation I/O
export async function readPptx(file: File | ArrayBuffer): Promise<Presentation>;
export async function writePptx(presentation: Presentation): Promise<Blob>;

// PDF Export
export async function exportSpreadsheetToPdf(workbook: Workbook): Promise<Blob>;
export async function exportPresentationToPdf(presentation: Presentation): Promise<Blob>;
```

### @docforge/spreadsheet

Spreadsheet editor based on FortuneSheet fork.

**Key Modifications from FortuneSheet:**

1. **UI Simplification**: Remove toolbar items for rarely-used features
2. **Theme System**: Custom theming to match modern design language
3. **AI Command Handlers**: Built-in support for AI command protocol
4. **Event Hooks**: External integration points
5. **Toolbar Customization**: Configuration-driven toolbar

**Structure:**

```
spreadsheet/
├── src/
│   ├── components/     # React components
│   │   ├── Spreadsheet.tsx
│   │   ├── Toolbar.tsx
│   │   ├── FormulaBar.tsx
│   │   ├── SheetTabs.tsx
│   │   └── CellEditor.tsx
│   ├── core/           # Core logic (forked)
│   │   ├── canvas/     # Canvas rendering
│   │   ├── formula/    # Formula engine
│   │   ├── selection/  # Selection management
│   │   └── clipboard/  # Clipboard handling
│   ├── ai/             # AI integration
│   │   ├── commands.ts
│   │   └── handlers.ts
│   ├── themes/         # Theming
│   │   └── default.ts
│   └── index.ts
```

**API:**

```typescript
export interface SpreadsheetOptions {
  container: HTMLElement | string;
  toolbar?: 'full' | 'minimal' | 'none' | ToolbarConfig;
  theme?: ThemeConfig;
  aiEnabled?: boolean;
  readOnly?: boolean;
  initialData?: Workbook;
}

export class Spreadsheet extends EventEmitter<SpreadsheetEvents> {
  constructor(options: SpreadsheetOptions);

  // Document operations
  getData(): Workbook;
  setData(workbook: Workbook): void;
  clear(): void;

  // Cell operations
  getCellValue(sheet: number, row: number, col: number): CellValue;
  setCellValue(sheet: number, row: number, col: number, value: CellValue): void;
  setCells(cells: CellUpdate[]): void;
  getRange(sheet: number, range: string): CellValue[][];

  // Formatting
  formatRange(sheet: number, range: string, format: CellFormat): void;

  // Charts
  insertChart(sheet: number, config: ChartConfig): string;

  // Sheets
  addSheet(name?: string): number;
  deleteSheet(index: number): void;
  renameSheet(index: number, name: string): void;

  // AI commands
  executeCommand(command: AICommand): Promise<AIResponse>;

  // Export
  export(format: 'xlsx' | 'csv' | 'pdf'): Promise<Blob>;

  // Lifecycle
  destroy(): void;
}
```

### @docforge/presentation

Custom canvas-based presentation editor.

**Structure:**

```
presentation/
├── src/
│   ├── components/     # React components
│   │   ├── Presentation.tsx
│   │   ├── SlidePanel.tsx
│   │   ├── SlideCanvas.tsx
│   │   ├── Toolbar.tsx
│   │   └── PropertyPanel.tsx
│   ├── core/
│   │   ├── canvas/     # Canvas rendering
│   │   │   ├── Renderer.ts
│   │   │   └── HitTest.ts
│   │   ├── shapes/     # Shape system
│   │   │   ├── Shape.ts
│   │   │   ├── TextBox.ts
│   │   │   ├── Rectangle.ts
│   │   │   ├── Ellipse.ts
│   │   │   ├── Line.ts
│   │   │   └── Image.ts
│   │   ├── selection/  # Selection handling
│   │   │   ├── SelectionManager.ts
│   │   │   └── Handles.ts
│   │   └── layout/     # Layout engine
│   │       ├── Grid.ts
│   │       └── Guides.ts
│   ├── ai/             # AI integration
│   │   ├── commands.ts
│   │   └── handlers.ts
│   └── index.ts
```

**API:**

```typescript
export interface PresentationOptions {
  container: HTMLElement | string;
  toolbar?: 'full' | 'minimal' | 'none' | ToolbarConfig;
  theme?: ThemeConfig;
  aiEnabled?: boolean;
  readOnly?: boolean;
  initialData?: Presentation;
}

export class PresentationEditor extends EventEmitter<PresentationEvents> {
  constructor(options: PresentationOptions);

  // Document operations
  getData(): Presentation;
  setData(presentation: Presentation): void;
  clear(): void;

  // Slide operations
  addSlide(layout?: SlideLayout, position?: number): number;
  deleteSlide(index: number): void;
  duplicateSlide(index: number): number;
  reorderSlide(from: number, to: number): void;
  getSlideCount(): number;

  // Shape operations
  addShape(slideIndex: number, type: ShapeType, props: ShapeProps): string;
  addTextBox(slideIndex: number, text: string, props: TextBoxProps): string;
  addImage(slideIndex: number, src: string, props: ImageProps): string;
  updateShape(slideIndex: number, shapeId: string, props: Partial<ShapeProps>): void;
  deleteShape(slideIndex: number, shapeId: string): void;

  // AI commands
  executeCommand(command: AICommand): Promise<AIResponse>;

  // Export
  export(format: 'pptx' | 'pdf' | 'png'): Promise<Blob>;

  // Lifecycle
  destroy(): void;
}
```

### @docforge/ai-bridge

AI integration layer providing the command protocol.

**Structure:**

```
ai-bridge/
├── src/
│   ├── protocol/
│   │   ├── types.ts      # Command/response types
│   │   ├── commands.ts   # Command definitions
│   │   └── errors.ts     # Error types
│   ├── handlers/
│   │   ├── registry.ts   # Command registry
│   │   └── executor.ts   # Command execution
│   ├── transport/
│   │   ├── postMessage.ts
│   │   └── direct.ts
│   └── index.ts
```

## Command Protocol Design

Based on lessons learned from the ZetaOffice implementation.

### Message Format

```typescript
interface AICommand {
  id: string;              // Unique command ID (UUID)
  type: string;            // Command type (e.g., 'sheet.setCells')
  payload: object;         // Command-specific data
  timestamp: number;       // Unix timestamp
}

interface AIResponse {
  commandId: string;       // References AICommand.id
  success: boolean;        // Whether command succeeded
  result?: any;            // Command-specific result data
  error?: {
    code: string;          // Error code (e.g., 'INVALID_RANGE')
    message: string;       // Human-readable error message
  };
  duration?: number;       // Execution time in ms
}
```

### Spreadsheet Commands

| Command | Description | Payload | Response |
|---------|-------------|---------|----------|
| `sheet.create` | Create new spreadsheet | `{ title?: string }` | `{ documentId: string }` |
| `sheet.getData` | Read cell data | `{ sheet?: number, range?: string }` | `{ data: CellValue[][] }` |
| `sheet.setCells` | Set cell values | `{ cells: [{sheet?, row, col, value}] }` | `{ updated: number }` |
| `sheet.format` | Apply formatting | `{ sheet, range, format }` | `{ success: true }` |
| `sheet.insertChart` | Add chart | `{ sheet, type, dataRange, position }` | `{ chartId: string }` |
| `sheet.addSheet` | Add new sheet | `{ name?: string }` | `{ index: number }` |
| `sheet.export` | Export document | `{ format: 'xlsx'|'pdf'|'csv' }` | `{ blob: Blob }` |

### Presentation Commands

| Command | Description | Payload | Response |
|---------|-------------|---------|----------|
| `slide.create` | Create new presentation | `{ title?: string }` | `{ documentId: string }` |
| `slide.addSlide` | Add slide | `{ layout?, position? }` | `{ index: number }` |
| `slide.deleteSlide` | Delete slide | `{ index: number }` | `{ success: true }` |
| `slide.addShape` | Add shape | `{ slide, type, x, y, width, height, props? }` | `{ shapeId: string }` |
| `slide.addText` | Add text box | `{ slide, text, x, y, width, height, format? }` | `{ shapeId: string }` |
| `slide.addImage` | Add image | `{ slide, src, x, y, width?, height? }` | `{ shapeId: string }` |
| `slide.format` | Format shape | `{ slide, shapeId, format }` | `{ success: true }` |
| `slide.getData` | Read presentation | `{}` | `{ slides: Slide[] }` |
| `slide.export` | Export document | `{ format: 'pptx'|'pdf' }` | `{ blob: Blob }` |

### Error Codes

| Code | Description |
|------|-------------|
| `INVALID_COMMAND` | Unknown command type |
| `INVALID_PAYLOAD` | Payload validation failed |
| `INVALID_RANGE` | Invalid cell range specification |
| `INVALID_SLIDE` | Slide index out of bounds |
| `SHAPE_NOT_FOUND` | Shape ID does not exist |
| `EXPORT_FAILED` | Export operation failed |
| `INTERNAL_ERROR` | Unexpected internal error |

## State Management

Each editor maintains internal state with external events for integration.

```typescript
interface EditorState {
  document: Document;      // Full document model
  selection: Selection;    // Current selection
  viewport: Viewport;      // Visible area
  history: History;        // Undo/redo stack
  isDirty: boolean;        // Has unsaved changes
}

// Events emitted for integration
type SpreadsheetEvents = {
  'document:changed': ChangeSet;
  'selection:changed': Selection;
  'command:executed': AIResponse;
  'cell:edited': { sheet: number; row: number; col: number; value: CellValue };
  'sheet:added': { index: number; name: string };
  'sheet:deleted': { index: number };
};

type PresentationEvents = {
  'document:changed': ChangeSet;
  'selection:changed': Selection;
  'command:executed': AIResponse;
  'slide:added': { index: number };
  'slide:deleted': { index: number };
  'shape:added': { slideIndex: number; shapeId: string };
  'shape:deleted': { slideIndex: number; shapeId: string };
};
```

## Embedding Architecture

DocForge editors can be embedded in two modes:

### Direct Embedding

For applications with direct JavaScript access:

```typescript
import { Spreadsheet } from '@docforge/spreadsheet';

const sheet = new Spreadsheet({
  container: '#editor',
  toolbar: 'minimal',
  aiEnabled: true,
});

// Execute AI commands directly
const response = await sheet.executeCommand({
  id: 'cmd-1',
  type: 'sheet.setCells',
  payload: {
    cells: [
      { row: 0, col: 0, value: 'Hello' },
      { row: 0, col: 1, value: 'World' },
    ],
  },
  timestamp: Date.now(),
});
```

### iframe Isolation

For AI integrations requiring isolation (recommended for LibreChat):

```html
<!-- Host page -->
<iframe id="docforge" src="/docforge/spreadsheet.html"></iframe>

<script>
const iframe = document.getElementById('docforge');

// Send command
iframe.contentWindow.postMessage({
  type: 'ai-command',
  command: {
    id: 'cmd-1',
    type: 'sheet.setCells',
    payload: { cells: [{ row: 0, col: 0, value: 'Hello' }] },
    timestamp: Date.now(),
  },
}, '*');

// Receive response
window.addEventListener('message', (e) => {
  if (e.data.type === 'ai-response') {
    console.log('Response:', e.data.response);
  }
});
</script>
```

## Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Language | TypeScript | Type safety, IDE support, better maintainability |
| UI Framework | React 18 | Component model, hooks, concurrent features, ecosystem |
| Rendering | HTML5 Canvas | Performance for large datasets, precise control |
| State | Zustand | Lightweight, TypeScript-native, simple API |
| Build | Vite + Rollup | Fast dev server, optimized production bundles |
| Testing | Vitest + Playwright | Fast unit tests, reliable E2E tests |
| Styling | Tailwind CSS | Utility-first, easy theming, small bundle |
| Monorepo | pnpm workspaces | Fast installs, strict dependency management |

## Directory Structure

```
docforge/
├── packages/
│   ├── core/                 # @docforge/core
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── file-io/              # @docforge/file-io
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── spreadsheet/          # @docforge/spreadsheet
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── presentation/         # @docforge/presentation
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── ai-bridge/            # @docforge/ai-bridge
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
├── apps/
│   ├── demo/                 # Demo application
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── docs/                 # Documentation site
│       └── ...
├── tools/                    # Build scripts
├── docs/                     # Project documentation
├── package.json              # Root package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .eslintrc.js
├── .prettierrc
└── README.md
```

## Data Models

### Spreadsheet Data Model

```typescript
interface Workbook {
  id: string;
  title: string;
  sheets: Sheet[];
  activeSheet: number;
  styles: StyleRegistry;
}

interface Sheet {
  id: string;
  name: string;
  cells: Map<string, Cell>;  // Key: "row,col"
  rowHeights: Map<number, number>;
  colWidths: Map<number, number>;
  merges: Merge[];
  charts: Chart[];
  frozenRows: number;
  frozenCols: number;
}

interface Cell {
  value: CellValue;
  formula?: string;
  style?: CellStyle;
  comment?: string;
}

type CellValue = string | number | boolean | null | Date;
```

### Presentation Data Model

```typescript
interface Presentation {
  id: string;
  title: string;
  slides: Slide[];
  slideWidth: number;
  slideHeight: number;
  theme: PresentationTheme;
}

interface Slide {
  id: string;
  layout: SlideLayout;
  shapes: Shape[];
  background?: Background;
  transition?: Transition;
  notes?: string;
}

interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  style: ShapeStyle;
  // Type-specific properties
  text?: RichText;      // For text boxes
  src?: string;         // For images
  points?: Point[];     // For lines/arrows
}

type ShapeType = 'textbox' | 'rectangle' | 'ellipse' | 'triangle' | 'line' | 'arrow' | 'image';
```

## Security Considerations

1. **No eval()**: All data processing uses safe parsing, no dynamic code execution
2. **Input Sanitization**: File imports validate structure before processing
3. **CSP Compatible**: No inline scripts, all code bundled
4. **iframe Isolation**: AI commands go through postMessage, not direct access
5. **Safe Image Loading**: External images loaded via proxy or validated URLs
6. **XSS Prevention**: User content (text, formulas) properly escaped when rendered
