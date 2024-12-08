import { WhiteList } from "../models/WhiteList";

export const createWhiteListService = async (req) => {
  const { domain, desc } = req.body;

  try {
    const newData = new WhiteList({ domain, desc });
    await newData.save();
    return true;

  } catch (error) {
    if (error.name === "ValidationError") {
      throw new Error("유효한 도메인 형식이 아닙니다.");
    }
    throw new Error("화이트리스트 생성 서비스 오류: " + error.message);
  }
};

export const readWhiteListService = async () => {
  try {
    const data = await WhiteList.find();
    return data;

  } catch (error) {
    throw new Error("화이트리스트 조회 서비스 오류: " + error.message);
  }
};

export const updateWhiteListService = async (req) => {
  const { id, domain, desc } = req.body;
  try {
    const updatedData = await WhiteList.findByIdAndUpdate(id, { domain, desc }, { new: true });
    return true;

  } catch (error) {
    throw new Error("화이트리스트 업데이트 서비스 오류: " + error.message);
  }
};

export const deleteWhiteListService = async (req) => {
  const { id } = req.body;
  try {
    await WhiteList.findByIdAndDelete(id);
    return true;

  } catch (error) {
    throw new Error("화이트리스트 삭제 서비스 오류: " + error.message);
  }
};