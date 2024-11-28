import { getNaverAllCateService } from "../service/cateService"
import { getPopularCateService } from "../service/cateService"

// 네이버 All 카테고리 update 컨트롤러
export const updateNaverAllCateController = async (req, res) => {
  try {
    await getNaverAllCateService();
    res.status(200);

  } catch (error) {
    console.error("updateNaverAllCate 컨트롤러 오류: ", error.response.data || error.message);
    res.status(500).json({error: "네이버 카테고리 업데이트 컨트롤러 오류"})    
  }
};

// 네이버 인기 카테고리 검색 컨트롤러
export const getPopularCateController = async (req, res) => {
  try {
    const keyword = req.body.data;

    const popularCate = await getPopularCateService(keyword);

    res.json(popularCate);

  } catch (error) {
    console.error("getPopularCate 컨트롤러 오류: ", error.response.data || error.message);
    res.status(500).json({error: "인기카테고리 컨트롤러 오류"});
  }
}