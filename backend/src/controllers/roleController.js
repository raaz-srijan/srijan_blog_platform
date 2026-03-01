const Role = require("../models/roleSchema");
const User = require("../models/userSchema");
const { getPaginationOptions, getPaginationMetaData } = require("../utils/pagination");

async function createRole(req, res) {
    try {
        const { name, level, permissions } = req.body;
        if (!name || level === undefined) {
            return res.status(400).json({ success: false, message: "Role name and level are required" });
        }

        const formattedName = name.trim().toLowerCase();

        const existing = await Role.findOne({ name: formattedName });
        if (existing) return res.status(409).json({ success: false, message: "Role already exists" });

        const role = await Role.create({
            name: formattedName,
            level,
            permissions: Array.isArray(permissions) ? permissions : []
        });

        return res.status(201).json({ success: true, message: "Role created successfully", role });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function fetchRoles(req, res) {
    try {
        const { page, limit, skip } = getPaginationOptions(req, 20);

        const roles = await Role.find()
            .populate("permissions", "name group")
            .sort({ level: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Role.countDocuments();
        const meta = getPaginationMetaData(total, limit, page);

        return res.status(200).json({
            success: true,
            count: roles.length,
            ...meta,
            roles
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function fetchRoleById(req, res) {
    try {
        const { roleId } = req.params;
        const role = await Role.findById(roleId).populate("permissions", "name group");
        if (!role) return res.status(404).json({ success: false, message: "Role not found" });

        return res.status(200).json({ success: true, role });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function updateRole(req, res) {
    try {
        const { roleId } = req.params;
        const { name, level, permissions } = req.body;

        const updatedData = {};
        if (name) updatedData.name = name.trim().toLowerCase();
        if (level !== undefined) updatedData.level = level;
        if (permissions && Array.isArray(permissions)) updatedData.permissions = permissions;

        const role = await Role.findByIdAndUpdate(
            roleId,
            { $set: updatedData },
            { new: true }
        ).populate("permissions", "name group");

        if (!role) return res.status(404).json({ success: false, message: "Role not found" });

        return res.status(200).json({ success: true, message: "Role updated successfully", role });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function deleteRole(req, res) {
    try {
        const { roleId } = req.params;

        const usersCount = await User.countDocuments({ roleId });
        if (usersCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete role. It is currently assigned to ${usersCount} user(s). Please reassing them first.`
            });
        }

        const role = await Role.findByIdAndDelete(roleId);
        if (!role) return res.status(404).json({ success: false, message: "Role not found" });

        return res.status(200).json({ success: true, message: "Role deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

module.exports = {
    createRole,
    fetchRoles,
    fetchRoleById,
    updateRole,
    deleteRole
};
