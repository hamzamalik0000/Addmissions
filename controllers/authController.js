const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Student, College } = require('../models');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const authController = {
  
  registerStudent: async (req, res) => {
    try {
      const { name, email, cnic, phone, city, password, matric_marks, matric_total, fsc_marks, fsc_total } = req.body;
      
      const existingStudent = await Student.findOne({ where: { email } });
      if (existingStudent) return res.status(400).json({ success: false, message: 'Email already exists' });

      const hashedPassword = await bcrypt.hash(password, 10);
      
      
      const m_marks = parseInt(matric_marks) || 0;
      const m_tot = parseInt(matric_total) || 1100;
      const f_marks = parseInt(fsc_marks) || 0;
      const f_tot = parseInt(fsc_total) || 1100;
      const merit_score = ((m_marks / m_tot) * 40) + ((f_marks / f_tot) * 60);

      const student = await Student.create({
        name, email, cnic, phone, city, 
        password: hashedPassword, 
        matric_marks: m_marks, matric_total: m_tot, 
        fsc_marks: f_marks, fsc_total: f_tot, 
        merit_score: merit_score.toFixed(2)
      });

      res.status(201).json({ success: true, message: 'Student registered successfully', data: { student_id: student.student_id, email: student.email } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  
  registerCollege: async (req, res) => {
    try {
      const { name, city, type, contact_email, admin_password, latitude, longitude } = req.body;
      
      const existingCollege = await College.findOne({ where: { contact_email } });
      if (existingCollege) return res.status(400).json({ success: false, message: 'College email already exists' });

      const hashedPassword = await bcrypt.hash(admin_password, 10);
      
      const college = await College.create({
        name, city, type, contact_email, admin_password: hashedPassword,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null
      });

      res.status(201).json({ success: true, message: 'College registered successfully', data: { college_id: college.college_id } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  
  login: async (req, res) => {
    try {
      const { email, password, role } = req.body;
      
      if (role === 'student') {
        const student = await Student.findOne({ where: { email } });
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
        
        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        
        const token = generateToken(student.student_id, 'student');
        res.json({ success: true, token, role: 'student', user: { id: student.student_id, name: student.name } });
      } else if (role === 'college') {
        const college = await College.findOne({ where: { contact_email: email } });
        if (!college) return res.status(404).json({ success: false, message: 'College not found' });
        
        const isMatch = await bcrypt.compare(password, college.admin_password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        
        const token = generateToken(college.college_id, 'college');
        res.json({ success: true, token, role: 'college', user: { id: college.college_id, name: college.name } });
      } else {
        res.status(400).json({ success: false, message: 'Invalid role specified' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  
  getMe: async (req, res) => {
    try {
      if (req.user.role === 'student') {
        const student = await Student.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
        res.json({ success: true, user: student });
      } else {
        const college = await College.findByPk(req.user.id, { attributes: { exclude: ['admin_password'] } });
        res.json({ success: true, user: college });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = authController;
