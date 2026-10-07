---
name: update-nms
description: >-
  /doc 폴더에 추가된 최신 생성일 기준의 HTML/CSS 파일을 감지하여 No Man's Sky 2D 프로젝트 소스에 완벽히 동기화 및 반영합니다.
  Use this skill whenever the user asks to update the game with latest files in /doc or types /update-nms.
---

# update-nms: No Man's Sky 2D 최신 소스 및 CSS 동기화 스킬

이 스킬은 `/doc` 폴더에 새롭게 추가된 최신 HTML 및 CSS 파일을 파일 생성/수정일 기준으로 탐색하여, `public/`, `src/index.css`, `src/gameEngine.ts`, `src/types.ts`, `src/components/`, `index.html` 등에 무손실로 반영하고 빌드 검증 및 배포를 수행하는 표준 절차입니다.

## 핵심 실행 절차 (Workflow)

### 1단계: `/doc` 폴더 내 최신 파일 탐색
1. **최신 CSS 파일 확인**:
   ```bash
   ls -lt doc/*.css | head -n 1
   ```
2. **최신 HTML 파일 확인**:
   ```bash
   ls -lt doc/*.html | head -n 1
   ```
3. 현재 프로젝트에 기적용된 파일과 비교하여 신규 회차(Turn Record, UI 번호 범위) 및 신규 버전(vX.XX.X) 여부 식별.

---

### 2단계: 최신 마스터 CSS 테마 반영
1. 최신 CSS 파일을 `public/nomansky-theme-complete.css`로 덮어쓰기 복사.
2. `src/index.css` 무손실 합성:
   - `src/index.css`의 상단(인게임 Tailwind 임포트 및 모바일 터치 전술 HUD/가상 컨트롤러 반응형 스타일, 약 1~698줄)을 보존.
   - 신규 마스터 CSS에서 중복된 외부 폰트 `@import url(...)` 구문을 제거하고 인게임 스타일 뒤에 결합.
3. `npm run build`를 실행하여 CSS 번들 최적화 및 빌드 정상 여부 확인.

---

### 3단계: 신규 HTML 및 게임플레이 엔진 반영
1. 신규 HTML 파일의 버전 번호(vX.XX.X) 및 헤더 타이틀, 신규 게임플레이 메카닉 파악.
2. 신규 아케이드 단독 실행용으로 `public/vX.XX.X.html`에 복사 배치.
3. `index.html`의 `<title>` 및 메타태그(description, og:title 등)를 해당 버전으로 갱신.
4. 신규 시스템(예: Waypoint 난이도 매트릭스, 센티넬 화기, 과급 슬롯, 함대 원정 등)의 데이터 구조 및 타입을 `src/types.ts`에 추가.
5. `src/gameEngine.ts`에 관련 상수, 상태 변수, 메서드, 런타임 게임플레이 배율 및 키보드/터치 바인딩 구현.
6. `src/components/MobileModals.tsx`, `src/components/MobileHUD.tsx`, `src/components/MobileQuickDrawer.tsx` 등 모바일 반응형 UI 컴포넌트에 전용 모달, 헤더 배지, 빠른 링크 연동.

---

### 4단계: 빌드 검증 및 구동
1. `npm run build` 실행: TypeScript 타입 에러 0개 및 CSS 번들링 0개 경고 확인.
2. 개발 서버(포트 3000) 구동 상태 점검:
   ```bash
   curl -I http://localhost:3000
   ```
3. 변경 파일 내역 검토 후 사용자 확인 및 커밋/푸시(`git push origin main`) 준비.
