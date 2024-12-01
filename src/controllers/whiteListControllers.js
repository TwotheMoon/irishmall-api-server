import { handleSuccess, handleError } from "../contants/errorHandleing";
import { createWhiteListService, deleteWhiteListService, readWhiteListService, updateWhiteListService } from "../service/whiteListService";


export const createWhiteListController = async (req, res) => {
  try {
    const result = await createWhiteListService(req);
    if (result) handleSuccess(res, null, "화이트리스트가 생성되었습니다.");
    else handleError(res, new Error("생성 실패"), "화이트리스트 생성에 실패했습니다.");
  
  } catch (error) {
    handleError(res, error, "화이트리스트 생성 컨트롤러 오류");
  }
};

export const readWhiteListController = async (req, res) => {
  try {
    const result = await readWhiteListService();
    if (result) handleSuccess(res, result, "화이트리스트 조회에 성공했습니다.");
    else handleError(res, new Error("조회 실패"), "화이트리스트 조회에 실패했습니다.");
 
  } catch (error) {
    handleError(res, error, "화이트리스트 조회 컨트롤러 오류");
  }
};

export const updateWhiteListController = async (req, res) => {
  try {
    const result = await updateWhiteListService(req);
    if (result) handleSuccess(res, null, "화이트리스트가 업데이트되었습니다.");
    else handleError(res, new Error("업데이트 실패"), "화이트리스트 업데이트에 실패했습니다.");
  
  } catch (error) {
    handleError(res, error, "화이트리스트 업데이트 컨트롤러 오류");
  }
};

export const deleteWhiteListController = async (req, res) => {
  try {
    const result = await deleteWhiteListService(req);
    if (result) handleSuccess(res, null, "화이트리스트가 삭제되었습니다.");
    else handleError(res, new Error("삭제 실패"), "화이트리스트 삭제에 실패했습니다.");
  
  } catch (error) {
    handleError(res, error, "화이트리스트 삭제 컨트롤러 오류");
  }
};