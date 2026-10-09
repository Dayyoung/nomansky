---
name: update-nms
description: >-
  /doc 폴더에 추가된 최신 생성일 기준의 HTML/CSS 파일을 감지하여 No Man's Sky 2D 프로젝트 소스에 완벽히 동기화 및 반영하고, git pull로 최신 소스 병합 후 git push까지 자동 완결합니다.
  Use this skill whenever the user asks to update the game with latest files in /doc or types /update-nms.
---

# update-nms: No Man's Sky 2D 최신 소스 동기화 & Git 통합 스킬

이 스킬은 `/doc` 폴더에 새롭게 추가된 최신 HTML 및 CSS 파일을 감지하여, 사전 `git pull`로 원격 최신 소스를 안전하게 병합한 뒤 프로젝트 전체 소스에 무손실로 반영하고, 빌드 검증을 거쳐 `git push`까지 원스톱으로 마무리하는 표준 절차입니다.

## 원터치 자동 실행 스크립트
다음 헬퍼 스크립트를 실행하면 1~4단계 전체 과정이 자동으로 완결됩니다:
```bash
./.agents/skills/update-nms/scripts/sync-doc.sh
```

---

## 핵심 실행 절차 (Manual & Automated Workflow)

### 1단계: 원격 저장소 최신 소스 병합 (Git Pull)
* 작업 시작 전 원격 저장소의 변경 사항을 먼저 안전하게 가져옵니다:
  ```bash
  git pull --rebase origin main
  ```

---

### 2단계: `/doc` 폴더 내 최신 파일 탐색 및 동기화
1. **최신 CSS 파일 확인 및 반영**:
   ```bash
   ls -lt doc/*.css | head -n 1
   ```
   * 최신 CSS 파일을 `public/nomansky-theme-complete.css`로 덮어쓰기 복사.
   * `src/index.css` 합성: 상단 인게임 Tailwind 및 모바일 터치 전술 HUD 스타일(약 1~698줄)을 보존하고, 신규 마스터 CSS의 중복 외부 폰트 `@import`를 제거하여 결합.
2. **최신 HTML 파일 확인 및 반영**:
   ```bash
   ls -lt doc/*.html | head -n 1
   ```
   * 신규 버전(vX.XX.X) 아케이드 단독 실행용으로 `public/vX.XX.X.html`에 복사 배치.
   * `index.html`의 `<title>` 및 메타태그(description, og:title 등)를 해당 버전으로 갱신.
   * 신규 모달, 기능, 단축키가 있을 경우 `src/types.ts`, `src/gameEngine.ts`, `src/components/MobileModals.tsx`, `src/components/MobileHUD.tsx`, `src/components/MobileQuickDrawer.tsx` 등에 즉시 연동.

---

### 3단계: 프로덕션 빌드 검증
* TypeScript 타입 에러 및 CSS 번들링 0개 오류 검증:
  ```bash
  npm run build
  ```

---

### 4단계: 변경 사항 자동 커밋 및 원격 푸시 (Git Push)
* 빌드 검증 성공 후 변경된 모든 소스를 스테이징, 커밋 후 원격 저장소로 즉시 푸시합니다:
  ```bash
  git add .
  git commit -m "feat: <버전> 최신 소스 및 마스터 CSS 테마 동기화"
  git push origin main
  ```
* 개발 서버(`port 3000`) 정상 응답(`curl -I http://localhost:3000`) 상태 점검.
