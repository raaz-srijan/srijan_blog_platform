const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true,
    },

    level:{
        type:Number,
        required:true
    },

    permissions:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Permission",
        required:true,
    }],
}, {timestamps:true});


module.exports = mongoose.model("Role", roleSchema);