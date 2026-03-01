const Permission = require("../models/permissionSchema");
const Role = require("../models/roleSchema");
const { getPaginationOptions, getPaginationMetaData } = require("../utils/pagination");

async function createPermission(req, res) {
    try {
        const { name, group } = req.body;
        if (!name) return res.status(400).json({ success: false, message: "Permission name is required" });

        const formattedName = name.trim().toLowerCase().replace(/\s+/g, '_');

        const existing = await Permission.findOne({ name: formattedName });
        if (existing) return res.status(409).json({ success: false, message: "Permission already exists" });

        const permission = await Permission.create({ name: formattedName, group: group?.trim() || null });
        return res.status(201).json({ success: true, message: "Permission created successfully", permission });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function fetchPermissions(req, res) {
    try {
        const { page, limit, skip } = getPaginationOptions(req, 50);

        const permissions = await Permission.find()
            .sort({ group: 1, name: 1 })
            .skip(skip)
            .limit(limit);

        const total = await Permission.countDocuments();
        const meta = getPaginationMetaData(total, limit, page);

        return res.status(200).json({
            success: true,
            count: permissions.length,
            ...meta,
            permissions
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function updatePermission(req, res) {
    try {
        const { permissionId } = req.params;
        const { name, group } = req.body;

        const updatedData = {};
        if (name) updatedData.name = name.trim().toLowerCase().replace(/\s+/g, '_');
        if (group !== undefined) updatedData.group = group ? group.trim() : null;

        const permission = await Permission.findByIdAndUpdate(permissionId, { $set: updatedData }, { new: true });
        if (!permission) return res.status(404).json({ success: false, message: "Permission not found" });

        return res.status(200).json({ success: true, message: "Permission updated successfully", permission });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

async function deletePermission(req, res) {
    try {
        const { permissionId } = req.params;
        const permission = await Permission.findByIdAndDelete(permissionId);
        if (!permission) return res.status(404).json({ success: false, message: "Permission not found" });

        await Role.updateMany(
            { permissions: permissionId },
            { $pull: { permissions: permissionId } }
        );

        return res.status(200).json({ success: true, message: "Permission deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

module.exports = {
    createPermission,
    fetchPermissions,
    updatePermission,
    deletePermission
};
