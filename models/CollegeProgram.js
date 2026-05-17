const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CollegeProgram = sequelize.define('CollegeProgram', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  program_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'college_programs',
  timestamps: false,
});

module.exports = CollegeProgram;
