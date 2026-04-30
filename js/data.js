// =============================================
// MYTh Kart — Database Manager (Firebase-first)
// =============================================

(function() {
    // ---- CONSTANTS (UI Only, never saved to Firebase) ----
    const CATEGORIES = [
        { id: "tumu", label: "Tümü", icon: "🏷️" },
        { id: "kafe", label: "Kafe", icon: "☕" },
        { id: "restoran", label: "Restoran", icon: "🍽️" },
        { id: "oyun", label: "Oyun", icon: "🎮" },
        { id: "eglence", label: "Eğlence", icon: "🎉" }
    ];

    const REGIONS = [
        "Tümü",
        "Bahçelievler",
        "Bilkent",
        "Çankaya",
        "Kızılay",
        "Etimesgut",
        "Keçiören"
    ];

    const SORT_OPTIONS = [
        { id: "default", label: "Varsayılan" },
        { id: "discount-high", label: "İndirim (Yüksekten Düşüğe)" },
        { id: "discount-low", label: "İndirim (Düşükten Yükseğe)" },
        { id: "popular", label: "En Popüler" },
        { id: "newest", label: "En Yeni" }
    ];

    // ---- Admin credentials (Only seeded if Firebase is completely empty) ----
    const DEFAULT_ADMINS = {
        "sahra.admin": { password: "sahra0267", name: "Sahra" },
        "batu.admin": { password: "MythAdmin2026!02", name: "Batu" },
        "zersah.admin": { password: "MythAdmin2026!03", name: "Zerşah" },
        "ece.admin": { password: "MythAdmin2026!04", name: "Ece" },
        "mert.admin": { password: "MythAdmin2026!05", name: "Mert" },
        "sila.admin": { password: "MythAdmin2026!06", name: "Sıla" },
        "murat.admin": { password: "MythAdmin2026!07", name: "Murat" },
        "cansin.admin": { password: "MythAdmin2026!08", name: "Cansın" },
        "peker.admin": { password: "MythAdmin2026!09", name: "Peker" },
        "begum.admin": { password: "MythAdmin2026!10", name: "Begüm" }
    };

    // Backwards-compat globals
    window.categories  = CATEGORIES;
    window.regions     = REGIONS;
    window.sortOptions = SORT_OPTIONS;
    window.venues      = [];

    // Mark DB as syncing — no writes allowed until Firebase is loaded
    window.isMythSyncing = true;

    // ---- Firebase Setup ----
    try {
        const firebaseConfig = {
            apiKey: "AIzaSyBjLc8L34Ok0s7Ml55iYjEHIy2-vLncl7E",
            authDomain: "myth-card.firebaseapp.com",
            projectId: "myth-card",
            storageBucket: "myth-card.firebasestorage.app",
            messagingSenderId: "207712470529",
            appId: "1:207712470529:web:1b3c3696cb12c72e9ee200",
            measurementId: "G-4K49RPKH1T"
        };

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        const db = firebase.firestore();
        window.db = db;

        // Initialize Analytics (optional)
        if (typeof firebase.analytics === 'function') {
            try { window.analytics = firebase.analytics(); } catch(e) {}
        }

        // -------------------------------------------------------
        // mythDB API — defined HERE so window.db is always valid
        // -------------------------------------------------------
        window.mythDB = {
            // Getters always read from localStorage (which was loaded from Firebase)
            getVenues:        () => JSON.parse(localStorage.getItem('myth_venues')         || '[]'),
            getDeals:         () => JSON.parse(localStorage.getItem('myth_deals')          || '[]'),
            getReviews:       () => JSON.parse(localStorage.getItem('myth_reviews')        || '[]'),
            getAvailablePins: () => JSON.parse(localStorage.getItem('myth_available_pins') || '[]'),

            getCategories:    () => CATEGORIES,
            getRegions:       () => REGIONS,
            getSortOptions:   () => SORT_OPTIONS,

            // saveToCloud: writes to localStorage AND directly to Firebase (no override dependency)
            // Returns a Promise — always await this before closing modals / redirecting
            saveToCloud: function(key, data) {
                const value = JSON.stringify(data);
                localStorage.setItem(key, value);   // local cache

                // Direct Firebase write — this is the ONLY source of truth
                return db.collection('myth_state').doc(key)
                    .set({ data: value })
                    .then(() => {
                        console.log('[MYTh] Saved to Firebase:', key);
                    })
                    .catch(e => {
                        console.error('[MYTh] Firebase write FAILED:', key, e);
                    });
            },

            // Convenience save wrappers (all return Promises)
            saveVenues:        (d) => window.mythDB.saveToCloud('myth_venues', d),
            saveDeals:         (d) => window.mythDB.saveToCloud('myth_deals', d),
            saveReviews:       (d) => window.mythDB.saveToCloud('myth_reviews', d),
            saveAvailablePins: (d) => window.mythDB.saveToCloud('myth_available_pins', d),
            saveUsers:         (d) => window.mythDB.saveToCloud('myth_users', d),
            saveAdmins:        (d) => window.mythDB.saveToCloud('myth_admins', d),
        };

        // -------------------------------------------------------
        // Main Sync: Firebase is the SINGLE source of truth
        // Called ONCE on page load. Never seeds if data exists.
        // -------------------------------------------------------
        async function syncFromFirebase() {
            try {
                // ----------------------------------------------------------
                // SENTINEL CHECK: Look for myth_meta/initialized document.
                // This is written ONCE on first-ever run and never deleted.
                // If it exists → Firebase is initialized, NEVER seed.
                // If it doesn't exist → first run ever, seed defaults.
                // This prevents accidental data wipe due to:
                //   - Network blips returning empty snapshot
                //   - Firebase quota exceeded
                //   - Any other transient error
                // ----------------------------------------------------------
                const sentinelRef = db.collection('myth_meta').doc('initialized');
                const sentinelDoc = await sentinelRef.get();

                if (!sentinelDoc.exists) {
                    // Truly first run — seed defaults and write sentinel
                    console.log('[MYTh] First run detected — seeding defaults');
                    const seeds = {
                        'myth_venues':         '[]',
                        'myth_deals':          '[]',
                        'myth_reviews':        '[]',
                        'myth_users':          JSON.stringify({ students: {}, alumni: {} }),
                        'myth_admins':         JSON.stringify(DEFAULT_ADMINS),
                        'myth_businesses':     '{}',
                        'myth_available_pins': '[]'
                    };
                    const batch = db.batch();
                    for (const [key, val] of Object.entries(seeds)) {
                        localStorage.setItem(key, val);
                        batch.set(db.collection('myth_state').doc(key), { data: val });
                    }
                    // Write sentinel — this will prevent any future seeding
                    batch.set(sentinelRef, {
                        initializedAt: new Date().toISOString(),
                        version: 1
                    });
                    await batch.commit();
                    console.log('[MYTh] Sentinel written — database initialized');

                } else {
                    // Sentinel exists → database was already initialized
                    // Load all keys from Firebase, NEVER seed/overwrite
                    const snapshot = await db.collection('myth_state').get();
                    console.log('[MYTh] Loading', snapshot.size, 'keys from Firebase');
                    snapshot.forEach(doc => {
                        const key = doc.id;
                        const val = doc.data().data;
                        if (val !== undefined && key !== 'myth_active_session' && key !== 'myth-theme') {
                            localStorage.setItem(key, val);
                        }
                    });
                }

                // Sync complete
                window.venues = JSON.parse(localStorage.getItem('myth_venues') || '[]');
                window.isMythSyncing = false;
                window.dispatchEvent(new Event('mythDBReady'));
                console.log('[MYTh] Sync complete. Venues:', window.venues.length);

            } catch (e) {
                // Network or quota error — run with whatever is in localStorage
                // NEVER seed or overwrite Firebase in error state
                console.error('[MYTh] Firebase sync failed, running in offline mode:', e);
                window.isMythSyncing = false;
                window.venues = JSON.parse(localStorage.getItem('myth_venues') || '[]');
                window.dispatchEvent(new Event('mythDBReady'));
            }
        }

        syncFromFirebase();

    } catch(e) {
        console.error('[MYTh] Firebase init failed:', e);
        // Still allow app to run offline
        window.isMythSyncing = false;
        window.venues = JSON.parse(localStorage.getItem('myth_venues') || '[]');

        // Fallback mythDB without Firebase
        window.mythDB = {
            getVenues:        () => JSON.parse(localStorage.getItem('myth_venues')         || '[]'),
            getDeals:         () => JSON.parse(localStorage.getItem('myth_deals')          || '[]'),
            getReviews:       () => JSON.parse(localStorage.getItem('myth_reviews')        || '[]'),
            getAvailablePins: () => JSON.parse(localStorage.getItem('myth_available_pins') || '[]'),
            getCategories:    () => CATEGORIES,
            getRegions:       () => REGIONS,
            getSortOptions:   () => SORT_OPTIONS,
            saveToCloud:      (key, data) => { localStorage.setItem(key, JSON.stringify(data)); return Promise.resolve(); },
            saveVenues:       (d) => window.mythDB.saveToCloud('myth_venues', d),
            saveDeals:        (d) => window.mythDB.saveToCloud('myth_deals', d),
            saveReviews:      (d) => window.mythDB.saveToCloud('myth_reviews', d),
            saveAvailablePins:(d) => window.mythDB.saveToCloud('myth_available_pins', d),
            saveUsers:        (d) => window.mythDB.saveToCloud('myth_users', d),
        };
    }

})();
