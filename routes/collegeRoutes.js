const express = require('express');
const router = express.Router();
const collegeController = require('../controllers/collegeController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');


router.get('/', collegeController.getAllColleges);
router.get('/:id', collegeController.getCollegeById);


router.use(authMiddleware);
router.use(roleMiddleware('college'));

router.put('/:id', (req, res, next) => {
  
  if (req.user.id !== req.params.id) return res.status(403).json({ success: false, message: 'Unauthorized' });
  next();
}, collegeController.updateProfile);

router.post('/:id/programs', (req, res, next) => {
  if (req.user.id !== req.params.id) return res.status(403).json({ success: false, message: 'Unauthorized' });
  next();
}, collegeController.addProgram);

router.delete('/:id/programs/:programId', (req, res, next) => {
  if (req.user.id !== req.params.id) return res.status(403).json({ success: false, message: 'Unauthorized' });
  next();
}, collegeController.removeProgram);

module.exports = router;
