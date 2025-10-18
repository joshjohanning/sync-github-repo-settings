# GitHub Copilot Instructions for TypeScript Actions

## Project Context
This is a GitHub Action built with TypeScript and Node.js. The action follows GitHub's best practices for building actions.

## Code Style and Standards
- Use TypeScript for type safety and better IDE support
- Follow existing code formatting and linting rules (ESLint, Prettier)
- Define proper interfaces and types for all data structures
- Avoid `any` types - use specific types or generics
- Use clear, descriptive variable and function names

## GitHub Actions Specifics
- Use `@actions/core` for inputs, outputs, and logging
- Use `@actions/github` or `@octokit/rest` for GitHub API interactions
- Handle errors gracefully with try-catch blocks and clear error messages
- Always validate and type-check inputs before processing
- Use semantic commit messages (e.g., `feat:`, `fix:`, `chore:`)

## TypeScript Best Practices
- Enable strict mode in tsconfig.json
- Use readonly for immutable properties
- Prefer interfaces over type aliases for object shapes
- Use enums for fixed sets of values
- Document complex types with JSDoc comments

## Testing
- Write unit tests for all new functionality using Jest or similar
- Aim for high code coverage (80%+)
- Test both success and failure scenarios
- Mock external dependencies and API calls
- Use TypeScript's type system to catch errors at compile time

## Dependencies
- Prefer well-maintained, typed npm packages
- Use @types/* packages for type definitions
- Keep dependencies up to date
- Document why new dependencies are needed

## Build and Distribution
- Compile TypeScript to JavaScript before distribution
- Include compiled `dist/` folder in version control (for GitHub Actions)
- Use `@vercel/ncc` or similar to bundle the action
- Test the built action before releasing

## Documentation
- Update README.md for user-facing changes
- Add TSDoc comments for public APIs and complex functions
- Include usage examples with TypeScript type hints
- Keep changelog updated
