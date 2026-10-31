# sync-github-repo-settings

🔄 Syncs configuration across a set of repositories using the [bulk-github-repo-settings-sync-action](https://github.com/joshjohanning/bulk-github-repo-settings-sync-action) 🚀

## How It Works

A GitHub Actions workflow runs the sync action, which reads [`repos.yml`](repos.yml) and pushes the referenced config files to each listed repository. This keeps settings like Dependabot configs, rulesets, workflows, `.gitignore` files, Copilot instructions, and more consistent across repos without manual updates.

Each entry in `repos.yml` maps a repository to the template files it should receive. Adding a new repo or changing a shared config is a single PR in this repo.

## Action Release Workflow

[`config/workflows/publish.yml`](config/workflows/publish.yml) builds and creates a draft release with an exact version tag on pushes to `main` or manual dispatch. Floating major tags (such as `v2`) stay on the last published release; minor aliases remain disabled.

Publishing a non-draft, non-prerelease release runs a separate `mode: promote` job that verifies the live release and updates the major alias to the existing exact-tag bundled commit, without rebuilding or creating another draft. The job checks out the default branch rather than the bundled release commit. Publication and promotion share a concurrency group with cancellation disabled; GitHub can replace a pending run, so this is serialization rather than a durable release queue.

Release the publisher's updated `mode` support under `joshjohanning/publish-github-action@v3` **before** syncing this workflow to action repositories. The publisher must also preserve this workflow in new bundled release commits so GitHub can discover the `release: published` trigger at the release tag; checking out the default branch inside the job cannot fix a missing trigger. Existing draft tags that omit the workflow need a separate bootstrap promotion after the new publisher is available.

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
