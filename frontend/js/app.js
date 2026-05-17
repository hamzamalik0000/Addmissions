const app = {
  currentUser: null,
  currentRole: null,

  init: async () => {
    
    document.getElementById('auth-page').classList.add('hidden');
    document.getElementById('loading-screen').style.display = 'flex';
    
    
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token || !role) {
      setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('auth-page').classList.remove('hidden');
        authUI.setRole('student');
      }, 1000); 
      return;
    }

    try {
      
      const res = await api.get('/auth/me');
      app.currentUser = res.user;
      app.currentRole = role;

      
      app.initTheme();
      app.buildSidebar();
      app.updateTopbar();
      
      
      setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('app').classList.remove('hidden');
        
        
        app.navigate(role === 'student' ? 'home' : 'overview');
      }, 1000);

    } catch (error) {
      console.error('Session invalid:', error);
      localStorage.clear();
      document.getElementById('loading-screen').style.display = 'none';
      document.getElementById('auth-page').classList.remove('hidden');
    }
  },

  initTheme: () => {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById('dark-mode-btn');
    if (theme === 'dark') {
      btn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      btn.innerHTML = '<i class="fas fa-moon"></i>';
    }
  },

  toggleDarkMode: () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const btn = document.getElementById('dark-mode-btn');
    if (newTheme === 'dark') {
      btn.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      btn.innerHTML = '<i class="fas fa-moon"></i>';
    }
  },

  logout: () => {
    localStorage.clear();
    app.currentUser = null;
    app.currentRole = null;
    document.getElementById('app').classList.add('hidden');
    document.getElementById('auth-page').classList.remove('hidden');
    authUI.setRole('student');
  },

  buildSidebar: () => {
    const nav = document.getElementById('sidebar-nav');
    nav.innerHTML = '';
    
    let items = [];
    if (app.currentRole === 'student') {
      items = [
        { id: 'home', icon: 'fa-home', label: 'Overview' },
        { id: 'browse', icon: 'fa-search', label: 'Browse Colleges' },
        { id: 'applications', icon: 'fa-file-alt', label: 'My Applications' },
        { id: 'saved', icon: 'fa-bookmark', label: 'Saved Colleges' },
        { id: 'calculator', icon: 'fa-calculator', label: 'Merit Calculator' },
        { id: 'compare', icon: 'fa-exchange-alt', label: 'Compare Colleges' },
        { id: 'tests', icon: 'fa-clipboard-list', label: 'Admission Tests' },
        { id: 'announcements', icon: 'fa-bullhorn', label: 'Announcements' },
        { id: 'messages', icon: 'fa-envelope', label: 'Messages' },
        { id: 'profile', icon: 'fa-user-cog', label: 'My Profile' }
      ];
    } else {
      items = [
        { id: 'overview', icon: 'fa-chart-pie', label: 'Overview' },
        { id: 'manage-apps', icon: 'fa-users', label: 'Manage Applications' },
        { id: 'profile', icon: 'fa-university', label: 'College Profile' },
        { id: 'announcements', icon: 'fa-bullhorn', label: 'Announcements' },
        { id: 'manage-tests', icon: 'fa-vials', label: 'Test Questions' },
        { id: 'messages', icon: 'fa-envelope', label: 'Messages' }
      ];
    }

    items.forEach(item => {
      const a = document.createElement('a');
      a.href = '#';
      a.className = 'nav-item';
      a.id = `nav-${item.id}`;
      a.innerHTML = `<i class="fas ${item.icon}"></i> <span>${item.label}</span>`;
      a.onclick = (e) => {
        e.preventDefault();
        app.navigate(item.id);
        if (window.innerWidth <= 768) app.toggleSidebar();
      };
      nav.appendChild(a);
    });

    
    const name = app.currentRole === 'student' ? app.currentUser.name : app.currentUser.name;
    document.getElementById('sf-name').innerText = name;
    document.getElementById('sf-role').innerText = app.currentRole === 'student' ? 'Student' : 'College Admin';
    document.getElementById('sf-avatar').innerText = name.charAt(0).toUpperCase();
  },

  updateTopbar: () => {
    const name = app.currentUser.name;
    document.getElementById('topbar-avatar').innerText = name.charAt(0).toUpperCase();
    app.fetchNotificationsCount();
  },

  fetchNotificationsCount: async () => {
    
    
  },

  toggleSidebar: () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
  },

  navigate: (viewId) => {
    
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeNav = document.getElementById(`nav-${viewId}`);
    if (activeNav) activeNav.classList.add('active');

    
    document.getElementById('page-title').innerText = activeNav ? activeNav.innerText.trim() : 'Dashboard';

    
    const container = document.getElementById('view-container');
    container.innerHTML = '<div class="spinner"></div>'; 

    if (app.currentRole === 'student' && typeof studentApp !== 'undefined') {
      studentApp.renderView(viewId, container);
    } else if (app.currentRole === 'college' && typeof collegeApp !== 'undefined') {
      collegeApp.renderView(viewId, container);
    }
  },

  showToast: (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';

    toast.innerHTML = `<i class="fas fa-${icon}"></i> <span>${message}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  showModal: (contentHTML) => {
    document.getElementById('modal-content').innerHTML = contentHTML;
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  closeModal: (e) => {
    if (e && e.target !== document.getElementById('modal-overlay') && !e.target.closest('.modal-close')) {
      return; 
    }
    document.getElementById('modal-overlay').classList.add('hidden');
    document.body.style.overflow = 'auto';
  }
};


window.addEventListener('DOMContentLoaded', () => {
  app.init();
});


document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !document.getElementById('modal-overlay').classList.contains('hidden')) {
    app.closeModal();
  }
});
