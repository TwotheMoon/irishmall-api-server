import { createTokenService } from "../service/tokenService";

// 토큰생성 컨트롤러
export const createTokenController = async (req, res) => {
  try {
    const access_token = await createTokenService();
    console.log("서버에서 줄꺼야", access_token);
    res.json(access_token);
  } catch (error) {
    console.log("토큰 발급 controller 오류", err.message);
    res.status(500).json({ error: "토큰 발급 실패 "})
  }
};