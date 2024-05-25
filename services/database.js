import mongoose from "mongoose";
import { getMONGO_URI } from "../config/index.js";

const connectDB = async () =>
  await mongoose
    .connect(getMONGO_URI())
    .then(() => console.log("Database-Connected🔗!"))
    .catch((error) => {
      console.error("Database connection error:", error);
      process.exit(1);
    });

export default connectDB;
