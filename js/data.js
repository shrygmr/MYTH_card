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

    // ---- Admin & Business credentials (Only seeded if Firebase is empty) ----
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

    // ---- Public mythDB API ----
    // saveToCloud: writes to both localStorage AND Firebase, returns a Promise
    // Admin/business must await this before closing modals so data survives page refresh
    window.mythDB = {
        getVenues:  () => JSON.parse(localStorage.getItem('myth_venues')  || '[]'),
        getDeals:   () => JSON.parse(localStorage.getItem('myth_deals')   || '[]'),
        getReviews: () => JSON.parse(localStorage.getItem('myth_reviews') || '[]'),
        getAvailablePins: () => JSON.parse(localStorage.getItem('myth_available_pins') || '[]'),

        // saveToCloud(key, data) — guaranteed write to Firebase, awaitable
        saveToCloud: function(key, data) {
            const value = JSON.stringify(data);
            localStorage.setItem(key, value); // local always first
            if (window.db) {
                return window.db.collection('myth_state').doc(key)
                    .set({ data: value })
                    .catch(e => console.error('[MYTh] Firebase write error:', key, e));
            }
            return Promise.resolve();
        },

        // Convenience wrappers — these return Promises
        saveVenues:       (d) => window.mythDB.saveToCloud('myth_venues', d),
        saveDeals:        (d) => window.mythDB.saveToCloud('myth_deals', d),
        saveReviews:      (d) => window.mythDB.saveToCloud('myth_reviews', d),
        saveAvailablePins:(d) => window.mythDB.saveToCloud('myth_available_pins', d),
        saveUsers:        (d) => window.mythDB.saveToCloud('myth_users', d),

        getCategories:   () => CATEGORIES,
        getRegions:      () => REGIONS,
        getSortOptions:  () => SORT_OPTIONS
    };

    // Backwards-compat globals
    window.categories  = CATEGORIES;
    window.regions     = REGIONS;
    window.sortOptions = SORT_OPTIONS;
    window.venues      = [];

    // Mark DB as syncing — UI will show loading until done
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

        // Initialize Analytics
        if (typeof firebase.analytics === 'function') {
            window.analytics = firebase.analytics();
            console.log('[MYTh] Analytics initialized');
        }

        // Keys that should NEVER be pushed from local to cloud
        const CLOUD_SKIP_KEYS = new Set(['myth_active_session', 'myth-theme']);

        // Keys that should NEVER be pulled from cloud to overwrite local
        // (session is device-specific)
        const LOCAL_ONLY_KEYS = new Set(['myth_active_session', 'myth-theme']);

        // Override setItem: auto-sync writes to Firebase
        // But ONLY after initial sync completes (isMythSyncing = false)
        const _origSetItem = localStorage.setItem.bind(localStorage);
        localStorage.setItem = function(key, value) {
            _origSetItem(key, value);
            if (
                key.startsWith('myth_') &&
                !CLOUD_SKIP_KEYS.has(key) &&
                window.db &&
                !window.isMythSyncing
            ) {
                window.db.collection('myth_state').doc(key)
                    .set({ data: value })
                    .catch(e => console.error('[MYTh] Firebase write error:', key, e));
            }
        };

        // ---- Main Sync: Firebase is the single source of truth ----
        async function syncFromFirebase() {
            try {
                const snapshot = await db.collection('myth_state').get();

                if (snapshot.empty) {
                    // Firebase is completely empty — seed with safe defaults
                    console.log('[MYTh] Firebase empty — seeding defaults');
                    const seeds = {
                        'myth_venues':   '[]',
                        'myth_deals':    '[]',
                        'myth_reviews':  '[]',
                        'myth_users':    JSON.stringify({ students: {}, alumni: {} }),
                        'myth_admins':   JSON.stringify(DEFAULT_ADMINS),
                        'myth_businesses': '{}'
                    };
                    const batch = db.batch();
                    for (const [key, val] of Object.entries(seeds)) {
                        _origSetItem(key, val);
                        batch.set(db.collection('myth_state').doc(key), { data: val });
                    }
                    await batch.commit();
                } else {
                    // Firebase has data — it is the authority, overwrite localStorage
                    console.log('[MYTh] Loading', snapshot.size, 'keys from Firebase');
                    snapshot.forEach(doc => {
                        const key = doc.id;
                        const val = doc.data().data;
                        if (val && !LOCAL_ONLY_KEYS.has(key)) {
                            _origSetItem(key, val);
                        }
                    });
                }

                // Update global venues reference
                window.venues = JSON.parse(localStorage.getItem('myth_venues') || '[]');
                // Notify UI that data is ready
                window.isMythSyncing = false;
                window.dispatchEvent(new Event('mythDBReady'));
                console.log('[MYTh] Sync complete. Venues:', window.venues.length);

            } catch (e) {
                console.error('[MYTh] Firebase sync failed:', e);
                // Fall back gracefully — run without cloud
                window.isMythSyncing = false;
                window.dispatchEvent(new Event('mythDBReady'));
            }
        }

        syncFromFirebase();

    } catch(e) {
        console.warn('[MYTh] Firebase init failed:', e);
        // If Firebase totally broken, still allow app to run
        window.isMythSyncing = false;
        window.venues = JSON.parse(localStorage.getItem('myth_venues') || '[]');
    }

})();
