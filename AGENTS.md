# AGENTS.md — Developer and AI Agent Guidelines for LAST SIGNAL

## Project Overview
LAST SIGNAL is a standalone, browser-based, single-player science-fiction space station survival and management game written in TypeScript (strict mode), HTML5 Canvas 2D/SVG, and Web Audio API, built with Vite and tested with Vitest and Playwright.

Language: **Turkish** for all player-facing UI, dialogs, events, and narrative content.

## Key Architectural Principles
1. **Strict Decoupling**: Simulation logic (`src/simulation/`, `src/systems/`) MUST be completely independent of UI and rendering logic (`src/ui/`, `src/rendering/`).
2. **Deterministic Timestep**: The simulation runs on a fixed tick rate (1 tick = 1 sim second at 1x speed). All random choices MUST use the seeded PRNG (`src/core/random.ts`).
3. **No Decorative Features**: Every metric, gauge, button, and slider in the UI must bind to actual underlying simulation state.
4. **No External Frameworks**: Plain TypeScript with DOM manipulation and Canvas/SVG. No React, Vue, Three.js, etc.

## Coding Conventions
- **TypeScript**: Strict mode enabled. Always explicitly specify return types and parameter types for public APIs.
- **Styling**: All CSS rules must use root CSS variables defined in `src/styles/variables.css`.
- **Localization**: UI text strings should be centralized or structured in clear data modules (`src/data/narrative.ts`, `src/data/events.ts`). All user-visible text is in Turkish.
- **Testing**: Unit tests in `tests/unit/` using Vitest. E2E tests in `tests/e2e/` using Playwright. Ensure all unit tests pass before submitting changes (`npm run test`).

## Automated Verification Requirements
- `npm run build` must complete with zero TypeScript or Vite errors.
- `npm run test` must pass all Vitest tests.
- `npm run test:e2e` must pass critical path E2E flows.
