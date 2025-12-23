# Contributing to DocForge

Thank you for your interest in contributing to DocForge! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Commit Messages](#commit-messages)

## Code of Conduct

By participating in this project, you agree to maintain a respectful, inclusive environment. Be kind, be patient, and be constructive.

## Getting Started

### Prerequisites

- **Node.js 20+**: [Download](https://nodejs.org/)
- **pnpm 8+**: Install with `npm install -g pnpm`
- **Git**: [Download](https://git-scm.com/)

### Installation

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

### Verifying Setup

```bash
# Run linting
pnpm lint

# Run tests
pnpm test

# Build all packages
pnpm build
```

## Development Setup

### Recommended IDE

We recommend **VS Code** with these extensions:

- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense

### Environment Configuration

The project uses standard configuration files:

- `.eslintrc.js` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `tsconfig.base.json` - Base TypeScript configuration

## Project Structure

```
docforge/
├── packages/
│   ├── core/           # @docforge/core - Shared utilities and types
│   ├── spreadsheet/    # @docforge/spreadsheet - Spreadsheet editor
│   ├── presentation/   # @docforge/presentation - Presentation editor
│   ├── file-io/        # @docforge/file-io - File format handling
│   └── ai-bridge/      # @docforge/ai-bridge - AI command protocol
├── apps/
│   ├── demo/           # Demo application
│   └── docs/           # Documentation site
├── tools/              # Build and development scripts
├── docs/               # Project documentation
├── package.json        # Root package.json
├── pnpm-workspace.yaml # Workspace configuration
└── tsconfig.base.json  # Base TypeScript config
```

### Package Descriptions

| Package | Description |
|---------|-------------|
| `@docforge/core` | Shared types, utilities, and event system |
| `@docforge/spreadsheet` | React-based spreadsheet editor (FortuneSheet fork) |
| `@docforge/presentation` | Canvas-based presentation editor |
| `@docforge/file-io` | Import/export for XLSX, PPTX, PDF, ODF |
| `@docforge/ai-bridge` | AI command protocol and message handling |

## Development Workflow

### Working on a Feature

1. **Check existing issues** for related work
2. **Create an issue** if one doesn't exist
3. **Fork the repository** (external contributors)
4. **Create a feature branch**:
   ```bash
   git checkout -b feat/my-feature
   ```
5. **Make your changes** with tests
6. **Run linting and tests**:
   ```bash
   pnpm lint
   pnpm test
   ```
7. **Commit with conventional commit message**
8. **Push and open a PR**

### Branch Naming

Use descriptive branch names:

- `feat/add-chart-support` - New features
- `fix/formula-calculation` - Bug fixes
- `docs/update-readme` - Documentation
- `refactor/simplify-selection` - Code refactoring
- `test/add-export-tests` - Adding tests

### Working with Packages

Each package can be developed independently:

```bash
# Work on a specific package
cd packages/core
pnpm dev

# Build a specific package
pnpm --filter @docforge/core build

# Test a specific package
pnpm --filter @docforge/spreadsheet test
```

## Coding Standards

### TypeScript

- **Strict mode** is enabled - no implicit any
- **Explicit return types** for public APIs
- **Interfaces over types** for object shapes
- **Readonly** where applicable

```typescript
// Good
export interface CellData {
  readonly id: string;
  value: CellValue;
  style?: CellStyle;
}

export function formatCell(cell: CellData, format: CellFormat): CellData {
  // Implementation
}

// Avoid
export type CellData = {
  id: string;
  value: any;
};
```

### React

- **Functional components** with hooks
- **Named exports** for components
- **Props interfaces** defined separately
- **Memoization** where performance matters

```typescript
// Good
export interface ToolbarProps {
  onAction: (action: ToolbarAction) => void;
  disabled?: boolean;
}

export function Toolbar({ onAction, disabled = false }: ToolbarProps) {
  // Implementation
}
```

### File Organization

- One component per file
- Co-locate tests with source files
- Group related utilities together

```
components/
├── Toolbar/
│   ├── Toolbar.tsx
│   ├── Toolbar.test.tsx
│   ├── ToolbarButton.tsx
│   └── index.ts
```

### Comments

- Write self-documenting code
- Add JSDoc for public APIs
- Explain "why" not "what"

```typescript
/**
 * Calculates the intersection of two cell ranges.
 * Returns null if ranges don't overlap.
 */
export function intersectRanges(a: CellRange, b: CellRange): CellRange | null {
  // Implementation
}
```

## Testing

### Unit Tests

We use **Vitest** for unit testing:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

Write tests alongside source files:

```typescript
// utils.ts
export function parseRange(range: string): CellRange {
  // Implementation
}

// utils.test.ts
import { describe, it, expect } from 'vitest';
import { parseRange } from './utils';

describe('parseRange', () => {
  it('parses simple range', () => {
    expect(parseRange('A1:B2')).toEqual({
      startRow: 0,
      startCol: 0,
      endRow: 1,
      endCol: 1,
    });
  });

  it('handles single cell', () => {
    expect(parseRange('C3')).toEqual({
      startRow: 2,
      startCol: 2,
      endRow: 2,
      endCol: 2,
    });
  });
});
```

### E2E Tests

We use **Playwright** for E2E testing:

```bash
# Run E2E tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui
```

### Test Coverage

- Aim for **80%+ coverage** for core logic
- Focus on:
  - Command handlers
  - File format parsing
  - Formula calculations
  - User interactions

## Pull Request Process

### Before Submitting

1. **Update documentation** if changing APIs
2. **Add/update tests** for new functionality
3. **Run the full test suite**: `pnpm test`
4. **Run linting**: `pnpm lint`
5. **Build all packages**: `pnpm build`

### PR Template

When opening a PR, include:

```markdown
## Summary

Brief description of changes.

## Changes

- Added X feature
- Fixed Y bug
- Updated Z documentation

## Testing

- [ ] Unit tests added/updated
- [ ] E2E tests added/updated (if applicable)
- [ ] Manual testing performed

## Screenshots (if applicable)

Add screenshots for UI changes.

## Related Issues

Closes #123
```

### Review Process

1. PRs require at least one approval
2. CI must pass (lint, test, build)
3. Address review feedback
4. Maintainer merges when ready

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change that neither fixes nor adds |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |

### Scopes

- `core` - @docforge/core package
- `spreadsheet` - @docforge/spreadsheet package
- `presentation` - @docforge/presentation package
- `file-io` - @docforge/file-io package
- `ai-bridge` - @docforge/ai-bridge package
- `demo` - Demo application
- `docs` - Documentation

### Examples

```
feat(spreadsheet): add chart insertion command

Implement the sheet.insertChart AI command handler with support
for bar, line, and pie charts.

Closes #45
```

```
fix(file-io): handle empty sheets in XLSX export

Previously, exporting a workbook with empty sheets would throw
an error. Now empty sheets are exported correctly.

Fixes #78
```

```
docs: update architecture diagram

Add @docforge/ai-bridge to the system overview diagram.
```

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Open a GitHub Issue
- **Feature Requests**: Open a GitHub Issue with "enhancement" label

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to DocForge!
