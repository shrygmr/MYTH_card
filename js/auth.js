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
           navLoginBtn.onclick = () => window.location.href = 'admin.html';
        } else if (session.type === 'business') {
           navLoginBtn.innerHTML = '<i class="fas fa-store"></i> İşletmem';
           navLoginBtn.onclick = () => window.location.href = 'business.html';
        } else {
           navLoginBtn.innerHTML = '<i class="fas fa-user-circle"></i> Hesabım';
           navLoginBtn.onclick = () => window.location.href = 'profile.html';
        }
      }
    } else {
      loginOverlay.classList.add('hidden');
      document.body.style.overflow = 'auto'; 
      if (navLoginBtn) {
        navLoginBtn.innerHTML = '<i class="fas fa-user"></i> Giriş Yap';
        navLoginBtn.onclick = () => {
          loginOverlay.classList.remove('hidden');
          document.body.style.overflow = 'hidden';
        };
      }
    }

    loginOverlay.addEventListener('click', (e) => {
      if (e.target === loginOverlay) {
        loginOverlay.classList.add('hidden');
        document.body.style.overflow = 'auto';
      }
    });

    // Tab Switching
    const tabs = document.querySelectorAll('.login-tab');
    const studentForm  = document.getElementById('studentForm');
    const alumniForm   = document.getElementById('alumniForm');
    const businessForm = document.getElementById('businessForm');
    const adminForm    = document.getElementById('adminForm');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        if (studentForm)  studentForm.style.display  = 'none';
        if (alumniForm)   alumniForm.style.display    = 'none';
        if (businessForm) businessForm.style.display  = 'none';
        if (adminForm)    adminForm.style.display      = 'none';
        if (tab.dataset.tab === 'student'  && studentForm)  studentForm.style.display  = 'block';
        if (tab.dataset.tab === 'alumni'   && alumniForm)   alumniForm.style.display   = 'block';
        if (tab.dataset.tab === 'business' && businessForm) businessForm.style.display = 'block';
        if (tab.dataset.tab === 'admin'    && adminForm)    adminForm.style.display    = 'block';
      });
    });

    // ─── Helpers ────────────────────────────────────────────────────────────
    function getUsers() {
      return JSON.parse(localStorage.getItem('myth_users') || '{"students":{}, "alumni":{}}');
    }

    async function saveUsers(users) {
      await window.mythDB.saveUsers(users);
    }

    function whenDBReady(callback) {
      if (!window.isMythSyncing) { callback(); }
      else { window.addEventListener('mythDBReady', callback, { once: true }); }
    }

    function showError(formEl, msg) {
      let errEl = formEl.querySelector('.myth-auth-error');
      if (!errEl) {
        errEl = document.createElement('p');
        errEl.className = 'myth-auth-error';
        errEl.style.cssText = 'color:#e63946; font-size:0.85rem; margin-top:8px; text-align:center;';
        formEl.appendChild(errEl);
      }
      errEl.textContent = msg;
    }
    function clearError(formEl) {
      const errEl = formEl.querySelector('.myth-auth-error');
      if (errEl) errEl.textContent = '';
    }

    function loginUser(type, identifier, venueId = null) {
      const sessionObj = { type, identifier };
      if (venueId) sessionObj.venueId = venueId;
      localStorage.setItem('myth_active_session', JSON.stringify(sessionObj));
      if (window.analytics) window.analytics.logEvent('login', { method: type });
      if (type === 'admin')         { window.location.href = 'admin.html'; }
      else if (type === 'business') { window.location.href = 'business.html'; }
      else { loginOverlay.classList.add('hidden'); document.body.style.overflow = 'auto'; window.location.reload(); }
    }

    // ─── STUDENT FORM ────────────────────────────────────────────────────────
    const studentIdInput   = document.getElementById('studentId');
    const studentPassInput = document.getElementById('studentPass');
    const studentHelpText  = document.getElementById('studentHelpText');
    const studentSubmitBtn = document.getElementById('studentSubmitBtn');

    if (studentIdInput) {
      studentIdInput.addEventListener('input', (e) => {
        const val = e.target.value.trim().toUpperCase();
        if (!val) { studentHelpText.style.display = 'none'; studentSubmitBtn.textContent = 'Giriş Yap'; return; }
        const users = getUsers();
        if (users.students[val]) {
          studentHelpText.style.display = 'none';
          studentSubmitBtn.textContent  = 'Giriş Yap';
        } else {
          studentHelpText.style.display = 'block';
          studentHelpText.textContent   = 'Yeni kayıt için kartınızdaki şifreyi girin (Örn: 4567-03)';
          studentSubmitBtn.textContent  = 'Kayıt Ol ve Giriş Yap';
        }
      });

      studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearError(studentForm);
        whenDBReady(async () => {
          const studentId = studentIdInput.value.trim().toUpperCase();
          const pass      = studentPassInput.value.trim().toUpperCase();
          studentSubmitBtn.textContent = 'Bekleyin...';
          studentSubmitBtn.disabled = true;

          const users = getUsers();

          // ── DURUM 1: myth_users'ta kayıtlı ──
          if (users.students[studentId]) {
            if (users.students[studentId].password === pass) {
              loginUser('student', studentId);
            } else {
              showError(studentForm, 'Hatalı şifre. Lütfen kart numaranı kontrol edin.');
              studentSubmitBtn.textContent = 'Giriş Yap';
              studentSubmitBtn.disabled = false;
            }
            return;
          }

          // ── DURUM 2: myth_users'ta YOK — önce PIN formatı kontrolü ──
          const pinRegex = /^[A-Z0-9]{4}-[A-Z0-9]{2}$/;
          if (!pinRegex.test(pass)) {
            showError(studentForm, 'Lütfen kartınızın üzerindeki geçerli şifreyi girin (Örn: 4567-03).');
            studentSubmitBtn.textContent = 'Kayıt Ol ve Giriş Yap';
            studentSubmitBtn.disabled = false;
            return;
          }

          const availablePins = window.mythDB.getAvailablePins();

          // ── DURUM 3: PIN havuzda VAR → yeni kayıt ──
          if (availablePins.indexOf(pass) !== -1) {
            // Çift kullanım güvenliği: başka birinin şifresi mi?
            const isPinUsed = Object.values(users.students).some(u => u.password === pass);
            if (isPinUsed) {
              showError(studentForm, 'Bu şifre zaten bir hesapla eşleşmiş. Kendi kartınızdaki şifreyi kullanın.');
              window.mythDB.saveAvailablePins(availablePins.filter(p => p !== pass));
              studentSubmitBtn.textContent = 'Kayıt Ol ve Giriş Yap';
              studentSubmitBtn.disabled = false;
              return;
            }

            // Yeni kayıt
            users.students[studentId] = { password: pass, registeredAt: new Date().toISOString() };

            // defacto haritasından kod ata (varsa)
            try {
              const defactoMap = JSON.parse(localStorage.getItem('myth_defacto_map') || '{}');
              if (defactoMap[pass]) users.students[studentId].defactoCode = defactoMap[pass];
            } catch(e) {}

            await Promise.all([
              saveUsers(users),
              window.mythDB.saveAvailablePins(availablePins.filter(p => p !== pass))
            ]);

            if (window.analytics) window.analytics.logEvent('sign_up', { method: 'student' });
            loginUser('student', studentId);
            return;
          }

          // ── DURUM 4: PIN havuzda YOK — daha önce kayıt olmuş ama myth_users'a düşmemiş olabilir ──
          // Şifre eşleşmesi: myth_users'ta bu şifreyle kayıtlı başka biri var mı?
          const isPinUsedByOther = Object.values(users.students).some(u => u.password === pass);
          if (isPinUsedByOther) {
            showError(studentForm, 'Bu şifre zaten başka bir öğrenci numarasına kayıtlı.');
            studentSubmitBtn.textContent = 'Kayıt Ol ve Giriş Yap';
            studentSubmitBtn.disabled = false;
            return;
          }

          // PIN ne havuzda ne de başka birinde — bu kişi daha önce kayıt olmuş ama myth_users'a yazılamamış.
          // Kurtarma: Bu kişiyi sisteme ekle ve giriş yaptır.
          console.log('[MYTh] Kurtarma modu: myth_users dışında kalmış kullanıcı tespit edildi:', studentId);
          users.students[studentId] = {
            password:    pass,
            registeredAt: new Date().toISOString(),
            recoveredAt:  new Date().toISOString()
          };
          await saveUsers(users);
          loginUser('student', studentId);
        });
      });
    }

    // ─── ALUMNI FORM ─────────────────────────────────────────────────────────
    const alumniPhoneInput = document.getElementById('alumniPhone');
    const alumniPassInput  = document.getElementById('alumniPass');
    const alumniHelpText   = document.getElementById('alumniHelpText');
    const alumniSubmitBtn  = document.getElementById('alumniSubmitBtn');

    if (alumniPhoneInput) {
      alumniPhoneInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (!val) { alumniHelpText.style.display = 'none'; alumniSubmitBtn.textContent = 'Giriş Yap'; return; }
        const users = getUsers();
        if (users.alumni[val]) {
          alumniHelpText.style.display = 'none';
          alumniSubmitBtn.textContent  = 'Giriş Yap';
        } else {
          alumniHelpText.style.display = 'block';
          alumniSubmitBtn.textContent  = 'Kayıt Ol ve Giriş Yap';
        }
      });

      alumniForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearError(alumniForm);
        whenDBReady(async () => {
          const phone = alumniPhoneInput.value.trim();
          const pass  = alumniPassInput.value.trim();
          alumniSubmitBtn.textContent = 'Bekleyin...';
          alumniSubmitBtn.disabled = true;

          const users = getUsers();

          if (users.alumni[phone]) {
            if (users.alumni[phone].password === pass) {
              loginUser('alumni', phone);
            } else {
              showError(alumniForm, 'Hatalı şifre.');
              alumniSubmitBtn.textContent = 'Giriş Yap';
              alumniSubmitBtn.disabled = false;
            }
          } else {
            // Yeni kayıt
            if (pass.length < 4) {
              showError(alumniForm, 'Şifreniz en az 4 karakter olmalıdır.');
              alumniSubmitBtn.textContent = 'Kayıt Ol ve Giriş Yap';
              alumniSubmitBtn.disabled = false;
              return;
            }
            users.alumni[phone] = { password: pass, registeredAt: new Date().toISOString() };
            await saveUsers(users);
            if (window.analytics) window.analytics.logEvent('sign_up', { method: 'alumni' });
            loginUser('alumni', phone);
          }
        });
      });
    }

    // ─── BUSINESS FORM ───────────────────────────────────────────────────────
    if (businessForm) {
      businessForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearError(businessForm);
        whenDBReady(() => {
          const businessId = document.getElementById('businessId').value.trim();
          const pass       = document.getElementById('businessPass').value.trim();
          const businesses = JSON.parse(localStorage.getItem('myth_businesses') || '{}');
          if (businesses[businessId] && businesses[businessId].password === pass) {
            loginUser('business', businessId, businesses[businessId].venueId);
          } else {
            showError(businessForm, 'Hatalı İşletme Kullanıcı Adı veya Şifre.');
          }
        });
      });
    }

    // ─── ADMIN FORM ──────────────────────────────────────────────────────────
    if (adminForm) {
      adminForm.addEventListener('submit', (e) => {
        e.preventDefault();
        clearError(adminForm);
        whenDBReady(() => {
          const adminId = document.getElementById('adminId').value.trim();
          const pass    = document.getElementById('adminPass').value.trim();
          const admins  = JSON.parse(localStorage.getItem('myth_admins') || '{}');
          if (admins[adminId] && admins[adminId].password === pass) {
            loginUser('admin', adminId);
          } else {
            showError(adminForm, 'Hatalı Yetkili Kullanıcı Adı veya Şifre.');
          }
        });
      });
    }

  });
})();
