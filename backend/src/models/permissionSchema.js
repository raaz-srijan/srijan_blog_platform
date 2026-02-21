const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true,
    },

    group:{
        type:String,
        default:null,
    },
}, {timestamps:true});


module.exports = mongoose.model("Permission", permissionSchema);