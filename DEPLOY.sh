#!/usr/bin/env bash
# One-shot deploy of the built PrepVerse site to the existing GitHub repo.
# It pushes the ready-built files (relative-base, works at any path) to the
# `gh-pages` branch of munsa00005-del/pyq-, then prints the live URL.
#
# Run:   bash /tmp/deploy/DEPLOY.sh
# You'll be asked for your GitHub username + a Personal Access Token (as the
# password). Create a token at: github.com -> Settings -> Developer settings ->
# Personal access tokens -> Fine-grained -> repo "pyq-" -> Contents: Read/Write.

set -e
REPO_URL="https://github.com/munsa00005-del/pyq-.git"

cd /tmp/deploy
git branch -M gh-pages
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

echo ">> Pushing built site to gh-pages branch of pyq- ..."
git push -u origin gh-pages --force

echo
echo "================================================================"
echo " Pushed. Now enable Pages (one time):"
echo "   1. Open: https://github.com/munsa00005-del/pyq-/settings/pages"
echo "   2. Source: 'Deploy from a branch'"
echo "   3. Branch: gh-pages   Folder: / (root)   -> Save"
echo
echo " Live URL (ready in ~1 min):"
echo "   https://munsa00005-del.github.io/pyq-/"
echo "================================================================"
