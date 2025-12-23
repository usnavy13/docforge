# DocForge

Modern, AI-native document editing for spreadsheets and presentations.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Spreadsheets**: Full-featured spreadsheet editor with formulas, charts, and formatting
- **Presentations**: Slide deck editor with shapes, images, and transitions
- **AI Integration**: Built-in protocol for AI assistant collaboration
- **File Compatibility**: Import/export XLSX, PPTX, PDF, ODF formats
- **Clean UI**: Modern interface without legacy clutter

## Quick Start

```bash
# Clone the repository
git clone https://github.com/usnavy13/docforge.git
cd docforge

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start development server
pnpm dev
```

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| `@docforge/core` | Shared utilities and types | Planned |
| `@docforge/spreadsheet` | Spreadsheet editor (FortuneSheet fork) | Planned |
| `@docforge/presentation` | Presentation editor (canvas-based) | Planned |
| `@docforge/file-io` | File format handling (XLSX, PPTX, PDF) | Planned |
| `@docforge/ai-bridge` | AI command protocol | Planned |

## Documentation

- [Project Charter](docs/PROJECT_CHARTER.md) - Vision and goals
- [Requirements](docs/REQUIREMENTS.md) - Functional and non-functional requirements
- [Architecture](docs/ARCHITECTURE.md) - System design and technology decisions
- [Roadmap](docs/ROADMAP.md) - Development phases and milestones
- [Contributing](CONTRIBUTING.md) - How to contribute

## Architecture

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

## Background

DocForge was created to address the limitations of existing solutions for embedding document editing in AI-powered applications:

- **ZetaOffice/LibreOffice WASM**: Cannot customize UI, dispatch commands have side effects
- **Univer**: Critical features (XLSX import/export, charts, PDF) are closed source
- **Traditional office suites**: Heavy, not designed for AI integration

DocForge provides a fully open-source alternative with a modern, clean UI designed specifically for AI collaboration.

## Technology Stack

| Component | Technology | License |
|-----------|------------|---------|
| Spreadsheet | FortuneSheet (fork) | MIT |
| XLSX I/O | SheetJS CE | Apache 2.0 |
| PPTX Export | PptxGenJS | MIT |
| UI Framework | React 18 | MIT |
| Build | Vite + pnpm | MIT |

## License

MIT License - see [LICENSE](LICENSE)

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a pull request.

## Acknowledgments

- [FortuneSheet](https://github.com/ruilisi/fortune-sheet) - MIT licensed spreadsheet foundation
- [SheetJS](https://sheetjs.com/) - Excellent file format handling
- [PptxGenJS](https://gitbrent.github.io/PptxGenJS/) - PowerPoint generation
- [LibreChat](https://github.com/danny-avila/LibreChat) - Inspiration and primary integration target
