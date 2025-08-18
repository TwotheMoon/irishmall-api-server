import axios from "axios";
import cron from "node-cron";
import { commerceApiBaseUrl, commerceCate, naverApiShopUrl, openApiBaseUrl } from "../contants/apiUrl";
import { createTokenService } from "./tokenService";
import { NaverAllCate } from "../models/NaverAllCate";
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { MyCate } from "../models/MyCate";
import { getAllMyCateService } from "./cateService";


// 네이버 카테고리 update 배치
export const updateNaverAllCateBatch = async () => {
  try {
    const { access_token } = await createTokenService();
    if (!access_token) {
      throw new Error('토큰 생성 실패❌');
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

    for (const cate of allCate) {
      await NaverAllCate.updateOne(
        { categoryId: cate.id },
        { 
          wholeCategoryName: cate.wholeCategoryName 
        },
        { upsert: true }
      );
    }

    console.log('최신 네이버 카테고리 갱신 성공✅');
    return true;
  } catch (error) {
    console.error("updateNaverAllCateBatch 서비스 오류❌:", error.response?.data || error.message);
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
    const naverAllCate = await NaverAllCate.find({});

    const findedCateArr = sortedCategories.map((cate) => {
      if(cate){
        const match = naverAllCate.find((item) => item.wholeCategoryName.includes(cate));
        if(match) {
          return {
            id: match.categoryId,
            wholeCategoryName: match.wholeCategoryName,
          }
        }
      };
      return {
        categoryId: "",
        wholeCategoryName: ""
      }
    });

    console.log(findedCateArr);

    // 마이카테 매핑
    const resultArr = await Promise.all(
      findedCateArr.map( async (item) => {
        if(!item.id) {
          return {
            categoryId: "",
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

// 컬럼 최대 너비 계산 함수
const calculateMaxColumnWidths = (data) => {
  const colWidths = [];

  data.forEach((row) => {
    row.forEach((cell, idx) => {
      const cellValue = String(cell || '');
      const cellLength = cellValue.length;

      if (colWidths[idx] === undefined || cellLength > colWidths[idx]) {
        colWidths[idx] = cellLength;
      }
    });
  });

  // Excel에서는 기본 폰트 기준으로 약 1.2 배를 곱해 적당한 너비 설정
  return colWidths.map(width => ({ wch: Math.ceil(width * 1.2) }));
};

// 필터링된 데이터에 기반한 컬럼 너비 설정
const calculateAndSetColumnWidths = (filteredData, newWorksheet) => {
  const columnWidths = calculateMaxColumnWidths(filteredData);
  newWorksheet['!cols'] = columnWidths;
};

// 엑셀 업로드 및 속성 걸러내기 서비스
export const uploadNaverCateExcelService = async (filePath, rowRange, req) => {
  try {
    // 엑셀 파일 읽기
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // "마이카테" 컬럼 인덱스 찾기
    const header = jsonData[0];
    const myCateIndex = header.indexOf("마이카테");
    if (myCateIndex === -1) {
      throw new Error('"마이카테" 컬럼을 찾을 수 없습니다.');
    }

    // 행 범위 적용
    let startRow = 1; // 헤더 다음 행부터 시작
    let endRow = jsonData.length;
    
    // rowRange가 제공되면 해당 범위로 설정
    if (rowRange && rowRange.start && rowRange.end) {
      startRow = rowRange.start;
      endRow = rowRange.end;
    }

    // NaverAllCate 데이터 가져오기
    const naverAllCate = await NaverAllCate.find({});
    const myCateAttrMap = new Map();

    // 모든 naverAllCate 데이터를 통해 myCate와 itHasAttr 매핑
    naverAllCate.forEach(attr => {
      if (attr.myCate && Array.isArray(attr.myCate)) {
        attr.myCate.forEach(myCate => {
          if (!myCateAttrMap.has(myCate)) {
            myCateAttrMap.set(myCate, attr.itHasAttr);
          } else {
            if (attr.itHasAttr) {
              myCateAttrMap.set(myCate, true); // 한번 true이면 계속 true 유지
            }
          }
        });
      }
    });

    // 필터링된 데이터 저장
    const filteredData = [header]; // 헤더 추가

    for (let i = startRow; i < endRow; i++) {
      const row = jsonData[i];
      const myCateValue = row[myCateIndex];

      // myCateValue 기반 itHasAttr 확인
      const itHasAttr = myCateAttrMap.get(myCateValue);
      if (itHasAttr) {
        filteredData.push(row);
      }
    }

    // 필터링된 행의 개수 계산 (헤더 제외)
    const filteredCount = filteredData.length - 1;

    // 새로운 워크북 생성 및 시트 추가
    const newWorkbook = XLSX.utils.book_new();
    const newWorksheet = XLSX.utils.aoa_to_sheet(filteredData);

    // 컬럼 너비 수동 계산 및 적용
    calculateAndSetColumnWidths(filteredData, newWorksheet);

    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "Filtered");

    // 파일명 생성 및 저장 경로 설정
    const inputFileExtension = path.extname(req.file.originalname);
    const originalFileName = path.basename(req.file.originalname, inputFileExtension);
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().slice(0, 10).replace(/-/g, '-');
    const fileName = `${originalFileName}_${formattedDate}${inputFileExtension}`;
    const uploadDir = path.join(__dirname, '../../uploads/navercate');
    
    // 폴더가 없으면 생성
    if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const savePath = path.join(uploadDir, fileName);
    XLSX.writeFile(newWorkbook, savePath);

    // 절대 URL로 변경
    const protocol = req.protocol;
    const host = req.get('host');
    const downloadUrl = `${protocol}://${host}/uploads/navercate/${fileName}`;

    return { 
      downloadPath: downloadUrl,
      fileName: fileName,
      filteredCount: filteredCount
    };
  } catch (error) {
    throw error;
  }
};

// 최신 네이버 카테 속성 업데이트 서비스
export const updateNaverCateAttrService = async () => {
  try {
    console.log("네이버 카테고리 사전 업데이트 시작");
    await updateNaverAllCateBatch().then(() => console.log("네이버 카테고리 사전 업데이트 완료✅"));
    await getAllMyCateService();

    const naverAllCate = (await NaverAllCate.find({}));
    const myAllCate = await MyCate.find({});

    let { access_token } = await createTokenService();
    if (!access_token) {
      throw new Error('토큰 생성 실패❌');
    }

    for (let i = 0; i < naverAllCate.length; i++) {
      const category = naverAllCate[i];
      console.log(`${i}번째 카테고리 속성 업데이트 시작: categoryId=${category.categoryId}`);
      try {
        const res = await axios({
          method: 'get',
          url: `${commerceApiBaseUrl}/external/v1/product-attributes/attributes`,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`
          },
          params: {
            categoryId: category.categoryId
          }
        });

        if (res.status === 200) {
          const filteredMyCate = myAllCate
            .filter(cate => String(cate.naverCate) === String(category.categoryId))
            .map(cate => cate.myCate);

          try {
            await NaverAllCate.updateOne(
              { categoryId: category.categoryId },
              {
                wholeCategoryName: category.wholeCategoryName,
                itHasAttr: true,
                myCate: filteredMyCate
              },
              { upsert: true }
            );
            console.log(`${category.categoryId} 속성 업데이트 true ✅`);
          } catch (dbError) {
            console.error(`DB 업데이트 에러 (${category.categoryId}):`, dbError);
          }
        } else {
          try {
            // myCate 업데이트 시에도 필요한 데이터만 필터링
            const filteredMyCate = myAllCate
              .filter(cate => String(cate.naverCate) === String(category.categoryId))
              .map(cate => cate.myCate);

            await NaverAllCate.updateOne(
              { categoryId: category.categoryId },
              {
                myCate: filteredMyCate
              },
              { upsert: true }
            );
            console.log(`${category.categoryId} 속성 업데이트 false ✅`);
          } catch (dbError) {
            console.error(`DB 업데이트 에러 (${category.categoryId}):`, dbError);
          }
        }
      } catch (error) {
        if (error.response?.status === 401 || error.code === 'GW.AUTHN') {
          console.log('토큰 만료');
          const newToken = await createTokenService();
          access_token = newToken.access_token;
          i--; // 현재 인덱스 재시도
        } else { // false 인 경우
          console.log(`false 처리 ${category.categoryId}:`, error.status);
          await NaverAllCate.updateOne(
            { categoryId: category.categoryId },
            {
              wholeCategoryName: category.wholeCategoryName,
              itHasAttr: false
            },
            { upsert: true }
          );
        }
      }

      // 0.3초 대기
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    console.log("네이버 카테고리 속성 업데이트 완료✅");
    return true;
  } catch (error) {
    console.log("전체 처리 중 에러 발생❌:", error);
    throw error;
  }
};

// ------------ 배치 ------------
// 분 시 일 월 요일
cron.schedule("30 8 * * *", () => {
  console.log("네이버 카테고리 및 속성 업데이트 배치 실행");
  updateNaverCateAttrService();
}, { timezone: "Asia/Seoul" });
