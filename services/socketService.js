const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

export const addUser = (userId, socketId) => (userSocketMap[userId] = socketId);

export const removeUser = (userId) => delete userSocketMap[userId];

export const getOnlineUsers = () => Object.keys(userSocketMap);
