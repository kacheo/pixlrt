# Contributing to pixlrt

Thank you for your interest in contributing! This document covers how to report bugs, propose features, and submit code changes.

## Reporting Issues

Use the [GitHub issue tracker](https://github.com/kacheo/pixlrt/issues) to report bugs or request features.

**For bugs**, include:
- Node.js version and OS
- Minimal reproduction case
- Expected vs actual behavior

## Development Setup

```bash
git clone https://github.com/kacheo/pixlrt.git
cd pixlrt
npm install
npm test
```

Key commands:
- `npm run build` — compile with tsup
- `npm test` — run Vitest tests
- `npm run test:watch` — watch mode
- `npm run lint` — ESLint
- `npm run format` — Prettier

## Making Changes

1. Fork the repo and create a branch from `main`
2. Write tests for new behavior (coverage threshold: 90%)
3. Run `npm test` and `npm run lint` — both must pass
4. Keep commits focused; one logical change per PR

## Code Style

- Strict TypeScript — no `any` unless unavoidable
- `.js` extensions on all relative imports (required for ESM)
- Immutable patterns — transforms return new instances, not mutations
- Functions over classes where possible

## Testing

Test files mirror source: `test/<module>.test.ts`. Add tests in the relevant file or create a new one for new modules.

Generated files (PNGs, SVGs) go in `examples/` and are not committed.

## Pull Requests

- Target `main`
- Describe what changed and why
- Reference any related issues

## License

By contributing, you agree your contributions will be licensed under the [Apache-2.0 License](./LICENSE).
