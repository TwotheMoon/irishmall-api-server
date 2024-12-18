import { handleError, handleSuccess } from "../contants/errorHandleing";
import { getAdKeywordService } from "../service/adKeywordToolService";
import { testService } from "../service/testService";

export const testController = async (req, res) => {
  try {
    const result = await getAdKeywordService();
    if (result) handleSuccess(res, result, "테스트를 성공했습니다.");
    else handleError(res, new Error("테스트 실패"), "테스트를 실패했습니다.");
  } catch (error) {
    handleError(res, error, "테스트 컨트롤러 오류");
  }
} 