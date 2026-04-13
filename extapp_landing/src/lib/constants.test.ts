/**
 * Phase 3 RED — constants.ts 외부 주소 단일 출처 검증
 * 대응 체크: TEST-P3.9
 *
 * constants.ts 는 프로젝트의 **외부 주소/설정의 단일 출처** 역할을 한다
 * (phase03 §3.3 TASK-002 의 파일 JSDoc 참조).
 *
 * 본 테스트가 방어하는 리스크:
 *   - main_landing_todolist.md 리스크 #7: "Chrome Web Store CTA URL 오타"
 *     → 본 테스트가 정확한 URL 문자열을 값 단위로 고정한다
 *   - main_landing_todolist.md 리스크 #9 (Phase 8): "PARTNERSHIP_CONTACT
 *     이메일 오타/누락" → Phase 8 가 본 파일과 같은 패턴으로 추가할 때 동일한
 *     값 검증을 붙이게 될 것
 *
 * 추가 검증:
 *   - URL 형식 (https:// 시작) — Phase 2 §14.2.4 Button 자동 external 감지가
 *     이 형식에 의존. 만약 URL 이 http:// 나 다른 스킴으로 바뀌면 Header CTA 의
 *     target/rel 동작이 깨진다
 *   - SUPPORTED_LANGUAGES 의 초기 구성이 ['ko', 'en'] 임을 보장
 *
 * RED 기대 동작:
 *   `./constants` 모듈이 현재 존재하지 않으므로 "Failed to resolve import"
 *   로 본 파일 전체가 FAIL.
 */
import { describe, it, expect } from 'vitest';
import {
  CHROME_WEB_STORE_URL,
  SUPPORTED_LANGUAGES,
  NAV_ANCHORS,
  PARTNERSHIP_FORM_URL,
  DOCS_URL,
} from './constants';

describe('constants.ts 외부 주소 단일 출처 (TEST-P3.9)', () => {
  // ─────────────────────────────────────────────────────────
  // TEST-P3.9 — CHROME_WEB_STORE_URL 정확한 값
  // ─────────────────────────────────────────────────────────
  describe('TEST-P3.9 — CHROME_WEB_STORE_URL', () => {
    it('공식 Chrome Web Store 상세 URL 과 정확히 일치한다', () => {
      // main_landing_todolist.md 의 주 CTA 선언:
      //   https://chromewebstore.google.com/detail/cpemgmhplednniaifpolbchjmegidcao?authuser=0&hl=ko
      // 이 값이 변경되면 본 테스트도 함께 수정하고 PR 리뷰에서 승인받는 것이
      // "CTA URL 변경의 공식 경로" 다.
      expect(CHROME_WEB_STORE_URL).toBe(
        'https://chromewebstore.google.com/detail/cpemgmhplednniaifpolbchjmegidcao?authuser=0&hl=ko'
      );
    });

    it('https:// 프로토콜로 시작한다 (Button 자동 external 감지 계약)', () => {
      // Phase 2 §14.2.4 의 isHttpUrl() 헬퍼가 이 URL 을 외부 링크로 판정해야
      // target="_blank" + noopener + noreferrer 가 자동 부여된다. 만약 URL 이
      // http:// 또는 다른 스킴으로 바뀌면 Header/Hero/FinalCTA 의 CTA 보안
      // 속성이 깨진다.
      expect(CHROME_WEB_STORE_URL).toMatch(/^https:\/\//);
    });

    it('Chrome Web Store 도메인을 가리킨다', () => {
      // 오타나 사기 도메인을 막는 가드.
      expect(CHROME_WEB_STORE_URL).toContain('chromewebstore.google.com');
    });

    it('extension ID (확장앱 식별자) 를 path 에 포함한다', () => {
      // 상세 페이지 URL 패턴: /detail/{extensionId}
      // ID 가 빠진 URL 은 Chrome Web Store 루트로 이동해 전환율이 0 이 된다.
      expect(CHROME_WEB_STORE_URL).toMatch(/\/detail\/cpemgmhplednniaifpolbchjmegidcao/);
    });
  });

  // ─────────────────────────────────────────────────────────
  // SUPPORTED_LANGUAGES — i18n 초기 구성 보장
  // ─────────────────────────────────────────────────────────
  describe('SUPPORTED_LANGUAGES', () => {
    it('ko 와 en 을 정확히 포함한다 (Phase 3 1차 범위)', () => {
      expect(SUPPORTED_LANGUAGES).toContain('ko');
      expect(SUPPORTED_LANGUAGES).toContain('en');
    });

    it('1차 활성 언어는 정확히 2개 (ko, en) 이다', () => {
      // Phase 3 1차는 ko/en 만 활성. ja/zh 는 2차/3차 활성화 시점에
      // 본 상수에 추가될 예정. 현재는 2개로 고정.
      expect(SUPPORTED_LANGUAGES.length).toBe(2);
    });

    it('as const 로 readonly tuple 이 유지된다 (타입 추론 안정성)', () => {
      // SupportedLanguage = typeof SUPPORTED_LANGUAGES[number] 가 리터럴
      // 유니온으로 좁혀지려면 원본이 readonly tuple 이어야 한다. 런타임에선
      // Array.isArray 와 length 로 간접 검증.
      expect(Array.isArray(SUPPORTED_LANGUAGES)).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────
  // NAV_ANCHORS — 네비게이션 단일 출처
  // ─────────────────────────────────────────────────────────
  describe('NAV_ANCHORS (Header + Section id 단일 출처)', () => {
    // 리뷰 피드백 반영 (Medium): Header 의 href 와 Section 의 id 가 분리되어
    // 있어 3/4 앵커가 dead link 상태였음. NAV_ANCHORS 를 단일 출처로 두고
    // Header 가 이 배열에서 href 를, App.tsx 가 id 를 각각 생성하도록 통합.

    it('정확히 4개 앵커를 포함한다 (features/scenarios/differentiation/roadmap)', () => {
      expect(NAV_ANCHORS.length).toBe(4);
      const ids = NAV_ANCHORS.map((a) => a.id);
      expect(ids).toEqual(['features', 'scenarios', 'differentiation', 'roadmap']);
    });

    it('각 앵커는 id 와 labelKey 를 필수로 갖는다', () => {
      for (const anchor of NAV_ANCHORS) {
        expect(anchor).toHaveProperty('id');
        expect(anchor).toHaveProperty('labelKey');
        expect(typeof anchor.id).toBe('string');
        expect(anchor.id.length).toBeGreaterThan(0);
        expect(typeof anchor.labelKey).toBe('string');
      }
    });

    it('labelKey 는 header.nav.{id} 패턴을 따른다 (i18n 키 규약)', () => {
      // Header 가 t(anchor.labelKey) 로 렌더하므로 labelKey 가 실제 i18n 키와
      // 일치해야 한다. 패턴 검증으로 오타/누락을 차단.
      for (const anchor of NAV_ANCHORS) {
        expect(anchor.labelKey).toBe(`header.nav.${anchor.id}`);
      }
    });

    it('ID 가 중복되지 않는다 (각 앵커는 고유한 DOM target)', () => {
      const ids = NAV_ANCHORS.map((a) => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  // ───────────────────────────────────────────────────────────
  // Phase 8: PARTNERSHIP_CONTACT (TEST-P8.11)
  // ───────────────────────────────────────────────────────────
  describe('PARTNERSHIP_FORM_URL (TEST-P8.11)', () => {
    it('Google Forms URL 형식이다', () => {
      expect(PARTNERSHIP_FORM_URL).toMatch(/^https:\/\/docs\.google\.com\/forms\//);
    });
  });

  describe('DOCS_URL', () => {
    it('https:// 로 시작하는 유효한 URL 이다', () => {
      expect(DOCS_URL).toMatch(/^https:\/\/.+/);
    });
  });
});
