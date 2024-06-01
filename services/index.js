import mongoose from "mongoose";
import { User } from "../models/userModel.js";
import { decryptMsg } from "../helper/index.js";

export const getConversationalUsers = async (loggedInUserId) => {
  try {
    const loggedInUserObjectId = new mongoose.Types.ObjectId(loggedInUserId);

    let users = await User.aggregate([
      {
        $match: { _id: { $ne: loggedInUserObjectId } },
      },
      {
        $lookup: {
          from: "messages",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $or: [
                        { $eq: ["$senderId", loggedInUserObjectId] },
                        { $eq: ["$receiverId", loggedInUserObjectId] },
                      ],
                    },
                    {
                      $or: [
                        { $eq: ["$senderId", "$$userId"] },
                        { $eq: ["$receiverId", "$$userId"] },
                      ],
                    },
                  ],
                },
              },
            },
            {
              $sort: { createdAt: -1 },
            },
            {
              $limit: 1,
            },
            {
              $project: {
                _id: 1,
                message: 1,
                createdAt: 1,
                senderId: 1,
                senderType: {
                  $cond: {
                    if: { $eq: ["$senderId", loggedInUserObjectId] },
                    then: "self",
                    else: "partner",
                  },
                },
              },
            },
          ],
          as: "latestMessage",
        },
      },
      {
        $unwind: {
          path: "$latestMessage",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 1,
          fullName: 1,
          username: 1,
          profilePhoto: 1,
          lastMessage: "$latestMessage.message",
          lastMessageTime: "$latestMessage.createdAt",
          lastMessageSender: "$latestMessage.senderType",
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    users = users.map((user) => {
      if (user.lastMessage?.iv && user.lastMessage?.msg)
        return { ...user, lastMessage: decryptMsg(user.lastMessage) };

      return user;
    });

    return users;
  } catch (error) {
    console.log(error);
    return [];
  }
};
