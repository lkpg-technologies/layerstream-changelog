#!/usr/bin/env bash
# Writes releases/<component>/<version>.md in the current (changelog) checkout and
# pushes it. Inputs come from the environment so that release notes are never
# interpolated into shell code.
set -euo pipefail

: "${COMPONENT:?}" "${VERSION:?}" "${NOTES?}"
TITLE="${TITLE:-}"

if [ ! -d "releases/${COMPONENT}" ]; then
  echo "::error::Unknown component '${COMPONENT}'. Known: $(ls releases | tr '\n' ' ')"
  exit 1
fi
if ! [[ "$VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$ ]]; then
  echo "::error::Version '${VERSION}' is not of the form v1.2.3"
  exit 1
fi

# Drop HTML comments (PR templates are full of them) and surrounding blank lines.
body=$(printf '%s' "$NOTES" | perl -0pe 's/<!--.*?-->//gs; s/\r//g; s/\A\s+|\s+\z//g')
if [ -z "$body" ]; then
  echo "::error::Release notes are empty; refusing to publish ${COMPONENT} ${VERSION}"
  exit 1
fi

file="releases/${COMPONENT}/${VERSION}.md"
# Re-running a release job keeps the original publish date.
date=$( { grep -m1 '^date: ' "$file" 2>/dev/null || true; } | cut -d' ' -f2)
date="${date:-$(date -u +%Y-%m-%dT%H:%M:%SZ)}"
{
  echo '---'
  echo "component: ${COMPONENT}"
  echo "version: ${VERSION}"
  echo "date: ${date}"
  # JSON strings are valid YAML, which handles any quoting in the title.
  [ -n "$TITLE" ] && echo "title: $(jq -Rn --arg t "$TITLE" '$t')"
  echo '---'
  echo
  printf '%s\n' "$body"
} > "$file"

git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git add "$file"
if git diff --cached --quiet; then
  echo "Entry ${file} is already up to date"
  exit 0
fi
git commit -q -m "${COMPONENT} ${VERSION}"

# Another component may have published at the same moment; rebase and retry.
for attempt in 1 2 3 4 5; do
  if git push -q origin HEAD; then
    echo "Published ${file}"
    exit 0
  fi
  echo "Push rejected (attempt ${attempt}), rebasing…"
  sleep $((attempt * 2))
  git pull -q --rebase origin "$(git rev-parse --abbrev-ref HEAD)"
done
echo "::error::Could not push ${file}"
exit 1
