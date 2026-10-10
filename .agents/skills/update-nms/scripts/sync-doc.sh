#!/usr/bin/env bash
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
cd "$REPO_ROOT"

echo "=========================================================="
echo " [update-nms] 1단계: 원격 저장소 최신 소스 당겨오기 (git pull)"
echo "=========================================================="

HAS_LOCAL_CHANGES=0
if [ -n "$(git status --porcelain)" ]; then
  echo ">> 로컬 미커밋 변경 사항 감지: git stash 임시 보관..."
  HAS_LOCAL_CHANGES=1
  git stash push -u -m "autostash_update_nms"
fi

git pull --rebase origin main || {
  echo "!! git pull 중 오류 또는 충돌이 발생했습니다."
  if [ $HAS_LOCAL_CHANGES -eq 1 ]; then
    git stash pop || true
  fi
  exit 1
}

if [ $HAS_LOCAL_CHANGES -eq 1 ]; then
  echo ">> 임시 보관된 로컬 변경 사항 복원: git stash pop..."
  git stash pop || true
fi

echo "=========================================================="
echo " [update-nms] 2단계: /doc 내 최신 파일 탐색 및 소스 동기화"
echo "=========================================================="

# 1. Find latest CSS file
LATEST_CSS=$(ls -t doc/*.css 2>/dev/null | head -n 1)
CSS_UPDATED=0
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
  CSS_UPDATED=1
else
  echo "!! No CSS files found in doc/"
fi

# 2. Find latest HTML file
LATEST_HTML=$(ls -t doc/*.html 2>/dev/null | head -n 1)
HTML_VER=""
if [ -n "$LATEST_HTML" ]; then
  echo ">> Found latest HTML: $LATEST_HTML"
  HTML_VER=$(echo "$LATEST_HTML" | grep -oE "v[0-9]+\.[0-9]+\.[0-9]+" | head -n 1 || echo "")
  if [ -n "$HTML_VER" ]; then
    cp "$LATEST_HTML" "public/${HTML_VER}.html"
    echo "   -> Copied to public/${HTML_VER}.html"
  fi
fi

echo "=========================================================="
echo " [update-nms] 3단계: 프로덕션 빌드 검증 (npm run build)"
echo "=========================================================="
npm run build

echo "=========================================================="
echo " [update-nms] 4단계: 변경 사항 자동 커밋 및 원격 푸시 (git push)"
echo "=========================================================="
if [ -n "$(git status --porcelain)" ]; then
  git add .
  COMMIT_MSG="feat: /doc 최신 소스 동기화 및 마스터 CSS 테마 갱신"
  if [ -n "$HTML_VER" ]; then
    COMMIT_MSG="feat: ${HTML_VER} 최신 소스 및 마스터 CSS 테마 동기화"
  fi
  git commit -m "$COMMIT_MSG"
  git push origin main
  echo ">> 원격 저장소(origin/main) 푸시 완료!"
else
  echo ">> 변경된 파일이 없어 푸시를 생략합니다 (최신 상태 유지 중)."
fi

echo "=========================================================="
echo " [update-nms] 모든 동기화 및 git push가 완료되었습니다!"
echo "=========================================================="
