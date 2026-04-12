/**
 * Phase 3 RED — i18n 런타임 & locale 파일 검증
 * 대응 체크: TEST-P3.1 · TEST-P3.2 · TEST-P3.3
 *
 * 본 파일은 세 개 계층을 한 번에 다룬다:
 *   1. 파일 존재 + 필수 키 (TEST-P3.1)    — locale JSON 파일을 직접 import
 *   2. ko/en 키 동기화  (TEST-P3.2)       — collectKeys 재귀 비교
 *   3. i18next 런타임 t() 동작 (TEST-P3.3) — `../i18n` 초기화 모듈 사용
 *
 * 설계 결정:
 *   - 세 계층을 분리하지 않은 이유: 모두 "i18n 서브시스템" 이라는 도메인
 *     아래 응집력이 강하고, 별도 파일로 쪼개면 리뷰 시 맥락이 흩어진다.
 *   - ja/zh 는 Phase 3 1차 범위에서 빈 객체 `{}` 로 스캐폴드되어 있으므로
 *     parity 검증 대상에서 제외한다 (phase03 §3.2 TEST-P3.2 주석 참조).
 *     2차(ja)·3차(zh) 활성화 PR 이 본 테스트를 확장할 책임을 진다.
 *
 * RED 기대 동작:
 *   - `./locales/ko.json` · `./locales/en.json` · `../i18n` (index.ts) 모두
 *     현재 존재하지 않으므로 Vitest가 "Failed to resolve import" 로 본 파일
 *     전체를 FAIL 처리해야 한다.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ko from './locales/ko.json';
import en from './locales/en.json';
import ja from './locales/ja.json';
import zh from './locales/zh.json';
import i18n from '.';

// ─────────────────────────────────────────────────────────────
// 헬퍼 — 중첩 객체에서 "dot.path.leaf" 형태의 모든 리프 키 수집
// ─────────────────────────────────────────────────────────────
function collectKeys(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return [];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    return v !== null && typeof v === 'object' ? collectKeys(v, path) : [path];
  });
}

function findEmptyValues(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object') return [];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object') return findEmptyValues(v, path);
    return typeof v === 'string' && v.trim() === '' ? [path] : [];
  });
}

// ─────────────────────────────────────────────────────────────
// TEST-P3.1 — **4개 locale 파일 모두** 존재 + 필수 키
// ─────────────────────────────────────────────────────────────
describe('TEST-P3.1 — 4개 locale 파일 존재 (ko/en/ja/zh)', () => {
  // 리뷰 피드백 반영 (High): 이전 버전은 ko/en 만 검증했으나 체크리스트가
  // 요구하는 "4개 파일 존재" 를 완전히 가드하지 못해, ja/zh 를 실수로 누락한
  // 채로 커밋되어도 통과하는 결함이 있었다.
  // 수정: ja.json / zh.json 을 import 하고 각각 객체로 존재함을 강제한다.
  // 두 파일은 Phase 3 1차에서 `{}` 빈 객체로 스캐폴드되므로 객체 타입
  // 검증만 수행한다 (키 동기화는 2차/3차 활성화 PR 의 책임).

  it('ko.json 이 존재하고 header / footer 최상위 키를 포함한다', () => {
    expect(ko).toBeDefined();
    expect(ko).toHaveProperty('header');
    expect(ko).toHaveProperty('footer');
  });

  it('en.json 이 존재하고 header / footer 최상위 키를 포함한다', () => {
    expect(en).toBeDefined();
    expect(en).toHaveProperty('header');
    expect(en).toHaveProperty('footer');
  });

  it('ja.json 이 존재한다 (2차 언어 활성화 전 스캐폴드)', () => {
    // 현재는 `{}` 빈 객체 허용. 2차 활성화 시점에 본 케이스를 확장하여
    // ko/en 과 동일한 키 구조를 요구하도록 strict 하게 전환한다.
    expect(ja).toBeDefined();
    expect(typeof ja).toBe('object');
    expect(ja).not.toBeNull();
  });

  it('zh.json 이 존재한다 (3차 언어 활성화 전 스캐폴드)', () => {
    expect(zh).toBeDefined();
    expect(typeof zh).toBe('object');
    expect(zh).not.toBeNull();
  });

  it('header.nav 안에 4개 네비 키(features/scenarios/differentiation/roadmap) 가 있다', () => {
    // phase03 §3.3 TASK-003 의 locale 스펙이 요구하는 네비 구조.
    // Header 컴포넌트 (TEST-P3.4) 가 이 키들에 의존한다.
    const required = [
      'header.nav.features',
      'header.nav.scenarios',
      'header.nav.differentiation',
      'header.nav.roadmap',
    ];
    const koKeys = collectKeys(ko);
    const enKeys = collectKeys(en);
    for (const key of required) {
      expect(koKeys).toContain(key);
      expect(enKeys).toContain(key);
    }
  });

  it('header.cta 와 footer.copyright 키가 존재한다', () => {
    expect(collectKeys(ko)).toContain('header.cta');
    expect(collectKeys(en)).toContain('header.cta');
    expect(collectKeys(ko)).toContain('footer.copyright');
    expect(collectKeys(en)).toContain('footer.copyright');
  });

  it('common.examplePrefix 키가 ko/en 양쪽에 존재한다', () => {
    // Phase 5 리뷰 반영: SolutionSection 과 FeatureCard 가 예시 접두사를
    // i18n 으로 렌더 (ko: "예:", en: "e.g."). 하드코딩 "예:" 제거.
    expect(collectKeys(ko)).toContain('common.examplePrefix');
    expect(collectKeys(en)).toContain('common.examplePrefix');
  });

  // ───────────────────────────────────────────────────────────
  // Phase 4 필수 키 — hero.* / problem.* (TEST-P4.5 보강)
  // ───────────────────────────────────────────────────────────
  it('Phase 4 필수 hero.* 키가 ko/en 양쪽에 모두 존재한다 (TEST-P4.5)', () => {
    // 리뷰 피드백 반영 (Medium): 이전 버전은 TEST-P3.2 의 parity check
    // (`collectKeys(ko).sort() === collectKeys(en).sort()`) 에만 의존해서
    // **ko/en 양쪽 모두에서 키가 누락되어도** 통과하는 결함이 있었다.
    // parity 는 "한쪽만 누락" 을 막을 뿐, "양쪽 동시 누락" 은 막지 못함.
    //
    // phase04 §4.3 TASK-001 스펙을 명시적 required 리스트로 강제.
    // HeroSection.test.tsx 가 `t('hero.subtitle')` 로 실제 값을 조회하므로
    // 이 리스트의 누락은 i18n.test.ts 와 HeroSection.test.tsx 양쪽에서 FAIL.
    const required = [
      'hero.eyebrow',
      'hero.title',
      'hero.subtitle',
      'hero.cta_primary',
      'hero.cta_secondary',
      'hero.trust',
      // 리뷰 피드백 반영 (Medium): hero.imageAlt 는 HeroSection 이 <img alt>
      // 로 실제 런타임 사용하는 접근성 키이지만 이전 버전의 required 리스트에
      // 빠져있어 ko/en 양쪽에서 동시 누락되어도 i18n.test.ts 가 통과했다.
      // 접근성 회귀(스크린리더 사용자에게 hero 이미지가 키 문자열로 읽힘)를
      // 원천 차단하기 위해 명시적으로 포함.
      'hero.imageAlt',
    ];
    const koKeys = collectKeys(ko);
    const enKeys = collectKeys(en);
    for (const key of required) {
      expect(koKeys, `ko.json 에 "${key}" 누락`).toContain(key);
      expect(enKeys, `en.json 에 "${key}" 누락`).toContain(key);
    }
  });

  it('Phase 4 필수 problem.* 키가 ko/en 양쪽에 모두 존재한다 (TEST-P4.5)', () => {
    // 위와 동일한 취지로 ProblemSection 의 8개 키 (title + 4×2) 를 명시적으로 요구.
    // phase04 §4.3 TASK-001 스펙: problem.title + problem.items.{p1..p4}.{title,desc}
    const required = [
      'problem.title',
      'problem.items.p1.title',
      'problem.items.p1.desc',
      'problem.items.p2.title',
      'problem.items.p2.desc',
      'problem.items.p3.title',
      'problem.items.p3.desc',
      'problem.items.p4.title',
      'problem.items.p4.desc',
    ];
    const koKeys = collectKeys(ko);
    const enKeys = collectKeys(en);
    for (const key of required) {
      expect(koKeys, `ko.json 에 "${key}" 누락`).toContain(key);
      expect(enKeys, `en.json 에 "${key}" 누락`).toContain(key);
    }
  });

  // ───────────────────────────────────────────────────────────
  // Phase 5 필수 키 — solution.* / features.* (TEST-P5.8)
  // ───────────────────────────────────────────────────────────
  it('Phase 5 필수 solution.* 키가 ko/en 양쪽에 모두 존재한다 (TEST-P5.8)', () => {
    // phase05 §5.3 TASK-002 스펙: solution.title + 3 축 × 3 필드 = 10키
    const required = [
      'solution.title',
      'solution.axes.context.title',
      'solution.axes.context.desc',
      'solution.axes.context.example',
      'solution.axes.action.title',
      'solution.axes.action.desc',
      'solution.axes.action.example',
      'solution.axes.script.title',
      'solution.axes.script.desc',
      'solution.axes.script.example',
    ];
    const koKeys = collectKeys(ko);
    const enKeys = collectKeys(en);
    for (const key of required) {
      expect(koKeys, `ko.json 에 "${key}" 누락`).toContain(key);
      expect(enKeys, `en.json 에 "${key}" 누락`).toContain(key);
    }
  });

  it('Phase 5 필수 features.* 키가 ko/en 양쪽에 모두 존재한다 (TEST-P5.8)', () => {
    // phase05 §5.3 TASK-002 스펙:
    //   features.title + features.status.{done,wip,planned}
    //   + 9 카드 × {title,desc,example} = 31키
    const statusKeys = ['features.status.done', 'features.status.wip', 'features.status.planned'];
    const itemKeys = [
      'chat',
      'helper',
      'select',
      'autofill',
      'action',
      'image',
      'improve',
      'script',
      'floating',
    ];
    const fields = ['title', 'desc', 'example'];
    const required = [
      'features.title',
      ...statusKeys,
      ...itemKeys.flatMap((k) => fields.map((f) => `features.items.${k}.${f}`)),
    ];
    const koKeys = collectKeys(ko);
    const enKeys = collectKeys(en);
    for (const key of required) {
      expect(koKeys, `ko.json 에 "${key}" 누락`).toContain(key);
      expect(enKeys, `en.json 에 "${key}" 누락`).toContain(key);
    }
  });
});

// ─────────────────────────────────────────────────────────────
// TEST-P3.2 — ko/en 키 동기화
// ─────────────────────────────────────────────────────────────
describe('TEST-P3.2 — ko.json 과 en.json 키 구조 동기화', () => {
  it('ko 와 en 의 리프 키 집합이 완전히 동일하다', () => {
    // 한 언어에만 있는 키 = 번역 누락 = 그 언어 사용자가 빈 UI 를 보게 됨.
    // collectKeys 는 모든 리프를 "dot.path" 로 평탄화한 뒤 정렬 비교한다.
    expect(collectKeys(ko).sort()).toEqual(collectKeys(en).sort());
  });

  it('ko/en 양쪽 모두 빈 문자열 값이 없다 (번역 누락 조기 감지)', () => {
    // 키는 존재하지만 값이 "" 인 상황도 사용자 입장에선 번역 누락과 같음.
    // 추후 PR 에서 실수로 빈 문자열이 들어가면 본 테스트가 차단한다.
    expect(findEmptyValues(ko)).toEqual([]);
    expect(findEmptyValues(en)).toEqual([]);
  });

  // 주의: ja / zh 는 Phase 3 1차 범위에서 `{}` 빈 객체 스캐폴드만 있으므로
  // parity 검증 대상에서 제외한다. 2차(ja) / 3차(zh) 언어 활성화 PR 이
  // 이 describe 블록을 확장해서 해당 언어도 비교에 포함시킬 책임을 진다.
  // (phase03 §3.2 TEST-P3.2 주석 참조)
});

// ─────────────────────────────────────────────────────────────
// TEST-P3.3 — i18next 런타임 t() 동작
// ─────────────────────────────────────────────────────────────
describe('TEST-P3.3 — i18next 초기화 및 t() 동작', () => {
  beforeEach(async () => {
    // 각 케이스 전에 ko 로 리셋해 테스트 간 독립 보장
    await i18n.changeLanguage('ko');
  });

  it('ko 언어에서 t("header.nav.features") 가 한국어 문자열 "기능" 을 반환한다', () => {
    // phase03 §3.3 TASK-003 의 ko.json 스펙: `header.nav.features` = "기능"
    expect(i18n.t('header.nav.features')).toBe('기능');
  });

  it('en 언어로 전환 후 t("header.nav.features") 가 영문 문자열을 반환한다', async () => {
    await i18n.changeLanguage('en');
    const value = i18n.t('header.nav.features');
    // en.json 의 정확한 값은 구현 자유 — "Features" 같은 형태여야 하며,
    // 최소한 한국어 "기능" 이 아니어야 한다.
    expect(value).not.toBe('기능');
    expect(typeof value).toBe('string');
    expect(value.length).toBeGreaterThan(0);
  });

  it('존재하지 않는 키는 키 자체를 반환한다 (기본 fallback 동작)', () => {
    // i18next 의 기본 미싱 키 처리 = 키 문자열 그대로 반환.
    // 이것이 바뀌면 (예: null 반환) 런타임 크래시가 일어날 수 있으므로 계약.
    const missing = i18n.t('this.key.does.not.exist');
    expect(missing).toBe('this.key.does.not.exist');
  });

  it('i18n.language 가 현재 활성 언어를 정확히 반영한다', async () => {
    await i18n.changeLanguage('ko');
    expect(i18n.language).toBe('ko');
    await i18n.changeLanguage('en');
    expect(i18n.language).toBe('en');
  });
});

// ─────────────────────────────────────────────────────────────
// Phase 3 hotfix (2026-04-12) — `<html lang>` sync
//
// 배경: Phase 4 E2E Playwright 검증 중 발견한 회귀.
//   `index.html` 은 `<html lang="en">` 로 하드코딩되어 있고, i18n 은
//   ko 로 감지되었음에도 `document.documentElement.lang` 이 업데이트되지
//   않아 스크린리더 / SEO / spellcheck 가 잘못된 언어로 동작하는 접근성
//   회귀가 있었다.
//
// 수정: `src/i18n/index.ts` 에 init 완료 직후 초기 sync + `languageChanged`
//   이벤트 handler 로 `document.documentElement.lang` 을 i18n.language 와
//   항상 일치시킴.
//
// 본 describe 블록은 그 계약을 세 방향으로 검증한다:
//   1. 정적 — 초기 import 시점에 `<html lang>` 이 i18n.language 와 일치
//   2. 동적 — `changeLanguage('en' → 'ko' → 'en')` 후 즉시 `<html lang>` 이 반영
//   3. region 정규화 — `changeLanguage('ko-KR')` → `<html lang>="ko"` (base only)
// ─────────────────────────────────────────────────────────────
describe('`<html lang>` 동기화 (Phase 3 hotfix — 2026-04-12)', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('ko');
  });

  it('import 직후 `<html lang>` 이 i18n.language 와 일치한다 (초기 sync)', () => {
    // i18n/index.ts 의 side-effect 로 이미 sync 되어 있어야 함.
    // 본 파일 상단의 `import i18n from '.'` 이 init 을 트리거하고,
    // init 후 즉시 `syncHtmlLang(i18n.language)` 가 실행된다.
    expect(document.documentElement.lang).toBe(i18n.language);
  });

  it('changeLanguage("en") 호출 시 `<html lang>` 이 "en" 으로 즉시 갱신된다', async () => {
    await i18n.changeLanguage('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('changeLanguage("ko") 호출 시 `<html lang>` 이 "ko" 로 즉시 갱신된다', async () => {
    await i18n.changeLanguage('en');
    expect(document.documentElement.lang).toBe('en');
    await i18n.changeLanguage('ko');
    expect(document.documentElement.lang).toBe('ko');
  });

  it('region 코드가 붙은 언어("ko-KR") 는 base("ko") 로 정규화되어 DOM 에 쓰인다', async () => {
    // navigator 가 "ko-KR" 을 반환하는 시나리오 대응. i18n 내부는
    // `load: 'languageOnly'` 설정으로 base 만 사용하지만, `i18n.language`
    // 자체는 감지 당시의 full tag 를 유지할 수 있다.
    // syncHtmlLang 이 split('-')[0] 으로 base 만 DOM 에 쓰도록 보장.
    await i18n.changeLanguage('ko-KR');
    expect(document.documentElement.lang).toBe('ko');
  });

  it('languageChanged 이벤트 handler 가 등록되어 있다 (회귀 가드)', () => {
    // Phase 3 hotfix 에서 syncHtmlLang 을 `i18n.on('languageChanged', ...)`
    // 로 등록했으므로 i18n 내부 store 에 handler 가 1개 이상 존재해야 한다.
    // i18next 의 store 구조는 버전마다 조금씩 다르지만, `store.listeners`
    // 또는 public API `i18n.off('languageChanged', fn)` 로는 직접 카운트할
    // 수 없다. 대신 실제 동작(changeLanguage 후 DOM 갱신)을 위 3 케이스가
    // 이미 검증하므로, 본 케이스는 "handler 호출 이전/이후 DOM 값 변화"
    // 로 간접 확인.
    //
    // 이중 가드: 누군가 `syncHtmlLang` 등록을 삭제하면 다른 케이스가
    // FAIL 하기 전에 본 케이스가 가장 명시적으로 실패하도록 한다.
    const before = document.documentElement.lang;
    // 강제로 document.lang 를 오염시킨 뒤 changeLanguage 가 복구하는지 확인
    document.documentElement.lang = 'xx-invalid';
    return i18n.changeLanguage('en').then(() => {
      expect(document.documentElement.lang).toBe('en');
      expect(document.documentElement.lang).not.toBe('xx-invalid');
      // before 값 자체는 beforeEach 가 'ko' 로 리셋한 상태이므로 'ko'
      expect(before).toBe('ko');
    });
  });
});

// ─────────────────────────────────────────────────────────────
// TEST-P3.3 (확장) — 언어 감지 우선순위 (browser ↔ localStorage ↔ fallback)
// ─────────────────────────────────────────────────────────────
describe('언어 감지 우선순위 — localStorage > navigator > fallback "en"', () => {
  // 리뷰 피드백 반영 (Medium): 이전 버전은 수동 언어 전환과 localStorage
  // 저장만 검증했을 뿐 초기 감지 우선순위를 전혀 검증하지 않았다. phase03
  // §3.1 의 "언어 감지: 브라우저 → localStorage → fallback `en`" 설계가
  // 잘못 구현되어도 감지 못했다.
  //
  // 본 describe 블록은 두 층위로 검증한다:
  //   1. 정적 설정 검증 — i18n.options 에서 detection.order / fallbackLng 확인
  //   2. 동적 런타임 검증 — vi.resetModules() 로 localStorage/navigator 를
  //      조작한 뒤 i18n 을 재import 해서 실제 감지 동작 확인

  describe('정적 설정 검증 (i18n.options)', () => {
    it('fallbackLng 가 "en" 으로 설정되어 있다', () => {
      const fallback = i18n.options.fallbackLng;
      // i18next 는 fallbackLng 를 문자열 · 배열 · 객체 중 하나로 저장한다.
      // 세 형태 모두에서 "en" 이 fallback 으로 작동함을 검증.
      if (typeof fallback === 'string') {
        expect(fallback).toBe('en');
      } else if (Array.isArray(fallback)) {
        expect(fallback).toContain('en');
      } else if (fallback && typeof fallback === 'object') {
        // { default: ['en'] } 같은 형태
        expect(JSON.stringify(fallback)).toContain('en');
      } else {
        throw new Error(`unexpected fallbackLng shape: ${JSON.stringify(fallback)}`);
      }
    });

    it('supportedLngs 가 ["ko", "en"] 을 정확히 포함한다', () => {
      const supported = i18n.options.supportedLngs;
      expect(supported).toEqual(expect.arrayContaining(['ko', 'en']));
    });

    it('detection.order 가 ["localStorage", "navigator"] 순서로 정의된다', () => {
      // phase03 §3.3 TASK-004 init 설정:
      //   detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] }
      // 이 순서가 바뀌면 "직전 선택 언어 유지" UX 가 깨진다.
      expect(i18n.options.detection?.order).toEqual(['localStorage', 'navigator']);
    });

    it('detection.caches 에 "localStorage" 가 포함된다', () => {
      expect(i18n.options.detection?.caches).toContain('localStorage');
    });
  });

  describe('동적 런타임 검증 (vi.resetModules + dynamic import)', () => {
    // 각 케이스는 fresh i18n 인스턴스를 로드해서 해당 환경에서의 초기 감지
    // 결과를 검증한다. vi.resetModules() 로 모듈 캐시를 리셋하지 않으면
    // i18n 이 한 번 초기화된 후 재호출해도 상태가 유지되어 의미 없는 테스트가
    // 된다.
    //
    // ── 환경 제약 ──
    // happy-dom 의 `window.navigator.language` 는 `Object.defineProperty` 로
    // 값 override 가 안정적으로 작동하지 않는다 (실측: override 후에도 기본값
    // 'en-US' 반환). i18next-browser-languagedetector 는 `window.navigator.language`
    // 를 직접 읽으므로 happy-dom 환경에서 navigator 기반 경로를 테스트 격리
    // 상태로 돌리는 것이 불가능하다. 따라서 navigator 를 조작하는 2개 케이스
    // (navigator=ko-KR / navigator=fr) 는 `it.skip` 으로 문서화만 하고 실행은
    // 생략한다. 이들 경로의 검증은:
    //   (a) 정적 설정 검증 describe (위) — detection.order 와 fallbackLng 구조
    //   (b) 수동 QA — 실제 Chrome/Firefox 에서 언어 설정 변경 후 첫 방문 확인
    // 두 경로로 대체된다.

    beforeEach(() => {
      vi.resetModules();
      localStorage.clear();
    });

    it('localStorage="en" 이 있으면 우선적으로 "en" 으로 감지된다 (localStorage 경로)', async () => {
      // 이 케이스만 실행 가능 — localStorage 는 happy-dom 에서 정상 작동.
      // detection.order = ['localStorage', 'navigator'] 의 1순위 작동 검증.
      localStorage.setItem('i18nextLng', 'en');
      const { default: freshI18n } = await import('.');
      expect(freshI18n.language).toBe('en');
    });

    it('localStorage="ko" 가 있으면 "ko" 로 감지된다', async () => {
      localStorage.setItem('i18nextLng', 'ko');
      const { default: freshI18n } = await import('.');
      expect(freshI18n.language).toBe('ko');
    });

    it.skip('(환경 제약) localStorage 비어있음 + navigator=ko-KR → "ko"', async () => {
      // 위 블록 주석의 "환경 제약" 참조.
      // happy-dom 의 navigator.language override 이슈로 실행 불가.
      // 수동 QA 에서 브라우저 언어를 한국어로 설정 후 localStorage 클리어 →
      // 첫 방문 시 한국어 라벨이 보이는지 확인.
    });

    it.skip('(환경 제약) localStorage 비어있음 + navigator=fr (미지원) → fallback "en"', async () => {
      // 위와 동일 환경 제약. 수동 QA 에서 브라우저를 프랑스어로 설정 후
      // localStorage 클리어 → 첫 방문 시 영문 라벨 fallback 확인.
    });
  });
});
