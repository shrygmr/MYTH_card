// =============================================
// MYTh Kart — Database Seeder & Manager
// =============================================

(function() {
    const DEFAULT_VENUES = [];

    const DEFAULT_DEALS = [];

    // Auth seeds
    const DEFAULT_ADMINS = {
        "sahra.admin": { password: "MythAdmin2026!01", name: "Sahra" },
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

    const DEFAULT_BUSINESSES = {
        "tunali": { password: "123", venueId: 1, name: "Tunalı Roasters Yönetim" },
        "bahceli": { password: "123", venueId: 2, name: "Bahçeli Burger Yönetim" }
    };

    // Constants
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

    function initializeDatabase() {
        if (!localStorage.getItem('myth_venues')) {
            localStorage.setItem('myth_venues', JSON.stringify(DEFAULT_VENUES));
        }
        if (!localStorage.getItem('myth_deals')) {
            localStorage.setItem('myth_deals', JSON.stringify(DEFAULT_DEALS));
        }
        // Always overwrite admins so the new demo users are seeded
        localStorage.setItem('myth_admins', JSON.stringify(DEFAULT_ADMINS));
        if (!localStorage.getItem('myth_businesses')) {
            localStorage.setItem('myth_businesses', JSON.stringify(DEFAULT_BUSINESSES));
        }
        if (!localStorage.getItem('myth_reviews')) {
            localStorage.setItem('myth_reviews', JSON.stringify([]));
        }
        if (!localStorage.getItem('myth_users')) {
            const defaultUsers = {
                students: {
                    "201100000": { password: "100001", registeredAt: new Date().toISOString() }
                },
                alumni: {
                    "05555555555": { password: "1234", registeredAt: new Date().toISOString() }
                }
            };
            localStorage.setItem('myth_users', JSON.stringify(defaultUsers));
        }
    }

    // Run on load
    initializeDatabase();

    // Firebase Setup
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
        window.isMythSyncing = true;


        // Override localStorage.setItem to sync to Firebase automatically
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            originalSetItem.call(this, key, value);
            // Don't sync session to cloud, only global data
            // Also don't sync if we are currently performing the initial fetch from cloud
            if (key.startsWith('myth_') && key !== 'myth_active_session' && window.db && !window.isMythSyncing) {
                window.db.collection('myth_state').doc(key).set({ data: value }).catch(e => console.error("Firebase save error", e));
            }
        };

        // Sync from Firebase on load
        async function syncFromFirebase() {
            try {
                const snapshot = await db.collection('myth_state').get();
                let changed = false;
                
                if (snapshot.empty) {
                    // Seed Firebase with our initial default data
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key && key.startsWith('myth_') && key !== 'myth_active_session') {
                            db.collection('myth_state').doc(key).set({ data: localStorage.getItem(key) });
                        }
                    }
                } else {
                    snapshot.forEach(doc => {
                        const serverValue = doc.data().data;
                        const localValue = localStorage.getItem(doc.id);
                        if (serverValue && serverValue !== localValue) {
                            originalSetItem.call(localStorage, doc.id, serverValue);
                            changed = true;
                        }
                    });
                    
                    if (changed) {
                        // Re-bind global vars
                        window.venues = JSON.parse(localStorage.getItem('myth_venues') || '[]');
                        // Dispatch event to notify UI
                        window.dispatchEvent(new Event('mythDBUpdated'));
                    }
                }
            } catch (e) {
                console.error("Firebase sync failed:", e);
            }
        }

        syncFromFirebase().finally(() => {
            window.isMythSyncing = false;
        });

    } catch(e) {
        console.warn("Firebase is not initialized or failed.", e);
    }

    // Export public DB interface
    window.mythDB = {
        getVenues: () => JSON.parse(localStorage.getItem('myth_venues') || '[]'),
        saveVenues: (data) => localStorage.setItem('myth_venues', JSON.stringify(data)),
        
        getDeals: () => JSON.parse(localStorage.getItem('myth_deals') || '[]'),
        saveDeals: (data) => localStorage.setItem('myth_deals', JSON.stringify(data)),
        
        getReviews: () => JSON.parse(localStorage.getItem('myth_reviews') || '[]'),
        saveReviews: (data) => localStorage.setItem('myth_reviews', JSON.stringify(data)),
        
        getCategories: () => CATEGORIES,
        getRegions: () => REGIONS,
        getSortOptions: () => SORT_OPTIONS
    };

    // For backwards compatibility with map.js & app.js until they are updated
    // We bind the data to the global scope as if it was defined statically.
    window.venues = window.mythDB.getVenues();
    window.categories = CATEGORIES;
    window.regions = REGIONS;
    window.sortOptions = SORT_OPTIONS;
    
})();
