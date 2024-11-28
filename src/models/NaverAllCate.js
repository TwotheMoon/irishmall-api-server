import mongoose from "mongoose";

const naverAllCateSchema = new mongoose.Schema({
  id: String,
  wholeCategoryName: String,
});

export const NaverAllCate = mongoose.model("NaverAllCate", naverAllCateSchema);
