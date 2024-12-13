import mongoose from "mongoose";

const naverAllAttrDumpSchema = new mongoose.Schema({
  categoryId: String,
  wholeCategoryName: String,
  itHasAttr: Boolean
});

export const NaverAllAttrDump = mongoose.model("naver_all_attr_dump", naverAllAttrDumpSchema);