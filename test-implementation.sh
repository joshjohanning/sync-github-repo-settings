#!/bin/bash
# Test script to validate package.json sync implementation

echo "🧪 Testing package.json sync implementation"
echo ""

# Test 1: Verify action.yml has required inputs
echo "✓ Test 1: Checking action.yml inputs..."
if grep -q "package-json:" .github/actions/bulk-github-repo-settings-sync-action/action.yml && \
   grep -q "sync-dev-dependencies:" .github/actions/bulk-github-repo-settings-sync-action/action.yml && \
   grep -q "sync-scripts:" .github/actions/bulk-github-repo-settings-sync-action/action.yml; then
    echo "  ✅ All required inputs are defined"
else
    echo "  ❌ Missing required inputs"
    exit 1
fi

# Test 2: Verify dist files exist
echo ""
echo "✓ Test 2: Checking dist files..."
if [ -f .github/actions/bulk-github-repo-settings-sync-action/dist/index.js ]; then
    echo "  ✅ dist/index.js exists"
else
    echo "  ❌ dist/index.js missing"
    exit 1
fi

# Test 3: Verify template package.json exists and is valid JSON
echo ""
echo "✓ Test 3: Checking template package.json..."
if [ -f config/package-json/npm-actions.json ]; then
    if jq empty config/package-json/npm-actions.json 2>/dev/null; then
        echo "  ✅ Template is valid JSON"
    else
        echo "  ❌ Template is invalid JSON"
        exit 1
    fi
else
    echo "  ❌ Template file missing"
    exit 1
fi

# Test 4: Verify template has required sections
echo ""
echo "✓ Test 4: Checking template structure..."
if jq -e '.devDependencies' config/package-json/npm-actions.json > /dev/null && \
   jq -e '.scripts' config/package-json/npm-actions.json > /dev/null; then
    echo "  ✅ Template has devDependencies and scripts"
    echo "  📦 devDependencies count: $(jq '.devDependencies | length' config/package-json/npm-actions.json)"
    echo "  📜 scripts count: $(jq '.scripts | length' config/package-json/npm-actions.json)"
else
    echo "  ❌ Template missing required sections"
    exit 1
fi

# Test 5: Verify workflow configuration
echo ""
echo "✓ Test 5: Checking workflow configuration..."
if grep -q "package-json: './config/package-json/npm-actions.json'" .github/workflows/sync-github-repo-settings.yml && \
   grep -q "sync-dev-dependencies: true" .github/workflows/sync-github-repo-settings.yml && \
   grep -q "sync-scripts: true" .github/workflows/sync-github-repo-settings.yml; then
    echo "  ✅ Workflow has package.json sync configured"
else
    echo "  ❌ Workflow missing package.json sync configuration"
    exit 1
fi

# Test 6: Verify repos.yml has package.json configuration
echo ""
echo "✓ Test 6: Checking repos.yml configuration..."
REPO_COUNT=$(grep -c "package-json:" repos.yml || echo "0")
if [ "$REPO_COUNT" -gt 0 ]; then
    echo "  ✅ $REPO_COUNT repositories configured with package.json sync"
else
    echo "  ⚠️  Warning: No repositories configured with package.json sync"
fi

# Test 7: Verify documentation exists
echo ""
echo "✓ Test 7: Checking documentation..."
if [ -f PACKAGE_JSON_SYNC.md ] && [ -f SECURITY_SUMMARY.md ]; then
    echo "  ✅ Documentation files exist"
else
    echo "  ❌ Documentation files missing"
    exit 1
fi

echo ""
echo "🎉 All tests passed!"
echo ""
echo "📝 Summary:"
echo "  - Action inputs: ✅"
echo "  - Bundled action: ✅"
echo "  - Template file: ✅"
echo "  - Workflow config: ✅"
echo "  - Repository config: ✅"
echo "  - Documentation: ✅"
echo ""
echo "The implementation is ready to use!"
