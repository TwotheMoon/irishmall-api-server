import { attrTestService2, attrTestService3, updateNaverCateAttrService, uploadNaverCateExcelService } from "../service/naverCateService";

export const uploadNaverCateExcelController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 400, message: "파일이 업로드되지 않았습니다." });
    }

    const { startRow, endRow } = req.body;

    const filePath = req.file.path;
    const rowRange = startRow && endRow ? { start: parseInt(startRow) - 1, end: parseInt(endRow) } : null;

    const result = await uploadNaverCateExcelService(filePath, rowRange, req);

    return res.json({ 
      status: 200, 
      message: "엑셀 업로드에 성공했습니다.", 
      downloadUrl: result.downloadPath,
      fileName: result.fileName,
      filteredCount: result.filteredCount
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: 500, message: "엑셀 처리 중 오류가 발생했습니다." });
  }
};

export const updateNaverCateAttrController = async (req, res) => {
  try {
    await updateNaverCateAttrService();
    return res.end();
  } catch (error) {
    console.log(error);
  }
};  

