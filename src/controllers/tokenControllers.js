import { createTokenService } from "../service/tokenService";

// 토큰생성 컨트롤러
export const createTokenController = async (req, res) => {
  try {
    const access_token = await createTokenService();
    console.log("new Token", access_token);
    res.json(access_token);
  
  } catch (error) {
    console.log("토큰 발급 controller 오류", error.message);
    res.status(500).json({ error: "토큰 발급 실패 "})
  }
};