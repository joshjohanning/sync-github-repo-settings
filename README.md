# sync-github-repo-settings

🔄 Syncing configuration across a set of repositories using my [bulk-github-repo-settings-sync-action](https://github.com/joshjohanning/bulk-github-repo-settings-sync-action) 🚀

## Features

This repository maintains centralized configuration for multiple repositories and syncs:

- **Repository settings** (merge strategies, branch protection, etc.)
- **Dependabot configuration** (`.github/dependabot.yml`)
- **Copilot instructions** (`.github/copilot-instructions.md`) - _Coming soon!_

## Structure

- `config/dependabot/` - Dependabot configuration templates for different repository types
- `config/copilot/` - GitHub Copilot instruction templates for different repository types
- `repos.yml` - List of repositories and their specific configurations
- `.github/workflows/sync-github-repo-settings.yml` - Workflow that performs the sync

## Copilot Instructions

The `config/copilot/` directory contains GitHub Copilot instruction templates that can be synced to target repositories. These instructions help Copilot provide better, more context-aware suggestions tailored to specific project types.

Available templates:
- `node-action.md` - For JavaScript-based GitHub Actions
- `typescript-action.md` - For TypeScript-based GitHub Actions  
- `composite-action.md` - For Composite GitHub Actions

### Status

The copilot-instructions sync feature is ready in this repository's configuration, but requires an updated version of `bulk-github-repo-settings-sync-action` that supports this functionality. See `IMPLEMENTATION_GUIDE.md` for details on the required changes to the action.

Once the action is updated, the workflow will automatically sync copilot-instructions.md files to the configured repositories.

