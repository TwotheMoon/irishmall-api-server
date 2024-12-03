import { handleError, handleSuccess } from "../contants/errorHandleing";
import { createTokenService } from "../service/tokenService";

// 토큰생성 컨트롤러
export const createTokenController = async (req, res) => {
  try {
    const access_token = await createTokenService();
    res.json(access_token);
    if(access_token) handleSuccess(res, access_token, "토큰 정상적으로 발행되었습니다.");
    else handleError(res, new Error("토큰발급 실패"), "토큰발급을 실패했습니다.")
  
  } catch (error) {
    handleError(res, error, "토큰생성 컨트롤러 오류");
  }
};