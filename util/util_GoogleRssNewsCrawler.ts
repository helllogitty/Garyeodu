

import { XMLParser } from 'fast-xml-parser';

export interface Article {
  제목: string;
  링크: string;
  날짜: string;
  설명: string;
  키워드: string;
}

/**
 * 구글 뉴스 RSS에서 '사진 개인정보 유출' 키워드로 기사 가져오기
 * 최대 3번 재시도, 각 요청 후 4초 대기
 */
export const fetchPrivacyNews = async (): Promise<Article[]> => {
  const url =
    'https://news.google.com/rss/search?q=사진%20개인정보%20유출&hl=ko&gl=KR&ceid=KR:ko';

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  for (let i = 0; i < 3; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const xml = await response.text();
      await delay(4000); // ✅ 4초 대기

      const parser = new XMLParser({
        ignoreAttributes: false,
      });
      const json = parser.parse(xml);

      const items = json.rss?.channel?.item ?? [];

      if (!Array.isArray(items)) {
        console.warn('⚠️ RSS 항목이 배열이 아닙니다:', items);
        return [];
      }

      const articles: Article[] = items.slice(0, 3).map((item: any): Article => ({
        제목: item.title ?? '제목 없음',
        링크: item.link ?? '',
        날짜: item.pubDate ?? '',
        설명: item.description ?? '',
        키워드: '사진 개인정보 유출',
      }));

      return articles;
    } catch (error: any) {
      console.error(`❌ RSS 뉴스 로딩 실패 (시도 ${i + 1}):`, error.message || error);

      // 마지막 시도 실패 시 빈 배열 반환
      if (i === 2) return [];

      // 2초 후 재시도
      await delay(2000);
    }
  }

  return []; // 혹시 모를 예외
};