# sync-github-repo-settings

🔄 Syncs configuration across a set of repositories using the [bulk-github-repo-settings-sync-action](https://github.com/joshjohanning/bulk-github-repo-settings-sync-action) 🚀

## How It Works

A GitHub Actions workflow runs the sync action, which reads [`repos.yml`](repos.yml) and pushes the referenced config files to each listed repository. This keeps settings like Dependabot configs, rulesets, workflows, `.gitignore` files, Copilot instructions, and more consistent across repos without manual updates.

Each entry in `repos.yml` maps a repository to the template files it should receive. Adding a new repo or changing a shared config is a single PR in this repo.

The `npm-actions.yml` and `npm-actions-no-octokit.yml` Dependabot templates allow up to 15 open npm version-update PRs per repository. The security-only npm template keeps version updates disabled.

## Action Release Workflow

[`config/workflows/publish.yml`](config/workflows/publish.yml) builds and creates a draft release with an exact version tag on pushes to `main` or manual dispatch (with `promote_tag` left empty). Floating major tags (such as `v2`) stay on the last published release; minor aliases remain disabled.

Publishing a non-draft, non-prerelease release (the `published` and `released` events; `released` also covers a prerelease later changed to a full release) runs a separate, idempotent `mode: promote` job that verifies the live release and updates the major alias to the existing exact-tag bundled commit, without rebuilding or creating another draft. The job checks out the default branch rather than the bundled release commit. Publication and promotion share a concurrency group with cancellation disabled and `queue: max`, allowing up to 100 pending runs without replacing an earlier pending promotion. This template targets GitHub.com; verify larger concurrency queue support before using it on GitHub Enterprise Server.

Release the publisher's updated `mode` and `release_workflow_file` support under `joshjohanning/publish-github-action@v3` **before** syncing this workflow to action repositories. The publish job passes `release_workflow_file: .github/workflows/publish.yml` to preserve this one workflow in new bundled release commits so GitHub can discover the `release` trigger at the release tag; checking out the default branch inside the job cannot fix a missing trigger. Existing draft tags that omit the workflow (and any draft created between the publisher release and this sync) won't trigger promotion when published; after publishing them, run the workflow manually with `promote_tag` set to the release tag (for example, `v2.1.2`).

## Actions Lockfile

[`config/workflows/actions.lock`](config/workflows/actions.lock) is a [workflow dependency lockfile](https://docs.github.com/en/actions/concepts/security/workflow-dependency-lockfiles) for the workflow templates. It pins each `uses:` ref (including floating refs such as `@v2`) to a commit. `repos.yml` syncs it to `.github/workflows/actions.lock` in the same `file-sync` pull request as `ci.yml` and `publish.yml`, so a workflow and its lock entries never land separately. A synced lockfile replaces any lockfile already in a target repository, and workflows that aren't synced (such as `integration-test.yml`) stay unlocked.

Floating refs stay on their locked commit even after the upstream tag moves. Regenerate the lockfile with [`scripts/actions-lock.sh`](scripts/actions-lock.sh) (requires `gh extension install github/gh-actions-lock`), which runs `gh actions-lock --no-narrow` against `config/workflows`:

- After changing any `uses:` in a template: `./scripts/actions-lock.sh`
- To advance moved floating refs: `./scripts/actions-lock.sh --relock`

The [`actions-lockfile`](.github/workflows/actions-lockfile.yml) workflow runs `--verify` on pull requests that change the templates. It also runs `--relock` weekly and opens a `ci(deps): relock floating action refs` pull request when a floating ref has moved. Dependabot doesn't regenerate this lockfile, because it only updates lockfiles in `.github/workflows`.

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
  workflows/                       # GitHub Actions workflow files and actions.lock (.github/workflows/)
scripts/
  actions-lock.sh                  # Runs gh actions-lock against config/workflows
```
