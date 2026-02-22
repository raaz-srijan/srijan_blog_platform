const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },

    avatar: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        }
    },

    isVerified: {
        type: Boolean,
        default: false,
        required: true,
    },

    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);