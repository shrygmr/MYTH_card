// =============================================
// MYTh Kart — Main Application Logic
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
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // =============================================
    // Mobile Menu
    // =============================================
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-open');
    });

    // Close mobile menu on link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('mobile-open');
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

        // Bind events
        categoryPills.querySelectorAll('.cat-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                activeCategory = pill.dataset.category;
                populateCategories();
                renderVenues();
            });
        });
    }

    populateRegions();
    populateSortOptions();
    populateCategories();

    // =============================================
    // Filter & Search Events
    // =============================================
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderVenues();
    });

    regionFilter.addEventListener('change', (e) => {
        activeRegion = e.target.value;
        renderVenues();
    });

    sortFilter.addEventListener('change', (e) => {
        activeSort = e.target.value;
        renderVenues();
    });

    // =============================================
    // Render Venues
    // =============================================
    function getFilteredVenues() {
        const dbVenues = window.mythDB ? window.mythDB.getVenues() : venues;
        let filtered = [...dbVenues];

        // Category
        if (activeCategory !== 'tumu') {
            filtered = filtered.filter(v => v.category === activeCategory);
        }

        // Region
        if (activeRegion !== 'Tümü') {
            filtered = filtered.filter(v => v.region === activeRegion);
        }

        // Search
        if (searchQuery) {
            filtered = filtered.filter(v =>
                v.name.toLowerCase().includes(searchQuery) ||
                v.description.toLowerCase().includes(searchQuery) ||
                v.address.toLowerCase().includes(searchQuery)
            );
        }

        // Sort
        switch (activeSort) {
            case 'discount-high':
                filtered.sort((a, b) => b.discount - a.discount);
                break;
            case 'discount-low':
                filtered.sort((a, b) => a.discount - b.discount);
                break;
            case 'popular':
                filtered.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
                break;
            case 'newest':
                filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
                break;
        }

        return filtered;
    }

    function getCategoryEmoji(cat) {
        const map = { kafe: '☕', restoran: '🍽️', oyun: '🎮', eglence: '🎉' };
        return map[cat] || '🏷️';
    }

    function getCategoryLabel(cat) {
        const map = { kafe: 'Kafe', restoran: 'Restoran', oyun: 'Oyun', eglence: 'Eğlence' };
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
                if (userGrp[activeId]) {
                    favs = userGrp[activeId].favorites || [];
                }
            }
        }

        if (filtered.length === 0) {
            venuesGrid.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">🔍</div>
          <h3>Sonuç bulunamadı</h3>
          <p>Arama kriterlerinizi değiştirmeyi deneyin.</p>
        </div>
      `;
            return;
        }

        venuesGrid.innerHTML = filtered.map(venue => {
            const venueReviews = allReviews.filter(r => r.venueId === venue.id);
            let ratingHtml = '';
            if (venueReviews.length > 0) {
                const avg = (venueReviews.reduce((sum, r) => sum + r.rating, 0) / venueReviews.length).toFixed(1);
                ratingHtml = `<div class="rating-tag">${avg} ⭐</div>`;
            }

            const isFav = favs.includes(venue.id);
            const favIcon = isFav ? '<i class="fas fa-heart" style="color:#EF4444;"></i>' : '<i class="far fa-heart"></i>';

            return `
      <div class="venue-card" data-id="${venue.id}">
        <div class="venue-card-img" style="background: linear-gradient(135deg, var(--cat-${venue.category}), ${getDarkerShade(venue.category)});">
          <span class="venue-emoji">${getCategoryEmoji(venue.category)}</span>
          <div class="discount-tag">%${venue.discount}</div>
          ${ratingHtml}
          ${venue.isNew ? '<div class="new-tag" style="top: 10px; left: 10px; right: auto;">Yeni!</div>' : ''}
          ${venue.popular ? '<div class="popular-tag" style="top: 10px; left: 10px; right: auto;">🏆 Popüler</div>' : ''}
          <button class="fav-btn" data-vid="${venue.id}">${favIcon}</button>
        </div>
        <div class="venue-card-body">
          <h3>${venue.name}</h3>
          <span class="venue-card-category ${venue.category}">
            ${getCategoryEmoji(venue.category)} ${getCategoryLabel(venue.category)}
          </span>
          <p class="venue-card-desc">${venue.description}</p>
          <div class="venue-card-meta">
            <span class="meta-icon">📍</span> ${venue.region} · ${venue.address.split(',')[0]}
          </div>
        </div>
      </div>
    `}).join('');

        // Favorite Toggle
        venuesGrid.querySelectorAll('.fav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent card click
                if (!activeId) {
                    alert('Favorilere eklemek için lütfen giriş yapın.');
                    return;
                }
                const vId = parseInt(btn.dataset.vid);
                const usersData = JSON.parse(localStorage.getItem('myth_users') || '{"students":{}, "alumni":{}}');
                const session = JSON.parse(localStorage.getItem('myth_active_session'));
                const userGrp = session.type === 'student' ? usersData.students : usersData.alumni;
                
                if (!userGrp[activeId].favorites) userGrp[activeId].favorites = [];
                
                if (userGrp[activeId].favorites.includes(vId)) {
                    userGrp[activeId].favorites = userGrp[activeId].favorites.filter(id => id !== vId);
                } else {
                    userGrp[activeId].favorites.push(vId);
                }
                localStorage.setItem('myth_users', JSON.stringify(usersData));
                renderVenues(); // re-render to update heart color
            });
        });

        // Click to scroll to map
        venuesGrid.querySelectorAll('.venue-card').forEach(card => {
            card.addEventListener('click', () => {
                const venueId = parseInt(card.dataset.id);
                const dbVenues = window.mythDB ? window.mythDB.getVenues() : venues;
                const venue = dbVenues.find(v => v.id === venueId);
                if (venue && window.mythMap) {
                    document.getElementById('map').scrollIntoView({ behavior: 'smooth' });
                    setTimeout(() => {
                        window.mythMap.flyToVenue(venue);
                    }, 500);
                }
            });
        });
    }

    function getDarkerShade(category) {
        const map = {
            kafe: '#6D28D9',
            restoran: '#B91C1C',
            oyun: '#1D4ED8',
            eglence: '#D97706'
        };
        return map[category] || '#4C1D95';
    }

    renderVenues();

    // =============================================
    // Render Weekly Deals
    // =============================================
    function renderDeals() {
        const dealsContainer = document.getElementById('weeklyDealsContainer');
        if (!dealsContainer) return;
        
        const deals = window.mythDB ? window.mythDB.getDeals() : [];
        const dbVenues = window.mythDB ? window.mythDB.getVenues() : venues;
        
        if (deals.length === 0) {
            dealsContainer.innerHTML = '<p>Şu an aktif bir fırsat bulunmuyor.</p>';
            return;
        }

        dealsContainer.innerHTML = deals.map(deal => {
            const venue = dbVenues.find(v => v.id === deal.venueId);
            const venueName = venue ? venue.name : 'Bilinmeyen Mekan';
            const dealIcon = deal.type === 'hediye' ? '🎁' : '🔥';
            return `
                <div class="deal-card" style="background: var(--bg-card); border: 1px solid var(--primary); padding: 16px; border-radius: var(--radius-md); margin-bottom: 12px; display: flex; align-items: center; gap: 16px;">
                    <div style="font-size: 2rem;">${dealIcon}</div>
                    <div>
                        <h4 style="margin: 0; color: var(--primary);">${venueName}</h4>
                        <h3 style="margin: 4px 0;">${deal.title}</h3>
                        <p style="margin: 4px 0 8px 0; font-size: 0.9rem; color: var(--text-secondary);">${deal.description}</p>
                        <small style="color: var(--text-muted);">Geçerlilik: ${deal.validUntil}</small>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderDeals();

    // =============================================
    // Smooth Scroll for Nav Links
    // =============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // =============================================
    // Active Nav Link Highlight
    // =============================================
    const sections = document.querySelectorAll('section[id]');
    const navLinksList = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinksList.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // =============================================
    // Stats Counter Animation
    // =============================================
    let statsAnimated = false;
    const aboutSection = document.getElementById('about');

    function animateCounters() {
        if (statsAnimated) return;

        const rect = aboutSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            statsAnimated = true;

            const venueCount = window.mythDB ? window.mythDB.getVenues().length : venues.length;

            animateNumber('statMembers', 0, 500, 1500, '+');
            animateNumber('statVenues', 0, venueCount, 1000, '');
            animateNumber('statDiscount', 0, 30, 1200, '', '%', true);
        }
    }

    function animateNumber(elementId, start, end, duration, suffix = '', prefix = '', prefixFirst = false) {
        const el = document.getElementById(elementId);
        const range = end - start;
        const startTime = performance.now();

        function step(timestamp) {
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            const current = Math.floor(start + range * eased);

            if (prefixFirst) {
                el.textContent = `${prefix}${current}${suffix}`;
            } else {
                el.textContent = `${current}${suffix}`;
            }

            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }

        requestAnimationFrame(step);
    }

    window.addEventListener('scroll', animateCounters);
    animateCounters(); // check on load

    // Firebase Realtime Sync Listener
    window.addEventListener('mythDBUpdated', () => {
        if(window.mythDB) {
            window.venues = window.mythDB.getVenues();
            const activeCat = document.querySelector('.category-btn.active').dataset.cat;
            const activeRegion = document.getElementById('regionFilter').value;
            const activeSort = document.getElementById('sortFilter').value;
            renderVenues(window.venues);
            // Simulate re-filtering
            document.getElementById('regionFilter').dispatchEvent(new Event('change'));
            renderDeals();
        }
    });
});
