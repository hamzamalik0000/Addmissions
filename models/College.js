const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const College = sequelize.define('College', {
  college_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('Public', 'Private'),
    allowNull: false,
  },
  contact_email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  admin_password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  seats: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  fee: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  deadline: {
    type: DataTypes.DATEONLY,
  },
  merit_cutoff: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  description: {
    type: DataTypes.TEXT,
  },
  logo_icon: {
    type: DataTypes.STRING,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
  },
}, {
  tableName: 'colleges',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = College;
