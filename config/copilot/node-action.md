# GitHub Copilot Instructions for Node.js Actions

## Project Context
This is a GitHub Action built with Node.js and JavaScript. The action follows GitHub's best practices for building actions.

## Code Style and Standards
- Use modern JavaScript (ES6+) with async/await patterns
- Follow existing code formatting and linting rules (ESLint, Prettier)
- Maintain consistency with the existing codebase structure
- Use clear, descriptive variable and function names

## GitHub Actions Specifics
- Use `@actions/core` for inputs, outputs, and logging
- Use `@actions/github` for GitHub API interactions when needed
- Handle errors gracefully and provide clear error messages
- Always validate inputs before processing
- Use semantic commit messages (e.g., `feat:`, `fix:`, `chore:`)

## Testing
- Write unit tests for all new functionality
- Maintain or improve code coverage
- Test both success and failure scenarios
- Mock external dependencies appropriately

## Dependencies
- Prefer well-maintained, popular npm packages
- Keep dependencies up to date
- Use exact versions for actions in workflows
- Document why new dependencies are needed

## Documentation
- Update README.md for user-facing changes
- Add JSDoc comments for complex functions
- Include usage examples for new features
- Keep changelog updated
