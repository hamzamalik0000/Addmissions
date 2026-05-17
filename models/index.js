const sequelize = require('../config/db');


const Student = require('./Student');
const College = require('./College');
const CollegeProgram = require('./CollegeProgram');
const Application = require('./Application');
const Announcement = require('./Announcement');
const TestQuestion = require('./TestQuestion');
const TestResult = require('./TestResult');
const Notification = require('./Notification');
const Message = require('./Message');




College.hasMany(CollegeProgram, { foreignKey: 'college_id', onDelete: 'CASCADE' });
CollegeProgram.belongsTo(College, { foreignKey: 'college_id' });


Student.belongsToMany(College, { through: 'saved_colleges', foreignKey: 'student_id' });
College.belongsToMany(Student, { through: 'saved_colleges', foreignKey: 'college_id' });


College.hasMany(Announcement, { foreignKey: 'college_id', onDelete: 'CASCADE' });
Announcement.belongsTo(College, { foreignKey: 'college_id' });


College.hasMany(TestQuestion, { foreignKey: 'college_id', onDelete: 'CASCADE' });
TestQuestion.belongsTo(College, { foreignKey: 'college_id' });


Student.hasMany(TestResult, { foreignKey: 'student_id', onDelete: 'CASCADE' });
TestResult.belongsTo(Student, { foreignKey: 'student_id' });


College.hasMany(TestResult, { foreignKey: 'college_id', onDelete: 'CASCADE' });
TestResult.belongsTo(College, { foreignKey: 'college_id' });


module.exports = {
  sequelize,
  Student,
  College,
  CollegeProgram,
  Application,
  Announcement,
  TestQuestion,
  TestResult,
  Notification,
  Message
};
