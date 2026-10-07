#!/usr/bin/env bash
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
cd "$REPO_ROOT"

echo "=========================================================="
echo " [update-nms] Checking latest doc files in: $REPO_ROOT/doc"
echo "=========================================================="

# 1. Find latest CSS file
LATEST_CSS=$(ls -t doc/*.css 2>/dev/null | head -n 1)
if [ -n "$LATEST_CSS" ]; then
  echo ">> Found latest CSS: $LATEST_CSS"
  cp "$LATEST_CSS" "public/nomansky-theme-complete.css"
  echo "   -> Copied to public/nomansky-theme-complete.css"

  # Preserve first 698 lines of src/index.css (Tailwind & in-game responsive HUD)
  TMP_CSS=$(mktemp)
  head -n 698 src/index.css > "$TMP_CSS"
  echo -e "\n/* === 2. COMPLETE UNIFIED MASTER THEME (LATEST FROM $LATEST_CSS) === */\n" >> "$TMP_CSS"
  # Append master CSS while filtering duplicate @import
  sed '/@import url/d' "$LATEST_CSS" >> "$TMP_CSS"
  mv "$TMP_CSS" src/index.css
  echo "   -> Synthesized into src/index.css (Total lines: $(wc -l < src/index.css))"
else
  echo "!! No CSS files found in doc/"
fi

# 2. Find latest HTML file
LATEST_HTML=$(ls -t doc/*.html 2>/dev/null | head -n 1)
if [ -n "$LATEST_HTML" ]; then
  echo ">> Found latest HTML: $LATEST_HTML"
  # Extract version from filename or title (e.g. v5.51.0)
  VER=$(echo "$LATEST_HTML" | grep -oE "v[0-9]+\.[0-9]+\.[0-9]+" | head -n 1 || echo "")
  if [ -n "$VER" ]; then
    cp "$LATEST_HTML" "public/${VER}.html"
    echo "   -> Copied to public/${VER}.html"
  fi
fi

# 3. Test build
echo ">> Running build validation..."
npm run build

echo "=========================================================="
echo " [update-nms] Successfully updated and verified!"
echo "=========================================================="
