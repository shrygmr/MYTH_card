// =============================================
// MYTh Kart — Reviews System
// =============================================

(function () {
    document.addEventListener('DOMContentLoaded', () => {
        const reviewOverlay = document.getElementById('reviewOverlay');
        const openReviewBtn = document.getElementById('openReviewBtn');
        const closeReviewModal = document.getElementById('closeReviewModal');
        const reviewForm = document.getElementById('reviewForm');
        const reviewVenueSelect = document.getElementById('reviewVenue');
        const stars = document.querySelectorAll('#starRating i');
        const reviewRatingInput = document.getElementById('reviewRating');
        const reviewsList = document.getElementById('reviewsList');
        const loginOverlay = document.getElementById('loginOverlay');

        // Check if UI elements exist
        if (!reviewOverlay || !openReviewBtn) return;

        // 1. Populate Venues Dropdown
        const dbVenues = window.mythDB ? window.mythDB.getVenues() : (typeof venues !== 'undefined' ? venues : []);
        dbVenues.forEach(v => {
            const option = document.createElement('option');
            option.value = v.id;
            option.textContent = v.name + " (" + v.region + ")";
            reviewVenueSelect.appendChild(option);
        });

        // 2. Open / Close Modal Logic
        openReviewBtn.addEventListener('click', () => {
            // Check auth
            const activeSession = localStorage.getItem('myth_active_session');
            if (!activeSession) {
                alert('Yorum yapmak için lütfen önce giriş yapın.');
                if (loginOverlay) {
                    loginOverlay.classList.remove('hidden');
                    document.body.style.overflow = 'hidden';
                }
                return;
            }

            reviewOverlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // block scroll
        });

        closeReviewModal.addEventListener('click', () => {
            reviewOverlay.classList.add('hidden');
            document.body.style.overflow = 'auto'; // unblock scroll
        });

        // 3. Interactive Star Rating
        let currentRating = 0;

        stars.forEach(star => {
            star.addEventListener('mouseover', (e) => {
                const val = parseInt(e.target.dataset.value);
                stars.forEach(s => {
                    if (parseInt(s.dataset.value) <= val) {
                        s.classList.add('hovered');
                    } else {
                        s.classList.remove('hovered');
                    }
                });
            });

            star.addEventListener('mouseout', () => {
                stars.forEach(s => s.classList.remove('hovered'));
            });

            star.addEventListener('click', (e) => {
                currentRating = parseInt(e.target.dataset.value);
                reviewRatingInput.value = currentRating;
                stars.forEach(s => {
                    if (parseInt(s.dataset.value) <= currentRating) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
            });
        });

        // 4. Handle Form Submit
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (currentRating === 0) {
                alert('Lütfen mekan için bir puan (yıldız) verin.');
                return;
            }

            const venueId = parseInt(reviewVenueSelect.value);
            let text = document.getElementById('reviewText').value.trim();
            
            // Swear word filter
            function censorText(str) {
                const badWords = ['amk', 'küfür', 'aq', 'salak', 'aptal', 'gerizekalı', 'sg', 'piç', 'oç', 'lan'];
                let censored = str;
                badWords.forEach(word => {
                    const regex = new RegExp(`\\b${word}\\b`, 'gi');
                    censored = censored.replace(regex, '*'.repeat(word.length));
                });
                return censored;
            }
            
            text = censorText(text);

            const sessionData = JSON.parse(localStorage.getItem('myth_active_session'));
            
            // Mask identifier (show first 5 chars, then ***)
            const iden = sessionData.identifier.toString();
            const maskedName = iden.length > 5 ? iden.substring(0, 5) + "***" : iden + "***";
            
            const newReview = {
                id: Date.now(),
                venueId: venueId,
                author: maskedName,
                realId: sessionData.identifier, // Saved for Admin panel visibility
                authorType: sessionData.type, // 'student' or 'alumni'
                rating: currentRating,
                text: text,
                date: new Date().toLocaleDateString('tr-TR')
            };

            const existingReviews = JSON.parse(localStorage.getItem('myth_reviews') || '[]');
            existingReviews.unshift(newReview); // Add to top
            localStorage.setItem('myth_reviews', JSON.stringify(existingReviews));

            // Reset form and close
            reviewForm.reset();
            currentRating = 0;
            stars.forEach(s => s.classList.remove('active'));
            reviewRatingInput.value = 0;
            
            reviewOverlay.classList.add('hidden');
            document.body.style.overflow = 'auto';

            // Re-render
            renderReviews();
        });

        // 5. Render Reviews
        function renderReviews() {
            const existingReviews = JSON.parse(localStorage.getItem('myth_reviews') || '[]');
            
            if (existingReviews.length === 0) {
                reviewsList.innerHTML = `<div class="no-results" style="padding: 20px;">Henüz yorum yapılmamış. İlk yorumu siz yapın!</div>`;
                return;
            }

            reviewsList.innerHTML = existingReviews.map(r => {
                // Find venue name
                const v = typeof venues !== 'undefined' ? venues.find(ven => ven.id === r.venueId) : null;
                const venueName = v ? v.name : 'Bilinmeyen Mekan';

                // Build stars HTML
                let starsHtml = '';
                for (let i = 1; i <= 5; i++) {
                    if (i <= r.rating) {
                        starsHtml += '<i class="fas fa-star"></i>';
                    } else {
                        starsHtml += '<i class="fas fa-star empty"></i>';
                    }
                }

                // Avatar Icon based on type
                const iconClass = r.authorType === 'student' ? 'fa-user-graduate' : 'fa-user-tie';

                return `
                    <div class="review-card">
                        <div class="review-card-header">
                            <div class="review-user-info">
                                <div class="review-avatar">
                                    <i class="fas ${iconClass}"></i>
                                </div>
                                <div>
                                    <div class="review-user-name">${r.author}</div>
                                    <div class="review-venue">📍 ${venueName}</div>
                                </div>
                            </div>
                            <div class="review-date">${r.date}</div>
                        </div>
                        <div class="review-stars">
                            ${starsHtml}
                        </div>
                        <div class="review-text">${r.text}</div>
                        ${r.reply ? `
                        <div class="business-reply">
                            <strong><i class="fas fa-store"></i> İşletme Yanıtı</strong>
                            ${r.reply}
                        </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        }

        // Init render
        renderReviews();
    });
})();
