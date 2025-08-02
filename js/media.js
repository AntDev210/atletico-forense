document.addEventListener('DOMContentLoaded', function() {

    // Gestione del menu a tendina
    const hasSubmenus = document.querySelectorAll('.has-submenu');
    hasSubmenus.forEach(item => {
        const submenu = item.querySelector('.submenu');
        if (submenu) {
            item.addEventListener('mouseenter', () => {
                submenu.style.display = 'block';
            });
            item.addEventListener('mouseleave', () => {
                submenu.style.display = 'none';
            });
        }
    });

    // Gestione del menu mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const mainMenu = document.querySelector('.main-menu');
    if (menuToggle && mainMenu) {
        menuToggle.addEventListener('click', function() {
            mainMenu.classList.toggle('active');
        });
    }

    // Gestione animazione parole H1
    const words = document.querySelectorAll('.word-bounce');
    if (words.length > 0) {
        words.forEach((word, index) => {
            word.style.animationDelay = `${0.5 + (index * 0.3)}s`;
            word.style.animationName = 'bounceInUp';
            word.style.opacity = '1';
        });
    }

    // --- Funzione per caricare e visualizzare le news ---
    function loadAndDisplayNews() {
        const mainNewsGrid = document.querySelector('.news-grid');
        const noMainNewsMessage = document.getElementById('no-main-news-message');

        if (!mainNewsGrid || !noMainNewsMessage) return;

        const newsItems = JSON.parse(localStorage.getItem('newsItems')) || [];
        mainNewsGrid.innerHTML = '';

        if (newsItems.length === 0) {
            noMainNewsMessage.style.display = 'block';
        } else {
            noMainNewsMessage.style.display = 'none';
            
            newsItems.sort((a, b) => {
                const [dayA, monthA, yearA] = a.date.split('/');
                const [dayB, monthB, yearB] = b.date.split('/');
                const dateA = new Date(`${yearA}-${monthA}-${dayA}`);
                const dateB = new Date(`${yearB}-${monthB}-${dayB}`);
                return dateB - dateA;
            });

            newsItems.forEach(news => {
                const newsCard = document.createElement('article');
                newsCard.classList.add('news-card');
                newsCard.dataset.newsId = news.id;
                newsCard.style.cursor = 'pointer';

                let imageHtml = '';
                if (news.image) { 
                    imageHtml = `<div class="news-image-container"><img src="${news.image}" alt="Immagine News" class="news-image"></div>`;
                }

                newsCard.innerHTML = `
                    ${imageHtml}
                    <div class="news-content">
                        <div class="news-meta">
                            <span class="news-category">${news.category}</span>
                            <span class="news-date">${news.date}</span>
                        </div>
                        <h3 class="news-title">${news.title}</h3>
                        <p class="news-excerpt">${news.excerpt}</p>
                    </div>
                `;
                mainNewsGrid.appendChild(newsCard);
            });
        }
    }

    // --- Funzione per caricare e visualizzare i contenuti multimediali (AGGIORNATA) ---
    function loadMediaContent() {
        const imageGallery = document.getElementById('image-gallery');
        const videoGallery = document.getElementById('video-gallery');
        const noImagesMessage = document.getElementById('no-images-message');
        const noVideosMessage = document.getElementById('no-videos-message');
        
        if (!imageGallery || !videoGallery) return;
        
        imageGallery.innerHTML = '';
        videoGallery.innerHTML = '';

        const mediaItems = JSON.parse(localStorage.getItem('mediaItems')) || [];
        
        if (mediaItems.length === 0) {
            if (noImagesMessage) noImagesMessage.style.display = 'block';
            if (noVideosMessage) noVideosMessage.style.display = 'block';
        } else {
            let hasImages = false;
            let hasVideos = false;

            mediaItems.forEach(item => {
                const mediaCard = document.createElement('div');
                mediaCard.classList.add('media-card');

                let mediaHtml = '';
                if (item.type === 'image') {
                    hasImages = true;
                    mediaHtml = `
                        <div class="media-content">
                            <img src="${item.src}" alt="${item.title}" class="media-item">
                        </div>
                    `;
                    mediaCard.innerHTML = `${mediaHtml}<div class="media-info"><h4>${item.title}</h4><p>${item.description}</p><p class="media-date">${item.date}</p></div>`;
                    imageGallery.appendChild(mediaCard);

                } else if (item.type === 'video') {
                    hasVideos = true;
                    if (item.src) { // Video locale
                        mediaHtml = `
                            <div class="media-content">
                                <video class="media-item" controls>
                                    <source src="${item.src}" type="video/mp4">
                                    Il tuo browser non supporta il tag video.
                                </video>
                            </div>
                        `;
                    } else if (item.videoId) { // Video da YouTube
                        mediaHtml = `
                            <div class="media-content">
                                <iframe src="https://www.youtube.com/embed/${item.videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="media-item"></iframe>
                            </div>
                        `;
                    }
                    mediaCard.innerHTML = `${mediaHtml}<div class="media-info"><h4>${item.title}</h4><p>${item.description}</p><p class="media-date">${item.date}</p></div>`;
                    videoGallery.appendChild(mediaCard);
                }
            });

            if (noImagesMessage) noImagesMessage.style.display = hasImages ? 'none' : 'block';
            if (noVideosMessage) noVideosMessage.style.display = hasVideos ? 'none' : 'block';
        }
    }

    // Controlla la pagina corrente per caricare i contenuti appropriati
    if (document.body.classList.contains('media-page')) {
        loadMediaContent();
    } else {
        loadAndDisplayNews();
    }
});