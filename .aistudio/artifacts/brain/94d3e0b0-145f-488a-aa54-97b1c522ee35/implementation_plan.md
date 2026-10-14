# 우주선 모드 및 사람 모드 A/D 좌우 조작 방향 반전 수정

우주선 비행 모드와 보행(사람) 모드에서 A/D 키 입력 시 좌우 방향이 반대로 적용되던 조작계를 상호 맞교환하여 사용자의 의도에 맞게 직관적으로 동작하도록 수정합니다.

## User Review & Critical Decisions

> [!IMPORTANT]
> - **우주선 모드(Spaceship Flight)**: A 키와 D 키의 선회 각속도(`steerYaw`) 및 좌우 횡이동(`strafeInput`) 방향을 맞교환합니다.
> - **사람(행성 표면 보행) 모드(Traveler / On-Foot)**: A 키와 D 키의 횡이동(`inputRight`) 및 카메라 좌우 회전 보조(`orbitYaw`) 방향을 맞교환합니다.
> - **2D 엔진 호환(Tactical Mode)**: `gameEngine.ts`의 키보드 A/D 이동 벡터(`moveX`) 방향도 일관되게 맞교환하여 2D/3D 전환 시 일관성을 보장합니다.

---

## 1. Overview & Core Concept

- **What It Does**: 사용자가 키보드 A와 D 키를 눌렀을 때, 우주선 모드(우주 비행)와 사람 모드(행성 표면 보행 및 2D 모드) 전반에 걸쳐 반대로 반전되어 있던 좌우 이동 및 선회 방향을 서로 교체하여 올바른 방향으로 조작할 수 있도록 합니다.
- **Target Audience / Persona**: 데스크톱 키보드로 노 맨즈 스카이 스타일의 우주 탐험을 즐기는 플레이어.
- **Key Value**: 조작 불일치로 인한 조종 혼란을 해소하고 직관적이고 쾌적한 비행 및 보행 조작감 제공.

---

## 2. User Experience & Visual Design

- **우주선 모드 조작감**:
  - `A` 키 입력: 기체 선회(Yaw) 및 롤 뱅킹(Roll Banking), 횡방향 스트레이프 이동 방향 맞교환.
  - `D` 키 입력: 반대 방향으로 선회 및 롤 뱅킹, 횡방향 스트레이프 이동.
- **사람(표면 탐사) 모드 조작감**:
  - `A` 키 입력: 카메라 시점 기준 좌우 스트레이프 이동 및 시점 선회 보조 방향 맞교환.
  - `D` 키 입력: 대칭 방향으로 스트레이프 이동 및 시점 선회 보조.
- **조이스틱 및 터치 컨트롤**:
  - 모바일 가상 조이스틱과 키보드 조작계 간의 방향 통일성 유지.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: 3D 모드와 2D 모드 조작계 동시 수정**
  - *Chosen Approach*: `ThreeGameEngine.ts`의 우주선 모드/지표면 모드뿐만 아니라 `gameEngine.ts`의 기본 이동 벡터도 일관되게 적용.
  - *Why*: 차원 전환(2D ↔ 3D) 시 조작 방향 불일치로 인한 혼선 방지.
  - *Alternatives Considered*: 3D 엔진만 수정하는 방안 - 2D 모드 전환 시 방향이 달라지는 문제가 발생하므로 전역 일관성 유지 선택.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│                   Keyboard Input (A / D)               │
└───────────────────────────┬────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌────────────────────────┐      ┌────────────────────────┐
│  ThreeGameEngine (3D)  │      │    gameEngine (2D)     │
├────────────────────────┤      ├────────────────────────┤
│ • Space: steerYaw      │      │ • moveX calculation    │
│   & strafeInput swap   │      │   swap (-1 ↔ +1)       │
│ • Surface: inputRight  │      └────────────────────────┘
│   & orbitYaw swap      │
└────────────────────────┘
```

- **우주선 모드 (`handleSpaceMode`)**:
  - `kb.a`와 `kb.d`의 `steerYaw` 및 `strafeInput` 부호 맞교환
- **지표면 보행 모드 (`handleSurfaceMode`)**:
  - `kb.a`와 `kb.d`의 `inputRight` 및 `orbitYaw` 회전 가감 부호 맞교환
- **2D/전술 모드 (`gameEngine.update`)**:
  - `this.keyboard.a`, `this.keyboard.d`의 `moveX` 가감 부호 맞교환

---

## 5. Verification Plan

1. **빌드 검증**: `compile_applet`을 실행하여 컴파일 오류가 없는지 확인.
2. **우주선 모드 확인**: 비행 상태에서 A 및 D 키를 각각 입력하여 선회 방향과 기체 롤 기울기가 정상적으로 반전 적용되었는지 검증.
3. **사람(보행) 모드 확인**: 행성 표면에서 A 및 D 키 입력 시 좌우 이동 및 시점 전환 방향이 정상적으로 동작하는지 검증.
