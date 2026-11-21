# sync-github-repo-settings

🔄 Syncs configuration across a set of repositories using the [bulk-github-repo-settings-sync-action](https://github.com/joshjohanning/bulk-github-repo-settings-sync-action) 🚀

## How It Works

A GitHub Actions workflow runs the sync action, which reads [`repos.yml`](repos.yml) and pushes the referenced config files to each listed repository. This keeps settings like Dependabot configs, rulesets, workflows, `.gitignore` files, Copilot instructions, and more consistent across repos without manual updates.

Each entry in `repos.yml` maps a repository to the template files it should receive. Adding a new repo or changing a shared config is a single PR in this repo.

The `npm-actions.yml`, `npm-actions-no-octokit.yml`, and `npm-actions-no-octokit-aw.yml` Dependabot templates allow up to 15 open npm version-update PRs for the root directory. The AW template also monitors `/.github/workflows` with Dependabot's default limit of five. The security-only npm template keeps version updates disabled.

The agentic workflow templates exclude generated `.github/workflows/*.lock.yml` files from GitHub Actions updates; update them through `gh aw` compilation or upgrades instead.

The `actions-gh-aw-upgrade.yml` template monitors the handwritten composite action in the `gh-aw-upgrade` directory.

## Action Release Workflow

[`config/workflows/publish.yml`](config/workflows/publish.yml) builds and creates a draft release with an exact version tag on pushes to `main` or manual dispatch (with `promote_tag` left empty). Floating major tags (such as `v2`) stay on the last published release; minor aliases remain disabled.

Publishing a non-draft, non-prerelease release (the `published` and `released` events; `released` also covers a prerelease later changed to a full release) runs a separate, idempotent `mode: promote` job that verifies the live release and updates the major alias to the existing exact-tag bundled commit, without rebuilding or creating another draft. The job checks out the default branch rather than the bundled release commit. Publication and promotion share a concurrency group with cancellation disabled and `queue: max`, allowing up to 100 pending runs without replacing an earlier pending promotion. This template targets GitHub.com; verify larger concurrency queue support before using it on GitHub Enterprise Server.

Release the publisher's updated `mode` and `release_workflow_file` support under `joshjohanning/publish-github-action@v3` **before** syncing this workflow to action repositories. The publish job passes `release_workflow_file: .github/workflows/publish.yml` to preserve this one workflow in new bundled release commits so GitHub can discover the `release` trigger at the release tag; checking out the default branch inside the job cannot fix a missing trigger. Existing draft tags that omit the workflow (and any draft created between the publisher release and this sync) won't trigger promotion when published; after publishing them, run the workflow manually with `promote_tag` set to the release tag (for example, `v2.1.2`).

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
