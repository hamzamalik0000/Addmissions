const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TestResult = sequelize.define('TestResult', {
  result_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  passed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
}, {
  tableName: 'test_results',
  timestamps: true,
  createdAt: 'taken_at',
  updatedAt: false,
});

module.exports = TestResult;
