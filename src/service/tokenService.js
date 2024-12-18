import axios from "axios";
import bcrypt from "bcrypt";
import { commerceApiBaseUrl, commerceToken } from "../contants/apiUrl";
const qs = require('querystring');

// 토큰 자격증명 생성
const createSignatureService = async (client_id, client_secret, timestamp) => {
  const password = `${client_id}_${timestamp}`;
  const hashed = bcrypt.hashSync(password, client_secret);
  const base64Signature = Buffer.from(hashed, "utf-8").toString('base64');

  return base64Signature;
}

// 토큰 발급 서비스
export const createTokenService = async () => {
  try {
    const client_id = process.env.NAVER_COMMERCE_API_ID;
    const client_secret = process.env.NAVER_COMMERCE_API_SECRET;
    const timestamp = Date.now();
    const grant_type = 'client_credentials';
    const type = 'SELF';


    // 자격증명 생성
    const client_secret_sign = await createSignatureService(client_id, client_secret, timestamp);

    const data = qs.stringify({
      client_id,
      client_secret,
      timestamp,
      grant_type,
      client_secret_sign,
      type
    });

    const res = await axios({
      method: 'post',
      url: commerceApiBaseUrl + commerceToken,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data
    });

    console.log("토큰 발급 성공:", res.data);
    return res.data;
  } catch (error) {
    console.error("토큰 생성 중 오류 발생:", error.response?.data || error.message);
    throw error;
  }
};
