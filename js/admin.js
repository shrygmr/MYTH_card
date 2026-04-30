// =============================================
// MYTh Kart — Admin Panel Logic
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const activeSession = localStorage.getItem('myth_active_session');
    if (!activeSession) {
        window.location.href = 'index.html';
        return;
    }
    const session = JSON.parse(activeSession);
    if (session.type !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    // Set Admin Name
    const admins = JSON.parse(localStorage.getItem('myth_admins') || '{}');
    if (admins[session.identifier]) {
        document.getElementById('adminNameDisplay').textContent = admins[session.identifier].name;
    }

    // Only sahra.admin can see the Users tab
    const isSuperAdmin = session.identifier === 'sahra.admin';
    if (isSuperAdmin) {
        document.getElementById('navUsersBtn').style.display = 'flex';
    }

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('myth_active_session');
        window.location.href = 'index.html';
    });

    // Wait for Firebase sync before any DB operations
    function whenDBReady(cb) {
        if (!window.isMythSyncing) { cb(); }
        else { window.addEventListener('mythDBReady', cb, { once: true }); }
    }

    // Re-render all tables once Firebase data arrives
    window.addEventListener('mythDBReady', () => {
        renderDashboard();
        renderVenuesTable();
        renderDealsTable();
        renderReviewsTable();
        if (isSuperAdmin) renderUsersTable();
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

            // Re-render active module
            if (target === 'dashboard') renderDashboard();
            if (target === 'venues') renderVenuesTable();
            if (target === 'deals') renderDealsTable();
            if (target === 'reviews') renderReviewsTable();
            if (target === 'users') {
                if (isSuperAdmin) renderUsersTable();
                else { window.location.href = 'admin.html'; }
            }
        });
    });

    // ---------------------------------------------
    // Dashboard Logic
    // ---------------------------------------------
    function renderDashboard() {
        const venues = window.mythDB.getVenues();
        const deals = window.mythDB.getDeals();
        const reviews = window.mythDB.getReviews();

        document.getElementById('statVenuesCount').textContent = window.isMythSyncing ? '...' : venues.length;
        document.getElementById('statDealsCount').textContent = window.isMythSyncing ? '...' : deals.length;
        document.getElementById('statReviewsCount').textContent = window.isMythSyncing ? '...' : reviews.length;
    }

    // ---------------------------------------------
    // Venues Logic
    // ---------------------------------------------
    const venueModal = document.getElementById('venueModal');
    const venueForm = document.getElementById('venueForm');
    let isEditingVenue = false;

    function renderVenuesTable() {
        const venues = window.mythDB.getVenues();
        const tbody = document.getElementById('venuesTableBody');
        
        if (window.isMythSyncing) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Bulut verileri senkronize ediliyor...</td></tr>';
            return;
        }

        tbody.innerHTML = venues.map(v => `
            <tr>
                <td>#${v.id}</td>
                <td><strong>${v.name}</strong></td>
                <td>${v.category}</td>
                <td>${v.region}</td>
                <td>${v.discount && v.discount.toString().includes('%') ? v.discount : '%' + v.discount}</td>
                <td>
                    <button class="action-btn edit" onclick="editVenue(${v.id})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="deleteVenue(${v.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');

        // Populate venue select in Deal Modal
        const dVenueSelect = document.getElementById('dVenueId');
        dVenueSelect.innerHTML = venues.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
    }

    document.getElementById('openAddVenueModal').addEventListener('click', () => {
        isEditingVenue = false;
        venueForm.reset();
        document.getElementById('vId').value = '';
        venueModal.classList.remove('hidden');
    });

    document.getElementById('closeVenueModal').addEventListener('click', () => {
        venueModal.classList.add('hidden');
    });

    venueForm.addEventListener('submit', (e) => {
        e.preventDefault();
        whenDBReady(async () => {
            const submitBtn = venueForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Kaydediliyor...';
            submitBtn.disabled = true;

            const venues = window.mythDB.getVenues();
            
            const venueData = {
                id: isEditingVenue ? parseInt(document.getElementById('vId').value) : Date.now(),
                name: document.getElementById('vName').value,
                category: document.getElementById('vCategory').value,
                region: document.getElementById('vRegion').value,
                discount: document.getElementById('vDiscount').value,
                lat: parseFloat(document.getElementById('vLat').value),
                lng: parseFloat(document.getElementById('vLng').value),
                address: document.getElementById('vAddress').value,
                description: document.getElementById('vDesc').value,
                popular: false,
                isNew: !isEditingVenue
            };

            if (isEditingVenue) {
                const index = venues.findIndex(v => v.id === venueData.id);
                if (index !== -1) {
                    venueData.popular = venues[index].popular;
                    venueData.isNew = venues[index].isNew;
                    venues[index] = venueData;
                }
            } else {
                venues.push(venueData);
            }

            // AWAIT the Firebase write — modal stays open until data is confirmed saved
            await window.mythDB.saveVenues(venues);

            submitBtn.textContent = 'Kaydet';
            submitBtn.disabled = false;
            venueModal.classList.add('hidden');
            renderVenuesTable();
            renderDashboard();
        });
    });

    window.editVenue = function(id) {
        const venues = window.mythDB.getVenues();
        const venue = venues.find(v => v.id === id);
        if (venue) {
            isEditingVenue = true;
            document.getElementById('vId').value = venue.id;
            document.getElementById('vName').value = venue.name;
            document.getElementById('vCategory').value = venue.category;
            document.getElementById('vRegion').value = venue.region;
            document.getElementById('vDiscount').value = venue.discount;
            document.getElementById('vLat').value = venue.lat;
            document.getElementById('vLng').value = venue.lng;
            document.getElementById('vAddress').value = venue.address;
            document.getElementById('vDesc').value = venue.description;
            venueModal.classList.remove('hidden');
        }
    };

    window.deleteVenue = function(id) {
        if (confirm('Bu mekanı silmek istediğinize emin misiniz?')) {
            let venues = window.mythDB.getVenues();
            venues = venues.filter(v => v.id !== id);
            window.mythDB.saveVenues(venues);
            renderVenuesTable();
            renderDashboard();
        }
    };

    // ---------------------------------------------
    // Deals Logic
    // ---------------------------------------------
    const dealModal = document.getElementById('dealModal');
    const dealForm = document.getElementById('dealForm');
    let isEditingDeal = false;

    function renderDealsTable() {
        const deals = window.mythDB.getDeals();
        const venues = window.mythDB.getVenues();
        const tbody = document.getElementById('dealsTableBody');
        
        tbody.innerHTML = deals.map(d => {
            const venue = venues.find(v => v.id === d.venueId);
            const venueName = venue ? venue.name : 'Silinmiş Mekan';
            return `
                <tr>
                    <td>#${d.id}</td>
                    <td><strong>${venueName}</strong></td>
                    <td>${d.title}</td>
                    <td>${d.validUntil}</td>
                    <td>
                        <button class="action-btn edit" onclick="editDeal(${d.id})"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete" onclick="deleteDeal(${d.id})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    document.getElementById('openAddDealModal').addEventListener('click', () => {
        isEditingDeal = false;
        dealForm.reset();
        document.getElementById('dId').value = '';
        dealModal.classList.remove('hidden');
    });

    document.getElementById('closeDealModal').addEventListener('click', () => {
        dealModal.classList.add('hidden');
    });

    dealForm.addEventListener('submit', (e) => {
        e.preventDefault();
        whenDBReady(async () => {
            const submitBtn = dealForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Kaydediliyor...';
            submitBtn.disabled = true;

            const deals = window.mythDB.getDeals();
            const dealData = {
                id: isEditingDeal ? parseInt(document.getElementById('dId').value) : Date.now(),
                venueId: parseInt(document.getElementById('dVenueId').value),
                title: document.getElementById('dTitle').value,
                type: document.getElementById('dType').value,
                validUntil: document.getElementById('dValidUntil').value,
                description: document.getElementById('dDesc').value
            };

            if (isEditingDeal) {
                const index = deals.findIndex(d => d.id === dealData.id);
                if (index !== -1) deals[index] = dealData;
            } else {
                deals.push(dealData);
            }

            await window.mythDB.saveDeals(deals);

            submitBtn.textContent = 'Kaydet';
            submitBtn.disabled = false;
            dealModal.classList.add('hidden');
            renderDealsTable();
            renderDashboard();
        });
    });

    window.editDeal = function(id) {
        const deals = window.mythDB.getDeals();
        const deal = deals.find(d => d.id === id);
        if (deal) {
            isEditingDeal = true;
            document.getElementById('dId').value = deal.id;
            document.getElementById('dVenueId').value = deal.venueId;
            document.getElementById('dTitle').value = deal.title;
            document.getElementById('dType').value = deal.type;
            document.getElementById('dValidUntil').value = deal.validUntil;
            document.getElementById('dDesc').value = deal.description;
            dealModal.classList.remove('hidden');
        }
    };

    window.deleteDeal = function(id) {
        if (confirm('Bu fırsatı silmek istediğinize emin misiniz?')) {
            let deals = window.mythDB.getDeals();
            deals = deals.filter(d => d.id !== id);
            window.mythDB.saveDeals(deals);
            renderDealsTable();
            renderDashboard();
        }
    };

    // ---------------------------------------------
    // Reviews Logic
    // ---------------------------------------------
    function renderReviewsTable() {
        const reviews = window.mythDB.getReviews();
        const venues = window.mythDB.getVenues();
        const tbody = document.getElementById('reviewsTableBody');
        
        tbody.innerHTML = reviews.map(r => {
            const venue = venues.find(v => v.id === r.venueId);
            const venueName = venue ? venue.name : 'Silinmiş Mekan';
            
            // Re-fetch real author name by finding matching masked name logic in users
            // Since we didn't save the real identifier in the review object, let's just 
            // display the "author" as saved. In a real backend, we'd have the user ID.
            // But we stored masked name. To satisfy the prompt "Yetkililer gerçek kimliği görebilmeli", 
            // wait, we should have saved the real identifier.
            // Since we can't change past reviews, we'll display what we have, but we will update reviews.js to save realId!
            const realId = r.realId ? r.realId : r.author;

            return `
                <tr>
                    <td>${r.date}</td>
                    <td>${venueName}</td>
                    <td><strong style="color: var(--primary);">${realId}</strong></td>
                    <td>${r.rating} ⭐</td>
                    <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${r.text}">${r.text}</td>
                    <td>
                        <button class="action-btn delete" onclick="deleteReview(${r.id})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    window.deleteReview = function(id) {
        if (confirm('Bu yorumu silmek istediğinize emin misiniz?')) {
            let reviews = window.mythDB.getReviews();
            reviews = reviews.filter(r => r.id !== id);
            window.mythDB.saveReviews(reviews);
            renderReviewsTable();
            renderDashboard();
        }
    };

    // ---------------------------------------------
    // Users Logic
    // ---------------------------------------------
    function renderUsersTable() {
        // Force refresh from mythDB to ensure we see fresh Firebase data
        const users = window.mythDB.getUsers ? window.mythDB.getUsers() : JSON.parse(localStorage.getItem('myth_users') || '{"students":{}, "alumni":{}}');
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        
        let html = '';

        // Students
        for (const [id, data] of Object.entries(users.students)) {
            const date = data.registeredAt ? new Date(data.registeredAt).toLocaleString('tr-TR') : 'Bilinmiyor';
            html += `
                <tr>
                    <td><span class="badge" style="background:var(--primary); color:white; padding:4px 8px; border-radius:4px;">Öğrenci</span></td>
                    <td><strong>${id}</strong></td>
                    <td><i class="fas fa-key" style="color:var(--secondary); margin-right:5px;"></i> ${data.password}</td>
                    <td>${date}</td>
                </tr>
            `;
        }

        // Alumni
        for (const [phone, data] of Object.entries(users.alumni)) {
            const date = data.registeredAt ? new Date(data.registeredAt).toLocaleString('tr-TR') : 'Bilinmiyor';
            html += `
                <tr>
                    <td><span class="badge" style="background:var(--secondary); color:white; padding:4px 8px; border-radius:4px;">Mezun</span></td>
                    <td><strong>${phone}</strong></td>
                    <td><i class="fas fa-lock" style="color:var(--primary); margin-right:5px;"></i> ${data.password}</td>
                    <td>${date}</td>
                </tr>
            `;
        }

        tbody.innerHTML = html || '<tr><td colspan="4" style="text-align:center;">Henüz kayıtlı kullanıcı yok.</td></tr>';
    }

    // Init
    renderDashboard();
    renderVenuesTable();
    renderDealsTable();
    renderReviewsTable();
    renderUsersTable();

    // Firebase Sync Listener
    window.addEventListener('mythDBUpdated', () => {
        renderDashboard();
        renderVenuesTable();
        renderDealsTable();
        renderReviewsTable();
        renderUsersTable();
    });
});
