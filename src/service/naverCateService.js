import axios from "axios";
import { commerceApiBaseUrl } from "../contants/apiUrl";
import { createTokenService } from "./tokenService";
import { NaverAllCate } from "../models/NaverAllCate";
import { NaverAllAttr } from "../models/NaverAllAttr";
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

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

    // NaverAllAttr 데이터 가져오기
    const naverAllAttrs = await NaverAllAttr.find({});
    const myCateAttrMap = new Map();

    // 모든 NaverAllAttr 데이터를 통해 myCate와 itHasAttr 매핑
    naverAllAttrs.forEach(attr => {
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
    const naverAllCate = await NaverAllCate.find({});

    const { access_token } = await createTokenService();
    if (!access_token) {
      throw new Error('토큰 생성 실패');
    }

    for (let i = 0; i < naverAllCate.length; i++) {
      const category = naverAllCate[i];
      try {
        const res = await axios({
          method: 'get',
          url: `${commerceApiBaseUrl}/external/v1/product-attributes/attributes`,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`
          },
          params: {
            categoryId: category.id
          }
        });

        if (res.data) {
          await NaverAllAttr.create({
            categoryId: category.id,
            wholeCategoryName: category.wholeCategoryName,
            itHasAttr: true
          });
        }
      } catch (error) {
        if(error.status === 401 || error.code === 'GW.AUTHN') {
          console.log('토큰 만료')
          await createTokenService();
        } else {
          console.log(`Error processing category ID ${category.id}:`, error);
          await NaverAllAttr.create({
            categoryId: category.id,
            wholeCategoryName: category.wholeCategoryName,
            itHasAttr: false
          });
        }
      }

      // 1.5초 대기
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  } catch (error) {
    console.log("전체 처리 중 에러 발생:", error);
  }
};
