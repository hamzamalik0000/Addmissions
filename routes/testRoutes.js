const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);


router.get('/:collegeId/questions', roleMiddleware('student'), testController.getTestQuestions);
router.post('/:collegeId/submit', roleMiddleware('student'), testController.submitTest);
router.get('/results/mine', roleMiddleware('student'), testController.getMyResults);


router.get('/my-questions', roleMiddleware('college'), testController.getCollegeQuestions);
router.post('/questions', roleMiddleware('college'), testController.addQuestion);
router.delete('/questions/:id', roleMiddleware('college'), testController.deleteQuestion);

module.exports = router;
