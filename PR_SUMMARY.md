# Summary: Copilot Instructions Sync Feature

## What Was Done

This PR adds the configuration and documentation needed to sync GitHub Copilot instruction files (`.github/copilot-instructions.md`) to target repositories, following the same pattern as the existing dependabot.yml sync functionality.

## Changes in This Repository (sync-github-repo-settings)

### ✅ Configuration Ready

1. **Created `config/copilot/` directory** with three instruction templates:
   - `node-action.md` - For JavaScript-based GitHub Actions
   - `typescript-action.md` - For TypeScript-based GitHub Actions
   - `composite-action.md` - For Composite Actions
   - `README.md` - Documentation explaining the configuration

2. **Updated `repos.yml`** to reference copilot-instructions files for all applicable repositories

3. **Updated workflow** (`.github/workflows/sync-github-repo-settings.yml`) with a comment noting where to add the copilot-instructions-pr-title parameter when the feature is available

4. **Updated main README.md** to document the feature and its current status

5. **Created `IMPLEMENTATION_GUIDE.md`** - Comprehensive guide for implementing the feature in the `bulk-github-repo-settings-sync-action` repository

## What's Next

### For the Action Repository (bulk-github-repo-settings-sync-action)

The feature needs to be implemented in the action repository. The `IMPLEMENTATION_GUIDE.md` file provides detailed instructions on all required changes:

1. **action.yml** - Add two new inputs:
   - `copilot-instructions-md` - Path to the copilot-instructions file
   - `copilot-instructions-pr-title` - PR title for updates

2. **src/index.js** - Add:
   - `syncCopilotInstructions()` function (similar to `syncDependabotYml()`)
   - Integration into the main `run()` function
   - Support for repo-specific overrides
   - Dry-run mode support
   - Change detection

3. **README.md** - Document the new feature with examples

4. **Tests** - Add test coverage for the new functionality

### Reference Implementation

A complete reference implementation has been created in `/tmp/bulk-github-repo-settings-sync-action/` showing all necessary code changes. The implementation follows the exact same pattern as the existing dependabot.yml sync feature for consistency.

Key files modified (in the reference):
- `action.yml` - New inputs added
- `src/index.js` - New function and integration added
- Pattern matches `syncDependabotYml()` but targets `.github/copilot-instructions.md`

## How It Will Work (Once Implemented)

1. The workflow runs and reads copilot-instructions.md files from `config/copilot/`
2. For each repository in `repos.yml` that has a `copilot-instructions-md` field:
   - Checks if `.github/copilot-instructions.md` exists in the target repo
   - Compares content with the source file
   - If different, creates/updates a PR with the new content
   - Uses branch name: `copilot-instructions-sync`
   - Avoids duplicate PRs for the same update
   - Creates verified commits via GitHub API

3. Repository maintainers can review and merge the PRs to update their Copilot instructions

## Benefits

- **Centralized management** of Copilot instructions across multiple repositories
- **Consistency** in how Copilot understands different types of projects
- **Easy updates** - Change once, sync to all repositories
- **Review process** - Changes go through PRs before being applied
- **Type-specific instructions** - Different templates for different project types

## Example Usage (When Available)

In repos.yml:
```yaml
repos:
  - repo: owner/javascript-action
    copilot-instructions-md: './config/copilot/node-action.md'
  - repo: owner/typescript-action
    copilot-instructions-md: './config/copilot/typescript-action.md'
```

In workflow:
```yaml
- name: Update Repository Settings
  uses: joshjohanning/bulk-github-repo-settings-sync-action@v1.2.0  # Or next version
  with:
    github-token: ${{ steps.app-token.outputs.token }}
    repositories-file: 'repos.yml'
    copilot-instructions-pr-title: 'chore: update copilot-instructions.md'
    # ... other settings ...
```

## Testing

Once the action is updated:
1. Test in dry-run mode first
2. Verify PRs are created correctly
3. Check that existing PRs are updated instead of duplicated
4. Confirm unchanged files don't trigger PRs

## Files Added/Modified

- ✅ `config/copilot/node-action.md` - New
- ✅ `config/copilot/typescript-action.md` - New  
- ✅ `config/copilot/composite-action.md` - New
- ✅ `config/copilot/README.md` - New
- ✅ `repos.yml` - Modified (added copilot-instructions-md references)
- ✅ `.github/workflows/sync-github-repo-settings.yml` - Modified (added comment)
- ✅ `README.md` - Modified (added feature documentation)
- ✅ `IMPLEMENTATION_GUIDE.md` - New

## Next Steps

1. Review and merge this PR to prepare the repository
2. Implement the feature in `bulk-github-repo-settings-sync-action` following the implementation guide
3. Release a new version of the action (e.g., v1.2.0)
4. Update the workflow in this repository to use the new version and enable the parameters
5. Test and deploy!
