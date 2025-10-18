# sync-github-repo-settings

🔄 Syncing configuration across a set of repositories using my [bulk-github-repo-settings-sync-action](https://github.com/joshjohanning/bulk-github-repo-settings-sync-action) 🚀

## Features

This repository demonstrates how to use the bulk-github-repo-settings-sync-action to:

- Sync repository settings (merge strategies, auto-merge, branch deletion, etc.)
- Sync dependabot.yml configuration files
- **NEW:** Sync package.json devDependencies across repositories
- **NEW:** Sync package.json scripts across repositories
- Manage repository topics
- Enable default CodeQL scanning

## Configuration

### Syncing package.json

You can now sync `devDependencies` and/or `scripts` sections from a template package.json file to multiple repositories.

Example configuration in `repos.yml`:

```yaml
repos:
  - repo: joshjohanning/my-action
    topics: 'github,actions,javascript,node-action'
    dependabot-yml: './config/dependabot/npm-actions.yml'
    package-json: './config/package-json/npm-actions.json'
    sync-dev-dependencies: true
    sync-scripts: true
```

This will:
1. Merge devDependencies from the template into the target repository's package.json
2. Merge scripts from the template into the target repository's package.json
3. Create a pull request with the changes
4. Include a note to run `npm install` to update package-lock.json

### Template Files

Example template files are available in the `config/` directory:

- `config/dependabot/` - Dependabot configuration templates
- `config/package-json/` - package.json templates for syncing devDependencies and scripts

## Usage

See [.github/workflows/sync-github-repo-settings.yml](.github/workflows/sync-github-repo-settings.yml) for the workflow configuration.
