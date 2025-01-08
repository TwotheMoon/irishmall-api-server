import { handleError, handleSuccess } from "../contants/errorHandleing";
import { getSearchNaverTagService } from "../service/naverTagService";


// 네이버태그 검색 조회 컨트롤러
export const getSearchNaverTagController = async (req, res) => {
  const { keyword } = req.body;
  console.log(keyword)
  if (!keyword) return handleError(res, new Error("키워드가 없습니다."), "키워드가 없습니다.");
  try {
    const result = await getSearchNaverTagService(keyword);
    if (result) handleSuccess(res, result, "네이버태그 조회를 성공했습니다.");
    else handleError(res, new Error("네이버태그 조회 실패"), "네이버태그 조회를 실패했습니다.");
    console.log(result)

  } catch (error) {
    handleError(res, error, "네이버태그 조회 컨트롤러 오류");
  }
}