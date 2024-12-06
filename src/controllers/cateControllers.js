import { handleError, handleSuccess } from "../contants/errorHandleing";
import { 
  getAllMyCateService,
  getPopularCateService, 
  updateMyCateExcelService, 
  updateNaverAllCateBatch
} from "../service/cateService"

// 네이버 All 카테고리 update 컨트롤러
export const updateNaverAllCateController = async (req, res) => {
  try {
    const result = await updateNaverAllCateBatch();
    if (result) handleSuccess(res, null, "네이버 카테고리를 업데이트했습니다.");
    else handleError(res, new Error("네이버 카테 업데이트 실패"), "네이버 카테고리 업데이트를 실패했습니다.");

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

// 마이카테 엑셀 업데이트 컨트롤러
export const updateMyCateExcelController = async (req, res) => {
  try {
    if(!req.file) {
      return handleError(res, new Error("파일 없음"), "파일이 존재하지 않습니다.");
    }

    const result = await updateMyCateExcelService(req.file);
    if (result) handleSuccess(res, null, "마이 카테고리 업데이트를 성공했습니다.");
    else handleError(res, new Error("마이 카테 업데이트 실패"), "마이 카테고리 업데이트를 실패했습니다.");
    
  } catch (error) {
    handleError(res, error, "마이 카테고리 업데이트 컨트롤러 오류");
  }
};

// 모든 마이카테 조회 컨트롤러
export const getAllMyCateController = async (req, res) => {
  try {
    const result = await getAllMyCateService();
    if (result) handleSuccess(res, result, "마이 카테고리 조회를 성공했습니다.");
    else handleError(res, new Error("마이 카테 조회 실패"), "마이 카테고리 조회를 실패했습니다.");
    
  } catch (error) {
    handleError(res, error, "마이 카테고리 조회 컨트롤러 오류");
  }
}