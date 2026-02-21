const permissionData = [
  { name: "create_post", group: "post" },
  { name: "edit_post", group: "post" },
  { name: "delete_post", group: "post" },
  { name: "publish_post", group: "post" },
  { name: "manage_tags", group: "post" },
  
  { name: "create_comment", group: "comment" },
  { name: "edit_comment", group: "comment" },
  { name: "delete_comment", group: "comment" },
  { name: "moderate_comments", group: "comment" },
  
  { name: "manage_users", group: "user" },
  { name: "assign_roles", group: "user" },
  { name: "view_users", group: "user" },

  { name: "view_dashboard", group: "platform" },
  { name: "export_reports", group: "platform" },
  { name: "manage_settings", group: "platform" },
];


const roleData = [
  {
    name: "admin",
    level: 1,
    permissions: [
      "create_post",
      "edit_post",
      "delete_post",
      "publish_post",
      "manage_tags",
      "create_comment",
      "edit_comment",
      "delete_comment",
      "moderate_comments",
      "manage_users",
      "assign_roles",
      "view_users",
      "view_dashboard",
      "export_reports",
      "manage_settings",
    ],
  },
  {
    name: "moderator",
    level: 2,
    permissions: [
      "edit_post",
      "delete_post",
      "publish_post",
      "manage_tags",
      "edit_comment",
      "delete_comment",
      "moderate_comments",
      "view_dashboard",
    ],
  },
  {
    name: "user",
    level: 3,
    permissions: [
      "create_post",
      "create_comment",
    ],
  },
];


module.exports = {permissionData, roleData}