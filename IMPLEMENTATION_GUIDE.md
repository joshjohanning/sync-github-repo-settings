# Custom File Sync Implementation Guide

This guide provides step-by-step instructions for implementing the custom file sync feature.

## Overview

The custom file sync feature allows syncing 1:N custom files (workflows, templates, configuration files, etc.) from this repository to target repositories, similar to how `dependabot.yml` is currently synced.

## For This Repository (sync-github-repo-settings)

### Current Status

✅ **Ready to Use** - Configuration examples and files are prepared
⏳ **Waiting for Action Update** - The underlying action needs to be updated first

### What's Already Done

1. **Example Files Created:**
   - Workflows: `config/workflows/codeql-analysis.yml`, `config/workflows/pr-labeler.yml`
   - Templates: `config/issue-templates/bug_report.md`, `config/issue-templates/feature_request.md`

2. **Configuration Examples:**
   - `repos-with-custom-files-example.yml` - Shows how to configure file syncing

3. **Documentation:**
   - `README.md` - Feature documentation and examples
   - `CUSTOM_FILE_SYNC_SPEC.md` - Technical specification

### When Action is Updated

Once the `bulk-github-repo-settings-sync-action` supports custom file sync, update the workflow:

1. **Update the action version** in `.github/workflows/sync-github-repo-settings.yml`:
   ```yaml
   - name: Update Repository Settings
     uses: joshjohanning/bulk-github-repo-settings-sync-action@v2  # Updated version
   ```

2. **Option A: Use global custom files** (apply to all repos):
   ```yaml
   - name: Update Repository Settings
     uses: joshjohanning/bulk-github-repo-settings-sync-action@v2
     with:
       github-token: ${{ steps.app-token.outputs.token }}
       repositories-file: 'repos.yml'
       # ... existing settings ...
       custom-files: |
         - source: './config/workflows/codeql-analysis.yml'
           target: '.github/workflows/codeql-analysis.yml'
           pr-title: 'chore: add CodeQL workflow'
   ```

3. **Option B: Use per-repository custom files** (in repos.yml):
   ```yaml
   repos:
     - repo: joshjohanning/approveops
       topics: 'github,actions,javascript,node-action'
       dependabot-yml: './config/dependabot/npm-actions.yml'
       custom-files:
         - source: './config/workflows/codeql-analysis.yml'
           target: '.github/workflows/codeql-analysis.yml'
   ```

4. **Test in dry-run mode first:**
   ```yaml
   dry-run: true  # Preview changes before applying
   ```

## For the Action Repository (bulk-github-repo-settings-sync-action)

### Implementation Steps

See [`CUSTOM_FILE_SYNC_SPEC.md`](./CUSTOM_FILE_SYNC_SPEC.md) for detailed specifications.

#### Phase 1: Core Implementation (MVP)

1. **Update `action.yml`** - Add new inputs:
   ```yaml
   inputs:
     custom-files:
       description: 'YAML/JSON array of custom files to sync'
       required: false
     custom-files-pr-title:
       description: 'Default PR title for custom file syncs'
       required: false
       default: 'chore: sync custom files'
   ```

2. **Update YAML Parser** - Add support for `custom-files` in repository configuration:
   ```javascript
   // In src/yaml-parser.js or similar
   const customFiles = repoConfig['custom-files'] || globalCustomFiles;
   ```

3. **Create File Sync Module** - Extract the dependabot sync logic and generalize it:
   ```javascript
   // src/file-sync.js
   async function syncCustomFiles(octokit, owner, repo, files, dryRun) {
     for (const file of files) {
       const { source, target, prTitle } = file;
       // Read source file
       // Compare with target
       // Create/update PR if needed
     }
   }
   ```

4. **Integrate into Main Flow**:
   ```javascript
   // In main action flow
   if (repoConfig.customFiles || globalCustomFiles) {
     await syncCustomFiles(octokit, owner, repo, customFiles, dryRun);
   }
   ```

5. **Update Tests** - Add test cases for:
   - Parsing custom-files from YAML
   - Syncing single file
   - Syncing multiple files
   - Skipping unchanged files
   - Updating existing PRs

6. **Update Documentation**:
   - README.md with usage examples
   - Action inputs documentation
   - Example repository configuration

#### Phase 2: Enhancements (Future)

- Batch multiple files into single PR
- File templating/variable substitution
- Support for file deletions
- Directory sync support

## Testing Checklist

### For Configuration Repository

- [x] YAML files are syntactically valid
- [x] Workflow files follow GitHub Actions schema
- [x] Issue templates follow GitHub template format
- [x] Example configuration is well-documented
- [ ] Test with actual action once implemented

### For Action Repository

- [ ] Unit tests for YAML parsing with custom-files
- [ ] Integration tests for file sync operations
- [ ] Dry-run mode shows correct preview
- [ ] PRs are created with correct titles
- [ ] Existing PRs are updated correctly
- [ ] Unchanged files are skipped
- [ ] Error handling for missing files
- [ ] Performance with multiple files

## Usage Examples

### Example 1: Sync CodeQL Workflow to All JavaScript Projects

```yaml
repos:
  - repo: joshjohanning/approveops
    topics: 'github,actions,javascript'
    custom-files:
      - source: './config/workflows/codeql-analysis.yml'
        target: '.github/workflows/codeql.yml'
```

### Example 2: Sync Multiple Files to a Repository

```yaml
repos:
  - repo: joshjohanning/my-project
    custom-files:
      - source: './config/workflows/codeql-analysis.yml'
        target: '.github/workflows/codeql.yml'
        pr-title: 'chore: add CodeQL security scanning'
      - source: './config/workflows/pr-labeler.yml'
        target: '.github/workflows/labeler.yml'
        pr-title: 'chore: add PR labeler'
      - source: './config/issue-templates/bug_report.md'
        target: '.github/ISSUE_TEMPLATE/bug_report.md'
        pr-title: 'chore: add bug report template'
```

### Example 3: Different Workflows for Different Project Types

```yaml
repos:
  - repo: joshjohanning/javascript-project
    custom-files:
      - source: './config/workflows/javascript-ci.yml'
        target: '.github/workflows/ci.yml'
  
  - repo: joshjohanning/python-project
    custom-files:
      - source: './config/workflows/python-ci.yml'
        target: '.github/workflows/ci.yml'
```

## Troubleshooting

### Issue: Source file not found
**Solution:** Ensure the source path is relative to the repository root

### Issue: Permission denied creating PR
**Solution:** Ensure GitHub App/token has `contents: write` and `pull-requests: write` permissions

### Issue: Files not syncing
**Solution:** Check dry-run output to see if files are being detected as changed

## References

- [Feature Specification](./CUSTOM_FILE_SYNC_SPEC.md)
- [Example Configuration](./repos-with-custom-files-example.yml)
- [Action Repository](https://github.com/joshjohanning/bulk-github-repo-settings-sync-action)
- [Current Implementation](https://github.com/joshjohanning/bulk-github-repo-settings-sync-action/blob/main/src/index.js)
