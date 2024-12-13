import { handleError, handleSuccess } from "../contants/errorHandleing";
import {
  getAllMyCateService,
  updateMyCateExcelService,
} from "../service/cateService"


// 마이카테 엑셀 업데이트 컨트롤러
export const updateMyCateExcelController = async (req, res) => {
  try {
    if (!req.file) {
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