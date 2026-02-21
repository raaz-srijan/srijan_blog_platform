require("dotenv").config();

const mongoose = require("mongoose");
const connectDb = require("../config/connectDb");
const Permission = require("../models/permissionSchema");
const Role = require("../models/roleSchema");
const { permissionData, roleData } = require("../constants/rolePermissionData");

async function seedData() {
  await connectDb();

  try {
    for (const perm of permissionData) {
      const exists = await Permission.findOne({ name: perm.name });
      if (exists) {
        console.log(`Permission '${perm.name}' already exists, skipping.`);
        continue; 
      }

      await Permission.create([perm]);
      console.log(`Permission '${perm.name}' created.`);
    }
    console.log("All permissions seeded successfully.");

    for (const role of roleData) {
      const existingRole = await Role.findOne({ name: role.name });
      if (existingRole) {
        console.log(`Role '${role.name}' already exists, skipping.`);
        continue; 
      }

      const permDocs = await Permission.find({ name: { $in: role.permissions } });
      const permIds = permDocs.map((p) => p._id);

      const newRole = await Role.create([{ ...role, permissions: permIds }]);
      console.log(`Role '${role.name}' created with permissions.`);
    }

    console.log("All roles seeded successfully.");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await mongoose.disconnect();
  }
}

seedData();