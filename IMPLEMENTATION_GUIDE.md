# Implementation Guide: Copilot Instructions Sync Feature

This document describes the changes needed in the `bulk-github-repo-settings-sync-action` repository to support syncing `copilot-instructions.md` files to target repositories.

## Overview

The feature adds the ability to sync `.github/copilot-instructions.md` files to target repositories, similar to how `dependabot.yml` files are currently synced.

## Changes Required

### 1. action.yml

Add new inputs after the dependabot inputs:

```yaml
  copilot-instructions-md:
    description: 'Path to a copilot-instructions.md file to sync to .github/copilot-instructions.md in target repositories'
    required: false
  copilot-instructions-pr-title:
    description: 'Title for pull requests when updating copilot-instructions.md'
    required: false
    default: 'chore: update copilot-instructions.md'
```

### 2. src/index.js

#### a. Add syncCopilotInstructions function

Add a new export function `syncCopilotInstructions()` after the `syncDependabotYml()` function (around line 682). This function should:
- Take parameters: `octokit`, `repo`, `copilotInstructionsPath`, `prTitle`, `dryRun`
- Read the local copilot-instructions.md file
- Check if `.github/copilot-instructions.md` exists in the target repo
- Compare content and skip if unchanged
- Create/update via PR if different
- Use branch name: `copilot-instructions-sync`
- Handle existing PRs (don't create duplicates)
- Support dry-run mode

The implementation follows the same pattern as `syncDependabotYml()` but targets `.github/copilot-instructions.md` instead of `.github/dependabot.yml`.

#### b. Update hasRepositoryChanges function

Update the function (around line 922) to include copilot-instructions changes:

```javascript
function hasRepositoryChanges(result) {
  return (
    (result.changes && result.changes.length > 0) ||
    result.topicsChange ||
    result.codeScanningChange ||
    (result.dependabotSync &&
      result.dependabotSync.success &&
      result.dependabotSync.dependabotYml &&
      result.dependabotSync.dependabotYml !== 'unchanged') ||
    (result.copilotInstructionsSync &&
      result.copilotInstructionsSync.success &&
      result.copilotInstructionsSync.copilotInstructions &&
      result.copilotInstructionsSync.copilotInstructions !== 'unchanged')
  );
}
```

#### c. Update run() function

1. Add input reading (around line 975):
```javascript
// Get copilot-instructions.md settings
const copilotInstructionsMd = getInput('copilot-instructions-md');
const copilotPrTitle = getInput('copilot-instructions-pr-title') || 'chore: update copilot-instructions.md';
```

2. Update hasSettings check (around line 994):
```javascript
const hasSettings =
  Object.values(settings).some(value => value !== null) ||
  enableCodeScanning ||
  topics !== null ||
  dependabotYml ||
  copilotInstructionsMd;
```

3. Add logging (around line 1018):
```javascript
if (copilotInstructionsMd) {
  core.info(`Copilot-instructions.md will be synced from: ${copilotInstructionsMd}`);
}
```

4. Add repo-specific override handling (around line 1083):
```javascript
// Handle repo-specific copilot-instructions.md
let repoCopilotInstructionsMd = copilotInstructionsMd;
if (repoConfig['copilot-instructions-md'] !== undefined) {
  repoCopilotInstructionsMd = repoConfig['copilot-instructions-md'];
}
```

5. Add sync call after dependabot sync (around line 1117):
```javascript
// Sync copilot-instructions.md if specified
if (repoCopilotInstructionsMd) {
  core.info(`  🤖 Syncing copilot-instructions.md...`);
  const copilotResult = await syncCopilotInstructions(
    octokit,
    repo,
    repoCopilotInstructionsMd,
    copilotPrTitle,
    dryRun
  );

  // Add copilot-instructions result to the main result
  result.copilotInstructionsSync = copilotResult;

  if (copilotResult.success) {
    if (copilotResult.copilotInstructions === 'unchanged') {
      core.info(`  🤖 ${copilotResult.message}`);
    } else if (dryRun) {
      core.info(`  🤖 ${copilotResult.message}`);
    } else {
      core.info(`  🤖 ${copilotResult.message}`);
      if (copilotResult.prUrl) {
        core.info(`  🔗 PR URL: ${copilotResult.prUrl}`);
      }
    }
  } else {
    core.warning(`  ⚠️  ${copilotResult.error}`);
  }
}
```

6. Update local development comments (around line 16):
```javascript
 *    export INPUT_COPILOT_INSTRUCTIONS_MD="./path/to/copilot-instructions.md"
 *    export INPUT_COPILOT_INSTRUCTIONS_PR_TITLE="chore: update copilot-instructions.md"
```

7. Update error message (around line 997):
```javascript
throw new Error(
  'At least one repository setting must be specified (or enable-default-code-scanning must be true, or topics must be provided, or dependabot-yml must be specified, or copilot-instructions-md must be specified)'
);
```

### 3. README.md

Add documentation similar to the dependabot.yml section:

#### Example Usage Section
```markdown
### Syncing Copilot Instructions

Sync a `copilot-instructions.md` file to `.github/copilot-instructions.md` in target repositories via pull requests:

```yml
- name: Sync Copilot Instructions
  uses: joshjohanning/bulk-github-repo-settings-sync-action@v1
  with:
    github-token: ${{ steps.app-token.outputs.token }}
    repositories-file: 'repos.yml'
    copilot-instructions-md: './config/copilot/node-action.md'
    copilot-instructions-pr-title: 'chore: update copilot-instructions.md'
```

Or with repo-specific overrides in `repos.yml`:

```yaml
repos:
  - repo: owner/repo1
    copilot-instructions-md: './config/copilot/node-action.md'
  - repo: owner/repo2
    copilot-instructions-md: './config/copilot/python-app.md'
```

**Behavior:**

- If `.github/copilot-instructions.md` doesn't exist, it creates it and opens a PR
- If it exists but differs, it updates it via PR
- If content is identical, no PR is created
- PRs are created/updated using the GitHub API so commits are verified
- Updates existing open PRs instead of creating duplicates
```

#### Action Inputs Table
Add rows:
```markdown
| `copilot-instructions-md`      | Path to a copilot-instructions.md file to sync to `.github/copilot-instructions.md` in target repositories | No | - |
| `copilot-instructions-pr-title`| Title for pull requests when updating copilot-instructions.md | No | `chore: update copilot-instructions.md` |
```

#### Features List
Add:
```markdown
- 🤖 **Sync copilot-instructions.md files** across repositories via pull requests
```

### 4. Tests (optional but recommended)

Add tests similar to the dependabot tests in `__tests__/index.test.js`:
- Test syncing copilot-instructions.md to a new repo
- Test updating existing copilot-instructions.md
- Test when content is unchanged
- Test with existing PR
- Test error handling
- Test dry-run mode

### 5. Update package version

Update version in `package.json` to reflect the new feature (e.g., from `1.1.0` to `1.2.0`).

## Testing

After implementation:

1. Build the action: `npm run bundle`
2. Test locally with environment variables
3. Test in a workflow with dry-run mode
4. Test actual PR creation in a test repository
5. Verify all tests pass: `npm test`

## Implementation Status

The implementation has been completed in `/tmp/bulk-github-repo-settings-sync-action` as a reference. The changes follow the same pattern as the existing `dependabot.yml` sync feature for consistency.

## Files Modified

- `action.yml` - Added new inputs
- `src/index.js` - Added syncCopilotInstructions function and integrated it into the workflow
- `README.md` - (To be updated with documentation)
- `__tests__/index.test.js` - (To be updated with tests)
