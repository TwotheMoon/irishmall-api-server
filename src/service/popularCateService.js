import axios from "axios";
import { naverApiShopUrl, openApiBaseUrl } from "../contants/apiUrl";
const qs = require('querystring');

// 인기 카테고리 topN 서비스
export const getPopularCateService = async (keyword) => {
  try {
    const res = await axios ({
      method: 'get',
      url: openApiBaseUrl + naverApiShopUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-Naver-Client-Id': process.env.NAVER_OPEN_API_ID,
        'X-Naver-Client-Secret': process.env.NAVER_OPEN_API_SECRET,
      },
      params: {
        'query': keyword,
        'display': 50,
        'exclude': "used:rental:cbshop",
      }
    });

    const popularCate = res.data;
    return popularCate;

  } catch (error) {
    console.error("인기 카테고리 서비스 오류 발생", error.response.data || error.message);
  }
};