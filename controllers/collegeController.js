const { College, CollegeProgram } = require('../models');
const { Op } = require('sequelize');

const collegeController = {
  
  getAllColleges: async (req, res) => {
    try {
      const { search, city, type, maxFee, maxMerit } = req.query;
      let whereClause = {};

      if (search) whereClause.name = { [Op.like]: `%${search}%` };
      if (city) whereClause.city = city;
      if (type) whereClause.type = type;
      if (maxFee) whereClause.fee = { [Op.lte]: maxFee };
      if (maxMerit) whereClause.merit_cutoff = { [Op.lte]: maxMerit };

      const colleges = await College.findAll({
        where: whereClause,
        include: [{ model: CollegeProgram, attributes: ['program_name'] }],
        attributes: { exclude: ['admin_password'] }
      });
      res.json({ success: true, data: colleges });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  
  getCollegeById: async (req, res) => {
    try {
      const college = await College.findByPk(req.params.id, {
        include: [{ model: CollegeProgram, attributes: ['program_name'] }],
        attributes: { exclude: ['admin_password'] }
      });
      if (!college) return res.status(404).json({ success: false, message: 'College not found' });
      res.json({ success: true, data: college });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  
  updateProfile: async (req, res) => {
    try {
      const { name, city, type, seats, fee, deadline, merit_cutoff, description, latitude, longitude } = req.body;
      const college = await College.findByPk(req.user.id);
      
      if (!college) return res.status(404).json({ success: false, message: 'College not found' });

      if (name) college.name = name;
      if (city) college.city = city;
      if (type) college.type = type;
      if (seats !== undefined) college.seats = seats;
      if (fee !== undefined) college.fee = fee;
      if (deadline) college.deadline = deadline;
      if (merit_cutoff !== undefined) college.merit_cutoff = merit_cutoff;
      if (description) college.description = description;
      if (latitude !== undefined) college.latitude = latitude ? parseFloat(latitude) : null;
      if (longitude !== undefined) college.longitude = longitude ? parseFloat(longitude) : null;

      await college.save();
      res.json({ success: true, message: 'Profile updated successfully', data: college });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  
  addProgram: async (req, res) => {
    try {
      const { program_name } = req.body;
      const program = await CollegeProgram.create({
        college_id: req.user.id,
        program_name
      });
      res.status(201).json({ success: true, message: 'Program added successfully', data: program });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  
  removeProgram: async (req, res) => {
    try {
      const { programId } = req.params;
      const deleted = await CollegeProgram.destroy({
        where: { id: programId, college_id: req.user.id }
      });
      if (!deleted) return res.status(404).json({ success: false, message: 'Program not found or unauthorized' });
      res.json({ success: true, message: 'Program removed successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = collegeController;
