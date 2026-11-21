#!/usr/bin/env bash
# Runs `gh actions-lock` against the workflow templates in config/workflows.
# The extension only scans .github/workflows, so the templates are staged there
# and the resulting lockfile is copied back to config/workflows/actions.lock.
# --no-narrow keeps floating refs (e.g. @v2) as written in the templates.
#
# Usage: ./scripts/actions-lock.sh [gh actions-lock flags, e.g. --verify or --relock]
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
templates="$repo_root/config/workflows"
staging="$(mktemp -d)"
trap 'rm -rf "$staging"' EXIT

mkdir -p "$staging/.github/workflows"
shopt -s nullglob
for file in "$templates"/*.yml "$templates"/*.yaml "$templates"/actions.lock; do
  cp "$file" "$staging/.github/workflows/"
done

(cd "$staging" && gh actions-lock --no-narrow "$@")

cp "$staging/.github/workflows/actions.lock" "$templates/actions.lock"
