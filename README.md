# sync-github-repo-settings

🔄 Syncs configuration across a set of repositories using the [bulk-github-repo-settings-sync-action](https://github.com/joshjohanning/bulk-github-repo-settings-sync-action) 🚀

## How It Works

A GitHub Actions workflow runs the sync action, which reads [`repos.yml`](repos.yml) and pushes the referenced config files to each listed repository. This keeps settings like Dependabot configs, rulesets, workflows, `.gitignore` files, Copilot instructions, and more consistent across repos without manual updates.

Each entry in `repos.yml` maps a repository to the template files it should receive. Adding a new repo or changing a shared config is a single PR in this repo.

The `npm-actions.yml` and `npm-actions-no-octokit.yml` Dependabot templates allow up to 15 open npm version-update PRs per repository. The security-only npm template keeps version updates disabled.

## Shared Repository Labels

The sync workflow passes [`config/labels.yml`](config/labels.yml) as the global `labels-file` input for every repository in `repos.yml`, including repositories that do not use the publish workflow. It creates the `skip-release` label or updates its color and description, preserving all other labels. Labels are managed directly through the API, not through generated sync PRs. Pull requests and manual dispatches from other branches preview label changes without writing; only runs on `main` (pushes and manual dispatch) apply them. Applying runs share one concurrency group, so label writes never overlap and the newest queued `main` configuration is applied last.

The GitHub App configured by `APP_CLIENT_ID` and `APP_PRIVATE_KEY` must be installed on **every managed repository** with **Issues: write** or **Pull requests: write** in addition to its existing settings/file-sync permissions. Approve any updated installation permissions before deployment. The job's `contents: read` permission is for `GITHUB_TOKEN`; changing that does not grant the cross-repository App token label access.

The workflow deliberately pins the bulk sync action to **`v2.17.0`**, the first release with `labels-file`, rather than the floating `v2` alias. Do not downgrade the pin: an older action can ignore the unknown input and falsely appear successful.

The workflow also requires a successful `labelsSync` result for every returned repository. Missing results and label API/configuration errors fail the job, even though the action normally treats optional label-sync errors as warnings. The PR comment counts those repositories as failures (not unchanged) and distinguishes a failed sync step from failed label verification. Review the per-repository results and workflow logs for failures; a successful PR dry run confirms read access and planned changes, **not** write permission.

**Deployment prerequisite:** merging this configuration immediately creates the label in every managed repository, so release the publisher's `skip-release` support (case-insensitive label matching) under `joshjohanning/publish-github-action@v3` **before** merging. Otherwise contributors could apply a label described as skipping publication while the existing publisher still releases. After merging, confirm the non-dry-run sync succeeds across the full list. This configuration does not publish upstream releases or create labels outside the sync workflow.

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
  labels.yml                       # Shared labels created/updated on every managed repository
  package-json/                    # Shared package.json settings (e.g. engines, scripts)
  pull-request-templates/          # PR templates
  rulesets/                        # Repository ruleset JSON files
  workflows/                       # GitHub Actions workflow files (.github/workflows/)
```
