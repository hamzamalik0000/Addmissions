const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Message = sequelize.define('Message', {
  message_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  sender_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  sender_role: {
    type: DataTypes.ENUM('student', 'college'),
    allowNull: false,
  },
  receiver_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  receiver_role: {
    type: DataTypes.ENUM('student', 'college'),
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'messages',
  timestamps: true,
  createdAt: 'sent_at',
  updatedAt: false,
});

module.exports = Message;
