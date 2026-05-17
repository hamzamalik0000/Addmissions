const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Student = sequelize.define('Student', {
  student_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  cnic: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  matric_marks: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  matric_total: {
    type: DataTypes.INTEGER,
    defaultValue: 1100,
  },
  fsc_marks: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fsc_total: {
    type: DataTypes.INTEGER,
    defaultValue: 1100,
  },
  merit_score: {
    type: DataTypes.DECIMAL(5, 2),
  },
  avatar_url: {
    type: DataTypes.STRING,
    defaultValue: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
  },
}, {
  tableName: 'students',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Student;
