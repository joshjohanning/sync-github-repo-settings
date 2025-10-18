# Custom File Sync Feature - Complete Proposal

## Issue

**Title:** Add ability to sync custom files (like workflows)

**Description:** Would need an input for target-files and input for source-files - maybe comma separated or as a json array? (or maybe yml). Basically be able to accept 1:N custom files.

## Solution

This proposal addresses the issue by providing a complete specification and example implementation for syncing 1 to N custom files across repositories.

## What's Delivered

### 1. Example Files (Ready to Sync)

All files are validated and ready to be synced to target repositories:

| File | Purpose | Location |
|------|---------|----------|
| CodeQL Analysis Workflow | Security scanning | `config/workflows/codeql-analysis.yml` |
| PR Labeler Workflow | Automatic PR labeling | `config/workflows/pr-labeler.yml` |
| Bug Report Template | Issue template | `config/issue-templates/bug_report.md` |
| Feature Request Template | Issue template | `config/issue-templates/feature_request.md` |

### 2. Configuration Examples

**File:** `repos-with-custom-files-example.yml`

Shows three usage patterns:
- ✅ Single file sync to a repository
- ✅ Multiple files sync to a repository  
- ✅ Global files applied to all repositories

### 3. Documentation

| Document | Purpose |
|----------|---------|
| `README.md` | Updated with feature overview, comparison table, visual diagram, and usage examples |
| `CUSTOM_FILE_SYNC_SPEC.md` | Complete technical specification with requirements, API design, and testing strategy |
| `IMPLEMENTATION_GUIDE.md` | Step-by-step guide for implementing and using the feature |

## Proposed Syntax (YAML - Recommended)

### Per-Repository Configuration

```yaml
repos:
  - repo: owner/repository
    custom-files:
      - source: './config/workflows/codeql-analysis.yml'
        target: '.github/workflows/codeql-analysis.yml'
        pr-title: 'chore: add CodeQL workflow'
      - source: './config/issue-templates/bug_report.md'
        target: '.github/ISSUE_TEMPLATE/bug_report.md'
        pr-title: 'chore: add bug report template'
```

### Global Configuration (Workflow Input)

```yaml
- uses: joshjohanning/bulk-github-repo-settings-sync-action@v2
  with:
    custom-files: |
      - source: './config/workflows/codeql-analysis.yml'
        target: '.github/workflows/codeql-analysis.yml'
```

## Alternative Syntax Options

As requested in the issue, the specification includes three format options:

1. **YAML Array** (Recommended for flexibility)
2. **JSON Array** (For programmatic generation)
3. **Comma-Separated** (For simple use cases)

See `CUSTOM_FILE_SYNC_SPEC.md` for details on each option.

## How It Works

```
Source Repo                        Action                    Target Repo
┌──────────────┐                ┌──────────┐               ┌──────────────┐
│ config/      │                │          │               │ .github/     │
│  workflows/  │────source─────▶│  Sync    │────target────▶│  workflows/  │
│  templates/  │────source─────▶│  Logic   │────target────▶│  ISSUE_*/    │
└──────────────┘                └──────────┘               └──────────────┘
                                     │
                                     ▼
                              Creates/Updates PR
                              if content differs
```

## Benefits

1. **Standardization:** Ensure all repositories use the same workflows and templates
2. **Maintainability:** Update files in one place, sync to all repositories
3. **Consistency:** Same PR-based approach as dependabot.yml sync
4. **Flexibility:** Support 1:N files per repository
5. **Safety:** Dry-run mode and PR-based changes for review

## Implementation Status

### This Repository (sync-github-repo-settings)
✅ **Complete** - Ready to use once action is updated

### Action Repository (bulk-github-repo-settings-sync-action)
⏳ **Pending** - Requires implementation (see CUSTOM_FILE_SYNC_SPEC.md)

## Implementation Checklist for Action

To implement in `bulk-github-repo-settings-sync-action`:

- [ ] Add `custom-files` and `custom-files-pr-title` inputs to `action.yml`
- [ ] Update YAML parser to support `custom-files` in repo configuration
- [ ] Create file sync module (generalize dependabot sync logic)
- [ ] Add change detection and PR management for custom files
- [ ] Implement dry-run support for custom files
- [ ] Add unit and integration tests
- [ ] Update action README and documentation
- [ ] Create release with new feature

## Testing

All deliverables in this PR have been validated:

- ✅ All YAML files are syntactically valid
- ✅ All workflows follow GitHub Actions schema
- ✅ Configuration structure is well-formed
- ✅ Documentation is comprehensive

## Files Changed

```
 CUSTOM_FILE_SYNC_SPEC.md               | 221 ++++++++++++++++++
 IMPLEMENTATION_GUIDE.md                | 230 ++++++++++++++++++
 README.md                              | 174 +++++++++++++-
 config/issue-templates/bug_report.md   |  27 +++
 config/issue-templates/feature_request.md | 20 ++
 config/workflows/codeql-analysis.yml   |  38 +++
 config/workflows/pr-labeler.yml        |  17 ++
 repos-with-custom-files-example.yml    |  45 ++++
 8 files changed, 771 insertions(+), 1 deletion(-)
```

## Questions & Discussion

See `CUSTOM_FILE_SYNC_SPEC.md` section "Open Questions" for items that need decision:

1. Should we support file deletions?
2. Should we support directory sync?
3. Should we support file templating?
4. Should we batch multiple files into a single PR?

## References

- Issue: Add ability to sync custom files (like workflows)
- Action Repository: https://github.com/joshjohanning/bulk-github-repo-settings-sync-action
- Current Dependabot Sync: Similar PR-based approach

## Next Steps

1. Review this proposal
2. Decide on syntax preference (YAML recommended)
3. Answer open questions in specification
4. Implement in `bulk-github-repo-settings-sync-action`
5. Release new version of action
6. Update this repository to use the feature
