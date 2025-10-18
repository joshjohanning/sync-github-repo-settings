# sync-github-repo-settings

🔄 Syncing configuration across a set of repositories using my [bulk-github-repo-settings-sync-action](https://github.com/joshjohanning/bulk-github-repo-settings-sync-action) 🚀

## Overview

This repository demonstrates how to use the `bulk-github-repo-settings-sync-action` to synchronize repository settings and files across multiple GitHub repositories. It includes:

- Repository settings configuration (merge strategies, auto-merge, branch protection, etc.)
- Dependabot configuration synchronization
- **[Proposed]** Custom file synchronization (workflows, issue templates, etc.)

## Repository Structure

```
.
├── config/
│   ├── dependabot/           # Dependabot configurations for different project types
│   │   ├── actions.yml       # For composite/shell actions
│   │   └── npm-actions.yml   # For Node.js actions
│   ├── workflows/            # Example workflows to sync
│   │   ├── codeql-analysis.yml
│   │   └── pr-labeler.yml
│   └── issue-templates/      # Example issue templates to sync
│       ├── bug_report.md
│       └── feature_request.md
├── repos.yml                 # Current repository list
└── repos-with-custom-files-example.yml  # Example showing proposed custom file sync
```

## Current Features

### Repository Settings Sync

The workflow currently syncs the following settings across all repositories:

- ✅ Allow squash merge
- ❌ Disable merge commits
- ❌ Disable rebase merge
- ✅ Enable auto-merge
- ✅ Delete branch on merge
- ✅ Allow update branch
- ✅ Enable default code scanning

### Dependabot Configuration Sync

Different dependabot configurations are synced based on repository type:
- **npm-actions.yml**: For JavaScript/Node.js GitHub Actions
- **actions.yml**: For composite/shell GitHub Actions

## Proposed Feature: Custom File Sync

### Comparison: Current vs Proposed

| Feature | Current (v1.x) | Proposed (v2.x) |
|---------|---------------|-----------------|
| **Repository Settings Sync** | ✅ Supported | ✅ Supported |
| **Dependabot Config Sync** | ✅ Single file only | ✅ Single file only |
| **Custom Files Sync** | ❌ Not supported | ✅ **Multiple files** |
| **File Types** | `.github/dependabot.yml` only | Any file (workflows, templates, configs, etc.) |
| **Files per Repo** | 1 (dependabot.yml) | **1 to N** custom files |
| **Per-Repo Configuration** | ✅ Via YAML | ✅ Enhanced YAML |
| **PR Management** | ✅ For dependabot | ✅ **For all files** |
| **Change Detection** | ✅ Smart detection | ✅ Smart detection |

### Overview

The ability to sync custom files (like workflows, issue templates, and other configuration files) would allow:

- 📋 Standardized workflows across all repositories
- 🐛 Consistent issue templates
- 🔄 Shared GitHub Actions configurations
- 📝 Common documentation files

### Proposed Configuration

See [`repos-with-custom-files-example.yml`](./repos-with-custom-files-example.yml) for a complete example.

#### Example: Sync a single workflow

```yaml
repos:
  - repo: owner/repository
    custom-files:
      - source: './config/workflows/codeql-analysis.yml'
        target: '.github/workflows/codeql-analysis.yml'
        pr-title: 'chore: add CodeQL workflow'
```

#### Example: Sync multiple files

```yaml
repos:
  - repo: owner/repository
    custom-files:
      - source: './config/workflows/codeql-analysis.yml'
        target: '.github/workflows/codeql-analysis.yml'
        pr-title: 'chore: add CodeQL workflow'
      - source: './config/issue-templates/bug_report.md'
        target: '.github/ISSUE_TEMPLATE/bug_report.md'
        pr-title: 'chore: add bug report template'
```

### How It Works

```
┌─────────────────────────────────────┐
│ sync-github-repo-settings (Source) │
│                                     │
│  ├── config/                        │
│  │   ├── workflows/                 │
│  │   │   ├── codeql-analysis.yml ───┼─┐
│  │   │   └── pr-labeler.yml ────────┼─┼─┐
│  │   └── issue-templates/           │ │ │
│  │       ├── bug_report.md ─────────┼─┼─┼─┐
│  │       └── feature_request.md ────┼─┼─┼─┼─┐
│  └── repos.yml                      │ │ │ │ │
└─────────────────────────────────────┘ │ │ │ │
                                        │ │ │ │
        ┌───────────────────────────────┘ │ │ │
        │       ┌─────────────────────────┘ │ │
        │       │       ┌───────────────────┘ │
        │       │       │       ┌─────────────┘
        ▼       ▼       ▼       ▼
┌─────────────────────────────────────┐
│ Target Repository (Destination)     │
│                                     │
│  └── .github/                       │
│      ├── workflows/                 │
│      │   ├── codeql-analysis.yml    │
│      │   └── pr-labeler.yml         │
│      └── ISSUE_TEMPLATE/            │
│          ├── bug_report.md          │
│          └── feature_request.md     │
└─────────────────────────────────────┘
```

### Workflow Input (Proposed)

The workflow would accept the custom files configuration:

```yaml
- name: Update Repository Settings
  uses: joshjohanning/bulk-github-repo-settings-sync-action@v2  # Future version
  with:
    github-token: ${{ steps.app-token.outputs.token }}
    repositories-file: 'repos.yml'
    custom-files-enabled: true  # Enable custom file sync
    # ... other settings
```

### Implementation Requirements

To implement this feature, the following changes are needed in `bulk-github-repo-settings-sync-action`:

1. **New Action Inputs:**
   - `custom-files`: Global custom files to sync to all repositories
   - `custom-files-pr-title`: Default PR title for custom file syncs
   - `custom-files-enabled`: Feature flag to enable custom file sync

2. **YAML Schema Updates:**
   - Support `custom-files` array in per-repository configuration
   - Each entry should have: `source`, `target`, and optional `pr-title`

3. **Behavior:**
   - Create/update files via pull requests (similar to dependabot sync)
   - Skip if content is identical
   - Update existing PRs instead of creating duplicates
   - Support per-repository overrides

### Alternative Syntax Options

The feature could support multiple input formats:

**Option 1: YAML Array (Recommended - Most Flexible)**
```yaml
custom-files:
  - source: './config/workflows/codeql.yml'
    target: '.github/workflows/codeql.yml'
    pr-title: 'chore: add CodeQL workflow'
```

**Option 2: JSON Array**
```yaml
custom-files: '[{"source":"./config/workflows/codeql.yml","target":".github/workflows/codeql.yml"}]'
```

**Option 3: Comma-Separated**
```yaml
custom-files: './config/workflows/codeql.yml:.github/workflows/codeql.yml,./config/workflows/pr-labeler.yml:.github/workflows/pr-labeler.yml'
```

## Usage

See the [workflow file](.github/workflows/sync-github-repo-settings.yml) for the current implementation.

## Contributing

To add a new repository to the sync:
1. Add the repository to `repos.yml`
2. Specify the appropriate `dependabot-yml` configuration
3. Set repository-specific settings if needed (topics, override settings, etc.)
