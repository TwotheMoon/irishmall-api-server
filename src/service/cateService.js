import XLSX from "xlsx";
import { MyCate } from "../models/MyCate";
import { NaverAllCate } from "../models/NaverAllCate";


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
          transformed[dbKey] = String(row[excelKey]);
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

    console.log(transformedData.filter(data => data.naverCate == "50016200"))

    const naverAllAttrs = await NaverAllCate.find({});

    naverAllAttrs.forEach(attr => {
      attr.myCate = transformedData
        .filter(data => data.naverCate === attr.categoryId)
        .map(data => data.myCate);
    });

    await Promise.all(naverAllAttrs.map(attr => attr.save()));

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