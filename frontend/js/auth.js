const authUI = {
  currentRole: 'student',

  setRole: (role) => {
    authUI.currentRole = role;
    
    
    document.getElementById('btn-role-student').classList.remove('active');
    document.getElementById('btn-role-college').classList.remove('active');
    document.getElementById(`btn-role-${role}`).classList.add('active');
    
    
    const hint = document.getElementById('login-demo-hint');
    if (role === 'student') {
      hint.innerText = 'Demo: ali@example.com / password123';
    } else {
      hint.innerText = 'Demo: admin@nust.edu.pk / password123';
    }

    
    const activeTab = document.querySelector('.auth-tab.active').id.replace('tab-', '');
    authUI.showTab(activeTab);
  },

  showTab: (tab) => {
    
    document.getElementById('tab-login').classList.remove('active');
    document.getElementById('tab-register').classList.remove('active');
    document.getElementById(`tab-${tab}`).classList.add('active');

    
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-student-form').classList.add('hidden');
    document.getElementById('register-college-form').classList.add('hidden');

    
    if (tab === 'login') {
      document.getElementById('login-form').classList.remove('hidden');
    } else {
      if (authUI.currentRole === 'student') {
        document.getElementById('register-student-form').classList.remove('hidden');
      } else {
        document.getElementById('register-college-form').classList.remove('hidden');
      }
    }
  },

  togglePw: (inputId, btn) => {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    } else {
      input.type = 'password';
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  },

  handleLogin: async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
      
      const response = await api.post('/auth/login', {
        email,
        password,
        role: authUI.currentRole
      });

      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        app.showToast('Login successful!', 'success');
        
        
        document.getElementById('auth-page').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        app.init();
      }
    } catch (error) {
      if (typeof app !== 'undefined') app.showToast(error.message, 'error');
      else alert(error.message);
    }
  },

  handleStudentRegister: async (e) => {
    e.preventDefault();
    
    const body = {
      name: document.getElementById('reg-s-name').value,
      email: document.getElementById('reg-s-email').value,
      cnic: document.getElementById('reg-s-cnic').value,
      phone: document.getElementById('reg-s-phone').value,
      city: document.getElementById('reg-s-city').value,
      matric_marks: document.getElementById('reg-s-matric').value,
      fsc_marks: document.getElementById('reg-s-fsc').value,
      password: document.getElementById('reg-s-pw').value,
    };

    try {
      const response = await api.post('/auth/register/student', body);
      if (response.success) {
        app.showToast('Registration successful! Please login.', 'success');
        authUI.showTab('login');
        document.getElementById('login-email').value = body.email;
      }
    } catch (error) {
      app.showToast(error.message, 'error');
    }
  },

  handleCollegeRegister: async (e) => {
    e.preventDefault();
    
    const body = {
      name: document.getElementById('reg-c-name').value,
      city: document.getElementById('reg-c-city').value,
      type: document.getElementById('reg-c-type').value,
      contact_email: document.getElementById('reg-c-email').value,
      admin_password: document.getElementById('reg-c-pw').value,
      latitude: document.getElementById('reg-c-lat').value,
      longitude: document.getElementById('reg-c-lng').value,
    };

    try {
      const response = await api.post('/auth/register/college', body);
      if (response.success) {
        app.showToast('College registered! Please login.', 'success');
        authUI.showTab('login');
        document.getElementById('login-email').value = body.contact_email;
      }
    } catch (error) {
      app.showToast(error.message, 'error');
    }
  }
};


window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('auth-page') && !document.getElementById('auth-page').classList.contains('hidden')) {
    authUI.setRole('student');
  }
});
