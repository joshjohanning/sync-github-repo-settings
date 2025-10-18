# GitHub Copilot Instructions for Composite Actions

## Project Context
This is a GitHub Composite Action that may use shell scripts, JavaScript, or a combination of both.

## Code Style and Standards
- Follow shell scripting best practices (use `set -e`, quote variables, etc.)
- Use clear, descriptive step names
- Maintain POSIX compatibility when possible
- Keep scripts maintainable and well-commented

## GitHub Actions Specifics
- Use `composite` action type in action.yml
- Leverage existing GitHub Actions when appropriate
- Handle errors gracefully with proper exit codes
- Provide clear output messages for debugging
- Use semantic commit messages (e.g., `feat:`, `fix:`, `chore:`)

## Shell Script Guidelines
- Use `set -euo pipefail` for safer scripts
- Quote all variables to prevent word splitting
- Use meaningful variable names in UPPER_CASE for environment variables
- Add comments explaining complex logic
- Validate required inputs before proceeding

## Testing
- Test on different runners (ubuntu, macos, windows if applicable)
- Test with various input combinations
- Include examples in README for common use cases

## Documentation
- Update README.md for user-facing changes
- Document all inputs and outputs clearly
- Provide usage examples
- Include troubleshooting section if needed
