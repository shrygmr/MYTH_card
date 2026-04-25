// =============================================
// MYTh Kart — Leaflet Map Integration
// =============================================

(function () {
    // Default center: Ankara
    const DEFAULT_CENTER = [39.92077, 32.85411];
    const DEFAULT_ZOOM = 13;

    let map;
    let markers = [];
    let userMarker = null;
    let userPosition = null;
    let activeMapCategory = 'tumu';

    function initMap() {
        map = L.map('leafletMap', {
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
            scrollWheelZoom: true,
            zoomControl: true
        });

        // Tile layer (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(map);

        // Add venue markers
        addVenueMarkers();

        // Locate button
        const locateBtn = document.getElementById('locateBtn');
        if (locateBtn) {
            locateBtn.addEventListener('click', locateUser);
        }

        // Map category filter buttons
        initMapFilters();
    }

    function getCategoryColor(category) {
        const colors = {
            kafe: '#8B5CF6',
            restoran: '#EF4444',
            oyun: '#3B82F6',
            eglence: '#F59E0B'
        };
        return colors[category] || '#6C3CE1';
    }

    function getCategoryEmoji(cat) {
        const emojiMap = { kafe: '☕', restoran: '🍽️', oyun: '🎮', eglence: '🎉' };
        return emojiMap[cat] || '🏷️';
    }

    function getCategoryLabel(cat) {
        const labels = { kafe: 'Kafe', restoran: 'Restoran', oyun: 'Oyun', eglence: 'Eğlence' };
        return labels[cat] || cat;
    }

    function createCustomIcon(category, isHighlighted) {
        const color = getCategoryColor(category);
        const emoji = getCategoryEmoji(category);
        const size = isHighlighted ? 52 : 40;
        const borderWidth = isHighlighted ? '4px' : '3px';
        const glowShadow = isHighlighted
            ? `0 0 20px ${color}, 0 4px 12px rgba(0,0,0,0.3)`
            : '0 4px 12px rgba(0,0,0,0.3)';

        return L.divIcon({
            className: 'custom-map-marker',
            html: `
        <div style="
          width: ${size}px; height: ${size}px;
          background: ${color};
          border-radius: 50% 50% 50% 4px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: ${glowShadow};
          transform: rotate(-45deg);
          border: ${borderWidth} solid white;
          transition: all 0.3s ease;
        ">
          <span style="transform: rotate(45deg); font-size: ${isHighlighted ? '22px' : '18px'};">${emoji}</span>
        </div>
      `,
            iconSize: [size, size],
            iconAnchor: [size / 2, size],
            popupAnchor: [0, -size - 2]
        });
    }

    // Build Google Maps directions URL
    function getDirectionsUrl(venue) {
        const destination = `${venue.lat},${venue.lng}`;
        // If user position is known, use it as origin
        if (userPosition) {
            return `https://www.google.com/maps/dir/${userPosition.lat},${userPosition.lng}/${destination}`;
        }
        // Otherwise just open the destination in Google Maps
        return `https://www.google.com/maps/dir//${destination}`;
    }

    function buildPopupHtml(venue) {
        const directionsUrl = getDirectionsUrl(venue);
        return `
      <div class="map-popup-title">${venue.name}</div>
      <div class="map-popup-cat">${getCategoryEmoji(venue.category)} ${getCategoryLabel(venue.category)} · ${venue.region}</div>
      <div class="map-popup-discount">%${venue.discount} İndirim</div>
      <div style="font-size: 0.8rem; color: #666; margin-top: 4px;">📍 ${venue.address}</div>
      <a href="${directionsUrl}" target="_blank" style="
        display: inline-flex; align-items: center; gap: 6px;
        margin-top: 10px; padding: 6px 14px;
        background: #4285F4; color: white;
        border-radius: 20px; font-size: 0.8rem; font-weight: 600;
        text-decoration: none; transition: background 0.2s;
      " onmouseover="this.style.background='#3367D6'" onmouseout="this.style.background='#4285F4'">
        <i class="fas fa-diamond-turn-right"></i> Google Maps'te Yol Tarifi
      </a>
    `;
    }

    function addVenueMarkers(filterCategory, highlightId) {
        // Clear existing markers
        markers.forEach(m => map.removeLayer(m));
        markers = [];

        const dbVenues = window.mythDB ? window.mythDB.getVenues() : venues;
        let venuesToShow = dbVenues;
        if (filterCategory && filterCategory !== 'tumu') {
            venuesToShow = dbVenues.filter(v => v.category === filterCategory);
        }

        venuesToShow.forEach(venue => {
            const isHighlighted = venue.id === highlightId;
            const icon = createCustomIcon(venue.category, isHighlighted);

            const marker = L.marker([venue.lat, venue.lng], { icon, zIndexOffset: isHighlighted ? 1000 : 0 })
                .addTo(map)
                .bindPopup(buildPopupHtml(venue));

            markers.push({ marker, venue });
        });
    }

    // =============================================
    // Distance calculation (Haversine)
    // =============================================
    function getDistanceKm(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function findNearestVenue(category) {
        if (!userPosition) return null;

        const dbVenues = window.mythDB ? window.mythDB.getVenues() : venues;
        let filtered = dbVenues;
        if (category && category !== 'tumu') {
            filtered = dbVenues.filter(v => v.category === category);
        }

        let nearest = null;
        let minDist = Infinity;

        filtered.forEach(v => {
            const dist = getDistanceKm(userPosition.lat, userPosition.lng, v.lat, v.lng);
            if (dist < minDist) {
                minDist = dist;
                nearest = { ...v, distance: dist };
            }
        });

        return nearest;
    }

    // =============================================
    // Map Category Filters
    // =============================================
    function initMapFilters() {
        const filterContainer = document.getElementById('mapFilters');
        if (!filterContainer) return;

        filterContainer.querySelectorAll('.map-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                activeMapCategory = category;

                // Update active state
                filterContainer.querySelectorAll('.map-filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                handleCategoryFilter(category);
            });
        });
    }

    function handleCategoryFilter(category) {
        if (category === 'tumu') {
            // Show all markers, hide nearest card
            addVenueMarkers();
            hideNearestCard();

            // Fit map to all markers
            if (markers.length > 0) {
                const group = L.featureGroup(markers.map(m => m.marker));
                map.fitBounds(group.getBounds().pad(0.1));
            }
            return;
        }

        // If user position is available, find nearest
        if (userPosition) {
            const nearest = findNearestVenue(category);
            if (nearest) {
                addVenueMarkers(category, nearest.id);
                showNearestCard(nearest);
                map.flyTo([nearest.lat, nearest.lng], 15, { duration: 1 });

                // Open the popup of the nearest venue
                setTimeout(() => {
                    const nearestMarker = markers.find(m => m.venue.id === nearest.id);
                    if (nearestMarker) nearestMarker.marker.openPopup();
                }, 1100);
            }
        } else {
            // No user position — just filter markers and prompt
            addVenueMarkers(category);
            hideNearestCard();

            if (markers.length > 0) {
                const group = L.featureGroup(markers.map(m => m.marker));
                map.fitBounds(group.getBounds().pad(0.1));
            }

            // Auto-locate user
            locateUser(() => {
                handleCategoryFilter(category);
            });
        }
    }

    // =============================================
    // Nearest Venue Info Card
    // =============================================
    function showNearestCard(venue) {
        const card = document.getElementById('nearestVenueCard');
        const emoji = document.getElementById('nearestEmoji');
        const name = document.getElementById('nearestName');
        const detail = document.getElementById('nearestDetail');
        const directions = document.getElementById('nearestDirections');

        emoji.textContent = getCategoryEmoji(venue.category);
        name.textContent = venue.name;

        const distStr = venue.distance < 1
            ? `${Math.round(venue.distance * 1000)} m`
            : `${venue.distance.toFixed(1)} km`;

        detail.textContent = `${getCategoryLabel(venue.category)} · ${venue.region} · ${distStr} · %${venue.discount} indirim`;
        directions.href = getDirectionsUrl(venue);

        card.style.display = 'flex';
        card.classList.add('card-appear');
        setTimeout(() => card.classList.remove('card-appear'), 500);
    }

    function hideNearestCard() {
        const card = document.getElementById('nearestVenueCard');
        if (card) card.style.display = 'none';
    }

    // =============================================
    // Locate User
    // =============================================
    function locateUser(callback) {
        const btn = document.getElementById('locateBtn');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Konum alınıyor...';

        if (!navigator.geolocation) {
            btn.innerHTML = '<i class="fas fa-location-crosshairs"></i> Konum desteklenmiyor';
            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-location-crosshairs"></i> Konumumu Bul';
            }, 2000);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                userPosition = { lat: latitude, lng: longitude };

                // Remove previous user marker
                if (userMarker) {
                    map.removeLayer(userMarker);
                }

                // Add user marker
                const userIcon = L.divIcon({
                    className: 'user-location-marker',
                    html: `
            <div style="
              width: 20px; height: 20px;
              background: #3B82F6;
              border-radius: 50%;
              border: 4px solid white;
              box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(0,0,0,0.2);
              animation: pulse 2s ease infinite;
            "></div>
          `,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });

                userMarker = L.marker([latitude, longitude], { icon: userIcon })
                    .addTo(map)
                    .bindPopup('<strong>📍 Konumunuz</strong>');

                if (!callback) {
                    userMarker.openPopup();
                    map.flyTo([latitude, longitude], 14, { duration: 1.5 });
                }

                btn.innerHTML = '<i class="fas fa-location-crosshairs"></i> Konumumu Bul';

                // Rebuild all popups with updated directions (now with origin)
                addVenueMarkers(activeMapCategory !== 'tumu' ? activeMapCategory : undefined);

                if (typeof callback === 'function') {
                    callback();
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                btn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Konum alınamadı';
                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-location-crosshairs"></i> Konumumu Bul';
                }, 2000);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }

    // Public API - to fly to a venue from card click
    window.mythMap = {
        flyToVenue: function (venue) {
            if (map) {
                map.flyTo([venue.lat, venue.lng], 16, { duration: 1.2 });
                setTimeout(() => {
                    const found = markers.find(m => m.venue.id === venue.id);
                    if (found) found.marker.openPopup();
                }, 1300);
            }
        }
    };

    // Init when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMap);
    } else {
        initMap();
    }
})();
