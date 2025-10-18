# Package.json Sync Feature

This document explains how to use the new package.json sync features added to the bulk-github-repo-settings-sync-action.

## Overview

The action now supports syncing `devDependencies` and/or `scripts` sections from a template package.json file to multiple target repositories. This is useful for:

- Standardizing development dependencies across multiple projects
- Ensuring consistent npm scripts across your repositories
- Automating updates to common tooling (linters, formatters, test runners, etc.)

## How It Works

1. Create a template package.json file (e.g., `config/package-json/npm-actions.json`)
2. Configure the action to sync specific sections (devDependencies and/or scripts)
3. The action will:
   - Read the template package.json
   - For each target repository:
     - Read the existing package.json
     - Merge the specified sections (source overwrites target for matching keys)
     - Create a pull request with the changes
     - Include a note to run `npm install` to update package-lock.json

## Configuration

### Global Configuration

Set these in your workflow file:

```yaml
- name: Update Repository Settings
  uses: ./.github/actions/bulk-github-repo-settings-sync-action
  with:
    github-token: ${{ steps.app-token.outputs.token }}
    repositories-file: 'repos.yml'
    package-json: './config/package-json/npm-actions.json'
    sync-dev-dependencies: true
    sync-scripts: true
    package-json-pr-title: 'chore: sync package.json devDependencies and scripts'
```

### Per-Repository Configuration

Override settings in `repos.yml`:

```yaml
repos:
  - repo: owner/repo1
    package-json: './config/package-json/npm-actions.json'
    sync-dev-dependencies: true
    sync-scripts: true
  
  - repo: owner/repo2
    # Only sync devDependencies for this repo
    package-json: './config/package-json/npm-actions.json'
    sync-dev-dependencies: true
    sync-scripts: false
  
  - repo: owner/repo3
    # Use a different template for this repo
    package-json: './config/package-json/typescript-actions.json'
    sync-dev-dependencies: true
    sync-scripts: true
```

## Template Package.json Format

Create a template file with only the sections you want to sync:

```json
{
  "devDependencies": {
    "@vercel/ncc": "^0.38.1",
    "eslint": "^9.38.0",
    "prettier": "^3.0.0"
  },
  "scripts": {
    "lint": "npx eslint .",
    "format": "npx prettier --write .",
    "test": "npx jest"
  }
}
```

## Merge Behavior

- **devDependencies**: Source dependencies are merged into target. If a dependency exists in both, the source version wins.
- **scripts**: Source scripts are merged into target. If a script exists in both, the source version wins.
- **Other sections**: Not touched. Name, version, dependencies, etc. remain unchanged.

## Pull Request

The action creates a PR with:
- Title: Configurable via `package-json-pr-title` (default: "chore: update package.json dependencies and scripts")
- Body: Lists all changes (added and updated dependencies/scripts)
- Note: Reminder to run `npm install` to update package-lock.json

## Important Notes

1. **package-lock.json**: The action only updates package.json. After merging the PR, you should run `npm install` locally to update package-lock.json and commit the changes.

2. **Existing PRs**: If a PR already exists for package.json sync, the action won't create a duplicate. Close or merge the existing PR first.

3. **No package.json**: If the target repository doesn't have a package.json, the sync will fail with an error.

4. **Alphabetical Sorting**: Keys in devDependencies and scripts are sorted alphabetically for consistent output.

## Example Use Cases

### Use Case 1: Standardize Linting and Formatting

Template (`config/package-json/linting.json`):
```json
{
  "devDependencies": {
    "eslint": "^9.38.0",
    "eslint-config-prettier": "^10.1.8",
    "prettier": "^3.0.0"
  },
  "scripts": {
    "lint": "npx eslint .",
    "format:check": "npx prettier --check .",
    "format:write": "npx prettier --write ."
  }
}
```

### Use Case 2: Standardize Testing

Template (`config/package-json/testing.json`):
```json
{
  "devDependencies": {
    "jest": "^30.2.0"
  },
  "scripts": {
    "test": "npx jest",
    "test:coverage": "npx jest --coverage"
  }
}
```

### Use Case 3: GitHub Actions Build Tools

Template (`config/package-json/npm-actions.json`):
```json
{
  "devDependencies": {
    "@vercel/ncc": "^0.38.1",
    "eslint": "^9.38.0",
    "jest": "^30.2.0",
    "prettier": "^3.0.0"
  },
  "scripts": {
    "bundle": "npm run format:write && npm run package",
    "lint": "npx eslint .",
    "package": "npx @vercel/ncc build src/index.js -o dist --source-map --license licenses.txt",
    "test": "npx jest"
  }
}
```
