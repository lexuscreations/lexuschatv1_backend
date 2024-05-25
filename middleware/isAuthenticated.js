import jwt from "jsonwebtoken";

import { User } from "../models/userModel.js";
import { getJWT_SECRET_KEY } from "../config/index.js";

const isAuthenticated = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) throw { name: "JsonWebTokenError" };

    const { userId } = jwt.verify(token, getJWT_SECRET_KEY());

    const user = await User.findById(userId);

    if (!user) throw { name: "UserNotFoundError" };

    req.id = userId;

    next();
  } catch (error) {
    const errorTypes = {
      TokenExpiredError: { status: 401, message: "Token expired" },
      JsonWebTokenError: { status: 401, message: "Invalid token" },
      UserNotFoundError: { status: 404, message: "User not found" },
    };

    const resObj = errorTypes[error.name] || {
      status: 500,
      message: "Internal Server Error",
    };

    console.log("🎟️jwt-error:", error);

    return res
      .clearCookie("token")
      .status(resObj.status)
      .json({
        type: "jwt",
        message: `${resObj.message}, Logged out successfully.`,
      });
  }
};
export default isAuthenticated;
