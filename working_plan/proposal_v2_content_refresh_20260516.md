# Landing Page v2 콘텐츠 리프레시 제안

> **소스**: `cooky-WebCopilot_hotfix/docs/extension_features_overview_20260516.md`
> **작성일**: 2026-05-16
> **목적**: 신규 확장앱 기능(Work Memory, /do agentic, Lexical 호환, 다중 탭 read, UI 자동화 ★)을 랜딩에 반영

---

## 0. 핵심 요약 (TL;DR)

| 우선순위 | 섹션 | 변경 성격 | 영향도 |
|---------|------|----------|--------|
| **★ P0** | Scenarios | **4 → 6 시나리오로 재구성** (+ 시나리오 4 = "사용자 UI/UX 커스텀 권한" 톤, 메일발송 플로팅 버튼 prompt 박스 노출) | 큼 |
| **★ P0** | Features | **9 → 12~13개**로 확장 (Work Memory, /do, FH, 다중탭, 톤변환 등 추가) | 큼 |
| P1 | Differentiation | **3 → 5~6개** 비교축 추가 (Work Memory, 다중탭, Rich Editor) | 중 |
| P1 | Hero | 서브타이틀 강화 ("작업 맥락 공간" + "다음에도 기억" 메시지) | 중 |
| P1 | Solution | 3축 → **4축** (Work Memory = 작업 영속성 추가) | 중 |
| P2 | Roadmap | **옵션 C 채택**: 핵심 기능은 Features로 (구현됨), Roadmap은 같은 영역의 "다음 진화"로 재정의 | 중 |
| P2 | Safety | "agentic 무한 루프 차단(sameToolGate)" 신규 항목 추가 | 작음 |
| P3 | AI Modes | 변경 없음 | — |
| P3 | Business | 카드 설명에 Work Memory / agentic 언급 보강 | 작음 |

→ **가장 중요한 인사이트**: 현재 페이지는 "AI 코파일럿"으로 **포지셔닝**하고 있으나, 문서는 **"개인형 작업 파트너"** + **"한 줄로 끝난다 + 다음에도 기억한다"** 로 더 뾰족하다. **시나리오 4 (UI 커스터마이즈)** 는 마케팅 톤의 ★ wow factor가 아닌, **"사용자가 자신의 손으로 페이지 UI/UX를 직접 만들 수 있다"** 는 **권한·자율성** 메시지로 풀어 (테마 수정 / 광고 차단 / **메일 발송 플로팅 버튼** 의 3가지 구체 예시 + prompt 박스 노출) **개방성·확장성**을 보여준다.

---

## 1. Hero (수정 제안)

### 현재
- title: "웹페이지를 이해하고, 질문하고, 자동화하는 AI 코파일럿"
- subtitle: "단순한 챗봇이 아닙니다. 당신의 요청과 웹페이지 문맥을 이해하고, 필요할 때 브라우저를 직접 조작할 수 있는 AI 생산성 도구입니다."

### 제안
- **eyebrow**: 그대로
- **title 후보 A** (보수적): "웹페이지를 이해하고, 작성하고, 기억하는 AI 코파일럿"
- **title 후보 B** (공격적, 차별화 강조): "한 줄로 끝나고, 다음에도 기억하는 브라우저 AI 파트너"
- **subtitle 후보**: "단순 채팅 AI가 아닌 **웹페이지 = 작업 맥락 공간** 으로 인식하는 개인형 작업 파트너입니다. 페이지 본문, 다중 탭, 입력폼, 사이트 UI까지 — 자연어 한 줄로 자동화하고, 사이트별 작업 메모리는 다음 방문에 자동 복원됩니다."

→ 권장: **title 후보 A + 새 subtitle**. (B는 "AI 코파일럿" 키워드를 잃어 SEO/검색 노출 손실 우려)

---

## 2. Problem (소폭 조정)

### 현재 4개 (p1~p4) — 그대로 유지하되 톤 미세 조정 가능
- p1: 확장앱 보안 불안 → 유지 ✓
- p2: 사이트별 맞춤 기능 부재 → 유지 ✓
- p3: 탭/북마크 관리 불가 → 유지 ✓
- p4: AI는 답변만 → 유지 ✓

### 제안 추가 (선택)
- **p5 신규** (다음 날 컨텍스트 손실): "어제까지 정리한 내용을 오늘 또 처음부터" — 사이트별 작업 컨텍스트가 매번 휘발됩니다.
  → Work Memory 솔루션의 problem-side 셋업

→ 권장: **p5 추가하여 5개로 확장** (4 → 5). 시나리오 3, 6에 깔린 "영속성" 메시지의 problem 짝꿍.

---

## 3. Solution (3축 → 4축)

### 현재 3축
1. context — 페이지 문맥 기반 AI
2. action — 브라우저 액션 자동화
3. script — 나만의 확장앱 만들기

### 제안: **memory** 축 신규 추가
4. **memory — 사이트별 작업 메모리**
   - desc: "사이트별 독립 메모리(per-site IDB)에 작업 진행 상황·비교 결과를 영속 저장. 다음 방문 시 자동 복원되어 처음부터 다시 시작할 필요가 없습니다."
   - example: "쇼핑 비교 표/리서치 노트 자동 복원"

→ 4축으로 확장하면 그리드는 **2x2** 또는 **4-col**으로 재배치. 문서가 강조하는 "**다음에도 기억한다**" 가치가 솔루션 축에 부재 → P1 우선순위.

---

## 4. Features (★ P0 — 9 → 12~13개로 확장)

### 현재 9개
chat / helper / select / autofill / action / image / improve / script / floating

### 갭 (추가 필요)
| 신규 키 | 제목 | 설명 | 상태 |
|---------|------|------|------|
| `workMemory` ★ | **Work Memory** | 사이트별 독립 메모리에 작업 컨텍스트 영속 저장·자동 복원 | 구현됨 |
| `doCommand` | **`/do` agentic 명령** | 작업 의도 자동 분류 + LLM-tool-LLM 자동 반복 | 구현됨 |
| `multiTab` | **다중 탭 종합 분석** | 여러 탭 한 번에 read → markdown 종합 표 | 구현됨 (v1.16.43) |
| `tone` | **톤 변환** | "더 짧게/존댓말로/격식 있게" 한 줄로 본문 톤 변환 | 구현됨 |
| `webSearch` | **web_search 통합** | AI가 자동으로 자료 보강 검색 호출 | 구현됨 |
| `tabGroup` | **탭 그룹화** | `/do` + chrome.tabGroups 자동 묶음 | 구현됨 |

### 기존 항목 보강
- **autofill**: 설명에 "Lexical/Slate/Draft/ProseMirror 4-stage fallback 호환" 추가
- **floating** → **floatingHelper**: 설명에 "FH 번역/검색/다국어 변환" 구체화 (현재 너무 추상적)
- **script**: 설명에 "EXECUTE/REGISTER + `/act_list`·`/act_edit` CRUD" 추가
- **select**: "우클릭 + Floating Helper 양방향" 명시

→ 권장: 9 → **13개**로 확장. 카테고리(정보 흡수 / 작성 / 자동화 / 메모리 / 안전성)로 그루핑하여 시각적 인지 부담 완화.

---

## 5. Scenarios (★ P0 — 4 → 6 시나리오 전면 개편)

### 현재 4개 (s1~s4)
- s1: 사이트별 맞춤 스크립트
- s2: 기사 요약·드래그 검색·즉시 번역
- s3: 그룹웨어 문서 작성 보조
- s4: 탭 정리·페이지 탐색 자동화

### 제안: 문서의 6 시나리오 그대로 채택
| # | 시나리오 | Target Sites | ★ |
|---|---------|--------------|---|
| 1 | 커뮤니티 글쓰기 | Reddit · dcinside · 클리앙 · fmkorea | |
| 2 | 영문 자료 분석 | arxiv · theverge · medium | |
| 3 | 쇼핑 가격 비교 | 쿠팡 · 11번가 · G마켓 · 무신사 | ★ Work Memory |
| **4** | **사이트 UI/UX 직접 커스터마이즈** | 어떤 사이트든 | **사용자 권한 강조** |
| 5 | AI 글쓰기 동반자 | Notion · Google Docs · Medium | |
| 6 | 리서치 워크플로우 | 학술 · 위키피디아 · 다중 뉴스 | ★ Work Memory |

### ★ 시나리오 4 재포지셔닝 (사용자 피드백 반영)

**기존 안**: "차별화 hero / wow factor"로 마케팅 톤 강조
**수정 안**: **"사용자가 자신의 손으로 페이지 UI/UX를 바꿀 수 있다"** 는 **권한·자율성** 톤으로 강조

#### 시나리오 4 카드 본문 (제안)

**제목**: *사이트의 UI/UX를 내가 직접 만든다*

**한 줄 가치**: 자연어 한 줄이면 사이트의 모양·동작·기능을 사용자가 직접 추가·변경할 수 있습니다. 코드 0줄.

**대표 예시 칩 3개**:
1. 🎨 **테마 수정** — "이 사이트 다크 모드로" → CSS 자동 주입 + 영구 저장
2. 🚫 **광고 차단** — "이 영역 광고 숨겨줘" → AI가 selector 분석 + JS 생성
3. 📧 **플로팅 버튼 추가 (★ 대표 데모)** — 아래 prompt 그대로 박스로 노출

#### 시나리오 4 데모 prompt 박스 (verbatim 인용)

```
"지정된 부분은 페이지의 본문 글이다.
 해당 사이트에 본문 글을 한국어로 번역하여
 cookyman@gmail.com 으로 메일로 전송할 수 있도록
 플로팅 버튼을 추가해줘."
```

→ **결과**: AI가 (1) 본문 selector 추출 + (2) 번역 → (3) mailto 링크 생성 + (4) 플로팅 버튼 DOM 주입 + (5) `REGISTER_SCRIPT` 로 영구 등록 — 다음 방문 시 자동 적용.

→ 이 한 prompt가 **EXECUTE_SCRIPT + 본문 read + 번역 + UI 주입 + 영구 등록** 의 5요소를 한 번에 시연. **시연 영상 0순위 후보**.

### 카드 디자인 변경
- 기존: Step 1~4 라벨 + 단순 desc
- 제안: **시나리오 N** 라벨 + Target Sites 배지 + "한 줄 가치" + 핵심 기능 칩(2~3개)
- **시나리오 4만 예외 처리**: prompt 박스를 카드 내부에 그대로 노출 (코드 블록 스타일, monospace, accent border)
  - 마케팅 톤(★ wow / 차별화) 대신 **"이런 것까지 가능합니다"** 의 **개방성·확장성** 톤
  - 카드 자체는 다른 시나리오와 **동등한 시각 비중**으로 두되, prompt 박스 한 가지로 자연스럽게 시선이 머물도록

### 그룹웨어 시나리오는?
현재 s3 "그룹웨어 문서 작성 보조"는 문서에는 없음. → **삭제 또는 시나리오 5로 흡수**. (Inwork B2B 문맥은 별도 페이지 또는 Business 섹션에서 다루는 것이 정합)

→ 권장: **s3 삭제, 6 시나리오 신규 채택, s4 = "사용자 UI/UX 커스텀 권한" 톤으로 prompt 박스 노출**.

---

## 6. Differentiation (3 → 5~6 비교축)

### 현재 3개 (d1~d3)
- d1: 답변형 → 행동형
- d2: 단발성 → 재사용 자산
- d3: 텍스트 → 페이지·필드·스크립트

### 제안 추가
- **d4 신규**: "단일 페이지 → **다중 탭 종합**" — 4-5개 탭 한 번에 read + markdown 표
- **d5 신규**: "매번 처음부터 → **사이트별 Work Memory**" — 다음 방문 자동 복원
- **d6 신규** (선택): "Lexical/Slate 호환성 낮음 → **4-stage fallback 완전 호환**" — 기술 디테일이라 일반 사용자 와닿지 않을 수 있음, 선택적

→ 권장: **d4, d5 추가하여 5개로 확장**. d6은 Business 섹션에서 다루는 것이 적합.

---

## 7. Safety (소폭 추가)

### 현재 4개 (approval / register / session / sensitive) — 유지
### 제안 추가
- **loop 신규**: "agentic 무한 루프 자동 차단"
  - desc: "동일 도구 반복 호출을 hard-stop으로 차단(sameToolGate, v1.16.42). 다중 탭 read는 args-aware로 정상 허용(v1.16.43)."

→ 권장: **5번째 항목으로 추가**. 안전성 신뢰 강화.

---

## 8. Roadmap (옵션 C — 양쪽 분리: Features = 현재 강점 / Roadmap = 다음 진화)

### 원칙
**같은 영역을 Features와 Roadmap이 다른 측면으로 다룬다.**
- Features 카드 = "오늘 쓸 수 있는 능력" (구현됨 배지) → install CTA 견인
- Roadmap 카드 = "이 영역의 다음 진화 단계" (계획·검토 중 / 보강 중 배지) → 지속 투자 신뢰

→ Floating Helper / Session Script 의 **핵심 가치는 Features에서 보존**, Roadmap은 같은 영역의 **확장 약속**으로 재정의.

---

### Features 섹션 보강 (Roadmap → Features 이전)

§4 의 features 목록에 추가/보강:

| 키 | 제목 | 설명 | 상태 |
|----|------|------|------|
| `floatingHelper` (기존 `floating` 보강) | **Floating Helper** | 텍스트 선택 시 옆에 즉시 뜨는 작업 메뉴. 번역·용어 검색·다국어 변환·요약을 한 클릭으로 | 구현됨 |
| `scriptCRUD` (신규) | **자동화 자산 관리** | `/act_list` 로 등록된 모든 스크립트 조회, `/act_edit` 으로 개별 수정·삭제. 사이트별 자동화를 자산처럼 운영 | 구현됨 |

→ §4 의 features 표에서 `floating` 항목은 위 `floatingHelper` 로 교체, `scriptCRUD` 는 신규 추가.

---

### Roadmap 섹션 재정의 (3개 슬롯 — 같은 영역 진화 + 신규 영역)

| 키 | 제목 | 설명 | 상태 | 영역 |
|----|------|------|------|------|
| `floatingExpansion` (기존 `floating` 진화) | **Floating Helper 컨텍스트 확장** | 현재 텍스트 선택 중심 → 이미지·링크·표·코드 블록 등 다양한 selection 타입으로 컨텍스트 액션 확장 | 보강 중 / 계획 중 | FH 영역 |
| `scriptPromotion` (기존 `continuity` 진화) | **세션 스크립트 → 영구 자산 승격** | 세션 단위 EXECUTE_SCRIPT 이력을 한 번에 조회·되돌리기·`REGISTER_SCRIPT` 로 승격하는 통합 흐름. 현재 `/act_list`·`/act_edit` CRUD를 베이스로 확장 | 보강 중 | 스크립트 영역 |
| `studio` (유지) | **Extension App Studio** | 사이트별 스크립트를 라이브러리 형태로 조회·편집·버전 관리. 현재 `/act_list`+`/act_edit` 가 시발점 | 계획·검토 중 | 스크립트 영역 |

→ 슬롯 수는 그대로 **3개 유지**. 각 항목이 "현재 강점에서 어디로 진화하는가" 를 명확히 가리킴.

---

### 신규 영역 후보 (옵션 — 4번째 슬롯 추가 시)

위 3개로도 충분하지만, 사용자가 **"새로운 방향성"** 을 추가로 보여주고 싶다면 1개 더 추가 가능:

| 후보 | 제목 | 설명 |
|------|------|------|
| `mcp` | **외부 MCP 서버 통합** | 사용자가 자체 도구·DB·API를 MCP 서버로 추가 → 확장의 도구 생태계화 |
| `teamShare` | **Work Memory 팀 공유** | 사이트별 작업 메모리를 팀 단위로 sync. 리서치·쇼핑 비교를 협업 자산으로 |
| `workflowExport` | **Action Tools 워크플로우 export** | 자주 쓰는 자동화 흐름을 재사용 가능한 워크플로우 파일로 export/import |

→ 4번째 슬롯 추가 결정은 사용자 회신 후. 추가 시 그리드는 2x2 또는 1x4 재배치.

---

### 변경 영향 정리

| 변경 | 위치 | 사용자 인식 변화 |
|------|------|----------------|
| Floating Helper → Features (구현됨) | Features 카드 신규 (또는 기존 `floating` 강화) | "있는지 몰랐던 기능" → "오늘 쓸 수 있는 핵심 가치" |
| 자동화 자산 관리(`/act_list`) → Features (구현됨) | Features 카드 신규 (`scriptCRUD`) | "안 보이던 CRUD 기능" → "스크립트를 자산처럼 운영" |
| Roadmap = "현재 강점의 다음 진화" 톤으로 재작성 | Roadmap 3슬롯 유지 | "할까 말까" 추측 → "이 영역을 계속 키운다" 신뢰 |

→ 사용자가 중요시한 두 기능 모두 **노출 면적·신뢰 수준 양쪽 모두 강화**. Roadmap도 정체성(진화 약속)이 더 또렷해진다.

---

## 9. Business (소폭 보강)

### 현재 3 카드
- context: 페이지 문맥 기반 AI
- actionTools: Action Tools 에이전트
- scripts: 스크립트 실행/등록 인프라

### 제안: 4번째 카드 추가
- **workMemory 신규**: "**작업 메모리 인프라**" — per-site IDB + Session Seed/Hydrate. 사용자별 작업 컨텍스트 영속화 패턴을 자사 서비스에 이식 가능.

→ 우선순위 P3. 시간 여유 있으면 추가.

---

## 10. AI Modes / Final CTA / Header / Footer
변경 없음. AI Modes는 직전 commit(54621e6)에서 Claude/Ollama swap 완료.

---

## 11. 구현 순서 제안 (Phase 화)

### Phase A (P0 — 1~2일)
1. ko.json / en.json 카피 추가·수정 (Hero, Problem 5번째, Solution 4번째 축)
2. **ScenariosSection 전면 재작성** (4 → 6, s4 ★ 강조 변형)
3. **FeaturesSection 확장** (9 → 13, 카테고리 그루핑 옵션)

### Phase B (P1 — 0.5일)
4. DifferentiationSection 5개로 확장
5. SolutionSection 4축 그리드 재배치 (2x2)

### Phase C (P2 — 0.5일)
6. RoadmapSection 항목 재정의 + Safety loop 항목 추가
7. BusinessSection workMemory 카드 추가 (선택)

### Phase D (검증)
8. test 일괄 업데이트, `npm run build` + `node verify_phase1.mjs`
9. 영문 ja/zh 빈 스캐폴드는 그대로 유지(non-goal)

각 Phase 완료 시 별도 commit 권장. 분리된 PR 또는 squash merge 정책은 사용자 결정.

---

## 12. 주의사항 (non-goals 준수)

`02_implementation_plan.md` §9 의 non-goal과 충돌 여부:
- ✅ Next.js / SSR 도입 안 함
- ✅ 다크 모드 추가 안 함
- ✅ 라우터 추가 안 함
- ✅ 실제 스크린샷 추가 안 함 (시나리오 카드도 placeholder)
- ✅ ja/zh 번역 채우지 않음
- ✅ 분석/CMS 도입 안 함

→ 모든 제안이 기존 non-goal 범위 내에 있음.

---

## 13. 결정 필요 사항 (사용자 컨펌)

1. **Hero title 후보 A vs B?** — A 승인 
2. **Problem p5 추가? (4→5)** - 제외 
3. **Scenarios 6 시나리오 전면 채택 + s4 = "사용자 UI/UX 커스텀 권한" 톤 + 메일발송 prompt 박스 노출 동의?**
4. **그룹웨어 s3 삭제 vs Business로 이동?** - 승인 
5. **Features 카테고리 그루핑 도입? (9→13개에 카테고리 헤더)** - 승인
6. **Roadmap = 옵션 C 채택 확정** (Features = 현재 강점 / Roadmap = 다음 진화) — §8 재작성 완료. 추가 컨펌 필요 없음.
7. **Roadmap 4번째 슬롯 추가 여부 + 후보(mcp/teamShare/workflowExport) 채택?** — 3슬롯 유지 권장

위 7개 결정 후 Phase A 부터 순차 구현 진행.
