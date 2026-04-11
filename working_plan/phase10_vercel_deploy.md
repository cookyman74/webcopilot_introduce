# Phase 10: Vercel 자동 배포

> **목표**: GitHub 리포와 Vercel을 연결하여 main 브랜치 push 시 자동 빌드/배포가 동작하도록 한다. Production URL이 발급되어 외부에서 접근 가능해진다.
> **상위 계획서**: [main_landing_todolist.md](./main_landing_todolist.md)
> **예상 소요**: 0.5~1일 (Root Directory 이슈 시 +0.5일)
> **E2E 확인 단위**: GitHub `git push` → Vercel 자동 빌드 성공 → Production URL에서 랜딩 페이지가 정상 서빙되며 한↔영 토글, CTA, 모든 섹션 동작.

---

## 10.1 사전 작업

- [ ] **[REVIEW]** 이전 Phase 결과서 검토
  - 파일: `working_history/v1.0/Phase9_ResponsiveSeoBuild_*.md`
  - 확인: Lighthouse 점수, 빌드 안정성, 미해결 이슈 없음

- [ ] **[CONTEXT]** 작업 목적 확인
  - 구현 계획서 7장 (Vercel 배포 파이프라인)
  - **핵심 주의사항**: 프로젝트가 리포 루트가 아닌 서브 디렉토리(`docs/00_intro_web_landing_page/extapp_landing`)에 위치 → Vercel Root Directory 설정 필수

- [ ] **[ANALYSIS]** 사전 환경 점검
  - GitHub 리포 권한 (Vercel이 read 권한 필요)
  - Vercel 계정 존재 여부 + GitHub 연동 상태
  - 현재 브랜치 결정: `v2.7/refactoring_tools` 또는 신규 `feat/landing_page` (main 머지 전 Preview 검증 권장)

- [ ] **[ANALYSIS]** 빌드 산출물 재확인
  ```bash
  cd 00_intro_web_landing_page/extapp_landing
  npm ci
  npm run build
  ls -la dist/
  ```

---

## 10.2 RED Phase: 검증 체크리스트

- [ ] **[RED]** 검증 체크리스트
  ```
  TEST-P10.1: extapp_landing/package.json의 build 스크립트가 "tsc -b && vite build"
  TEST-P10.2: extapp_landing/dist/index.html이 빌드 후 생성됨
  TEST-P10.3: extapp_landing/.gitignore에 node_modules, dist 포함
  TEST-P10.4: GitHub 리포에 코드 push 완료
  TEST-P10.5: Vercel 프로젝트의 Root Directory가 docs/00_intro_web_landing_page/extapp_landing
  TEST-P10.6: Vercel 프로젝트의 Framework Preset이 Vite
  TEST-P10.7: Vercel 첫 Production 빌드 성공
  TEST-P10.8: Production URL에서 랜딩 페이지 정상 노출
  TEST-P10.9: 후속 push 1회 → 자동 재배포 동작
  TEST-P10.10: Production URL에서 한↔영 토글, CTA, 앵커 모두 동작
  ```

- [ ] **[RED]** Vercel 배포 자체는 수동 조작이 포함되므로 자동화 테스트 대신 **체크리스트 기반 수동 검증**을 사용한다 (작업 결과서에 스크린샷/로그 첨부).

- [ ] **[RED-VERIFY]** 현재 미배포 상태이므로 Production URL이 존재하지 않음을 확인 (FAIL 베이스라인)

---

## 10.3 GREEN Phase: 최소 작업으로 통과시키기

- [ ] **[TASK-001]** `.gitignore` 최종 점검
  - 파일: `extapp_landing/.gitignore`
  - 포함: `node_modules/`, `dist/`, `.vite/`, `.env*.local`, `*.log`, `coverage/`

- [ ] **[TASK-002]** package.json 메타 정리
  - 파일: `extapp_landing/package.json`
  - `name`, `version`, `private: true` 확인
  - `engines.node: ">=20"` 명시 (Vercel이 이를 존중)

- [ ] **[TASK-003]** vercel.json (선택)
  - 파일: `extapp_landing/vercel.json`
  - 1차 권장 최소 구성:
    ```json
    {
      "$schema": "https://openapi.vercel.sh/vercel.json",
      "framework": "vite",
      "buildCommand": "npm run build",
      "outputDirectory": "dist",
      "installCommand": "npm install",
      "cleanUrls": true,
      "trailingSlash": false
    }
    ```
  - **참고**: Vercel이 Vite를 자동 감지하므로 이 파일이 없어도 동작하지만, 명시 시 환경 변동에 안전

- [ ] **[TASK-004]** GitHub에 코드 push
  ```bash
  git status
  git add 00_intro_web_landing_page
  git commit -m "[P10] Vercel 배포 설정 (vercel.json + meta 정리)"
  git push origin <현재 브랜치>
  ```

- [ ] **[TASK-005]** Vercel 프로젝트 생성
  - https://vercel.com → Add New Project → Import Git Repository → 본 리포 선택
  - **Root Directory 설정** (가장 중요):
    ```
    docs/00_intro_web_landing_page/extapp_landing
    ```
  - Framework Preset: `Vite` (자동 감지 확인)
  - Build Command: `npm run build` (자동)
  - Output Directory: `dist` (자동)
  - Install Command: `npm install` (자동)
  - Node.js Version: `20.x`
  - Deploy 클릭

- [ ] **[TASK-006]** 첫 빌드 결과 확인
  - Vercel Dashboard → Deployments → 첫 번째 항목 클릭
  - Build Logs 확인:
    - Install 단계: dependencies 정상 설치
    - Build 단계: `vite build` 성공
    - Deploy 단계: dist 업로드 완료
  - **빌드 실패 시** 가장 흔한 원인: Root Directory 미설정 → Settings → General → Root Directory 수정 후 Redeploy

- [ ] **[TASK-007]** Production URL 확인
  - Vercel이 발급한 기본 도메인(예: `extapp-landing.vercel.app`) 접속
  - 10개 섹션 모두 정상 노출 확인
  - 한↔영 토글, CTA 4곳, 앵커 네비 모두 동작 확인

- [ ] **[TASK-008]** 자동 재배포 검증
  - 작은 수정(예: footer 저작권 연도) 1건 커밋 → push
  - Vercel Deployments에서 새 빌드 자동 트리거 확인
  - 새 Production URL이 변경 사항을 반영하는지 확인

- [ ] **[GREEN-VERIFY]** 검증
  ```
  ✅ Vercel Production 빌드 성공
  ✅ Production URL 응답 200
  ✅ 자동 재배포 트리거 동작
  ```

---

## 10.4 REFACTOR Phase: 운영 설정 다듬기

### 10.4.1 구조 개선

- [ ] **[REFACTOR-STRUCTURE]** README에 배포 정보 추가
  - 파일: `extapp_landing/README.md`
  - 내용:
    - 프로젝트 개요 (1줄)
    - 개발: `npm run dev`
    - 빌드: `npm run build`
    - 테스트: `npm run test`
    - **Vercel Root Directory 주의사항** 명시
    - Production URL

- [ ] **[REFACTOR-STRUCTURE]** Preview 배포 정책
  - main 외 브랜치 push 시 Preview Deployment 자동 생성 확인
  - PR 생성 시 Vercel Bot이 Preview URL을 코멘트로 남기는지 확인

- [ ] **[REFACTOR-STRUCTURE]** 환경변수 정리 (1차엔 없음)
  - 향후 Analytics ID 등이 필요하면 Vercel Environment Variables 사용 가이드만 README에 메모

### 10.4.2 운영 품질 점검

- [ ] **[REFACTOR-PERF-MEASURE]** Vercel Build 시간 측정
  - 첫 빌드 시간, 캐시 후 재빌드 시간 기록
  - 비정상적으로 길면 (>3분) 원인 점검 (npm install 캐시 미작동 등)

- [ ] **[REFACTOR-PERF-ANALYZE]** Production Lighthouse 재측정
  - **로컬 preview**가 아닌 **Vercel Production URL** 기준으로 Lighthouse 측정
  - CDN/캐시 효과 반영
  - 결과 기록:
    | 항목 | Local Preview (P9) | Vercel Production | 차이 |
    |------|---------------------|--------------------|------|
    | Performance | [P9 값] | [측정] | [Δ] |
    | LCP | [P9 값] | [측정] | [Δ] |

- [ ] **[REFACTOR-PERF-VERIFY]** 외부 검증
  - 다른 네트워크/디바이스(모바일 셀룰러)에서 Production URL 접속
  - 한국/해외 양쪽 시간대에서 응답 속도 확인 (가능 시)

---

## 10.5 사후 작업

- [ ] **[VERIFY]** 전체 검증 체크리스트 (Production 기준)
  - [ ] Production URL HTTP 200
  - [ ] 10개 섹션 정상 노출
  - [ ] 한↔영 토글 동작 + 새로고침 후 유지
  - [ ] Header CTA → Chrome Web Store 새 탭
  - [ ] Hero Primary CTA → Chrome Web Store 새 탭
  - [ ] Hero Secondary CTA → `#features` 스크롤
  - [ ] Final Primary CTA → Chrome Web Store 새 탭
  - [ ] Header 네비 4개 앵커(features/scenarios/differentiation/roadmap) 정확
  - [ ] 모바일/태블릿/데스크톱 3개 폭에서 깨짐 없음
  - [ ] Lighthouse Performance/Accessibility ≥ 목표치
  - [ ] 자동 재배포 1회 검증 완료

- [ ] **[VERIFY]** 배포 회귀 안정성
  - main에 머지 후 1회 더 push → 자동 배포 안정 확인

- [ ] **[DOC]** 최종 작업 결과서 작성
  - 파일: `working_history/v1.0/Phase10_VercelDeploy_2026MMDD.md`
  - 포함:
    - Production URL
    - Vercel 프로젝트 설정 캡처 (Root Directory, Framework Preset)
    - 첫 빌드 로그 요약
    - Lighthouse 결과 (Production)
    - 미해결 이슈 / 후속 작업 (커스텀 도메인, Analytics, 일본어/중국어 등)

- [ ] **[DOC]** main_landing_todolist.md 업데이트
  - 모든 Phase 상태를 ✅로 마킹
  - "착수 대기" → "완료"로 변경

- [ ] **[COMMIT]** 최종 커밋
  ```bash
  git add 00_intro_web_landing_page
  git commit -m "[P10] Vercel 자동 배포 완료 + 운영 가이드 README"
  git push
  ```

- [ ] **[ANNOUNCE]** Production URL 공유
  - 팀/이해관계자에게 URL 전달
  - 피드백 수렴 채널 안내 (1차 이후 개선 작업의 입력)

---

## Phase 10 완료 조건 (Definition of Done)

- [ ] Vercel 프로젝트 생성 + Root Directory 정확
- [ ] Framework Preset = Vite, Node 20
- [ ] 첫 Production 빌드 성공
- [ ] Production URL 발급 및 정상 노출
- [ ] git push → 자동 재배포 동작 검증
- [ ] Production URL에서 모든 기능 회귀 검증 통과
- [ ] Production Lighthouse 측정 완료
- [ ] README에 배포 가이드 작성
- [ ] 작업 결과서 작성 및 커밋 완료
- [ ] **마일스톤**: 1차 랜딩 페이지 배포 완료

---

## 1차 배포 이후 후속 과제 (참고)

P10 완료 후 다음 단계로 검토할 항목 (별도 Phase로 구성):

1. **실제 스크린샷/목업 교체** — placeholder → 진짜 이미지
2. **카피 정교화** — 사용자 피드백 기반
3. **일본어 / 중국어 locale 추가** — `ja.json` / `zh.json` 채우기 + LanguageSwitcher 노출
4. **커스텀 도메인 연결** — 예: `webaiassistant.app`
5. **Analytics 도입** — Vercel Analytics 또는 Plausible
6. **OG 이미지 정식 제작** — 1200×630 brand image
7. **Sitemap / robots.txt 정식화**
8. **추가 페이지** — 예: 개인정보처리방침, 이용약관, 변경 이력
9. **Lighthouse 100점 도전** — 이미지 최적화, font preload, prefetch
10. **A/B 테스트 인프라** — Vercel Edge Config 또는 LaunchDarkly
