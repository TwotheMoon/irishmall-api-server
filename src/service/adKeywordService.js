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
  
    const keywordRes = await axios({
      method: 'GET',
      url: adApiBaseUrl + adKeywordTool,
      params: keywordParams,
      headers: {
        'X-Timestamp': timestamp,
        'X-API-KEY': process.env.NAVER_AD_API_ACCESS_LICENSE,
        'X-CUSTOMER': process.env.NAVER_AD_API_ID,
        'X-Signature': keywordSignature
      }
    });
    const managedRes = await axios({
      method: 'GET',
      url: adApiBaseUrl + adManagedKeyword,
      params: managedKeywordParams,
      headers: {
        'X-Timestamp': timestamp,
        'X-API-KEY': process.env.NAVER_AD_API_ACCESS_LICENSE,
        'X-CUSTOMER': process.env.NAVER_AD_API_ID,
        'X-Signature': managedKeywordSignature
      }
    });

    const filteredKeywords = keywordRes.data.keywordList.filter(keywordItem => {
      return !managedRes.data.some(managedItem => 
        managedItem.keyword === keywordItem.relKeyword && managedItem.managedKeyword.isLowSearchVolume
      );
    });

    return filteredKeywords;
  } catch (error) {
    console.error("getAdKeyword 서비스 오류❌:", error.response?.data || error.message);
    return false;
  }
}
