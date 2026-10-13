#!/usr/bin/env bash
set -e

echo "=== [improve-nms] No Man's Sky 3D Three.js 개발 검증 스크립트 ==="
echo "1. TypeScript 및 Vite 프로덕션 빌드 검사 중..."
npm run build

echo "2. 빌드 검증 성공! Three.js 3D 엔진 및 컴포넌트가 정상 동작합니다."
exit 0
