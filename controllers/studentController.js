const { Student, College } = require('../models');

const studentController = {
  getProfile: async (req, res) => {
    try {
      const student = await Student.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
      if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
      res.json({ success: true, data: student });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { name, phone, city, avatar_url } = req.body;
      const student = await Student.findByPk(req.user.id);
      if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

      student.name = name || student.name;
      student.phone = phone || student.phone;
      student.city = city || student.city;
      if (avatar_url !== undefined) student.avatar_url = avatar_url;
      await student.save();

      res.json({ success: true, message: 'Profile updated successfully', data: student });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getSavedColleges: async (req, res) => {
    try {
      const student = await Student.findByPk(req.user.id, {
        include: [{ model: College, attributes: ['college_id', 'name', 'city', 'type', 'fee', 'deadline'] }]
      });
      res.json({ success: true, data: student.Colleges });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  saveCollege: async (req, res) => {
    try {
      const { collegeId } = req.params;
      const student = await Student.findByPk(req.user.id);
      const college = await College.findByPk(collegeId);
      
      if (!college) return res.status(404).json({ success: false, message: 'College not found' });
      
      await student.addCollege(college);
      res.json({ success: true, message: 'College saved successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  unsaveCollege: async (req, res) => {
    try {
      const { collegeId } = req.params;
      const student = await Student.findByPk(req.user.id);
      const college = await College.findByPk(collegeId);
      
      if (!college) return res.status(404).json({ success: false, message: 'College not found' });
      
      await student.removeCollege(college);
      res.json({ success: true, message: 'College removed from saved list' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getEligibleColleges: async (req, res) => {
    try {
      const student = await Student.findByPk(req.user.id);
      if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

      const colleges = await College.findAll();
      const eligibleColleges = colleges.filter(c => parseFloat(student.merit_score) >= parseFloat(c.merit_cutoff));

      res.json({ success: true, data: eligibleColleges });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = studentController;
