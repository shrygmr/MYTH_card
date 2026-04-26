// =============================================
// MYTh Kart — Business Panel Logic
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const activeSession = localStorage.getItem('myth_active_session');
    if (!activeSession) {
        window.location.href = 'index.html';
        return;
    }
    const session = JSON.parse(activeSession);
    if (session.type !== 'business') {
        window.location.href = 'index.html';
        return;
    }

    const businesses = JSON.parse(localStorage.getItem('myth_businesses') || '{}');
    const myBusiness = businesses[session.identifier];
    const myVenueId = session.venueId;

    if (myBusiness) {
        document.getElementById('businessNameDisplay').textContent = myBusiness.name;
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

            // Re-render
            if (target === 'dashboard') renderDashboard();
            if (target === 'reviews') renderReviewsTable();
        });
    });

    // ---------------------------------------------
    // Dashboard Logic
    // ---------------------------------------------
    function renderDashboard() {
        const venues = window.mythDB.getVenues();
        const myVenue = venues.find(v => v.id === myVenueId);

        if (myVenue) {
            document.getElementById('bDiscount').textContent = '%' + myVenue.discount;
        }

        const reviews = window.mythDB.getReviews().filter(r => r.venueId === myVenueId);
        document.getElementById('bReviewCount').textContent = reviews.length;

        if (reviews.length > 0) {
            const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
            const avg = (sum / reviews.length).toFixed(1);
            document.getElementById('bAvgRating').textContent = avg;
        } else {
            document.getElementById('bAvgRating').textContent = '0.0';
        }

        // My Deals
        const deals = window.mythDB.getDeals().filter(d => d.venueId === myVenueId);
        const tbody = document.getElementById('bDealsTableBody');
        
        if (deals.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Şu an aktif kampanyanız bulunmuyor. Eklemek için yöneticilerle iletişime geçin.</td></tr>`;
        } else {
            tbody.innerHTML = deals.map(d => `
                <tr>
                    <td><strong>${d.title}</strong></td>
                    <td>${d.description}</td>
                    <td>${d.validUntil}</td>
                </tr>
            `).join('');
        }
    }

    // ---------------------------------------------
    // Reviews Logic
    // ---------------------------------------------
    function renderReviewsTable() {
        const reviews = window.mythDB.getReviews().filter(r => r.venueId === myVenueId);
        const tbody = document.getElementById('bReviewsTableBody');
        
        if (reviews.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Henüz yorum yapılmamış.</td></tr>`;
            return;
        }

        tbody.innerHTML = reviews.map(r => {
            const replyBtn = r.reply ? 
                `<span style="color:var(--primary); font-size:0.9rem;"><i class="fas fa-check"></i> Yanıtlandı</span>` : 
                `<button class="btn btn-primary" style="padding: 5px 10px; font-size: 0.8rem;" onclick="replyToReview(${r.id})">Yanıtla</button>`;
                
            return `
                <tr>
                    <td>${r.date}</td>
                    <td><strong style="color: var(--primary);">${r.author}</strong></td>
                    <td>${r.rating} ⭐</td>
                    <td>
                        <div style="max-width: 300px; overflow: hidden; text-overflow: ellipsis;" title="${r.text}">${r.text}</div>
                        ${r.reply ? `<div style="font-size:0.85rem; color:var(--text-muted); margin-top:5px;"><strong>Siz:</strong> ${r.reply}</div>` : ''}
                    </td>
                    <td>${replyBtn}</td>
                </tr>
            `;
        }).join('');
    }

    window.replyToReview = function(id) {
        const replyText = prompt("Müşteriye yanıtınızı yazın (Bu yanıt herkese açık görünecektir):");
        if (replyText && replyText.trim() !== "") {
            let reviews = window.mythDB.getReviews();
            const index = reviews.findIndex(r => r.id === id);
            if (index !== -1) {
                reviews[index].reply = replyText.trim();
                window.mythDB.saveReviews(reviews);
                renderReviewsTable();
            }
        }
    };

    // Init
    renderDashboard();
    renderReviewsTable();

    // Firebase Sync Listener
    window.addEventListener('mythDBUpdated', () => {
        renderDashboard();
        renderReviewsTable();
    });
});
