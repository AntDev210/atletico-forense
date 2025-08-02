document.addEventListener('DOMContentLoaded', () => {

    const mediaGallery = document.getElementById('media-gallery');
    const noMediaMessage = document.getElementById('no-media-message');

    // Funzione per caricare e visualizzare i media
    function loadAndDisplayMedia() {
        const mediaItems = JSON.parse(localStorage.getItem('mediaItems')) || [];

        // Cancella il contenuto attuale prima di ricaricare
        mediaGallery.innerHTML = '';

        if (mediaItems.length === 0) {
            // Mostra il messaggio se non ci sono media
            mediaGallery.appendChild(noMediaMessage);
            noMediaMessage.style.display = 'block';
        } else {
            noMediaMessage.style.display = 'none';

            mediaItems.forEach(media => {
                const mediaCard = document.createElement('div');
                mediaCard.classList.add('media-card');

                let mediaContent;
                if (media.type === 'image') {
                    mediaContent = `<img src="${media.src}" alt="${media.title}" class="media-item">`;
                } else if (media.type === 'video') {
                    mediaContent = `<video src="${media.src}" controls class="media-item"></video>`;
                }

                mediaCard.innerHTML = `
                    <div class="media-content">
                        ${mediaContent}
                    </div>
                    <div class="media-info">
                        <h4>${media.title}</h4>
                        <p>${media.description}</p>
                    </div>
                `;
                mediaGallery.appendChild(mediaCard);
            });
        }
    }

    // Carica i media all'avvio della pagina
    loadAndDisplayMedia();
});