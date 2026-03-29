# sync-github-repo-settings

🔄 Syncs configuration across a set of repositories using the [bulk-github-repo-settings-sync-action](https://github.com/joshjohanning/bulk-github-repo-settings-sync-action) 🚀

## How It Works

A GitHub Actions workflow runs the sync action, which reads [`repos.yml`](repos.yml) and pushes the referenced config files to each listed repository. This keeps settings like Dependabot configs, rulesets, workflows, `.gitignore` files, Copilot instructions, and more consistent across repos without manual updates.

Each entry in `repos.yml` maps a repository to the template files it should receive. Adding a new repo or changing a shared config is a single PR in this repo.

## Folder Structure

```text
repos.yml                          # List of repos and which config files to sync
config/
  copilot/                         # Copilot instruction files (.github/copilot-instructions.md)
  dependabot/                      # Dependabot configuration templates
  gitignore/                       # .gitignore templates
  package-json/                    # Shared package.json settings (e.g. engines, scripts)
  pull-request-templates/          # PR templates
  rulesets/                        # Repository ruleset JSON files
  workflows/                       # GitHub Actions workflow files (.github/workflows/)
```
