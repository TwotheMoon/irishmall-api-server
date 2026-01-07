import axios from 'axios';
import crypto from 'crypto';
import { adApiBaseUrl, adKeywordTool, adManagedKeyword } from '../contants/apiUrl';

// 네이버 광고검색 api 서명 생성
const createAdSignatureService = async (secretKey, timestamp, method, api_url) => {
  const data = `${timestamp}.${method}.${api_url}`;

  const hmac = crypto.createHmac('sha256', secretKey);

  hmac.update(data);

  const signature = hmac.digest('base64');

  return signature;
}

export const getAdKeywordService = async (keyword) => {
  try {
    const secretKey = process.env.NAVER_AD_API_SECRET;
    const timestamp = Date.now();
    const method = 'GET';

    const keywordParams = {
      hintKeywords: keyword,
      showDetail: "1"
    }
    const managedKeywordParams = {
      keywords: keyword,
      disablePattern: "true"
    }

    const keywordSignature = await createAdSignatureService(secretKey, timestamp, method, adKeywordTool);
    const managedKeywordSignature = await createAdSignatureService(secretKey, timestamp, method, adManagedKeyword);
  
    // keywordRes와 managedRes가 모두 완료된 후에만 filteredKeywords가 실행될 수 있도록 Promise.all 사용
    const [keywordRes, managedRes] = await Promise.all([
      axios({
        method: 'GET',
        url: adApiBaseUrl + adKeywordTool,
        params: keywordParams,
        headers: {
          'X-Timestamp': timestamp,
          'X-API-KEY': process.env.NAVER_AD_API_ACCESS_LICENSE,
          'X-CUSTOMER': process.env.NAVER_AD_API_ID,
          'X-Signature': keywordSignature
        }
      }),
      axios({
        method: 'GET',
        url: adApiBaseUrl + adManagedKeyword,
        params: managedKeywordParams,
        headers: {
          'X-Timestamp': timestamp,
          'X-API-KEY': process.env.NAVER_AD_API_ACCESS_LICENSE,
          'X-CUSTOMER': process.env.NAVER_AD_API_ID,
          'X-Signature': managedKeywordSignature
        }
      })
    ]);

    const filteredKeywords = keywordRes.data.keywordList.filter(keywordItem => {
      return !managedRes.data.some(managedItem => 
        managedItem.keyword === keywordItem.relKeyword && managedItem.managedKeyword.isLowSearchVolume
      );
    });
    console.log("필터링된 키워드", filteredKeywords[0])

    return filteredKeywords;
  } catch (error) {
    console.error("getAdKeyword 서비스 오류❌:", error.response?.data || error.message);
    return false;
  }
}
