const { Application, Student, College, CollegeProgram } = require('../models');

const applicationController = {
  
  submitApplication: async (req, res) => {
    try {
      const { college_id, program } = req.body;
      const student_id = req.user.id;

      
      const existing = await Application.findOne({ where: { student_id, college_id, program } });
      if (existing) return res.status(400).json({ success: false, message: 'Already applied for this program' });

      const application = await Application.create({
        student_id, college_id, program
      });

      res.status(201).json({ success: true, message: 'Application submitted successfully', data: application });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  
  getMyApplications: async (req, res) => {
    try {
      const applications = await Application.findAll({
        where: { student_id: req.user.id },
        include: [{ model: College, attributes: ['name', 'city', 'logo_icon'] }]
      });
      res.json({ success: true, data: applications });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  
  withdrawApplication: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await Application.destroy({
        where: { application_id: id, student_id: req.user.id, status: 'Pending' }
      });
      if (!deleted) return res.status(404).json({ success: false, message: 'Application not found or cannot be withdrawn' });
      res.json({ success: true, message: 'Application withdrawn successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  
  getCollegeApplications: async (req, res) => {
    try {
      const applications = await Application.findAll({
        where: { college_id: req.user.id },
        include: [{ model: Student, attributes: ['name', 'email', 'merit_score', 'city', 'phone'] }]
      });
      res.json({ success: true, data: applications });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  
  updateApplicationStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['Accepted', 'Rejected', 'Pending'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }

      const application = await Application.findOne({ where: { application_id: id, college_id: req.user.id } });
      if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

      application.status = status;
      await application.save();

      res.json({ success: true, message: `Application status updated to ${status}` });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = applicationController;
