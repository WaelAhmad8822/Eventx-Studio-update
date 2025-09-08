// seed/seedAdmin.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

const createAdmin = async () => {
  const existingAdmin = await User.findOne({ role: "admin" });
  if (existingAdmin) {
    console.log("Admin already exists");
    return process.exit();
  }

  const admin = new User({
    name: "wael",
    email: "wael@gmail.com",
    password: "wael1234",
    role: "admin",
  });

  await admin.save();
  console.log("✅ Admin user created successfully");
  process.exit();
};

createAdmin();
