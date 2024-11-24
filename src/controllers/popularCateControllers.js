import { getPopularCateService } from "../service/popularCateService";

export const getPopularCateController = async (req, res) => {
  try {
    const keyword = req.body.data;

    const popularCate = await getPopularCateService(keyword);

    res.json(popularCate);

  } catch (error) {
    console.log("인기 카테 controller오류", error.message);
    res.status(500).json({error: "인기카테고리 컨트롤러 오류"});
  }
}