const User = require("../models/userSchema");
const Role = require("../models/roleSchema");

const requireRole = (requiredRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ success: false, message: "Unauthorized: Login first" });
            }

            const user = await User.findById(req.user.id).populate("roleId");
            if (!user || !user.roleId) {
                return res.status(403).json({ success: false, message: "Access denied: No role assigned" });
            }

            const roleName = user.roleId.name.toLowerCase();
            const allowedRoles = Array.isArray(requiredRoles)
                ? requiredRoles.map(r => r.toLowerCase())
                : [requiredRoles.toLowerCase()];

            if (!allowedRoles.includes(roleName)) {
                return res.status(403).json({ success: false, message: "Access denied: Insufficient role level" });
            }

            next();
        } catch (error) {
            return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
        }
    };
};

const requirePermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ success: false, message: "Unauthorized: Login first" });
            }

            const user = await User.findById(req.user.id).populate({
                path: 'roleId',
                populate: { path: 'permissions', model: 'Permission' }
            });

            if (!user || !user.roleId) {
                return res.status(403).json({ success: false, message: "Access denied: No role assigned" });
            }

            const isSuperAdmin = user.roleId.name.toLowerCase() === 'super_admin';
            if (isSuperAdmin) return next();

            const permissions = user.roleId.permissions || [];
            const hasPermission = permissions.some(
                p => p.name.toLowerCase() === requiredPermission.toLowerCase()
            );

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied: Missing '${requiredPermission}' permission.`
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
        }
    };
};

module.exports = { requireRole, requirePermission };
