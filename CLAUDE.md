# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

To build the project, run:
```bash
npm install
npm run build
```

To lint the code, run:
```bash
npm run lint
```

To run tests, run:
```bash
npm run test
```

To run a single test, use the following format:
```bash
test -- SpecName
```

## Code Architecture

The codebase is structured into several major sections:

- **src/**: Contains the source code of the project.
- **src/components/**: Contains reusable components.
- **src/views/**: Contains views for the application.
- **src/router/**: Contains the router configuration.
- **src/store/**: Contains the Vuex store.
- **src/utils/**: Contains utility functions.

The project uses Vue 3, Element Plus, and Vue Router for its frontend.

The backend is built with Express.js.

## README.md

The README.md file contains important information about the project, including installation instructions, usage, and contribution guidelines.

## Cursor and Copilot Rules

The project uses Cursor and Copilot to help with development. The important rules are located in .cursor/rules/ and .github/copilot-instructions.md.
