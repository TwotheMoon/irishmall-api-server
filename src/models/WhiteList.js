import mongoose from "mongoose";


const whiteListSchema = new mongoose.Schema({
  domain: String,
  desc: String
});

export const WhiteList = mongoose.model("whitelists", whiteListSchema);