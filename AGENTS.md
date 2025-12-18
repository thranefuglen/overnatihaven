# Agent Guidelines

## Build/Test Commands
- Build: `npm run build` or `yarn build`
- Lint: `npm run lint` or `eslint .`
- Test all: `npm test` or `yarn test`
- Test single file: `npm test -- path/to/test.test.ts` or `jest path/to/test.test.ts`

## Code Style
- **Imports**: Group by external, internal, relative; sort alphabetically within groups
- **Formatting**: Use Prettier defaults (2 spaces, single quotes, trailing commas)
- **Types**: Prefer interfaces for objects, types for unions; avoid `any`, use `unknown` if needed
- **Naming**: camelCase for variables/functions, PascalCase for classes/components/types, UPPER_SNAKE_CASE for constants
- **Error Handling**: Use try-catch for async operations; throw typed errors; avoid silent failures
- **Functions**: Keep small and focused; prefer pure functions; document complex logic
- **Comments**: Explain "why" not "what"; use JSDoc for public APIs

## General Practices
- Write tests for new features and bug fixes
- Run linter and tests before committing
- Prefer composition over inheritance
- Keep dependencies minimal and up-to-date
