import { handleError, handleSuccess } from "../contants/errorHandleing";
import { getAdKeywordService } from "../service/adKeywordService";

export const getAdKeywordController = async (req, res) => {
  try {
    const result = await getAdKeywordService(req.body.data);
    if (result) handleSuccess(res, result, "광고 키워드 검색에 성공했습니다.✅");
    else handleError(res, new Error("광고 키워드 검색 실패"), "광고 키워드 검색에 실패했습니다.❌");
  } catch (error) {
    handleError(res, error, "광고 키워드 검색 컨트롤러 오류❌");
  }
} 