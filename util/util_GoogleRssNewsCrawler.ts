import axios from 'axios';
import * as xml2js from 'xml2js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Article {
  제목: string;
  링크: string;
  날짜: string;
  설명: string;
  키워드: string;
}

class GoogleRssNewsCrawler {
  private parser = new xml2js.Parser();
  private results: Article[] = [];
  private keywords: string[];

  constructor(keywords: string[]) {
    this.keywords = keywords;
  }

  /**
   * 단일 키워드로 뉴스 검색
   */
  private async fetchArticles(keyword: string): Promise<Article[]> {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}`;

    try {
      const res = await axios.get(url);
      const xml = res.data;
      const json = await this.parser.parseStringPromise(xml);
      const items = json.rss.channel[0].item || [];

      return items.map((item: any) => ({
        제목: item.title[0],
        링크: item.link[0],
        날짜: item.pubDate[0],
        설명: item.description[0],
        키워드: keyword
      }));
    } catch (err: any) {
      console.error(`❌ '${keyword}' RSS 가져오기 실패:`, err.message);
      return [];
    }
  }

  /**
   * 모든 키워드 수집 실행
   */
  async crawlAll(): Promise<Article[]> {
    console.log('📰 Google 뉴스 RSS 크롤링 시작...');
    this.results = [];

    for (const keyword of this.keywords) {
      console.log(`🔎 '${keyword}' 검색 중...`);
      const articles = await this.fetchArticles(keyword);
      this.results.push(...articles);
      console.log(`✅ ${articles.length}개 기사 수집됨`);
    }

    return this.results;
  }

  /**
   * 결과를 JSON으로 저장
   */
  saveToFile(filename = 'rss_privacy_news.json') {
    const filePath = path.join(__dirname, filename);
    fs.writeFileSync(filePath, JSON.stringify(this.results, null, 2), 'utf8');
    console.log(`💾 결과가 ${filePath}에 저장되었습니다.`);
  }
}

// 사용 예시
async function main() {
  const keywords = ['개인정보 유출', '프라이버시', '데이터 유출', '정보보호'];
  const crawler = new GoogleRssNewsCrawler(keywords);

  const results = await crawler.crawlAll();

  console.log(`\n📝 총 ${results.length}개 기사 수집 완료`);
  console.log('✨ 최근 뉴스 예시:');
  results.slice(0, 3).forEach((a, i) => {
    console.log(`${i + 1}. [${a.키워드}] ${a.제목}`);
    console.log(`   ${a.날짜}`);
    console.log(`   ${a.링크}`);
  });

  crawler.saveToFile(); // JSON 저장
}

main();