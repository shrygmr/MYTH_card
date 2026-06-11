// =============================================
// MYTh Kart — User Profile Logic
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const activeSession = localStorage.getItem('myth_active_session');
    if (!activeSession) {
        window.location.href = 'index.html';
        return;
    }
    const session = JSON.parse(activeSession);
    
    // Only student or alumni can access this panel
    if (session.type !== 'student' && session.type !== 'alumni') {
        window.location.href = 'index.html';
        return;
    }

    // ─── KULLANIM KOŞULLARI KONTROLÜ ─────────────────────────────────
    // Her kullanıcı için ayrı ayrı kontrol edilir (identifier bazlı)
    const identifier = session.identifier;
    const termsKey = `myth_terms_accepted_${identifier}`;
    
    if (!localStorage.getItem(termsKey)) {
        // İlk giriş: Modalı göster, sayfanın geri kalanını kilitle
        const modal = document.getElementById('termsModal');
        const checkbox = document.getElementById('termsCheckbox');
        const acceptBtn = document.getElementById('termsAcceptBtn');

        // body scroll kilitle
        document.body.style.overflow = 'hidden';
        modal.style.display = 'block';

        // Checkbox değişince butonu aktifleştir
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                acceptBtn.disabled = false;
                acceptBtn.style.opacity = '1';
                acceptBtn.style.cursor = 'pointer';
                acceptBtn.style.background = 'linear-gradient(135deg, #2563EB, #1D4ED8)';
                acceptBtn.style.boxShadow = '0 4px 20px rgba(37,99,235,0.4)';
            } else {
                acceptBtn.disabled = true;
                acceptBtn.style.opacity = '0.5';
                acceptBtn.style.cursor = 'not-allowed';
                acceptBtn.style.boxShadow = 'none';
            }
        });

        // Kabul butonuna basınca kaydet ve modalı kapat
        acceptBtn.addEventListener('click', () => {
            if (!checkbox.checked) return;
            localStorage.setItem(termsKey, JSON.stringify({
                acceptedAt: new Date().toISOString(),
                version: '1.0'
            }));
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    // ─────────────────────────────────────────────────────────────────
    document.getElementById('profileNameDisplay').textContent = identifier;
    
    const isStudent = session.type === 'student';
    document.getElementById('pUserType').textContent = isStudent ? 'Öğrenci' : 'Mezun';

    function loadProfileData() {
        const users = JSON.parse(localStorage.getItem('myth_users') || '{"students":{}, "alumni":{}}');
        const userGroup = isStudent ? users.students : users.alumni;
        
        // Find user with case-insensitive match just in case
        const cleanId = identifier.trim().toUpperCase();
        const userData = userGroup[cleanId] || userGroup[identifier];

        if (userData) {
            // Show PIN/Password as Card No for now, or use a custom cardNo if exists
            document.getElementById('pCardNo').textContent = userData.password || 'Bilinmiyor';
            
            if (userData.registeredAt) {
                const d = new Date(userData.registeredAt);
                document.getElementById('pRegDate').textContent = d.toLocaleDateString('tr-TR', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });
            } else {
                document.getElementById('pRegDate').textContent = 'Kayıtlı';
            }
            
            // DeFacto Code Logic (Talep Bazlı Havuz Sistemi)
            function refreshDefactoUI(currentUserData) {
                const dfClaimBtnArea = document.getElementById('dfClaimBtnArea');
                const dfCodeArea     = document.getElementById('dfCodeArea');
                const codeSpan       = document.getElementById('pDefactoCode');
                if (!dfClaimBtnArea || !dfCodeArea) return;

                if (currentUserData.defactoCode && currentUserData.defactoCode.trim() !== '') {
                    // User already has a code — show it
                    dfClaimBtnArea.style.display = 'none';
                    dfCodeArea.style.display = 'block';
                    if (codeSpan) codeSpan.textContent = currentUserData.defactoCode;
                } else {
                    // No code yet — check if pool has anything
                    const pool = window.mythDB.getDefactoPool ? window.mythDB.getDefactoPool() : [];
                    dfClaimBtnArea.style.display = 'flex';
                    dfClaimBtnArea.style.flexDirection = 'column';
                    dfClaimBtnArea.style.alignItems = 'center';
                    dfCodeArea.style.display = 'none';

                    const claimBtn = document.getElementById('claimDefactoBtn');
                    if (claimBtn) {
                        if (pool.length === 0) {
                            claimBtn.disabled = true;
                            claimBtn.style.opacity = '0.5';
                            claimBtn.style.cursor = 'not-allowed';
                            claimBtn.innerHTML = '<i class="fas fa-times-circle"></i> Kodlar Tükendi';
                        } else {
                            claimBtn.disabled = false;
                            claimBtn.style.opacity = '';
                            claimBtn.style.cursor = 'pointer';
                            claimBtn.innerHTML = '<i class="fas fa-ticket-alt"></i> Kod Talep Et';
                        }
                    }
                }
            }

            refreshDefactoUI(userData);

            // DeFacto Claim button handler
            const dfClaimBtn = document.getElementById('claimDefactoBtn');
            if (dfClaimBtn && !dfClaimBtn._listenerAdded) {
                dfClaimBtn._listenerAdded = true;
                dfClaimBtn.addEventListener('click', async () => {
                    // Re-read from DB to get fresh pool
                    const pool = window.mythDB.getDefactoPool ? window.mythDB.getDefactoPool() : [];
                    if (pool.length === 0) {
                        alert('Üzgünüz, tüm DeFacto kodları tükenmiştir.');
                        return;
                    }

                    dfClaimBtn.disabled = true;
                    dfClaimBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Atanıyor...';

                    // Take the first code from the pool (FIFO)
                    const assignedCode = pool.shift();

                    // Save updated pool
                    await window.mythDB.saveDefactoPool(pool);

                    // Save code to user record
                    const users = JSON.parse(localStorage.getItem('myth_users') || '{"students":{}, "alumni":{}}');
                    const session = JSON.parse(localStorage.getItem('myth_active_session') || '{}');
                    const userId = session.identifier;

                    if (users.students && users.students[userId]) {
                        users.students[userId].defactoCode = assignedCode;
                        users.students[userId].defactoClaimedAt = new Date().toISOString();
                        await window.mythDB.saveUsers(users);

                        // Update UI
                        userData.defactoCode = assignedCode;
                        refreshDefactoUI(userData);
                    }
                });
            }

            // Cookshop / Magnolia Code Logic (Talep Bazlı Havuz Sistemi)
            function refreshCookshopUI(currentUserData) {
                const csClaimBtnArea = document.getElementById('csClaimBtnArea');
                const csCodeArea     = document.getElementById('csCodeArea');
                const codeSpan       = document.getElementById('pCookshopCode');
                if (!csClaimBtnArea || !csCodeArea) return;

                if (currentUserData.cookshopCode && currentUserData.cookshopCode.trim() !== '') {
                    csClaimBtnArea.style.display = 'none';
                    csCodeArea.style.display = 'block';
                    if (codeSpan) codeSpan.textContent = currentUserData.cookshopCode;
                } else {
                    const pool = window.mythDB.getCookshopPool ? window.mythDB.getCookshopPool() : [];
                    csClaimBtnArea.style.display = 'flex';
                    csClaimBtnArea.style.flexDirection = 'column';
                    csClaimBtnArea.style.alignItems = 'center';
                    csCodeArea.style.display = 'none';

                    const claimBtn = document.getElementById('claimCookshopBtn');
                    if (claimBtn) {
                        if (pool.length === 0) {
                            claimBtn.disabled = true;
                            claimBtn.style.opacity = '0.5';
                            claimBtn.style.cursor = 'not-allowed';
                            claimBtn.innerHTML = '<i class="fas fa-times-circle"></i> Kodlar Tükendi';
                        } else {
                            claimBtn.disabled = false;
                            claimBtn.style.opacity = '';
                            claimBtn.style.cursor = 'pointer';
                            claimBtn.innerHTML = '<i class="fas fa-ticket-alt"></i> Kod Talep Et';
                        }
                    }
                }
            }

            refreshCookshopUI(userData);

            const csClaimBtn = document.getElementById('claimCookshopBtn');
            if (csClaimBtn && !csClaimBtn._listenerAdded) {
                csClaimBtn._listenerAdded = true;
                csClaimBtn.addEventListener('click', async () => {
                    const pool = window.mythDB.getCookshopPool ? window.mythDB.getCookshopPool() : [];
                    if (pool.length === 0) {
                        alert('Üzgünüz, tüm Cookshop kodları tükenmiştir.');
                        return;
                    }

                    csClaimBtn.disabled = true;
                    csClaimBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Atanıyor...';

                    const assignedCode = pool.shift();
                    
                    // Note: Ensure saveCookshopPool exists in data.js or fallback to localStorage
                    if(window.mythDB.saveCookshopPool) {
                        await window.mythDB.saveCookshopPool(pool);
                    } else {
                        localStorage.setItem('myth_cookshop_pool', JSON.stringify(pool));
                        if(window.saveToCloud) await window.saveToCloud('myth_cookshop_pool', pool);
                    }

                    const users = JSON.parse(localStorage.getItem('myth_users') || '{"students":{}, "alumni":{}}');
                    const session = JSON.parse(localStorage.getItem('myth_active_session') || '{}');
                    const userId = session.identifier;

                    if (users.students && users.students[userId]) {
                        users.students[userId].cookshopCode = assignedCode;
                        users.students[userId].cookshopClaimedAt = new Date().toISOString();
                        await window.mythDB.saveUsers(users);

                        userData.cookshopCode = assignedCode;
                        refreshCookshopUI(userData);
                    }
                });
            }

        } else {
            // Fallback if userData not found in the users list
            document.getElementById('pCardNo').textContent = 'Kayıtlı';
            document.getElementById('pRegDate').textContent = 'Kayıtlı';
        }
    }

    // Load after Firebase sync
    if (!window.isMythSyncing) {
        loadProfileData();
    } else {
        window.addEventListener('mythDBReady', loadProfileData, { once: true });
    }

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('myth_active_session');
        window.location.href = 'index.html';
    });

    // Sidebar Navigation
    const navBtns = document.querySelectorAll('.nav-btn');
    const modules = document.querySelectorAll('.admin-module');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const target = btn.dataset.target;
            modules.forEach(m => {
                m.classList.remove('active');
                if (m.id === target) m.classList.add('active');
            });

            if (target === 'dashboard') renderDashboard();
            if (target === 'myreviews') renderMyReviews();
            if (target === 'favorites') renderFavorites();
        });
    });

    // ---------------------------------------------
    // Digital Card & Gamification
    // ---------------------------------------------
    function updateDigitalCardAndBadges() {
        // Digital Card
        document.getElementById('dcName').textContent = identifier;
        document.getElementById('dcType').textContent = isStudent ? 'Öğrenci' : 'Mezun';
        document.getElementById('qrCodeImg').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MYTH-${identifier}`;

        // Gamification
        const allReviews = window.mythDB.getReviews();
        const myReviewsCount = allReviews.filter(r => r.realId === identifier).length;
        
        let badgesHtml = '';
        if (myReviewsCount >= 1) {
            badgesHtml += `<div style="background: var(--bg-input); padding: 10px 15px; border-radius: 20px; font-weight: 600;"><i class="fas fa-seedling" style="color: #10B981;"></i> Çaylak Yorumcu</div>`;
        }
        if (myReviewsCount >= 3) {
            badgesHtml += `<div style="background: var(--bg-input); padding: 10px 15px; border-radius: 20px; font-weight: 600;"><i class="fas fa-map-marked-alt" style="color: #3B82F6;"></i> MYTh Gezgini</div>`;
        }
        if (myReviewsCount >= 5) {
            badgesHtml += `<div style="background: var(--bg-input); padding: 10px 15px; border-radius: 20px; font-weight: 600;"><i class="fas fa-utensils" style="color: #F59E0B;"></i> Gurme</div>`;
        }
        
        if (myReviewsCount === 0) {
            badgesHtml = `<div style="color: var(--text-muted); font-size: 0.9rem;">İlk yorumunuzu yaparak rozet kazanmaya başlayın!</div>`;
        }

        document.getElementById('badgesContainer').innerHTML = badgesHtml;
    }

    // ---------------------------------------------
    // Dashboard Logic
    // ---------------------------------------------
    function renderDashboard() {
        const deals = window.mythDB.getDeals();
        const venues = window.mythDB.getVenues();
        const tbody = document.getElementById('pDealsTableBody');
        
        if (deals.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Şu an aktif bir fırsat bulunmuyor.</td></tr>`;
            return;
        }

        tbody.innerHTML = deals.map(d => {
            const venue = venues.find(v => v.id === d.venueId);
            const venueName = venue ? venue.name : 'Bilinmiyor';
            return `
                <tr>
                    <td><strong>${venueName}</strong></td>
                    <td>${d.title}</td>
                    <td>${d.description}</td>
                    <td>${d.validUntil}</td>
                </tr>
            `;
        }).join('');
    }

    // ---------------------------------------------
    // Reviews Logic
    // ---------------------------------------------
    function renderMyReviews() {
        // Find reviews matching this user's identifier
        const allReviews = window.mythDB.getReviews();
        const myReviews = allReviews.filter(r => r.realId === identifier);
        
        const venues = window.mythDB.getVenues();
        const tbody = document.getElementById('pReviewsTableBody');
        
        if (myReviews.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Henüz bir yorum yapmadınız.</td></tr>`;
            return;
        }

        tbody.innerHTML = myReviews.map(r => {
            const venue = venues.find(v => v.id === r.venueId);
            const venueName = venue ? venue.name : 'Silinmiş Mekan';
            return `
                <tr>
                    <td>${r.date}</td>
                    <td><strong style="color: var(--primary);">${venueName}</strong></td>
                    <td>${r.rating} ⭐</td>
                    <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;" title="${r.text}">${r.text}</td>
                    <td>
                        <button class="action-btn delete" onclick="deleteMyReview(${r.id})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    window.deleteMyReview = function(id) {
        if (confirm('Bu yorumunuzu silmek istediğinize emin misiniz?')) {
            let reviews = window.mythDB.getReviews();
            reviews = reviews.filter(r => r.id !== id);
            window.mythDB.saveReviews(reviews);
            renderMyReviews();
            updateDigitalCardAndBadges(); // update badges after deleting review
        }
    };

    // ---------------------------------------------
    // Favorites Logic
    // ---------------------------------------------
    function renderFavorites() {
        const usersData = JSON.parse(localStorage.getItem('myth_users') || '{"students":{}, "alumni":{}}');
        const userGrp = isStudent ? usersData.students : usersData.alumni;
        const uData = userGrp[identifier] || {};
        const favs = uData.favorites || [];

        const allVenues = window.mythDB.getVenues();
        const tbody = document.getElementById('pFavoritesTableBody');

        if (favs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Henüz favori mekanınız bulunmuyor. Ana sayfadan ❤️ butonunu kullanarak mekan ekleyebilirsiniz.</td></tr>`;
            return;
        }

        const favVenues = allVenues.filter(v => favs.includes(v.id));

        tbody.innerHTML = favVenues.map(v => `
            <tr>
                <td><strong>${v.name}</strong></td>
                <td>${v.category}</td>
                <td>%${v.discount}</td>
                <td>
                    <button class="action-btn delete" onclick="removeFavorite(${v.id})" title="Favorilerden Çıkar"><i class="fas fa-heart-broken"></i></button>
                </td>
            </tr>
        `).join('');
    }

    window.removeFavorite = function(venueId) {
        if (confirm('Mekanı favorilerinizden çıkarmak istediğinize emin misiniz?')) {
            const usersData = JSON.parse(localStorage.getItem('myth_users') || '{"students":{}, "alumni":{}}');
            const userGrp = isStudent ? usersData.students : usersData.alumni;
            if (userGrp[identifier] && userGrp[identifier].favorites) {
                userGrp[identifier].favorites = userGrp[identifier].favorites.filter(id => id !== venueId);
                localStorage.setItem('myth_users', JSON.stringify(usersData));
                renderFavorites();
            }
        }
    };

    // Init
    renderDashboard();
    renderMyReviews();
    renderFavorites();
    updateDigitalCardAndBadges();
});
