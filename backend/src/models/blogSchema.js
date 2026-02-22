const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      trim: true,
    },

    images: {
      url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },

    likesCount: {
      type: Number,
      default: 0,
    },

    draft: {
      type: Boolean,
      default: false,
      required: true,
    },

    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Blog", blogSchema);
