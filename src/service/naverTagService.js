import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Stealth 플러그인 사용
puppeteer.use(StealthPlugin());

// 네이버태그 검색 조회 서비스
export const getSearchNaverTagService = async (keyword) => {
  const url = `https://search.shopping.naver.com/search/all?pagingSize=80&query=${encodeURIComponent(keyword)}`;
  const browser = await puppeteer.launch({
    headless: true, // 브라우저가 보이지 않게 실행
    // executablePath: '/usr/bin/chromium', // NAS 에서 크롬 경로
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--disable-images', // 이미지를 로드하지 않도록 설정 (속도 향상)
      '--disable-extensions',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-animations',
    ],
  });

  try {
    const page = await browser.newPage();

    // 요청 차단 설정
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['stylesheet', 'image', 'font', 'media'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // 사용자 에이전트 설정
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/85.0.4183.102 Safari/537.36');

    // 요청 헤더 설정
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    });

    // 페이지 이동
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // __NEXT_DATA__ 스크립트의 내용 추출
    let nextDataContent;
    try {
      nextDataContent = await page.$eval('#__NEXT_DATA__', element => {
        return element.textContent;
      });
    } catch (error) {
      console.error("#__NEXT_DATA__ 요소를 찾을 수 없습니다:", error.message);
      await browser.close();
      return false;
    }

    if (!nextDataContent) {
      console.error("#__NEXT_DATA__의 텍스트 콘텐츠가 비어 있습니다.");
      await browser.close();
      return false;
    }

    let nextData;
    try {
      nextData = JSON.parse(nextDataContent);
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError.message);
      await browser.close();
      return false;
    }

    // 필요한 데이터 경로에 따라 naverTags 추출
    // 실제 데이터 구조에 맞게 경로를 조정해야 합니다.
    const naverItems = nextData.props.pageProps.initialState.products.list || [];
    const manuTags = [];

    await naverItems.forEach(item => {
      if (item.item.manuTag) {
        const tags = item.item.manuTag.split(',');
        const excludeTags = ["오늘출발", "오늘발송", "무료교환", "무료반품", "무료교환반품", "무료반품교환"];
        tags.forEach(tag => {
          const trimmedTag = tag.trim();
          if (!manuTags.includes(trimmedTag) && !excludeTags.includes(trimmedTag)) {
            manuTags.push(trimmedTag);
          }
        });
      }
    });

    console.log('네이버태그 검색 조회 성공✅');
    return manuTags;
  } catch (error) {
    console.error("getSearchNaverTagService 서비스 오류❌:", error.message);
    return false;
  } finally {
    await browser.close();
  }
};