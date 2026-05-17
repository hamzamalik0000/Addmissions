const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');


router.use(authMiddleware);
router.use(roleMiddleware('student'));

router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateProfile);
router.get('/saved-colleges', studentController.getSavedColleges);
router.post('/saved-colleges/:collegeId', studentController.saveCollege);
router.delete('/saved-colleges/:collegeId', studentController.unsaveCollege);
router.get('/eligible-colleges', studentController.getEligibleColleges);

module.exports = router;
