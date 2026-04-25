// =============================================
// MYTh Kart — Authentication & Registration
// =============================================

(function() {
  document.addEventListener('DOMContentLoaded', () => {
    const loginOverlay = document.getElementById('loginOverlay');
    if (!loginOverlay) return;

    // Check if user is already logged in
    const activeSession = localStorage.getItem('myth_active_session');
    const navLoginBtn = document.getElementById('navLoginBtn');

    if (activeSession) {
      const session = JSON.parse(activeSession);
      if (session.type === 'admin') {
        window.location.href = 'admin.html';
        return;
      } else if (session.type === 'business') {
        window.location.href = 'business.html';
        return;
      } else {
        loginOverlay.classList.add('hidden');
        document.body.style.overflow = 'auto';
        if (navLoginBtn) {
          navLoginBtn.innerHTML = '<i class="fas fa-user-circle"></i> Hesabım';
        }
      }
    } else {
      loginOverlay.classList.add('hidden');
      document.body.style.overflow = 'auto'; 
      if (navLoginBtn) {
        navLoginBtn.innerHTML = '<i class="fas fa-user"></i> Giriş Yap';
      }
    }

    if (navLoginBtn) {
      navLoginBtn.addEventListener('click', () => {
        if (activeSession) {
          // It's a student or alumni (others are redirected)
          window.location.href = 'profile.html';
        } else {
          loginOverlay.classList.remove('hidden');
          document.body.style.overflow = 'hidden';
        }
      });
    }

    // Add a close button logic for login overlay if they want to cancel login
    // Since we didn't add a close button to loginOverlay initially, we can just allow clicking outside
    loginOverlay.addEventListener('click', (e) => {
      if (e.target === loginOverlay) {
        loginOverlay.classList.add('hidden');
        document.body.style.overflow = 'auto';
      }
    });

    // Tab Switching
    const tabs = document.querySelectorAll('.login-tab');
    const studentForm = document.getElementById('studentForm');
    const alumniForm = document.getElementById('alumniForm');
    const businessForm = document.getElementById('businessForm');
    const adminForm = document.getElementById('adminForm');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        tab.classList.add('active');

        // Hide all forms
        studentForm.style.display = 'none';
        alumniForm.style.display = 'none';
        businessForm.style.display = 'none';
        adminForm.style.display = 'none';

        // Show active form
        if (tab.dataset.tab === 'student') studentForm.style.display = 'block';
        if (tab.dataset.tab === 'alumni') alumniForm.style.display = 'block';
        if (tab.dataset.tab === 'business') businessForm.style.display = 'block';
        if (tab.dataset.tab === 'admin') adminForm.style.display = 'block';
      });
    });

    // Database Mock using localStorage
    function getUsers() {
      const usersStr = localStorage.getItem('myth_users');
      return usersStr ? JSON.parse(usersStr) : { students: {}, alumni: {} };
    }

    function saveUsers(users) {
      localStorage.setItem('myth_users', JSON.stringify(users));
    }

    function loginUser(type, identifier, venueId = null) {
      const sessionObj = { type, identifier };
      if (venueId) sessionObj.venueId = venueId;
      
      localStorage.setItem('myth_active_session', JSON.stringify(sessionObj));
      
      if (type === 'admin') {
        window.location.href = 'admin.html';
      } else if (type === 'business') {
        window.location.href = 'business.html';
      } else {
        loginOverlay.classList.add('hidden');
        document.body.style.overflow = 'auto';
        window.location.reload(); // Reload to refresh user status across app
      }
    }

    // --- Student Form Logic ---
    const studentIdInput = document.getElementById('studentId');
    const studentCardGroup = document.getElementById('studentCardGroup');
    const studentCardNoInput = document.getElementById('studentCardNo');
    const studentSubmitBtn = document.getElementById('studentSubmitBtn');

    if(studentIdInput) {
      studentIdInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (!val) {
          studentCardGroup.style.display = 'none';
          studentSubmitBtn.textContent = 'Giriş Yap';
          studentCardNoInput.removeAttribute('required');
          return;
        }

        const users = getUsers();
        if (users.students[val]) {
          // Registered
          studentCardGroup.style.display = 'none';
          studentSubmitBtn.textContent = 'Giriş Yap';
          studentCardNoInput.removeAttribute('required');
        } else {
          // Not Registered
          studentCardGroup.style.display = 'block';
          studentSubmitBtn.textContent = 'Üyeliği Tamamla ve Giriş Yap';
          studentCardNoInput.setAttribute('required', 'true');
        }
      });

      studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const studentId = studentIdInput.value.trim();
        const users = getUsers();

        if (users.students[studentId]) {
          // Existing user login
          loginUser('student', studentId);
        } else {
          // New user registration
          const cardNo = studentCardNoInput.value.trim();
          if (!cardNo) {
            alert("Lütfen kart numaranızı girin.");
            return;
          }
          users.students[studentId] = { cardNo: cardNo, registeredAt: new Date().toISOString() };
          saveUsers(users);
          loginUser('student', studentId);
        }
      });
    }

    // --- Alumni Form Logic ---
    const alumniPhoneInput = document.getElementById('alumniPhone');
    const alumniCardGroup = document.getElementById('alumniCardGroup');
    const alumniCardNoInput = document.getElementById('alumniCardNo');
    const alumniSubmitBtn = document.getElementById('alumniSubmitBtn');

    if(alumniPhoneInput) {
      alumniPhoneInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (!val) {
          alumniCardGroup.style.display = 'none';
          alumniSubmitBtn.textContent = 'Giriş Yap';
          alumniCardNoInput.removeAttribute('required');
          return;
        }

        const users = getUsers();
        if (users.alumni[val]) {
          // Registered
          alumniCardGroup.style.display = 'none';
          alumniSubmitBtn.textContent = 'Giriş Yap';
          alumniCardNoInput.removeAttribute('required');
        } else {
          // Not Registered
          alumniCardGroup.style.display = 'block';
          alumniSubmitBtn.textContent = 'Üyeliği Tamamla ve Giriş Yap';
          alumniCardNoInput.setAttribute('required', 'true');
        }
      });

      alumniForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = alumniPhoneInput.value.trim();
        const users = getUsers();

        if (users.alumni[phone]) {
          // Existing user login
          loginUser('alumni', phone);
        } else {
          // New user registration
          const cardNo = alumniCardNoInput.value.trim();
          if (!cardNo) {
            alert("Lütfen kart numaranızı girin.");
            return;
          }
          users.alumni[phone] = { cardNo: cardNo, registeredAt: new Date().toISOString() };
          saveUsers(users);
          loginUser('alumni', phone);
        }
      });
    }

    // --- Business Form Logic ---
    if(businessForm) {
      businessForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const businessId = document.getElementById('businessId').value.trim();
        const pass = document.getElementById('businessPass').value.trim();
        
        const businesses = JSON.parse(localStorage.getItem('myth_businesses') || '{}');
        if (businesses[businessId] && businesses[businessId].password === pass) {
          loginUser('business', businessId, businesses[businessId].venueId);
        } else {
          alert('Hatalı İşletme Kullanıcı Adı veya Şifre.');
        }
      });
    }

    // --- Admin Form Logic ---
    if(adminForm) {
      adminForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const adminId = document.getElementById('adminId').value.trim();
        const pass = document.getElementById('adminPass').value.trim();
        
        const admins = JSON.parse(localStorage.getItem('myth_admins') || '{}');
        if (admins[adminId] && admins[adminId].password === pass) {
          loginUser('admin', adminId);
        } else {
          alert('Hatalı Yetkili Kullanıcı Adı veya Şifre.');
        }
      });
    }

  });
})();
