const studentApp = {
  renderView: async (viewId, container) => {
    try {
      if (viewId === 'home') await studentApp.renderHome(container);
      else if (viewId === 'browse') await studentApp.renderBrowse(container);
      else if (viewId === 'applications') await studentApp.renderApplications(container);
      else if (viewId === 'saved') await studentApp.renderSaved(container);
      else if (viewId === 'calculator') await studentApp.renderCalculator(container);
      else if (viewId === 'compare') await studentApp.renderCompare(container);
      else if (viewId === 'tests') await studentApp.renderTests(container);
      else if (viewId === 'announcements') await studentApp.renderAnnouncements(container);
      else if (viewId === 'messages') await studentApp.renderMessages(container);
      else if (viewId === 'profile') await studentApp.renderProfile(container);
      else container.innerHTML = '<h2>View not found</h2>';
    } catch (error) {
      container.innerHTML = `<div class="error-state"><i class="fas fa-exclamation-triangle"></i><p>${error.message}</p></div>`;
    }
  },

  renderHome: async (container) => {
    
    const [profileRes, appsRes, savedRes, eligibleRes] = await Promise.all([
      api.get('/students/profile'),
      api.get('/applications/mine'),
      api.get('/students/saved-colleges'),
      api.get('/students/eligible-colleges')
    ]);

    const user = profileRes.data;
    const merit = parseFloat(user.merit_score);

    container.innerHTML = `
      <div class="welcome-banner">
        <div>
          <h2>Welcome back, ${user.name}!</h2>
          <p>Your admission journey is on track.</p>
        </div>
        <div class="merit-badge">
          <span>Merit Score</span>
          <strong>${merit}%</strong>
        </div>
      </div>
      
      <div class="dashboard-grid">
        <div class="stat-card">
          <i class="fas fa-file-alt"></i>
          <div class="sc-info">
            <h3>${appsRes.data.length}</h3>
            <p>Applications Submitted</p>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-bookmark"></i>
          <div class="sc-info">
            <h3>${savedRes.data.length}</h3>
            <p>Saved Colleges</p>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-check-circle"></i>
          <div class="sc-info">
            <h3>${eligibleRes.data.length}</h3>
            <p>Eligible Colleges</p>
          </div>
        </div>
      </div>

      <div class="actions-row">
        <button class="btn-primary" onclick="app.navigate('browse')">Browse Colleges</button>
        <button class="btn-outline" onclick="app.navigate('applications')">My Applications</button>
        <button class="btn-outline" onclick="app.navigate('calculator')">Merit Calculator</button>
      </div>
    `;
  },

  renderBrowse: async (container) => {
    container.innerHTML = `
      <div class="filter-panel">
        <input type="text" id="browse-search" placeholder="Search by name..." />
        <select id="browse-city">
          <option value="">All Cities</option>
          <option>Lahore</option><option>Karachi</option><option>Islamabad</option><option>Peshawar</option>
        </select>
        <select id="browse-type">
          <option value="">All Types</option>
          <option>Public</option><option>Private</option>
        </select>
        <button class="btn-primary" onclick="studentApp.fetchAndRenderColleges()">Filter</button>
      </div>
      <div id="colleges-grid" class="cards-grid">
        <div class="spinner"></div>
      </div>
    `;
    await studentApp.fetchAndRenderColleges();
  },

  fetchAndRenderColleges: async () => {
    const search = document.getElementById('browse-search')?.value || '';
    const city = document.getElementById('browse-city')?.value || '';
    const type = document.getElementById('browse-type')?.value || '';
    
    let query = '?';
    if (search) query += `search=${search}&`;
    if (city) query += `city=${city}&`;
    if (type) query += `type=${type}&`;

    const res = await api.get(`/colleges${query}`);
    const grid = document.getElementById('colleges-grid');
    const merit = parseFloat(app.currentUser.merit_score || 0);

    if (res.data.length === 0) {
      grid.innerHTML = '<p>No colleges found matching your criteria.</p>';
      return;
    }

    grid.innerHTML = res.data.map(c => {
      const isEligible = merit >= parseFloat(c.merit_cutoff);
      return `
      <div class="college-card">
        <div class="cc-header">
          <h3>${c.name}</h3>
          <span class="badge ${c.type === 'Public' ? 'bg-primary' : 'bg-secondary'}">${c.type}</span>
        </div>
        <div class="cc-body">
          <p><i class="fas fa-map-marker-alt"></i> ${c.city}</p>
          <p><i class="fas fa-money-bill-wave"></i> Rs. ${c.fee.toLocaleString()}/yr</p>
          <p><i class="fas fa-chart-line"></i> Merit Cutoff: <strong>${c.merit_cutoff}%</strong></p>
          <p class="eligibility-status ${isEligible ? 'text-success' : 'text-danger'}">
            <i class="fas ${isEligible ? 'fa-check' : 'fa-times'}"></i> ${isEligible ? 'You are eligible' : 'Below cutoff'}
          </p>
        </div>
        <div class="cc-footer">
          <button class="btn-primary btn-sm" onclick="studentApp.viewCollegeDetails('${c.college_id}')">View Details</button>
          <button class="btn-outline btn-sm" onclick="studentApp.saveCollege('${c.college_id}')"><i class="fas fa-bookmark"></i></button>
        </div>
      </div>
    `}).join('');
  },

  viewCollegeDetails: async (id) => {
    try {
      const res = await api.get(`/colleges/${id}`);
      const c = res.data;
      
      const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${c.longitude-0.05},${c.latitude-0.05},${parseFloat(c.longitude)+0.05},${parseFloat(c.latitude)+0.05}&layer=mapnik&marker=${c.latitude},${c.longitude}`;

      const content = `
        <div class="modal-header">
          <h2>${c.name}</h2>
          <span class="badge ${c.type === 'Public' ? 'bg-primary' : 'bg-secondary'}">${c.type}</span>
        </div>
        <div class="modal-body college-details">
          <div class="cd-grid">
            <div>
              <h3>About</h3>
              <p>${c.description || 'No description available.'}</p>
              <ul class="cd-stats">
                <li><i class="fas fa-city"></i> City: ${c.city}</li>
                <li><i class="fas fa-users"></i> Seats: ${c.seats}</li>
                <li><i class="fas fa-money-bill"></i> Fee: Rs. ${c.fee.toLocaleString()}</li>
                <li><i class="fas fa-calendar-alt"></i> Deadline: ${c.deadline}</li>
                <li><i class="fas fa-chart-line"></i> Cutoff: ${c.merit_cutoff}%</li>
              </ul>
              
              <h3>Programs Offered</h3>
              <div class="programs-tags">
                ${c.CollegePrograms && c.CollegePrograms.length > 0 
                  ? c.CollegePrograms.map(p => `<span class="tag">${p.program_name}</span>`).join('')
                  : '<span>No programs listed</span>'}
              </div>
            </div>
            
            <div class="cd-map">
              <h3>Location</h3>
              <iframe width="100%" height="250" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="${mapUrl}"></iframe>
              <br/><small><a href="https://www.openstreetmap.org/?mlat=${c.latitude}&mlon=${c.longitude}#map=15/${c.latitude}/${c.longitude}" target="_blank">View Larger Map</a></small>
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="btn-primary" onclick="studentApp.applyToCollege('${c.college_id}')">Apply Now</button>
            <button class="btn-outline" onclick="studentApp.saveCollege('${c.college_id}')">Save College</button>
          </div>
        </div>
      `;
      app.showModal(content);
    } catch (error) {
      app.showToast('Failed to load details', 'error');
    }
  },

  applyToCollege: async (collegeId) => {
    const program = prompt("Enter the program name you are applying for (e.g., BS Computer Science):");
    if (!program) return;

    try {
      const res = await api.post('/applications', { college_id: collegeId, program });
      if (res.success) {
        app.showToast('Application submitted successfully!', 'success');
        app.closeModal();
      }
    } catch (error) {
      app.showToast(error.message, 'error');
    }
  },

  saveCollege: async (collegeId) => {
    try {
      const res = await api.post(`/students/saved-colleges/${collegeId}`);
      if (res.success) app.showToast('College saved!', 'success');
    } catch (error) {
      app.showToast(error.message, 'error');
    }
  },

  renderApplications: async (container) => {
    try {
      const res = await api.get('/applications/mine');
      if (res.data.length === 0) {
        container.innerHTML = '<p>You have not applied to any colleges yet.</p>';
        return;
      }

      let rows = res.data.map(app => `
        <tr>
          <td>${app.College.name}</td>
          <td>${app.program}</td>
          <td>${new Date(app.applied_at).toLocaleDateString()}</td>
          <td><span class="status-badge status-${app.status.toLowerCase()}">${app.status}</span></td>
          <td>
            ${app.status === 'Pending' ? `<button class="btn-danger btn-sm" onclick="studentApp.withdrawApp('${app.application_id}')">Withdraw</button>` : '-'}
          </td>
        </tr>
      `).join('');

      container.innerHTML = `
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>College</th>
                <th>Program</th>
                <th>Applied Date</th>
                <th>Status</th>
                <th>Action</th>
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

  withdrawApp: async (appId) => {
    if(!confirm('Are you sure you want to withdraw this application?')) return;
    try {
      await api.delete(`/applications/${appId}`);
      app.showToast('Application withdrawn', 'success');
      app.navigate('applications'); 
    } catch (error) {
      app.showToast(error.message, 'error');
    }
  },

  renderSaved: async (container) => {
    try {
      const res = await api.get('/students/saved-colleges');
      if (res.data.length === 0) {
        container.innerHTML = '<h2>Saved Colleges</h2><p>You have not saved any colleges yet.</p>';
        return;
      }
      const rows = res.data.map(c => {
        return `
          <div class="college-card" style="margin-bottom:1rem;">
            <div class="cc-header">
              <h3>${c.name}</h3>
              <span class="badge ${c.type === 'Public' ? 'bg-primary' : 'bg-secondary'}">${c.type}</span>
            </div>
            <div class="cc-body">
              <p><i class="fas fa-map-marker-alt"></i> ${c.city}</p>
              <p><i class="fas fa-money-bill-wave"></i> Rs. ${c.fee.toLocaleString()}/yr</p>
            </div>
            <div class="cc-footer">
              <button class="btn-primary btn-sm" onclick="studentApp.viewCollegeDetails('${c.college_id}')">View Details / Apply</button>
              <button class="btn-danger btn-sm" onclick="studentApp.unsaveCollege('${c.college_id}')"><i class="fas fa-trash"></i> Remove</button>
            </div>
          </div>
        `;
      }).join('');
      container.innerHTML = `<h2>Saved Colleges</h2><div class="cards-grid">${rows}</div>`;
    } catch(err) {
      container.innerHTML = `<p class="error-state">${err.message}</p>`;
    }
  },

  unsaveCollege: async (id) => {
    if(!confirm('Remove this college from saved list?')) return;
    try {
      await api.delete(`/students/saved-colleges/${id}`);
      app.showToast('Removed from saved', 'success');
      app.navigate('saved');
    } catch(e) {
      app.showToast(e.message, 'error');
    }
  },

  renderCalculator: async (container) => {
    container.innerHTML = `
      <div class="form-container" style="max-width: 500px; margin: 0 auto;">
        <h2>Merit Calculator</h2>
        <p>Calculate your standard merit (40% Matric, 60% FSc).</p>
        <div class="form-group">
          <label>Matric Marks (Out of 1100)</label>
          <input type="number" id="calc-matric" placeholder="e.g. 950" max="1100" />
        </div>
        <div class="form-group">
          <label>FSc Marks (Out of 1100)</label>
          <input type="number" id="calc-fsc" placeholder="e.g. 980" max="1100" />
        </div>
        <button class="btn-primary btn-full" onclick="studentApp.calculateMerit()">Calculate</button>
        <div id="calc-result" style="margin-top: 20px; font-size: 1.5rem; text-align: center; font-weight: bold;"></div>
      </div>
    `;
  },

  calculateMerit: () => {
    const matric = parseFloat(document.getElementById('calc-matric').value) || 0;
    const fsc = parseFloat(document.getElementById('calc-fsc').value) || 0;
    const merit = ((matric / 1100) * 40) + ((fsc / 1100) * 60);
    document.getElementById('calc-result').innerHTML = `Your Merit: <span class="text-primary">${merit.toFixed(2)}%</span>`;
  },

  renderCompare: async (container) => {
    try {
      const res = await api.get('/colleges');
      const options = res.data.map(c => `<option value="${c.college_id}">${c.name}</option>`).join('');
      
      studentApp.collegesData = res.data; 

      container.innerHTML = `
        <h2>Compare Colleges</h2>
        <div class="form-row">
          <div class="form-group">
            <label>College 1</label>
            <select id="comp-c1"><option value="">Select College</option>${options}</select>
          </div>
          <div class="form-group">
            <label>College 2</label>
            <select id="comp-c2"><option value="">Select College</option>${options}</select>
          </div>
        </div>
        <button class="btn-primary" onclick="studentApp.doCompare()">Compare</button>
        <div id="compare-result" style="margin-top: 2rem;"></div>
      `;
    } catch(err) {
      container.innerHTML = `<p class="error-state">${err.message}</p>`;
    }
  },

  doCompare: () => {
    const id1 = document.getElementById('comp-c1').value;
    const id2 = document.getElementById('comp-c2').value;
    if(!id1 || !id2) return app.showToast('Please select both colleges', 'error');
    
    const c1 = studentApp.collegesData.find(c => c.college_id === id1);
    const c2 = studentApp.collegesData.find(c => c.college_id === id2);

    document.getElementById('compare-result').innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Feature</th>
            <th>${c1.name}</th>
            <th>${c2.name}</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>City</td><td>${c1.city}</td><td>${c2.city}</td></tr>
          <tr><td>Type</td><td>${c1.type}</td><td>${c2.type}</td></tr>
          <tr><td>Fee (Annual)</td><td>Rs. ${c1.fee.toLocaleString()}</td><td>Rs. ${c2.fee.toLocaleString()}</td></tr>
          <tr><td>Merit Cutoff</td><td>${c1.merit_cutoff}%</td><td>${c2.merit_cutoff}%</td></tr>
          <tr><td>Seats</td><td>${c1.seats}</td><td>${c2.seats}</td></tr>
        </tbody>
      </table>
    `;
  },

  renderTests: async (container) => {
    try {
      const [appsRes, resultsRes] = await Promise.all([
        api.get('/applications/mine'),
        api.get('/tests/results/mine')
      ]);

      const testApps = appsRes.data.filter(a => a.status === 'Pending' || a.status === 'Test Failed' || a.status === 'Test Passed');
      const results = resultsRes.data;

      if(testApps.length === 0) {
         container.innerHTML = '<h2>Admission Tests</h2><p>Apply to a college first to take its admission test.</p>';
         return;
      }
      
      let html = '<h2>Admission Tests</h2><div class="cards-grid">';
      testApps.forEach(a => {
         const result = results.find(r => r.college_id === a.college_id);
         const hasTaken = !!result;
         
         html += `
           <div class="college-card">
             <div class="cc-header"><h3>${a.College.name}</h3></div>
             <div class="cc-body">
               <p>Application: <strong>${a.status}</strong></p>
               <p>Program: ${a.program}</p>
               ${hasTaken ? `<p>Test Result: <strong class="${result.passed ? 'text-success' : 'text-danger'}">${result.passed ? 'PASSED' : 'FAILED'}</strong> (${result.score}/${result.total})</p>` : '<p>Test status: <strong>Not Taken</strong></p>'}
             </div>
             <div class="cc-footer">
               ${!hasTaken ? `<button class="btn-primary btn-sm" onclick="studentApp.startTest('${a.college_id}', '${a.application_id}')">Take Test</button>` : `<button class="btn-secondary btn-sm" disabled>Completed</button>`}
             </div>
           </div>
         `;
      });
      html += '</div>';
      container.innerHTML = html;
    } catch(err) {
      container.innerHTML = `<p class="error-state">${err.message}</p>`;
    }
  },

  startTest: async (collegeId, appId) => {
    try {
      const res = await api.get(`/tests/${collegeId}/questions`);
      const questions = res.data;
      if(questions.length === 0) return app.showToast('No questions available for this college', 'error');

      studentApp.currentTest = { collegeId, appId, questions };
      let qHtml = questions.map((q, i) => `
        <div class="form-group" style="margin-bottom:1.5rem;">
          <p><strong>Q${i+1}: ${q.question_text}</strong></p>
          <div><input type="radio" name="q_${q.question_id}" value="A" required> A. ${q.option_a}</div>
          <div><input type="radio" name="q_${q.question_id}" value="B" required> B. ${q.option_b}</div>
          <div><input type="radio" name="q_${q.question_id}" value="C" required> C. ${q.option_c}</div>
          <div><input type="radio" name="q_${q.question_id}" value="D" required> D. ${q.option_d}</div>
        </div>
      `).join('');
      
      const content = `
        <div class="modal-header"><h2>Admission Test</h2></div>
        <div class="modal-body">
          <form id="test-form" onsubmit="studentApp.submitTest(event)">
            ${qHtml}
            <button type="submit" class="btn-primary">Submit Test</button>
          </form>
        </div>
      `;
      app.showModal(content);
    } catch(err) {
      app.showToast(err.message, 'error');
    }
  },

  submitTest: async (e) => {
    e.preventDefault();
    const t = studentApp.currentTest;
    const form = document.getElementById('test-form');
    
    const answers = {};
    t.questions.forEach(q => {
      const selected = form.querySelector(`input[name="q_${q.question_id}"]:checked`);
      answers[q.question_id] = selected ? selected.value : '';
    });
    
    try {
      await api.post(`/tests/${t.collegeId}/submit`, { application_id: t.appId, answers });
      app.showToast('Test submitted successfully!', 'success');
      app.closeModal();
      app.navigate('tests');
    } catch(err) {
      app.showToast(err.message, 'error');
    }
  },

  renderProfile: async (container) => {
    try {
      const res = await api.get('/students/profile');
      const u = res.data;
      const currentAvatar = u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150';

      container.innerHTML = `
        <div class="form-container" style="max-width: 600px; margin: 0 auto;">
          <h2>My Profile</h2>
          <form onsubmit="studentApp.updateProfile(event)">
            
            <!-- Avatar Section -->
            <div style="text-align: center; margin-bottom: 2rem;">
              <img id="avatar-preview" src="${currentAvatar}" style="width: 110px; height: 110px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary); margin-bottom: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" />
              <div class="form-group" style="max-width: 400px; margin: 0 auto;">
                <label>Profile Picture URL</label>
                <input type="text" id="prof-avatar" value="${u.avatar_url || ''}" placeholder="Paste any image URL" oninput="document.getElementById('avatar-preview').src = this.value || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150'" />
              </div>
              <div style="margin-top: 10px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
                <span style="font-size: 0.9rem; color: var(--text-muted); align-self: center;">Presets:</span>
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150" style="width: 40px; height: 40px; border-radius: 50%; cursor: pointer; border: 2px solid #ddd;" onclick="document.getElementById('prof-avatar').value = this.src; document.getElementById('avatar-preview').src = this.src;" />
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150" style="width: 40px; height: 40px; border-radius: 50%; cursor: pointer; border: 2px solid #ddd;" onclick="document.getElementById('prof-avatar').value = this.src; document.getElementById('avatar-preview').src = this.src;" />
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150" style="width: 40px; height: 40px; border-radius: 50%; cursor: pointer; border: 2px solid #ddd;" onclick="document.getElementById('prof-avatar').value = this.src; document.getElementById('avatar-preview').src = this.src;" />
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150" style="width: 40px; height: 40px; border-radius: 50%; cursor: pointer; border: 2px solid #ddd;" onclick="document.getElementById('prof-avatar').value = this.src; document.getElementById('avatar-preview').src = this.src;" />
              </div>
            </div>

            <div class="form-group">
              <label>Name</label><input type="text" id="prof-name" value="${u.name}" required />
            </div>
            <div class="form-group">
              <label>Phone</label><input type="text" id="prof-phone" value="${u.phone}" required />
            </div>
            <div class="form-group">
              <label>City</label><input type="text" id="prof-city" value="${u.city}" required />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Matric Marks</label><input type="number" id="prof-matric" value="${u.matric_marks}" max="1100" required />
              </div>
              <div class="form-group">
                <label>FSc Marks</label><input type="number" id="prof-fsc" value="${u.fsc_marks}" max="1100" required />
              </div>
            </div>
            <button type="submit" class="btn-primary btn-full">Update Profile</button>
          </form>
        </div>
      `;
    } catch(err) {
      container.innerHTML = `<p class="error-state">${err.message}</p>`;
    }
  },

  updateProfile: async (e) => {
    e.preventDefault();
    const body = {
      name: document.getElementById('prof-name').value,
      phone: document.getElementById('prof-phone').value,
      city: document.getElementById('prof-city').value,
      matric_marks: document.getElementById('prof-matric').value,
      fsc_marks: document.getElementById('prof-fsc').value,
      avatar_url: document.getElementById('prof-avatar').value || null,
    };
    try {
      await api.put('/students/profile', body);
      app.showToast('Profile updated!', 'success');
      app.navigate('profile');
    } catch(err) {
      app.showToast(err.message, 'error');
    }
  },

  renderAnnouncements: async (container) => {
    try {
      const res = await api.get('/announcements');
      const announcements = res.data;

      let html = '<h2>Colleges Announcements</h2>';
      if (announcements.length === 0) {
        html += '<p>No announcements from colleges yet.</p>';
      } else {
        html += '<div style="display:flex; flex-direction:column; gap:15px; max-width:800px; margin:0 auto;">';
        announcements.forEach(a => {
          html += `
            <div class="college-card" style="flex-direction:column; align-items:start; padding: 20px; border-left: 5px solid var(--primary); background: var(--bg-card);">
              <div style="width:100%; display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:10px;">
                <h3 style="margin:0; font-size:1.25rem; color:var(--text-main);">${a.title}</h3>
                <span class="badge bg-primary" style="font-size:0.8rem; padding: 4px 8px;"><i class="fas fa-university"></i> ${a.College ? a.College.name : 'College'}</span>
              </div>
              <p style="margin:0 0 12px 0; color:var(--text-main); line-height: 1.5; font-size: 0.95rem;">${a.message}</p>
              <div style="width:100%; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                <small style="color:var(--text-muted);"><i class="far fa-clock"></i> ${new Date(a.created_at).toLocaleString()}</small>
                <small style="color:var(--text-muted);"><i class="fas fa-map-marker-alt"></i> ${a.College ? a.College.city : ''}</small>
              </div>
            </div>
          `;
        });
        html += '</div>';
      }
      container.innerHTML = html;
    } catch(err) {
      container.innerHTML = `<p class="error-state">${err.message}</p>`;
    }
  },

  renderMessages: async (container) => {
    container.innerHTML = `
      <div class="form-container" style="max-width: 600px; margin: 0 auto; text-align: center; padding: 40px;">
        <i class="fas fa-envelope-open-text" style="font-size: 4rem; color: var(--primary); margin-bottom: 20px;"></i>
        <h2>Internal Messaging System</h2>
        <p style="color: var(--text-muted); margin-bottom: 20px;">The messaging and communication module is currently disabled for maintenance. Students and colleges will be notified once the upgraded chat system is deployed.</p>
        <button class="btn-primary" onclick="app.navigate('home')">Return to Overview</button>
      </div>
    `;
  }
};
