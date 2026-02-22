const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },

    blogId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Blog",
        required:true,
    },


}, {timestamps:true});

likeSchema.index({ userId: 1, blogId: 1 }, { unique: true });

module.exports = mongoose.model("Like", likeSchema);