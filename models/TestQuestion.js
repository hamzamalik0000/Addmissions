const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TestQuestion = sequelize.define('TestQuestion', {
  question_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  question_text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  option_a: { type: DataTypes.STRING, allowNull: false },
  option_b: { type: DataTypes.STRING, allowNull: false },
  option_c: { type: DataTypes.STRING, allowNull: false },
  option_d: { type: DataTypes.STRING, allowNull: false },
  correct_answer: {
    type: DataTypes.ENUM('A', 'B', 'C', 'D'),
    allowNull: false,
  },
}, {
  tableName: 'test_questions',
  timestamps: false,
});

module.exports = TestQuestion;
