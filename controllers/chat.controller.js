import ChatMessage from "../model/chat.model.js";
import { getOnlineUsers } from "../utils/socket.js";

// GET /api/v1/chat/:receiverId — paginated message history between two users
export const getMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await ChatMessage.find({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "name profileImage")
      .populate("receiver", "name profileImage");

    const total = await ChatMessage.countDocuments({
      $or: [
        { sender: userId, receiver: receiverId },
        { sender: receiverId, receiver: userId },
      ],
    });

    res.status(200).json({
      success: true,
      data: messages.reverse(),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/chat/online — list of currently connected user IDs
export const getOnlineUsersList = (_req, res) => {
  res.json({ success: true, data: getOnlineUsers() });
};
