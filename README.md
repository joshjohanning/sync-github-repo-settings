# sync-github-repo-settings

🔄 Syncing configuration across a set of repositories using my [bulk-github-repo-settings-sync-action](https://github.com/joshjohanning/bulk-github-repo-settings-sync-action) 🚀

## Features

This repository provides centralized configuration management for multiple GitHub repositories including:

- **Repository Settings**: Merge strategies, auto-merge, branch deletion, code scanning
- **Topics**: Repository topic management
- **Dependabot Configuration**: Sync `.github/dependabot.yml` files
- **Gitignore Files**: Sync `.gitignore` files with support for repo-specific customizations

## Structure

- `config/dependabot/`: Dependabot configuration templates
  - `npm-actions.yml`: For Node.js-based GitHub Actions
  - `actions.yml`: For composite/shell-based GitHub Actions
- `config/gitignore/`: Gitignore templates
  - `npm-actions.gitignore`: For Node.js-based GitHub Actions
  - `actions.gitignore`: For composite/shell-based GitHub Actions
- `repos.yml`: Repository list with per-repo configuration overrides
- `.github/workflows/sync-github-repo-settings.yml`: Workflow that performs the sync

## Gitignore Syncing

The gitignore sync feature allows you to maintain a base `.gitignore` template while allowing repositories to have custom additions at the end of the file. This follows the same pattern as dependabot.yml syncing.

**Key Features:**
- Base template is required to match
- Custom additions can be appended after the base template
- Changes are proposed via pull requests for review
- Existing custom content at the end is preserved

**Example**: A repository can use the base `npm-actions.gitignore` template and add custom entries like:

```gitignore
# (base template content here)

# custom action-specific entries
scanresults.json
twistlock-*.md
```

See `repos.yml` for configuration examples.
