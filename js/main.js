document.addEventListener('DOMContentLoaded', () => {

    // Gestione della barra di navigazione trasparente
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Gestione menu mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const mainMenu = document.querySelector('.main-menu');
    if (menuToggle && mainMenu) {
        menuToggle.addEventListener('click', () => {
            mainMenu.classList.toggle('active');
            // Gestione dell'icona (hamburger/X)
            const icon = menuToggle.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
    }

    // Gestione menu a tendina per desktop (con hover)
    const hasSubmenus = document.querySelectorAll('.has-submenu');
    hasSubmenus.forEach(item => {
        const submenu = item.querySelector('.submenu');
        if (submenu) {
            item.addEventListener('mouseenter', () => {
                submenu.style.opacity = '1';
                submenu.style.visibility = 'visible';
                submenu.style.transform = 'translateY(0)';
            });
            item.addEventListener('mouseleave', () => {
                submenu.style.opacity = '0';
                submenu.style.visibility = 'hidden';
                submenu.style.transform = 'translateY(10px)';
            });
        }
    });

    // --- Funzione per l'animazione di intro (MODIFICATA) ---
    function handleIntroAnimation() {
        const logoWrapper = document.querySelector('.logo-animation-wrapper');
        const fullLogo = document.querySelector('.full-logo');
        const leftHalf = document.querySelector('.left-half');
        const rightHalf = document.querySelector('.right-half');
        const titleContainer = document.querySelector('.animated-title-container');
        const words = document.querySelectorAll('.animated-title .word');
        const subTitle = document.querySelector('.animated-subtitle');
        
        if (logoWrapper && fullLogo && leftHalf && rightHalf && titleContainer && words.length > 0 && subTitle) {
            
            // FASE 1: Il wrapper e il logo intero diventano visibili e iniziano a ruotare
            logoWrapper.style.opacity = '1';
            fullLogo.style.animation = 'move-and-rotate 2.5s forwards cubic-bezier(0.68, -0.55, 0.27, 1.55)';
            
            // FASE 2: Dopo che la rotazione è completata (3000ms), avviamo la divisione e le altre animazioni
            setTimeout(() => {
                // Nascondiamo il logo intero
                fullLogo.style.display = 'none';
                
                // Mostriamo le due metà e avviamo le animazioni di separazione
                leftHalf.style.display = 'block';
                rightHalf.style.display = 'block';
                leftHalf.style.animation = 'split-and-open-left 1s forwards ease-out';
                rightHalf.style.animation = 'split-and-open-right 1s forwards ease-out';

                // Appare il contenitore del titolo
                titleContainer.style.opacity = '1';
                titleContainer.style.visibility = 'visible';

                // Animazione parola per parola del titolo
                words.forEach((word, index) => {
                    const delay = 500 + (index * 200); 
                    setTimeout(() => {
                        word.style.animation = 'bounceInUp 1.2s forwards';
                    }, delay);
                });

                // Animazione del sottotitolo
                const lastWordDelay = 500 + (words.length * 200);
                setTimeout(() => {
                    subTitle.style.animation = 'bounceInUp 1.2s forwards';
                }, lastWordDelay + 300);
    
            }, 3000); 
        }
    }

    // --- Funzione per caricare e visualizzare le news ---
    async function loadNews() {
        try {
            const response = await fetch('db.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const newsContainer = document.getElementById('main-news-grid');
            const noNewsMessage = document.getElementById('no-main-news-message');
    
            if (newsContainer && data.news && data.news.length > 0) {
                noNewsMessage.style.display = 'none';
                newsContainer.innerHTML = '';
                
                data.news.forEach(newsItem => {
                    const newsCard = document.createElement('div');
                    newsCard.className = 'news-card';
                    
                    newsCard.innerHTML = `
                        <div class="news-image-container">
                            <img src="${newsItem.image}" alt="${newsItem.title}" class="news-image">
                        </div>
                        <div class="news-meta">
                            <span class="news-category">${newsItem.category}</span>
                            <span class="news-date">${newsItem.date}</span>
                        </div>
                        <h3 class="news-title">${newsItem.title}</h3>
                        <p class="news-excerpt">${newsItem.excerpt}</p>
                    `;
                    newsContainer.appendChild(newsCard);
                });
            } else if (noNewsMessage) {
                noNewsMessage.style.display = 'block';
            }
        } catch (error) {
            console.error("Errore nel caricamento delle news:", error);
            const noNewsMessage = document.getElementById('no-main-news-message');
            if (noNewsMessage) {
                noNewsMessage.textContent = 'Errore nel caricamento delle news. Controlla il file db.json e il percorso.';
                noNewsMessage.style.display = 'block';
            }
        }
    }

    // --- Funzione per caricare e visualizzare i contenuti multimediali ---
    function loadMediaContent() {
        const imageGallery = document.getElementById('image-gallery');
        const videoGallery = document.getElementById('video-gallery');
        const noImagesMessage = document.getElementById('no-images-message');
        const noVideosMessage = document.getElementById('no-videos-message');
        
        if (!imageGallery || !videoGallery) return;
        
        imageGallery.innerHTML = '';
        videoGallery.innerHTML = '';

        fetch('db.json')
            .then(response => response.json())
            .then(data => {
                const mediaItems = data.media || [];
                
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
            })
            .catch(error => {
                console.error('Errore nel caricamento della galleria:', error);
                if (noImagesMessage) noImagesMessage.style.display = 'block';
                if (noVideosMessage) noVideosMessage.style.display = 'block';
            });
    }

    // Controlla la pagina corrente per caricare i contenuti appropriati e avviare l'animazione
    const bodyClassList = document.body.classList;
    if (bodyClassList.contains('media-page')) {
        loadMediaContent();
    } else { // Pagina principale
        loadNews();
        if (document.querySelector('.hero-slider')) {
            handleIntroAnimation();
        }
    }
});