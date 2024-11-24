import axios from "axios";
import { commerceApiBaseUrl, commerceCate } from "../contants/apiUrl";


// 카테고리 수집 서비스
export const getAllCateService = async (accessToken) => {
  try {
    const res = await axios({
      method: 'get',
      url: commerceApiBaseUrl + commerceCate,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const allCate = res.data;
    return allCate;

  } catch (error) {
    console.error("카테고리 서비스 오류 발생:", error.response.data || error.message);
  }
  return;
}