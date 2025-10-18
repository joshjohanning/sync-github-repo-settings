# Custom File Sync Feature Specification

## Overview

This document specifies the requirements for adding custom file synchronization capabilities to the `bulk-github-repo-settings-sync-action`.

## Problem Statement

Currently, the action only supports syncing a single `dependabot.yml` file. Users need the ability to sync multiple custom files (workflows, issue templates, pull request templates, configuration files, etc.) across repositories.

## Requirements

### Functional Requirements

1. **Support Multiple Files**: Must support syncing 1 to N custom files per repository
2. **Per-Repository Configuration**: Allow different files to be synced to different repositories
3. **Global Configuration**: Support global files that sync to all repositories
4. **File Mapping**: Support source → target path mapping for each file
5. **PR Creation**: Create pull requests for file changes (similar to dependabot sync)
6. **PR Customization**: Allow custom PR titles per file
7. **Change Detection**: Only create PRs when file content differs
8. **PR Updates**: Update existing open PRs instead of creating duplicates
9. **Dry Run Support**: Preview which files would be synced in dry-run mode

### Non-Functional Requirements

1. **Backward Compatibility**: Must not break existing usage
2. **Performance**: Should handle multiple files efficiently
3. **Error Handling**: Gracefully handle missing source files or permission errors
4. **Logging**: Clear logging of which files are being synced

## Proposed Design

### Action Inputs

Add the following new inputs to `action.yml`:

```yaml
custom-files:
  description: 'JSON array or YAML string of custom files to sync. Format: [{"source": "path/to/source", "target": "path/in/repo", "pr-title": "optional title"}]'
  required: false
custom-files-pr-title:
  description: 'Default PR title for custom file syncs when not specified per-file'
  required: false
  default: 'chore: sync custom files'
```

### YAML Configuration Schema

Update the repositories YAML schema to support:

```yaml
repos:
  - repo: owner/repository
    # Existing fields...
    dependabot-yml: './config/dependabot/npm.yml'
    
    # New field
    custom-files:
      - source: './config/workflows/codeql-analysis.yml'
        target: '.github/workflows/codeql-analysis.yml'
        pr-title: 'chore: add CodeQL workflow'  # Optional
      - source: './config/issue-templates/bug_report.md'
        target: '.github/ISSUE_TEMPLATE/bug_report.md'
        # pr-title omitted - uses default
```

### Implementation Approach

1. **Parse Configuration**: 
   - Parse custom-files from action inputs (global)
   - Parse custom-files from YAML config (per-repo)
   - Merge with per-repo overriding global

2. **File Processing**:
   - Read source file content
   - Compare with target file content (if exists)
   - Determine if update is needed

3. **PR Management** (per file):
   - Search for existing open PR with matching title
   - If exists and content differs: Update PR
   - If exists and content same: Close PR or skip
   - If not exists and content differs: Create PR
   - If not exists and content same: Skip

4. **Error Handling**:
   - Skip files with missing sources (log warning)
   - Skip repos where file creation fails (log error)
   - Continue processing other files/repos

### Example Usage

#### Global Files (Applied to All Repos)

```yaml
- name: Sync Settings and Files
  uses: joshjohanning/bulk-github-repo-settings-sync-action@v2
  with:
    github-token: ${{ steps.app-token.outputs.token }}
    repositories-file: 'repos.yml'
    custom-files: |
      - source: './config/workflows/codeql-analysis.yml'
        target: '.github/workflows/codeql-analysis.yml'
    custom-files-pr-title: 'chore: add standard workflows'
```

#### Per-Repository Files (Via YAML)

```yaml
repos:
  - repo: owner/repo1
    custom-files:
      - source: './config/workflows/javascript-ci.yml'
        target: '.github/workflows/ci.yml'
        pr-title: 'chore: add CI workflow'
  
  - repo: owner/repo2
    custom-files:
      - source: './config/workflows/python-ci.yml'
        target: '.github/workflows/ci.yml'
        pr-title: 'chore: add CI workflow'
```

### Alternative Syntax Options

The implementation should initially support the YAML array format shown above. Future versions could add support for:

1. **JSON Array** (for programmatic generation):
   ```yaml
   custom-files: '[{"source":"./config/workflows/codeql.yml","target":".github/workflows/codeql.yml"}]'
   ```

2. **Comma-Separated** (for simple cases):
   ```yaml
   custom-files: './config/workflows/codeql.yml:.github/workflows/codeql.yml'
   ```

## Implementation Phases

### Phase 1: Core Functionality (MVP)
- [ ] Add new action inputs
- [ ] Update YAML schema parsing
- [ ] Implement file sync logic (similar to dependabot sync)
- [ ] Basic error handling and logging
- [ ] Update action documentation

### Phase 2: Enhanced Features
- [ ] Support for file deletions
- [ ] Batch PRs (multiple files in one PR)
- [ ] File templating/variable substitution
- [ ] Conditional file sync based on repository properties

### Phase 3: Advanced Features
- [ ] Support for directory sync
- [ ] File conflict resolution strategies
- [ ] Auto-merge support for custom files
- [ ] Scheduled sync checks

## Testing Strategy

1. **Unit Tests**:
   - YAML parsing with custom-files
   - File content comparison logic
   - PR title generation

2. **Integration Tests**:
   - Sync single file to single repo
   - Sync multiple files to single repo
   - Sync same file to multiple repos
   - Update existing PR scenario
   - Skip unchanged file scenario

3. **Dry-Run Tests**:
   - Verify dry-run output shows files that would be synced
   - Ensure no PRs are created in dry-run mode

## Breaking Changes

None - this is a new feature that's opt-in.

## Migration Guide

N/A - New feature, no migration needed.

## Documentation Updates

1. **README.md**:
   - Add custom file sync to features list
   - Add usage examples
   - Document input parameters
   - Add troubleshooting section

2. **action.yml**:
   - Add new input descriptions
   - Update examples

3. **Example Files**:
   - Add `example-repos-with-custom-files.yml`
   - Add example workflow/template files

## Success Criteria

1. Users can sync 1-N custom files to target repositories
2. Files are synced via pull requests for review
3. No changes to existing functionality
4. Clear documentation with examples
5. Comprehensive test coverage

## Open Questions

1. Should we support file deletions (removing files from target repos)?
2. Should we support directory sync or only individual files?
3. Should we support file templating (variable substitution)?
4. Should we batch multiple file changes into a single PR?
5. What should the default branch be for PRs?

## References

- [Existing dependabot sync implementation](https://github.com/joshjohanning/bulk-github-repo-settings-sync-action)
- [Issue #X: Add ability to sync custom files](https://github.com/joshjohanning/sync-github-repo-settings/issues/X)
