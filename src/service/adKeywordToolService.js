import axios from 'axios';
import crypto from 'crypto';
import { adApiBaseUrl, adKeywordTool } from '../contants/apiUrl';
import e from 'express';

// 네이버 광고검색 api 서명 생성
const createAdSignatureService = async (secretKey, timestamp, method, api_url) => {
  const data = `${timestamp}.${method}.${api_url}`;

  const hmac = crypto.createHmac('sha256', secretKey);

  hmac.update(data);

  const signature = hmac.digest('base64');

  return signature;
}

export const getAdKeywordService = async () => {
  try {
    const secretKey = process.env.NAVER_AD_API_SECRET;
    const timestamp = Date.now();
    const method = 'GET';
    const api_url = adKeywordTool;

    const params = {
      hintKeywords: "가방,여자가방,남자가방",
      showDetail: "1"
    }

    const signature = await createAdSignatureService(secretKey, timestamp, method, api_url);
  
    const res = await axios({
      method: 'GET',
      url: adApiBaseUrl + api_url,
      params,
      headers: {
        'X-Timestamp': timestamp,
        'X-API-KEY': process.env.NAVER_AD_API_ACCESS_LICENSE,
        'X-CUSTOMER': process.env.NAVER_AD_API_ID,
        'X-Signature': signature
      }
    });

    console.log("네이버 광고검색 키워드 조회 성공:", res.data);
    return res.data;
  } catch (error) {
    console.log(error)
    console.error("getAdKeyword 서비스 오류❌:", error.response?.data || error.message);
    return false;
  }
}
