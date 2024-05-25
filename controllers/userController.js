import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { User } from "../models/userModel.js";
import { getRandomNumber } from "../utils/index.js";
import { getConversationalUsers } from "../services/index.js";
import {
  getJWT_SECRET_KEY,
  getRANDOM_AVATAR_BASE_URL,
} from "../config/index.js";

export const register = async (req, res) => {
  try {
    const { fullName, username, password, confirmPassword, gender } = req.body;

    if (!fullName || !username || !password || !confirmPassword || !gender)
      return res.status(400).json({ message: "All fields are required" });

    if (password !== confirmPassword)
      return res.status(400).json({ message: "Password do not match" });

    const user = await User.findOne({ username });

    if (user)
      return res
        .status(400)
        .json({ message: "Username already exit try different" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const maleProfilePhoto = `${getRANDOM_AVATAR_BASE_URL()}/male/${getRandomNumber(
      79
    )}.jpg`;
    const femaleProfilePhoto = `${getRANDOM_AVATAR_BASE_URL()}/female/${getRandomNumber(
      79
    )}.jpg`;

    await User.create({
      fullName,
      username,
      password: hashedPassword,
      profilePhoto: gender === "male" ? maleProfilePhoto : femaleProfilePhoto,
      gender,
    });

    return res.status(201).json({
      message: "Account created successfully.",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ username }).select("+password");

    if (!user)
      return res.status(400).json({
        message: "Incorrect username or password",
        success: false,
      });

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch)
      return res.status(400).json({
        message: "Incorrect username or password",
        success: false,
      });

    const tokenData = { userId: user._id };

    const token = await jwt.sign(tokenData, getJWT_SECRET_KEY(), {
      expiresIn: "1d",
    });

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "strict",
      })
      .json({
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        profilePhoto: user.profilePhoto,
      });
  } catch (error) {
    console.log(error);
  }
};

export const logout = (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "logged out successfully.",
    });
  } catch (error) {
    console.log(error);
  }
};

export const searchUsers = async (req, res) => {
  try {
    const loggedInUserId = req.id;
    const searchText = req.query.searchText;

    const query = {
      _id: { $ne: loggedInUserId },
      $or: [
        { username: { $regex: searchText, $options: "i" } },
        { fullName: { $regex: searchText, $options: "i" } },
      ],
    };

    const otherUsers = await User.find(query);
    return res.status(200).json(otherUsers);
  } catch (error) {
    console.log(error);
  }
};

export const getConversationalUsersHandler = async (req, res) => {
  try {
    const otherUsers = await getConversationalUsers(req.id);
    return res.status(200).json(otherUsers);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
