const express = require("express");
const { auth } = require("../middlewares/auth");
const {
    createRole,
    fetchRoles,
    fetchRoleById,
    updateRole,
    deleteRole
} = require("../controllers/roleController");


const { requireRole } = require("../middlewares/rbacMiddleware");

const router = express.Router();

router.post("/", auth, requireRole("super_admin"), createRole);
router.get("/", auth, requireRole(["super_admin", "admin"]), fetchRoles);
router.get("/:roleId", auth, requireRole(["super_admin", "admin"]), fetchRoleById);
router.put("/:roleId", auth, requireRole(["super_admin", "admin"]), updateRole);
router.delete("/:roleId", auth, requireRole("super_admin"), deleteRole);

module.exports = router;
