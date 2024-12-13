import mongoose from "mongoose";

const naverAllCateSchema = new mongoose.Schema({
  categoryId: String,
  wholeCategoryName: String,
  itHasAttr: Boolean,
  myCate: { type: [String], default: [] },
});

export const NaverAllCate = mongoose.model("naver_all_cate", naverAllCateSchema);
