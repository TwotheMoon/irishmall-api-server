import axios from "axios";
import cron from "node-cron";
import { NaverAllCate } from "../models/NaverAllCate";
import { commerceApiBaseUrl, commerceCate, naverApiShopUrl, openApiBaseUrl } from "../contants/apiUrl";
import { createTokenService } from "./tokenService";
import { match } from "assert";
const qs = require('querystring');

const getNaverAllCate = async () => {
  try {
    const naverAllCate = await NaverAllCate.find({});
    return naverAllCate

  } catch (error) {
    console.error("getNaverAllCate 서비스 오류: ", error.response.data || error.message);
  }
}

// 네이버 카테고리 update 배치
export const updateNaverAllCateBatch = async () => {
  try {
    const { access_token } = await createTokenService();

    const res = await axios({
      method: 'get',
      url: commerceApiBaseUrl + commerceCate,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      }
    });

    const resData = res.data;

    const allCate = resData.map((data) => ({
      id: data.id || "",
      wholeCategoryName: data.wholeCategoryName || ""
    }));

    await NaverAllCate.deleteMany();
    await NaverAllCate.insertMany(allCate);

  } catch (error) {
    console.error("updateNaverAllCateBatch 서비스 오류: ", error.response.data || error.message);
  }
};

            // 분 시 일 월 요일
cron.schedule("0 9 * * *", () => {
  console.log("네이버 카테고리 업데이트 배치 실행");
  updateNaverAllCateBatch();
});


// 인기 카테고리 topN 서비스
export const getPopularCateService = async (keyword) => {  
  try {
    const keywordRes = await axios ({
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

    // openAPI 검색 상품 50개 중 탑3 선택
    const topN = 3;
    const productsArr = keywordRes.data.items;
    const categoryCounts = {};

    productsArr.forEach((item) => {
      const categoriesForm = [
        item.category1 || "",
        item.category2 || "",
        item.category3 || "",
        item.category4 || "",
      ];

      const nonEmptyCategories = categoriesForm.filter((category) => category).join(">");

      categoryCounts[nonEmptyCategories] = (categoryCounts[nonEmptyCategories] || 0) + 1;
    });

    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN);

    while (sortedCategories.length < topN) {
      sortedCategories.push([false, 0]);
    }

    // 키워드 검색에 의해 생성된 네이버 TOP3 카테고리
    const popularCate = sortedCategories.map(([category]) => category);

    // 네이버 전체 카테고리
    const naverAllCate = await getNaverAllCate();

    const findedCateArr = popularCate.map((cate) => {
      if(cate){
        const match = naverAllCate.find((item) => item.wholeCategoryName.includes(cate));
        if(match) {
          return {
            id: match.id,
            wholeCategoryName: match.wholeCategoryName,
          }
        }
      };

      return {
        id: "",
        wholeCategoryName: ""
      }
    });

    return findedCateArr;

  } catch (error) {
    console.error("getPopularCateService 서비스 오류: ", error.response.data || error.message);
  }
};