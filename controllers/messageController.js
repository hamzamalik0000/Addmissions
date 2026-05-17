const { Message, Student, College } = require('../models');
const { Op } = require('sequelize');

const messageController = {
  
  sendMessage: async (req, res) => {
    try {
      const { receiver_id, receiver_role, subject, body } = req.body;
      const sender_id = req.user.id;
      const sender_role = req.user.role;

      const message = await Message.create({
        sender_id, sender_role, receiver_id, receiver_role, subject, body
      });

      res.status(201).json({ success: true, message: 'Message sent', data: message });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  
  getInbox: async (req, res) => {
    try {
      const messages = await Message.findAll({
        where: { receiver_id: req.user.id, receiver_role: req.user.role },
        order: [['sent_at', 'DESC']]
      });
      res.json({ success: true, data: messages });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  
  getSent: async (req, res) => {
    try {
      const messages = await Message.findAll({
        where: { sender_id: req.user.id, sender_role: req.user.role },
        order: [['sent_at', 'DESC']]
      });
      res.json({ success: true, data: messages });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  
  markAsRead: async (req, res) => {
    try {
      const { id } = req.params;
      const message = await Message.findOne({
        where: { message_id: id, receiver_id: req.user.id }
      });

      if (!message) return res.status(404).json({ success: false, message: 'Message not found' });

      message.is_read = true;
      await message.save();

      res.json({ success: true, message: 'Message marked as read' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = messageController;
