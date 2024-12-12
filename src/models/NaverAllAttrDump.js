import mongoose from "mongoose";

const naverAllAttrDumpSchema = new mongoose.Schema({
  categoryId: String,
  wholeCategoryName: String,
  itHasAttr: Boolean
});

export const NaverAllAttrDump = mongoose.model("NaverAllAttrDump", naverAllAttrDumpSchema);