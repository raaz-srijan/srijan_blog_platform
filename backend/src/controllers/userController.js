const User = require("../models/userSchema");
const Role = require("../models/roleSchema");
const bcrypt = require("bcrypt");
const { generateJWT, verifyJWT } = require("../utils/generateToken");

async function register(req, res) {
    try {
        const {name, email, password} = req.body;

        if(!name || !email || !password)
            return res.status(400).json({success:false, message:"Please fill all the required fields"});
    
        const normalizedEmail = email.toLowerCase();

        const existUser = await User.findOne({email:normalizedEmail}).populate('roleId');

        if(existUser)
            return res.status(409).json({success:false, message:"User already registered with this email"});

        if(password.length < 6)
            return res.status(400).json({success:false, message:"Password must be at least six characters"});

        const hashedPassword = await bcrypt.hash(password, 12);

        const defaultRole = await Role.findOne({name:"user"});
        if(!defaultRole)
            return res.status(404).json({success:false, message:"Invalid role"});

        const newUser = await User.create({name:name.trim(), email:normalizedEmail, password:hashedPassword, isVerified:false, roleId:defaultRole._id});

        const token = await generateJWT({id:newUser._id, email:newUser.email});

        return res.status(201).json({success:true, message:"User registered successfully", token});
    } catch (error) {
        return res.status(500).json({success:false, message:"Internal Server Error", error:error.message});
    }
}

async function verifyEmail(req, res) {
    try {
        const {token} = req.params;
        if(!token)
            return res.status(404).json({success:false, message:"Invalid or expired token"});

        const decoded = verifyJWT(token);

        if(!decoded)
            return res.status(404).json({success:false, message:"Invalid or expired token"});

        const user = await User.findById(decoded.id);

        if(!user)
            return res.status(404).json({success:false, message:"Invalid user"});

        user.isVerified = true;
        await user.save();
        
        return res.status(200).json({success:true, message:"Email verified successfully"});
    } catch (error) {
        return res.status(500).json({success:false, message:"Internal Server Error", error:error.message});
    }
}


async function login(req, res) {
    try {
        const {email, password} = req.body;

        if(!email || !password)
            return res.status(400).json({success:false, message:"Please fill all the required fields"});

        const existUser = await User.findOne({email:email.toLowerCase()});

        if(!existUser)
            return res.status(404).json({success:false, message:"Incorrect email or password"});

        if(!existUser.isVerified)
            return res.status(403).json({success:false, message:"Email is not verified"});

        const isMatch = await bcrypt.compare(password, existUser.password);
        if(!isMatch)
            return res.status(400).json({success:false, message:"Incorrect email or password"});

        const token = await generateJWT({id:existUser._id, email:existUser.email, role:existUser.roleId.name});

        return res.status(200).json({success:true, message:"Login successfully", token});
    } catch (error) {
        return res.status(500).json({success:false, message:"Internal Server Error", error:error.message});
    }
}


module.exports = {register, verifyEmail, login}