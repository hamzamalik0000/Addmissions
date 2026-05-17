const { TestQuestion, TestResult, College } = require('../models');

const testController = {
  
  getTestQuestions: async (req, res) => {
    try {
      const { collegeId } = req.params;
      const questions = await TestQuestion.findAll({
        where: { college_id: collegeId },
        attributes: ['question_id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d'] 
      });
      res.json({ success: true, data: questions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  
  submitTest: async (req, res) => {
    try {
      const { collegeId } = req.params;
      const { answers } = req.body; 
      
      const questions = await TestQuestion.findAll({ where: { college_id: collegeId } });
      if (questions.length === 0) return res.status(404).json({ success: false, message: 'No test available' });

      let score = 0;
      questions.forEach(q => {
        if (answers[q.question_id] === q.correct_answer) {
          score++;
        }
      });

      const total = questions.length;
      const passed = (score / total) >= 0.5; 

      const result = await TestResult.create({
        student_id: req.user.id,
        college_id: collegeId,
        score,
        total,
        passed
      });

      res.status(201).json({ success: true, message: 'Test submitted', data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  
  getMyResults: async (req, res) => {
    try {
      const results = await TestResult.findAll({
        where: { student_id: req.user.id },
        include: [{ model: College, attributes: ['name'] }]
      });
      res.json({ success: true, data: results });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  
  addQuestion: async (req, res) => {
    try {
      const { question_text, option_a, option_b, option_c, option_d, correct_answer } = req.body;
      const question = await TestQuestion.create({
        college_id: req.user.id,
        question_text, option_a, option_b, option_c, option_d, correct_answer
      });
      res.status(201).json({ success: true, message: 'Question added', data: question });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  
  deleteQuestion: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await TestQuestion.destroy({
        where: { question_id: id, college_id: req.user.id }
      });
      if (!deleted) return res.status(404).json({ success: false, message: 'Question not found' });
      res.json({ success: true, message: 'Question deleted' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getCollegeQuestions: async (req, res) => {
    try {
      const questions = await TestQuestion.findAll({
        where: { college_id: req.user.id }
      });
      res.json({ success: true, data: questions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = testController;
