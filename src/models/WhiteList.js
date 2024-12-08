import mongoose from "mongoose";


const whiteListSchema = new mongoose.Schema({
  domain: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: (v) => {
        return /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
      },
      message: "유효한 도메인 형식이 아닙니다.",
    },
  },
  desc: String
});

export const WhiteList = mongoose.model("whitelists", whiteListSchema);