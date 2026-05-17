const collegeApp = {
  renderView: async (viewId, container) => {
    try {
      if (viewId === 'overview') await collegeApp.renderOverview(container);
      else if (viewId === 'manage-apps') await collegeApp.renderManageApps(container);
      else if (viewId === 'profile') await collegeApp.renderProfile(container);
      else if (viewId === 'announcements') await collegeApp.renderAnnouncements(container);
      else if (viewId === 'manage-tests') await collegeApp.renderManageTests(container);
      else if (viewId === 'messages') await collegeApp.renderMessages(container);
      else container.innerHTML = '<h2>View not found</h2>';
    } catch (error) {
      container.innerHTML = `<div class="error-state"><i class="fas fa-exclamation-triangle"></i><p>${error.message}</p></div>`;
    }
  },

  renderOverview: async (container) => {
    const res = await api.get('/applications/college');
    const apps = res.data;
    
    const pending = apps.filter(a => a.status === 'Pending').length;
    const accepted = apps.filter(a => a.status === 'Accepted').length;
    const rejected = apps.filter(a => a.status === 'Rejected').length;

    container.innerHTML = `
      <div class="welcome-banner">
        <div>
          <h2>Overview for ${app.currentUser.name}</h2>
          <p>Monitor your admissions and applications.</p>
        </div>
      </div>
      
      <div class="dashboard-grid">
        <div class="stat-card">
          <i class="fas fa-file-import"></i>
          <div class="sc-info">
            <h3>${apps.length}</h3>
            <p>Total Applications</p>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-hourglass-half text-warning"></i>
          <div class="sc-info">
            <h3>${pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-check-circle text-success"></i>
          <div class="sc-info">
            <h3>${accepted}</h3>
            <p>Accepted</p>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-times-circle text-danger"></i>
          <div class="sc-info">
            <h3>${rejected}</h3>
            <p>Rejected</p>
          </div>
        </div>
      </div>
    `;
  },

  renderManageApps: async (container) => {
    try {
      const res = await api.get('/applications/college');
      if (res.data.length === 0) {
        container.innerHTML = '<p>No applications received yet.</p>';
        return;
      }

      let rows = res.data.map(a => `
        <tr>
          <td>${a.Student.name}</td>
          <td>${a.Student.merit_score}%</td>
          <td>${a.program}</td>
          <td>${new Date(a.applied_at).toLocaleDateString()}</td>
          <td><span class="status-badge status-${a.status.toLowerCase()}">${a.status}</span></td>
          <td>
            ${a.status === 'Pending' ? `
              <button class="btn-success btn-sm" onclick="collegeApp.updateStatus('${a.application_id}', 'Accepted')"><i class="fas fa-check"></i></button>
              <button class="btn-danger btn-sm" onclick="collegeApp.updateStatus('${a.application_id}', 'Rejected')"><i class="fas fa-times"></i></button>
            ` : '-'}
          </td>
        </tr>
      `).join('');

      container.innerHTML = `
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Merit</th>
                <th>Program</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    } catch (error) {
      container.innerHTML = `<p class="error-state">${error.message}</p>`;
    }
  },

  updateStatus: async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      app.showToast(`Application ${status}`, 'success');
      app.navigate('manage-apps');
    } catch (error) {
      app.showToast(error.message, 'error');
    }
  },

  renderProfile: async (container) => {
    try {
      const u = app.currentUser;
      const res = await api.get(`/colleges/${u.college_id}`);
      const c = res.data;
      
      let progRows = c.CollegePrograms ? c.CollegePrograms.map(p => `
        <div style="display:flex; justify-content:space-between; padding:5px; border-bottom:1px solid #ccc; margin-bottom: 5px;">
          <span>${p.program_name}</span>
          <button class="btn-danger btn-sm" onclick="collegeApp.removeProgram('${c.college_id}', '${p.program_id}')"><i class="fas fa-trash"></i></button>
        </div>
      `).join('') : '';

      container.innerHTML = `
        <div class="dashboard-grid">
          <div class="form-container" style="margin: 0; flex: 2;">
            <h2>College Profile</h2>
            <form onsubmit="collegeApp.updateProfile(event, '${c.college_id}')">
              <div class="form-group">
                <label>Name</label><input type="text" id="prof-name" value="${c.name}" required />
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>City</label><input type="text" id="prof-city" value="${c.city}" required />
                </div>
                <div class="form-group">
                  <label>Type</label>
                  <select id="prof-type">
                    <option ${c.type === 'Public'?'selected':''}>Public</option>
                    <option ${c.type === 'Private'?'selected':''}>Private</option>
                  </select>
                </div>
              </div>
               <div class="form-row">
                <div class="form-group">
                  <label>Fee (Rs)</label><input type="number" id="prof-fee" value="${c.fee}" required />
                </div>
                <div class="form-group">
                  <label>Merit Cutoff (%)</label><input type="number" id="prof-merit" value="${c.merit_cutoff}" step="0.1" required />
                </div>
                <div class="form-group">
                  <label>Total Seats</label><input type="number" id="prof-seats" value="${c.seats}" required />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Latitude</label><input type="number" id="prof-lat" value="${c.latitude || ''}" step="0.0001" placeholder="e.g. 33.6461" />
                </div>
                <div class="form-group">
                  <label>Longitude</label><input type="number" id="prof-lng" value="${c.longitude || ''}" step="0.0001" placeholder="e.g. 73.0793" />
                </div>
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea id="prof-desc" rows="3">${c.description || ''}</textarea>
              </div>
              <button type="submit" class="btn-primary btn-full">Update Profile</button>
            </form>
          </div>
          <div class="form-container" style="margin: 0; flex: 1;">
            <h2>Programs Offered</h2>
            <div style="margin-bottom:1rem;">${progRows || '<p>No programs added.</p>'}</div>
            <form onsubmit="collegeApp.addProgram(event, '${c.college_id}')" style="display:flex; gap:10px;">
              <input type="text" id="new-prog" placeholder="e.g. BS CS" required style="flex:1;" />
              <button type="submit" class="btn-success"><i class="fas fa-plus"></i></button>
            </form>
          </div>
        </div>
      `;
    } catch(err) {
      container.innerHTML = `<p class="error-state">${err.message}</p>`;
    }
  },
  updateProfile: async (e, id) => {
    e.preventDefault();
    const body = {
      name: document.getElementById('prof-name').value,
      city: document.getElementById('prof-city').value,
      type: document.getElementById('prof-type').value,
      fee: document.getElementById('prof-fee').value,
      merit_cutoff: document.getElementById('prof-merit').value,
      seats: document.getElementById('prof-seats').value,
      description: document.getElementById('prof-desc').value,
      latitude: document.getElementById('prof-lat').value || null,
      longitude: document.getElementById('prof-lng').value || null,
    };
    try {
      await api.put(`/colleges/${id}`, body);
      app.showToast('Profile updated!', 'success');
      app.navigate('profile');
    } catch(err) {
      app.showToast(err.message, 'error');
    }
  },
  addProgram: async (e, id) => {
    e.preventDefault();
    const name = document.getElementById('new-prog').value;
    try {
      await api.post(`/colleges/${id}/programs`, { program_name: name });
      app.showToast('Program added!', 'success');
      app.navigate('profile');
    } catch(err) {
      app.showToast(err.message, 'error');
    }
  },
  removeProgram: async (cId, pId) => {
    if(!confirm('Delete this program?')) return;
    try {
      await api.delete(`/colleges/${cId}/programs/${pId}`);
      app.showToast('Program deleted', 'success');
      app.navigate('profile');
    } catch(e) {
      app.showToast(e.message, 'error');
    }
  },

  showTestSetup: false,

  enableTestSetup: () => {
    collegeApp.showTestSetup = true;
    app.navigate('manage-tests');
  },

  generateDemoQuestions: async () => {
    const demoQuestions = [
      {
        question_text: "What is the primary language used for web scripting?",
        option_a: "Python",
        option_b: "JavaScript",
        option_c: "C++",
        option_d: "Java",
        correct_answer: "B"
      },
      {
        question_text: "What does HTML stand for?",
        option_a: "Hyper Text Markup Language",
        option_b: "High Tech Modern Language",
        option_c: "Hyper Transfer Markup Link",
        option_d: "Home Tool Markup Language",
        correct_answer: "A"
      },
      {
        question_text: "Which of the following is a CSS framework?",
        option_a: "Django",
        option_b: "React",
        option_c: "Bootstrap",
        option_d: "Node.js",
        correct_answer: "C"
      }
    ];

    try {
      app.showToast('Generating demo questions...', 'info');
      for (const q of demoQuestions) {
        await api.post('/tests/questions', q);
      }
      app.showToast('Demo test generated successfully!', 'success');
      collegeApp.showTestSetup = true;
      app.navigate('manage-tests');
    } catch (err) {
      app.showToast(err.message, 'error');
    }
  },

  renderManageTests: async (container) => {
    try {
      const res = await api.get('/tests/my-questions');
      const questions = res.data;
      
      if (questions.length === 0 && !collegeApp.showTestSetup) {
        container.innerHTML = `
          <div class="form-container" style="max-width: 600px; margin: 40px auto; text-align: center; padding: 40px;">
            <i class="fas fa-clipboard-list" style="font-size: 5rem; color: var(--primary); margin-bottom: 20px;"></i>
            <h2>Admission Test Creator</h2>
            <p style="color: var(--text-muted); margin-bottom: 30px;">
              An admission test allows you to evaluate applicant students automatically. Create custom MCQs to filter eligible candidates.
            </p>
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
              <button class="btn-primary" onclick="collegeApp.enableTestSetup()">
                <i class="fas fa-plus"></i> Create Admission Test
              </button>
              <button class="btn-outline" onclick="collegeApp.generateDemoQuestions()">
                <i class="fas fa-magic"></i> Auto-Generate Demo Test
              </button>
            </div>
          </div>
        `;
        return;
      }

      let rows = questions.map((q, i) => `
        <tr>
          <td>${i+1}</td>
          <td>${q.question_text}</td>
          <td>${q.correct_answer}</td>
          <td><button class="btn-danger btn-sm" onclick="collegeApp.deleteQuestion('${q.question_id}')"><i class="fas fa-trash"></i></button></td>
        </tr>
      `).join('');

      container.innerHTML = `
        <div class="dashboard-grid">
          <div class="form-container" style="margin: 0; flex: 1;">
            <h2>Add New Question</h2>
            <form onsubmit="collegeApp.addQuestion(event)">
              <div class="form-group">
                <label>Question Text</label>
                <textarea id="q-text" rows="2" required></textarea>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Option A</label><input type="text" id="q-a" required /></div>
                <div class="form-group"><label>Option B</label><input type="text" id="q-b" required /></div>
              </div>
              <div class="form-row">
                <div class="form-group"><label>Option C</label><input type="text" id="q-c" required /></div>
                <div class="form-group"><label>Option D</label><input type="text" id="q-d" required /></div>
              </div>
              <div class="form-group">
                <label>Correct Option</label>
                <select id="q-correct">
                  <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                </select>
              </div>
              <button type="submit" class="btn-primary btn-full">Add Question</button>
            </form>
          </div>
          <div class="form-container" style="margin: 0; flex: 2; overflow-y:auto; max-height: 600px;">
            <h2>Existing Questions (${questions.length})</h2>
            ${questions.length === 0 ? '<p>No questions added yet.</p>' : `
              <table class="data-table">
                <thead><tr><th>#</th><th>Question</th><th>Ans</th><th>Act</th></tr></thead>
                <tbody>${rows}</tbody>
              </table>
            `}
          </div>
        </div>
      `;
    } catch(err) {
      container.innerHTML = `<p class="error-state">${err.message}</p>`;
    }
  },
  addQuestion: async (e) => {
    e.preventDefault();
    const body = {
      question_text: document.getElementById('q-text').value,
      option_a: document.getElementById('q-a').value,
      option_b: document.getElementById('q-b').value,
      option_c: document.getElementById('q-c').value,
      option_d: document.getElementById('q-d').value,
      correct_answer: document.getElementById('q-correct').value,
    };
    try {
      await api.post('/tests/questions', body);
      app.showToast('Question added', 'success');
      app.navigate('manage-tests');
    } catch(err) {
      app.showToast(err.message, 'error');
    }
  },
  deleteQuestion: async (id) => {
    if(!confirm('Delete this question?')) return;
    try {
      await api.delete(`/tests/questions/${id}`);
      app.showToast('Question deleted', 'success');
      app.navigate('manage-tests');
    } catch(e) {
      app.showToast(e.message, 'error');
    }
  },

  renderMessages: async (container) => {
    try {
      const [inboxRes, sentRes, appsRes] = await Promise.all([
        api.get('/messages/inbox'),
        api.get('/messages/sent'),
        api.get('/applications/college')
      ]);

      const inbox = inboxRes.data;
      const sent = sentRes.data;

      // Extract unique students from applications
      const students = [];
      const studentIds = new Set();
      appsRes.data.forEach(a => {
        if (a.Student && !studentIds.has(a.student_id)) {
          studentIds.add(a.student_id);
          students.push({ id: a.student_id, name: a.Student.name });
        }
      });

      let inboxHtml = inbox.map(m => `
        <div class="message-card ${m.is_read ? 'read' : 'unread'}" onclick="collegeApp.viewMessage('${m.message_id}', '${m.subject}', '${m.body}', '${m.sender_role}')" style="padding:15px; border-bottom:1px solid #eee; cursor:pointer;">
          <div style="display:flex; justify-content:space-between; margin-bottom:5px; flex-wrap:wrap; gap:8px;">
            <strong>Subject: ${m.subject}</strong>
            <small style="color:var(--text-muted);">${new Date(m.sent_at).toLocaleString()}</small>
          </div>
          <p style="margin:0; font-size:0.9rem; color:var(--text-muted);">${m.body.substring(0, 60)}...</p>
        </div>
      `).join('') || '<p style="padding:15px; color:var(--text-muted);">No incoming messages in inbox.</p>';

      let sentHtml = sent.map(m => `
        <div class="message-card read" style="padding:15px; border-bottom:1px solid #eee;">
          <div style="display:flex; justify-content:space-between; margin-bottom:5px; flex-wrap:wrap; gap:8px;">
            <strong>Subject: ${m.subject}</strong>
            <small style="color:var(--text-muted);">${new Date(m.sent_at).toLocaleString()}</small>
          </div>
          <p style="margin:0; font-size:0.9rem; color:var(--text-muted);">${m.body}</p>
        </div>
      `).join('') || '<p style="padding:15px; color:var(--text-muted);">No sent messages yet.</p>';

      const studentOptions = students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

      container.innerHTML = `
        <div class="dashboard-grid">
          <div class="form-container" style="margin:0; flex:1.5;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
              <h2>Message Center</h2>
              <div style="display:flex; gap:10px;">
                <button class="btn-primary btn-sm" onclick="collegeApp.toggleMessageTab('inbox')">Inbox</button>
                <button class="btn-outline btn-sm" onclick="collegeApp.toggleMessageTab('sent')">Sent</button>
              </div>
            </div>
            <div id="messages-inbox" class="messages-list-wrapper">${inboxHtml}</div>
            <div id="messages-sent" class="messages-list-wrapper hidden">${sentHtml}</div>
          </div>

          <div class="form-container" style="margin:0; flex:1;">
            <h2>Send Message to Applicant</h2>
            <form onsubmit="collegeApp.sendMessage(event)">
              <div class="form-group">
                <label>To Student</label>
                <select id="msg-student-id" required>
                  <option value="">Select Student</option>
                  ${studentOptions || '<option disabled>No current applicants</option>'}
                </select>
              </div>
              <div class="form-group">
                <label>Subject</label>
                <input type="text" id="msg-subject" placeholder="e.g. Interview Schedule" required />
              </div>
              <div class="form-group">
                <label>Message Body</label>
                <textarea id="msg-body" rows="6" placeholder="Type your message here..." required></textarea>
              </div>
              <button type="submit" class="btn-primary btn-full"><i class="fas fa-paper-plane"></i> Send Message</button>
            </form>
          </div>
        </div>
      `;
    } catch(err) {
      container.innerHTML = `<p class="error-state">${err.message}</p>`;
    }
  },

  toggleMessageTab: (tab) => {
    if (tab === 'inbox') {
      document.getElementById('messages-inbox').classList.remove('hidden');
      document.getElementById('messages-sent').classList.add('hidden');
    } else {
      document.getElementById('messages-inbox').classList.add('hidden');
      document.getElementById('messages-sent').classList.remove('hidden');
    }
  },

  sendMessage: async (e) => {
    e.preventDefault();
    const body = {
      receiver_id: document.getElementById('msg-student-id').value,
      receiver_role: 'student',
      subject: document.getElementById('msg-subject').value,
      body: document.getElementById('msg-body').value
    };
    try {
      await api.post('/messages', body);
      app.showToast('Message sent successfully!', 'success');
      collegeApp.renderMessages(document.getElementById('view-container'));
    } catch(err) {
      app.showToast(err.message, 'error');
    }
  },

  viewMessage: async (id, subject, body, role) => {
    app.showModal(`
      <div class="modal-header">
        <h2>${subject}</h2>
        <small style="color:var(--text-muted);">From: ${role.toUpperCase()}</small>
      </div>
      <div class="modal-body" style="padding-top:15px; line-height:1.5;">
        <p>${body}</p>
      </div>
    `);
    try {
      await api.put(`/messages/${id}/read`);
    } catch(err) {
      console.error(err);
    }
  },
  
  renderAnnouncements: async (container) => {
    try {
      const u = app.currentUser;
      const res = await api.get('/announcements');
      const announcements = res.data.filter(a => a.college_id === u.college_id || a.college_id === u.id);

      let rows = announcements.map((a, i) => `
        <div class="college-card" style="margin-bottom:1rem; flex-direction:column; align-items:start; padding: 15px; border-left: 4px solid var(--primary);">
          <div style="width:100%; display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px; flex-wrap:wrap; gap:8px;">
            <h3 style="margin:0; font-size:1.15rem;">${a.title}</h3>
            <button class="btn-danger btn-sm" onclick="collegeApp.deleteAnnouncement('${a.announcement_id}')" style="padding: 4px 8px;"><i class="fas fa-trash"></i></button>
          </div>
          <div>
            <p style="margin:0 0 8px 0; font-size:0.95rem; color:var(--text-main); line-height: 1.4;">${a.message}</p>
            <small style="color:var(--text-muted); font-size:0.8rem;"><i class="far fa-clock"></i> ${new Date(a.created_at).toLocaleString()}</small>
          </div>
        </div>
      `).join('');

      container.innerHTML = `
        <div class="dashboard-grid">
          <div class="form-container" style="margin:0; flex:1;">
            <h2>Post New Announcement</h2>
            <form onsubmit="collegeApp.addAnnouncement(event)">
              <div class="form-group">
                <label>Title</label>
                <input type="text" id="ann-title" placeholder="e.g. Admission Deadline Extended" required />
              </div>
              <div class="form-group">
                <label>Announcement Message</label>
                <textarea id="ann-message" rows="5" placeholder="Type message here..." required></textarea>
              </div>
              <button type="submit" class="btn-primary btn-full"><i class="fas fa-bullhorn"></i> Post Announcement</button>
            </form>
          </div>
          <div class="form-container" style="margin:0; flex:1.5; overflow-y:auto; max-height:600px;">
            <h2>Posted Announcements (${announcements.length})</h2>
            ${announcements.length === 0 ? '<p style="color:var(--text-muted);">No announcements posted yet. Broadcast updates to your applicants!</p>' : `<div style="display:flex; flex-direction:column; gap:10px;">${rows}</div>`}
          </div>
        </div>
      `;
    } catch(err) {
      container.innerHTML = `<p class="error-state">${err.message}</p>`;
    }
  },

  addAnnouncement: async (e) => {
    e.preventDefault();
    const body = {
      title: document.getElementById('ann-title').value,
      message: document.getElementById('ann-message').value
    };
    try {
      await api.post('/announcements', body);
      app.showToast('Announcement posted successfully!', 'success');
      app.navigate('announcements');
    } catch(err) {
      app.showToast(err.message, 'error');
    }
  },

  deleteAnnouncement: async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      app.showToast('Announcement deleted!', 'success');
      app.navigate('announcements');
    } catch(err) {
      app.showToast(err.message, 'error');
    }
  }
};
