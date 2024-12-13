import { handleError, handleSuccess } from "../contants/errorHandleing";
import { updateNaverCateAttrService, uploadNaverCateExcelService, getPopularCateService, updateNaverAllCateBatch } from "../service/naverCateService";


// 네이버 All 카테고리 update 컨트롤러
export const updateNaverAllCateController = async (req, res) => {
  try {
    const result = await updateNaverAllCateBatch();
    if (!result) {
      return handleError(res, new Error("네이버 카테 업데이트 실패"), "네이버 카테고리 업데이트를 실패했습니다.");
    }
    handleSuccess(res, null, "네이버 카테고리를 업데이트했습니다.");
  } catch (error) {
    handleError(res, error, "네이버 카테고리 업데이트 컨트롤러 오류");
  }
};

// 네이버 인기 카테고리 검색 컨트롤러
export const getPopularCateController = async (req, res) => {
  try {
    const keyword = req.body.data;
    const popularCate = await getPopularCateService(keyword);
    if (popularCate) handleSuccess(res, popularCate, "인기 카테고리 조회에 성공했습니다.");
    else handleError(res, new Error("인기 카테 조회 실패"), "인기 카테고리 조회에 실패했습니다.");

  } catch (error) {
    handleError(res, error, "인기 카테고리 조회 컨트롤러 오류");
  }
};

// 네이버 카테고리 엑셀 업로드 컨트롤러
export const uploadNaverCateExcelController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 400, message: "파일이 업로드되지 않았습니다." });
    }

    const { startRow, endRow } = req.body;

    const filePath = req.file.path;
    const rowRange = startRow && endRow ? { start: parseInt(startRow) - 1, end: parseInt(endRow) } : null;

    const result = await uploadNaverCateExcelService(filePath, rowRange, req);

    return res.json({ 
      status: 200, 
      message: "엑셀 업로드에 성공했습니다.", 
      downloadUrl: result.downloadPath,
      fileName: result.fileName,
      filteredCount: result.filteredCount
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 500, message: "엑셀 처리 중 오류가 발생했습니다." });
  }
};

export const updateNaverCateAttrController = async (req, res) => {
  try {
    const result = await updateNaverCateAttrService();
    if(result) handleSuccess(res, null, "네이버 속성 업데이트 완료");
    else handleError(res, new Error("네이버 속성 업데이트 실패"), "네이버 속성 업데이트 실패");
  } catch (error) {
    handleError(res, error, "네이버 속성 업데이트 컨트롤러 오류");
  }
};  

