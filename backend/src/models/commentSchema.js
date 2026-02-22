const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog",
    required: true,
  },

  content: {
    type: String,
    required: true,
    trim: true,
  },

  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    default: null,
  }

}, { timestamps: true });

commentSchema.index({ blogId: 1 });
commentSchema.index({ parentCommentId: 1 });

module.exports = mongoose.model("Comment", commentSchema);