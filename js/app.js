// =============================================
// MYTh Kart — Main Application Logic (Optimized)
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    // ---- State ----
    let activeCategory = 'tumu';
    let activeRegion = 'Tümü';
    let activeSort = 'default';
    let searchQuery = '';

    // ---- DOM References ----
    const navbar = document.getElementById('navbar');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    const searchInput = document.getElementById('searchInput');
    const regionFilter = document.getElementById('regionFilter');
    const sortFilter = document.getElementById('sortFilter');
    const categoryPills = document.getElementById('categoryPills');
    const venuesGrid = document.getElementById('venuesGrid');

    // =============================================
    // Theme Management
    // =============================================
    function initTheme() {
        const savedTheme = localStorage.getItem('myth-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('myth-theme', next);
        updateThemeIcon(next);
    }

    function updateThemeIcon(theme) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    themeToggle.addEventListener('click', toggleTheme);
    initTheme();

    // =============================================
    // Navbar Scroll Effect
    // =============================================
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });

    // =============================================
    // Mobile Menu
    // =============================================
    mobileMenuBtn.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('mobile-open');
        const icon = mobileMenuBtn.querySelector('i');
        icon.className = isOpen ? 'fas fa-times' : 'fas fa-bars';
    });
    
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('mobile-open');
            mobileMenuBtn.querySelector('i').className = 'fas fa-bars';
        });
    });

    // =============================================
    // Populate Filters
    // =============================================
    function populateRegions() {
        regionFilter.innerHTML = regions.map(r =>
            `<option value="${r}" ${r === activeRegion ? 'selected' : ''}>${r === 'Tümü' ? '📍 Tüm Bölgeler' : '📍 ' + r}</option>`
        ).join('');
    }

    function populateSortOptions() {
        sortFilter.innerHTML = sortOptions.map(s =>
            `<option value="${s.id}" ${s.id === activeSort ? 'selected' : ''}>${s.label}</option>`
        ).join('');
    }

    function populateCategories() {
        categoryPills.innerHTML = categories.map(c =>
            `<button class="cat-pill ${c.id === activeCategory ? 'active' : ''}" data-category="${c.id}">
                ${c.icon} ${c.label}
            </button>`
        ).join('');

        categoryPills.querySelectorAll('.cat-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                activeCategory = pill.dataset.category;
                populateCategories();
                renderVenues();
            });
        });
    }

    // =============================================
    // Render Logic
    // =============================================
    function getFilteredVenues() {
        const dbVenues = window.mythDB ? window.mythDB.getVenues() : (window.venues || []);
        let filtered = [...dbVenues];

        if (activeCategory !== 'tumu') filtered = filtered.filter(v => v.category === activeCategory);
        if (activeRegion !== 'Tümü') filtered = filtered.filter(v => v.region === activeRegion);
        if (searchQuery) {
            filtered = filtered.filter(v =>
                v.name.toLowerCase().includes(searchQuery) ||
                (v.description && v.description.toLowerCase().includes(searchQuery)) ||
                (v.address && v.address.toLowerCase().includes(searchQuery))
            );
        }

        switch (activeSort) {
            case 'discount-high': filtered.sort((a, b) => parseFloat(b.discount || 0) - parseFloat(a.discount || 0)); break;
            case 'discount-low': filtered.sort((a, b) => parseFloat(a.discount || 0) - parseFloat(b.discount || 0)); break;
            case 'popular': filtered.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0)); break;
            case 'newest': filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
        }
        return filtered;
    }

    function getCategoryIcon(cat) {
        const map = { 
            kafe: '<i class="fas fa-coffee"></i>', 
            restoran: '<i class="fas fa-utensils"></i>', 
            oyun: '<i class="fas fa-gamepad"></i>', 
            eglence: '<i class="fas fa-mask"></i>', 
            petshop: '<i class="fas fa-paw"></i>', 
            hizmet: '<i class="fas fa-concierge-bell"></i>' 
        };
        return map[cat] || '<i class="fas fa-tag"></i>';
    }

    function getCategoryLabel(cat) {
        const map = { kafe: 'Kafe', restoran: 'Restoran', oyun: 'Oyun', eglence: 'Eğlence', petshop: 'Petshop', hizmet: 'Hizmet' };
        return map[cat] || cat;
    }

    function renderVenues() {
        const filtered = getFilteredVenues();
        const allReviews = window.mythDB ? window.mythDB.getReviews() : [];
        
        let favs = [];
        let activeId = null;
        const activeSession = localStorage.getItem('myth_active_session');
        if (activeSession) {
            const session = JSON.parse(activeSession);
            if (session.type === 'student' || session.type === 'alumni') {
                activeId = session.identifier;
                const usersData = JSON.parse(localStorage.getItem('myth_users') || '{"students":{}, "alumni":{}}');
                const userGrp = session.type === 'student' ? usersData.students : usersData.alumni;
                if (userGrp[activeId]) favs = userGrp[activeId].favorites || [];
            }
        }

        if (filtered.length === 0) {
            venuesGrid.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon"><i class="fas fa-search"></i></div>
                    <h3>Sonuç bulunamadı</h3>
                    <p>Farklı bir arama yapmayı veya filtreleri temizlemeyi deneyin.</p>
                </div>`;
            return;
        }

        venuesGrid.innerHTML = filtered.map(venue => {
            const venueReviews = allReviews.filter(r => r.venueId === venue.id);
            let ratingHtml = '';
            if (venueReviews.length > 0) {
                const avg = (venueReviews.reduce((sum, r) => sum + r.rating, 0) / venueReviews.length).toFixed(1);
                ratingHtml = `<div class="rating-tag">${avg} <i class="fas fa-star"></i></div>`;
            }

            const isFav = favs.includes(venue.id);
            const favIcon = isFav ? '<i class="fas fa-heart" style="color:#EF4444;"></i>' : '<i class="far fa-heart"></i>';

            return `
                <div class="venue-card" data-id="${venue.id}">
                    <div class="venue-card-img" style="background: linear-gradient(135deg, var(--cat-${venue.category}), var(--primary-dark));">
                        <span class="venue-icon">${getCategoryIcon(venue.category)}</span>
                        <div class="discount-tag">%${venue.discount} İNDİRİM</div>
                        ${ratingHtml}
                        <button class="fav-btn" data-vid="${venue.id}">${favIcon}</button>
                    </div>
                    <div class="venue-card-body">
                        <div class="venue-card-header">
                            <h3>${venue.name}</h3>
                            <span class="venue-card-category ${venue.category}">${getCategoryLabel(venue.category)}</span>
                        </div>
                        <div class="venue-card-meta">
                            <span><i class="fas fa-map-marker-alt"></i> ${venue.region}</span>
                            <span class="venue-card-action">Detaylar <i class="fas fa-chevron-right"></i></span>
                        </div>
                    </div>
                </div>`;
        }).join('');

        // Re-bind events
        venuesGrid.querySelectorAll('.fav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!activeId) { alert('Lütfen giriş yapın.'); return; }
                const vId = parseInt(btn.dataset.vid);
                const usersData = JSON.parse(localStorage.getItem('myth_users') || '{"students":{}, "alumni":{}}');
                const session = JSON.parse(localStorage.getItem('myth_active_session'));
                const userGrp = session.type === 'student' ? usersData.students : usersData.alumni;
                if (!userGrp[activeId].favorites) userGrp[activeId].favorites = [];
                if (userGrp[activeId].favorites.includes(vId)) userGrp[activeId].favorites = userGrp[activeId].favorites.filter(id => id !== vId);
                else userGrp[activeId].favorites.push(vId);
                localStorage.setItem('myth_users', JSON.stringify(usersData));
                renderVenues();
            });
        });

        venuesGrid.querySelectorAll('.venue-card').forEach(card => {
            card.addEventListener('click', () => {
                const venueId = parseInt(card.dataset.id);
                const dbVenues = window.mythDB ? window.mythDB.getVenues() : (window.venues || []);
                const venue = dbVenues.find(v => v.id === venueId);
                if (venue && window.mythMap) {
                    document.getElementById('map').scrollIntoView({ behavior: 'smooth' });
                    setTimeout(() => window.mythMap.flyToVenue(venue), 500);
                }
            });
        });
    }

    function renderDeals() {
        const dealsContainer = document.getElementById('weeklyDealsContainer');
        if (!dealsContainer) return;
        const deals = window.mythDB ? window.mythDB.getDeals() : [];
        const dbVenues = window.mythDB ? window.mythDB.getVenues() : (window.venues || []);
        if (deals.length === 0) { dealsContainer.innerHTML = '<p>Aktif fırsat bulunmuyor.</p>'; return; }
        dealsContainer.innerHTML = deals.map(deal => {
            const venue = dbVenues.find(v => v.id === deal.venueId);
            return `<div class="deal-card"><h4>${venue ? venue.name : ''}</h4><h3>${deal.title}</h3><p>${deal.description}</p></div>`;
        }).join('');
    }

    // =============================================
    // Initialization
    // =============================================
    function init() {
        if (window.mythDB) {
            window.venues = window.mythDB.getVenues();
            window.deals = window.mythDB.getDeals();
        }
        populateRegions();
        populateSortOptions();
        populateCategories();
        renderVenues();
        renderDeals();
    }

    // Filters
    searchInput.addEventListener('input', (e) => { searchQuery = e.target.value.toLowerCase().trim(); renderVenues(); });
    regionFilter.addEventListener('change', (e) => { activeRegion = e.target.value; renderVenues(); });
    sortFilter.addEventListener('change', (e) => { activeSort = e.target.value; renderVenues(); });

    // Sync Events
    window.addEventListener('mythDBReady', init);
    window.addEventListener('mythDBUpdated', init);

    // Run first init
    init();

    // Counter Animation
    let statsAnimated = false;
    function animateCounters() {
        if (statsAnimated || !document.getElementById('about')) return;
        const rect = document.getElementById('about').getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            statsAnimated = true;
            const vCount = window.venues ? window.venues.length : 0;
            animateNumber('statMembers', 0, 500, 1500, '+');
            animateNumber('statVenues', 0, vCount, 1000, '');
            animateNumber('statDiscount', 0, 30, 1200, '', '%', true);
        }
    }

    function animateNumber(elementId, start, end, duration, suffix = '', prefix = '', prefixFirst = false) {
        const el = document.getElementById(elementId);
        if (!el) return;
        const range = end - start;
        const startTime = performance.now();
        function step(timestamp) {
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const current = Math.floor(start + range * (1 - Math.pow(1 - progress, 3)));
            el.textContent = prefixFirst ? `${prefix}${current}${suffix}` : `${current}${suffix}`;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    window.addEventListener('scroll', animateCounters);
    animateCounters();
});
