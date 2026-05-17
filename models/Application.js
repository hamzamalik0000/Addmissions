const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Student = require('./Student');
const College = require('./College');

const Application = sequelize.define('Application', {
  application_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  program: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Accepted', 'Rejected'),
    defaultValue: 'Pending',
  },
}, {
  tableName: 'applications',
  timestamps: true,
  createdAt: 'applied_at',
  updatedAt: false,
});


Student.hasMany(Application, { foreignKey: 'student_id' });
Application.belongsTo(Student, { foreignKey: 'student_id' });

College.hasMany(Application, { foreignKey: 'college_id' });
Application.belongsTo(College, { foreignKey: 'college_id' });

module.exports = Application;
