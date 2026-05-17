const { sequelize, College, Student, TestQuestion } = require('./models');
const bcrypt = require('bcryptjs');

const collegesData = [
  { name: 'NUST Islamabad', city: 'Islamabad', type: 'Public', contact_email: 'admin@nust.edu.pk', admin_password: 'password123', seats: 1000, fee: 150000, deadline: '2026-08-01', merit_cutoff: 80.00, latitude: 33.6461, longitude: 73.0793, description: 'Engineering/CS' },
  { name: 'KEMU Lahore', city: 'Lahore', type: 'Public', contact_email: 'admin@kemu.edu.pk', admin_password: 'password123', seats: 300, fee: 50000, deadline: '2026-07-15', merit_cutoff: 88.00, latitude: 31.5546, longitude: 74.3194, description: 'Medical' },
  { name: 'LUMS Lahore', city: 'Lahore', type: 'Private', contact_email: 'admin@lums.edu.pk', admin_password: 'password123', seats: 800, fee: 600000, deadline: '2026-06-30', merit_cutoff: 75.00, latitude: 31.4716, longitude: 74.2699, description: 'Business/CS' },
  { name: 'UET Lahore', city: 'Lahore', type: 'Public', contact_email: 'admin@uet.edu.pk', admin_password: 'password123', seats: 1500, fee: 80000, deadline: '2026-07-20', merit_cutoff: 78.00, latitude: 31.5204, longitude: 74.3587, description: 'Engineering' },
  { name: 'Aga Khan University Karachi', city: 'Karachi', type: 'Private', contact_email: 'admin@aku.edu.pk', admin_password: 'password123', seats: 200, fee: 400000, deadline: '2026-06-15', merit_cutoff: 90.00, latitude: 24.8607, longitude: 67.0011, description: 'Medical' },
  { name: 'NED University Karachi', city: 'Karachi', type: 'Public', contact_email: 'admin@neduet.edu.pk', admin_password: 'password123', seats: 1200, fee: 60000, deadline: '2026-07-25', merit_cutoff: 72.00, latitude: 24.9215, longitude: 67.1126, description: 'Engineering' },
  { name: 'University of Peshawar', city: 'Peshawar', type: 'Public', contact_email: 'admin@uop.edu.pk', admin_password: 'password123', seats: 2000, fee: 30000, deadline: '2026-08-10', merit_cutoff: 60.00, latitude: 34.0151, longitude: 71.5249, description: 'Arts/Science' },
  { name: 'Bahria University Islamabad', city: 'Islamabad', type: 'Private', contact_email: 'admin@bahria.edu.pk', admin_password: 'password123', seats: 900, fee: 200000, deadline: '2026-07-10', merit_cutoff: 70.00, latitude: 33.5651, longitude: 73.0169, description: 'CS/Engineering' }
];

const seedData = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced for seeding.');

    const colleges = [];
    for (const college of collegesData) {
      college.admin_password = await bcrypt.hash(college.admin_password, 10);
      const created = await College.create(college);
      colleges.push(created);
    }
    console.log('Colleges seeded.');

    // Seed test questions for NUST Islamabad
    const nust = colleges.find(c => c.name === 'NUST Islamabad');
    if (nust) {
      await TestQuestion.bulkCreate([
        {
          college_id: nust.college_id,
          question_text: 'What is the capital of Pakistan?',
          option_a: 'Lahore',
          option_b: 'Karachi',
          option_c: 'Islamabad',
          option_d: 'Peshawar',
          correct_answer: 'C'
        },
        {
          college_id: nust.college_id,
          question_text: 'Which country is located to the east of Pakistan?',
          option_a: 'Iran',
          option_b: 'India',
          option_c: 'China',
          option_d: 'Afghanistan',
          correct_answer: 'B'
        },
        {
          college_id: nust.college_id,
          question_text: 'What is 5 + 3 * 2?',
          option_a: '16',
          option_b: '11',
          option_c: '13',
          option_d: '10',
          correct_answer: 'B'
        }
      ]);
      console.log('NUST Test Questions seeded.');
    }

    // Seed test questions for LUMS Lahore
    const lums = colleges.find(c => c.name === 'LUMS Lahore');
    if (lums) {
      await TestQuestion.bulkCreate([
        {
          college_id: lums.college_id,
          question_text: 'Which programming language is mainly used for Flutter app development?',
          option_a: 'Java',
          option_b: 'Swift',
          option_c: 'Dart',
          option_d: 'Kotlin',
          correct_answer: 'C'
        },
        {
          college_id: lums.college_id,
          question_text: 'Who is the founder of Pakistan?',
          option_a: 'Allama Iqbal',
          option_b: 'Liaquat Ali Khan',
          option_c: 'Quaid-e-Azam Muhammad Ali Jinnah',
          option_d: 'Sir Syed Ahmed Khan',
          correct_answer: 'C'
        }
      ]);
      console.log('LUMS Test Questions seeded.');
    }

    const studentPassword = await bcrypt.hash('password123', 10);
    const m_marks = 950, m_tot = 1100, f_marks = 980, f_tot = 1100;
    const merit_score = ((m_marks / m_tot) * 40) + ((f_marks / f_tot) * 60);

    await Student.create({
      name: 'Ali Ahmed',
      email: 'ali@example.com',
      cnic: '42201-1234567-1',
      phone: '0300-1234567',
      city: 'Lahore',
      password: studentPassword,
      matric_marks: m_marks,
      matric_total: m_tot,
      fsc_marks: f_marks,
      fsc_total: f_tot,
      merit_score: merit_score.toFixed(2)
    });
    console.log('Demo student seeded.');

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
