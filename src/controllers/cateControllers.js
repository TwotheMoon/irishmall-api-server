import { getAllCateService } from "../service/cateService.";


// All 카테고리 컨트롤러
export const getAllCateController = async (req, res) => {
  try {
    const accessToken = req.body.data;
    const allCate = await getAllCateService(accessToken);
    res.json(allCate);

  } catch (error) {
    console.log("All 카테 controller 오류", error.message)
    res.status(500).json({error: "카테고리 컨트롤러 오류"})    
  }
}