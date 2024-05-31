import { User } from "../models/userModel.js";
import { Message } from "../models/messageModel.js";
import { decryptMsg, encryptMsg } from "../helper/index.js";
import { Conversation } from "../models/conversationModel.js";
import { getReceiverSocketId } from "../services/socketService.js";

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const { message } = req.body;
    const receiverId = req.params.id;

    const { base64data_iv, final_encrypted_message } = encryptMsg(message);

    const {
      _id: newMsgId,
      createdAt: newMsgCreatedAt,
      updatedAt: newMsgUpdatedAt,
    } = await Message.create({
      senderId,
      receiverId,
      message: {
        iv: base64data_iv,
        msg: final_encrypted_message,
      },
    });

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (conversation) {
      conversation.messages.push(newMsgId);
      await conversation.save();
    } else {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        messages: [newMsgId],
      });
    }

    const { fullName, profilePhoto, username } = await User.findById(senderId);

    const preparedResponseObj = {
      sender: {
        fullName,
        username,
        profilePhoto,
        _id: senderId,
      },
      newMessage: {
        message,
        senderId,
        receiverId,
        _id: newMsgId,
        createdAt: newMsgCreatedAt,
        updatedAt: newMsgUpdatedAt,
      },
    };

    if (getReceiverSocketId(receiverId))
      req.io
        .to(getReceiverSocketId(receiverId))
        .emit("newMessage", preparedResponseObj);

    return res.status(201).json(preparedResponseObj);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMessage = async (req, res) => {
  try {
    const receiverId = req.params.id;
    const senderId = req.id;

    const conversation =
      (await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
      }).populate("messages")) || {};

    const messages = conversation.messages?.map(
      ({ _id, senderId, receiverId, createdAt, updatedAt, message }) => ({
        _id,
        senderId,
        receiverId,
        createdAt,
        updatedAt,
        message: decryptMsg(message),
      })
    );

    return res.status(200).json(messages || []);
  } catch (error) {
    console.error("messageController->getMessage->error:", error);
    return res
      .status(500)
      .json({ message: `Internal Server Error: ${error.message}` });
  }
};
