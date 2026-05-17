const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);


router.post('/', roleMiddleware('student'), applicationController.submitApplication);
router.get('/mine', roleMiddleware('student'), applicationController.getMyApplications);
router.delete('/:id', roleMiddleware('student'), applicationController.withdrawApplication);


router.get('/college', roleMiddleware('college'), applicationController.getCollegeApplications);
router.put('/:id/status', roleMiddleware('college'), applicationController.updateApplicationStatus);

module.exports = router;
