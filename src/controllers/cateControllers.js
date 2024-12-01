import { 
  getPopularCateService, 
  updateMyCateExcelService, 
  updateNaverAllCateBatch
} from "../service/cateService"

// 네이버 All 카테고리 update 컨트롤러
export const updateNaverAllCateController = async (req, res) => {
  try {
    const result = await updateNaverAllCateBatch();
    if(result){
      res.status(200).json({status: 200, message: "업데이트 되었습니다."});
    } else {
      res.status(500).json({status: 500, message: "업데이트에 실패하였습니다. 관리자에게 문의해주세요."});
    }

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

// 마이카테 엑셀 업데이트 컨트롤러
export const updateMyCateExcelController = async (req, res) => {
  
  try {
    if(!req.file) {
      return res.status(400).json({ message: "업로드된 파일이 없습니다. "});
    }

    const result = await updateMyCateExcelService(req.file);

    if(result){
      res.status(200).json({ message: "마이카테고리 업데이트 완료", result: true });
    } else {
      res.status(400).json({ message: "업데이트에 실패했습니다. 파일을 확인해 주세요.", result: false })
    }

  } catch (error) {
    console.error("updateMyCateExcel 컨트롤러 오류: ", error.response.data || error.message);
  }
}