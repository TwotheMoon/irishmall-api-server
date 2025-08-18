import mongoose from "mongoose";

const myCateSchema = new mongoose.Schema({
  cateName: String,
  myCate: String,
  auctionCate: String,
  gmarketCate: String,
  naverCate: String,
  elevenCate: String,
  cupangCate: String,
});

export const MyCate = mongoose.model("my_cate", myCateSchema);
