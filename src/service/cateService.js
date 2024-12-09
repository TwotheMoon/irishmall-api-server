import axios from "axios";
import cron from "node-cron";
import XLSX from "xlsx";
import { NaverAllCate } from "../models/NaverAllCate";
import { MyCate } from "../models/MyCate";
import { commerceApiBaseUrl, commerceCate, naverApiShopUrl, openApiBaseUrl } from "../contants/apiUrl";
import { createTokenService } from "./tokenService";

// 모든 네이버 카테 조회 서비스
const getAllNaverAllCate = async () => {
  try {
    const naverAllCate = await NaverAllCate.find({});
    return naverAllCate

  } catch (error) {
    console.error("getAllNaverAllCate 서비스 오류: ", error.response.data || error.message);
  }
}

// 네이버 카테고리 update 배치
export const updateNaverAllCateBatch = async () => {
  try {
    const { access_token } = await createTokenService();
    if (!access_token) {
      throw new Error('토큰 생성 실패');
    }

    const res = await axios({
      method: 'get',
      url: `${commerceApiBaseUrl}${commerceCate}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      }
    });

    if (!res.data || res.data.length === 0) {
      throw new Error('API 응답 데이터가 비어 있습니다.');
    }
    
    const allCate = res.data.map(({ id = "", wholeCategoryName = "" }) => ({
      id,
      wholeCategoryName
    }));

    await NaverAllCate.deleteMany().then(async () => {
      await NaverAllCate.insertMany(allCate);
    });

    console.log('최신 네이버 카테고리 갱신 성공✅');
    return true;
  } catch (error) {
    console.error("updateNaverAllCateBatch 서비스 오류:", error.response?.data || error.message);
    return false;
  }
};

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
    const TOP_N = 3;
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

    // 키워드 검색에 의해 생성된 네이버 TOP3 카테고리
    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_N)
      .map(([category]) => category);

    // 네이버 전체 카테고리
    const naverAllCate = await getAllNaverAllCate();

    const findedCateArr = sortedCategories.map((cate) => {
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

    // 마이카테 매핑
    const resultArr = await Promise.all(
      findedCateArr.map( async (item) => {
        if(!item.id) {
          return {
            id: "",
            wholeCategoryName: "",
            matchingCate: []
          };
        }

        const matchingDocs = await MyCate.find({ naverCate: item.id });

        const matchingCate = matchingDocs.map((doc) => ({
          cateName: doc.cateName || "",
          myCate: doc.myCate || "",
          naverCate: doc.naverCate || ""
        }));

        return {
          id: item.id || "",
          wholeCategoryName: item.wholeCategoryName || "",
          matchingCate: matchingCate || [],
        };
      })
    );

    return resultArr;

  } catch (error) {
    console.error("getPopularCateService 서비스 오류: ", error.response.data || error.message);
  }
};


// 마이카테 업데이트 서비스
export const updateMyCateExcelService = async (file) => {  

  try {
    const filePath = file.path;
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const transformRow = (row, mapping) => {
      const transformed = {};
      for (const [excelKey, dbKey] of Object.entries(mapping)) {
        if (row[excelKey] !== undefined) {
          transformed[dbKey] = row[excelKey];
        }
      }
      return transformed;
    };

    const keyMaaping = {
      "카테고리설명": "cateName",
      "마이카테": "myCate",
      A: "auctionCate",
      G: "gmarketCate",
      N: "naverCate",
      "11" : 'elevenCate',
      C: "cupangCate",
      K: "kCate"
    } 

    const transformedData = sheetData.map((row) => transformRow(row, keyMaaping));

    await MyCate.deleteMany().then( async () => { 
      await MyCate.insertMany(transformedData);
    });
    
    return true;

  } catch (error) {
    console.error("updateMyCateExcel 서비스 오류: ", error.response.data || error.message);
  }
};

// 모든 마이 카테고리 조회 서비스
export const getAllMyCateService = async () => {
  try {
    const allMyCate = await MyCate.find({});
    return allMyCate

  } catch (error) {
    console.error("getAllMyCateService 서비스 오류: ", error.response.data || error.message);
  }
};

// 배치
// 분 시 일 월 요일
cron.schedule("0 9 * * *", () => {
  console.log("네이버 카테고리 업데이트 배치 실행");
  updateNaverAllCateBatch();
}, { timezone: "Asia/Seoul" });
            