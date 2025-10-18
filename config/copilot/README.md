# Copilot Instructions Configuration

This directory contains GitHub Copilot instruction files that can be synced to target repositories.

## Files

- **node-action.md**: Instructions for Node.js GitHub Actions (JavaScript)
- **typescript-action.md**: Instructions for TypeScript GitHub Actions
- **composite-action.md**: Instructions for Composite GitHub Actions (Shell/Mixed)

## Usage

In `repos.yml`, reference the copilot instructions file for each repository:

```yaml
repos:
  - repo: owner/repo-name
    copilot-instructions-md: './config/copilot/node-action.md'
```

## How It Works

When the `bulk-github-repo-settings-sync-action` runs with copilot-instructions support:

1. It reads the local copilot-instructions.md file specified in the configuration
2. Checks if `.github/copilot-instructions.md` exists in the target repository
3. If it doesn't exist or differs from the source, creates/updates it via a pull request
4. PRs are created using the GitHub API with verified commits
5. Updates existing open PRs instead of creating duplicates

## Note

⚠️ **This feature requires a future version of `bulk-github-repo-settings-sync-action` that supports copilot-instructions syncing.**

The configuration structure is prepared here for when the action adds this capability, similar to how it currently handles `dependabot.yml` files.

## Customizing Instructions

Feel free to modify these instruction files to match your team's coding standards, practices, and preferences. The instructions help GitHub Copilot provide better suggestions tailored to your specific project types.
