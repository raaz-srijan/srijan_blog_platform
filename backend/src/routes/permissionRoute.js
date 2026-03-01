const express = require("express");
const { auth } = require("../middlewares/auth");
const {
    createPermission,
    fetchPermissions,
    updatePermission,
    deletePermission
} = require("../controllers/permissionController");

const { requireRole } = require("../middlewares/rbacMiddleware");

const router = express.Router();

router.post("/", auth, requireRole("super_admin"), createPermission);
router.get("/", auth, requireRole(["super_admin", "admin"]), fetchPermissions);
router.put("/:permissionId", auth, requireRole("super_admin"), updatePermission);
router.delete("/:permissionId", auth, requireRole("super_admin"), deletePermission);

module.exports = router;
