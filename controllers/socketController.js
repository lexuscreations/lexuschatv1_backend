import {
  addUser,
  removeUser,
  getOnlineUsers,
  getReceiverSocketId,
} from "../services/socketService.js";

export const handleConnection = (socket, io) => {
  try {
    const userId = socket.handshake.query.userId;
    if (!userId) return;

    addUser(userId, socket.id);

    io.emit("getOnlineUsers", getOnlineUsers());

    socket.on("disconnect", () => {
      removeUser(userId);
      io.emit("getOnlineUsers", getOnlineUsers());
    });

    socket.on("typing", ({ isTyping, receiverId }) => {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId)
        io.to(receiverSocketId).emit("typing", { senderId: userId, isTyping });
    });
  } catch (error) {
    console.error("🛑 Socket Error:", error);
  }
};
