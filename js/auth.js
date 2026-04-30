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
      loginOverlay.classList.add('hidden');
      document.body.style.overflow = 'auto';
      
      if (navLoginBtn) {
        if (session.type === 'admin') {
           navLoginBtn.innerHTML = '<i class="fas fa-user-shield"></i> Yönetim';
        } else if (session.type === 'business') {
           navLoginBtn.innerHTML = '<i class="fas fa-store"></i> İşletmem';
        } else {
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
          const session = JSON.parse(activeSession);
          if (session.type === 'admin') window.location.href = 'admin.html';
          else if (session.type === 'business') window.location.href = 'business.html';
          else window.location.href = 'profile.html';
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
    // These always read AFTER Firebase sync is done (isMythSyncing=false)
    function getUsers() {
      const usersStr = localStorage.getItem('myth_users');
      return usersStr ? JSON.parse(usersStr) : { students: {}, alumni: {} };
    }

    async function saveUsers(users) {
      // Direct Firebase write via mythDB — guaranteed to persist
      await window.mythDB.saveUsers(users);
    }

    // Wait for Firebase sync to complete before allowing any auth action
    // If already done, resolves immediately
    function whenDBReady(callback) {
      if (!window.isMythSyncing) {
        callback();
      } else {
        window.addEventListener('mythDBReady', callback, { once: true });
      }
    }

    function loginUser(type, identifier, venueId = null) {
      const sessionObj = { type, identifier };
      if (venueId) sessionObj.venueId = venueId;
      
      localStorage.setItem('myth_active_session', JSON.stringify(sessionObj));

      // Log event to Analytics
      if (window.analytics) {
        window.analytics.logEvent('login', { method: type, user_id: identifier });
      }
      
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
    const studentPassInput = document.getElementById('studentPass');
    const studentHelpText = document.getElementById('studentHelpText');
    const studentSubmitBtn = document.getElementById('studentSubmitBtn');

    if(studentIdInput) {
      studentIdInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (!val) {
          studentHelpText.style.display = 'none';
          studentSubmitBtn.textContent = 'Giriş Yap';
          return;
        }

        const users = getUsers();
        if (users.students[val]) {
          // Registered
          studentHelpText.style.display = 'none';
          studentSubmitBtn.textContent = 'Giriş Yap';
        } else {
          // Not Registered
          studentHelpText.style.display = 'block';
          studentHelpText.textContent = "Yeni kayıt için kartınızdaki şifreyi girin (Örn: 4567-03)";
          studentSubmitBtn.textContent = 'Kayıt Ol ve Giriş Yap';
        }
      });

      studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        whenDBReady(async () => {
          const studentId = studentIdInput.value.trim().toUpperCase();
          const pass = studentPassInput.value.trim().toUpperCase();
          const users = getUsers();

          if (users.students[studentId]) {
            // Existing student — login
            if (users.students[studentId].password === pass) {
              loginUser('student', studentId);
            } else {
              alert("Hatalı şifre. Lütfen kart numaranı kontrol edin.");
            }
          } else {
            // New student registration
            const pinRegex = /^[A-Z0-9]{4}-[A-Z0-9]{2}$/;
            if (!pinRegex.test(pass)) {
              alert("Lütfen kartınızın üzerindeki geçerli şifreyi girin (Örn: 4567-03).");
              return;
            }
            const availablePins = window.mythDB.getAvailablePins();
            if (availablePins.indexOf(pass) === -1) {
              alert("Bu şifre geçersiz veya zaten başka bir öğrenci tarafından kullanılmış.");
              return;
            }

            // EXTRA GUARANTEE: Check if any existing student already has this password
            const isPinUsed = Object.values(users.students).some(u => u.password === pass);
            if (isPinUsed) {
              alert("Bu şifre zaten bir hesapla eşleşmiş. Lütfen kendi kartınızdaki şifreyi kullanın.");
              // Clean up the available list if it was supposed to be gone
              window.mythDB.saveAvailablePins(availablePins.filter(p => p !== pass));
              return;
            }

            studentSubmitBtn.textContent = 'Kaydediliyor...';
            studentSubmitBtn.disabled = true;
            users.students[studentId] = { password: pass, registeredAt: new Date().toISOString() };
            // Await both saves before login so data is in Firebase before redirect
            await Promise.all([
              saveUsers(users),
              window.mythDB.saveAvailablePins(availablePins.filter(p => p !== pass))
            ]);
            loginUser('student', studentId);
          }
        });
      });
    }

    // --- Alumni Form Logic ---
    const alumniPhoneInput = document.getElementById('alumniPhone');
    const alumniPassInput = document.getElementById('alumniPass');
    const alumniHelpText = document.getElementById('alumniHelpText');
    const alumniSubmitBtn = document.getElementById('alumniSubmitBtn');

    if(alumniPhoneInput) {
      alumniPhoneInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (!val) {
          alumniHelpText.style.display = 'none';
          alumniSubmitBtn.textContent = 'Giriş Yap';
          return;
        }

        const users = getUsers();
        if (users.alumni[val]) {
          // Registered
          alumniHelpText.style.display = 'none';
          alumniSubmitBtn.textContent = 'Giriş Yap';
        } else {
          // Not Registered
          alumniHelpText.style.display = 'block';
          alumniSubmitBtn.textContent = 'Kayıt Ol ve Giriş Yap';
        }
      });

      alumniForm.addEventListener('submit', (e) => {
        e.preventDefault();
        whenDBReady(async () => {
          const phone = alumniPhoneInput.value.trim();
          const pass = alumniPassInput.value.trim();
          const users = getUsers();

          if (users.alumni[phone]) {
            if (users.alumni[phone].password === pass) {
              loginUser('alumni', phone);
            } else {
              alert("Hatalı şifre.");
            }
          } else {
            if (pass.length < 4) {
              alert("Şifreniz en az 4 haneli olmalıdır.");
              return;
            }
            alumniSubmitBtn.textContent = 'Kaydediliyor...';
            alumniSubmitBtn.disabled = true;
            users.alumni[phone] = { password: pass, registeredAt: new Date().toISOString() };
            await saveUsers(users);
            loginUser('alumni', phone);
          }
        });
      });
    }

    // --- Business Form Logic ---
    if(businessForm) {
      businessForm.addEventListener('submit', (e) => {
        e.preventDefault();
        whenDBReady(() => {
          const businessId = document.getElementById('businessId').value.trim();
          const pass = document.getElementById('businessPass').value.trim();
          const businesses = JSON.parse(localStorage.getItem('myth_businesses') || '{}');
          if (businesses[businessId] && businesses[businessId].password === pass) {
            loginUser('business', businessId, businesses[businessId].venueId);
          } else {
            alert('Hatalı İşletme Kullanıcı Adı veya Şifre.');
          }
        });
      });
    }

    // --- Admin Form Logic ---
    if(adminForm) {
      adminForm.addEventListener('submit', (e) => {
        e.preventDefault();
        whenDBReady(() => {
          const adminId = document.getElementById('adminId').value.trim();
          const pass = document.getElementById('adminPass').value.trim();
          const admins = JSON.parse(localStorage.getItem('myth_admins') || '{}');
          if (admins[adminId] && admins[adminId].password === pass) {
            loginUser('admin', adminId);
          } else {
            alert('Hatalı Yetkili Kullanıcı Adı veya Şifre.');
          }
        });
      });
    }

  });
})();
