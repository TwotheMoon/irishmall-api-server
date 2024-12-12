import mongoose from "mongoose";

const naverAllAttrSchema = new mongoose.Schema({
  categoryId: String,
  wholeCategoryName: String,
  myCate: { type: [String], default: [] },
  itHasAttr: Boolean,
});

export const NaverAllAttr = mongoose.model("NaverAllAttr", naverAllAttrSchema);
