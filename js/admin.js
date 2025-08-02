document.addEventListener('DOMContentLoaded', () => {
    // Elementi per la gestione del login e del layout
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');

    // Elementi per la gestione delle News
    const addNewsForm = document.getElementById('add-news-form');
    const addNewsMessage = document.getElementById('add-news-message');
    const currentNewsContainer = document.getElementById('current-news-container');
    const noNewsMessage = document.querySelector('#news-management-section .no-news-message');
    const newsImageInput = document.getElementById('news-image');
    const imagePreviewAdmin = document.getElementById('image-preview-admin');
    let currentImageFile = null;
    let editingNewsIndex = -1;

    // Elementi per la gestione dei Media
    const addMediaForm = document.getElementById('add-media-form');
    const addMediaMessage = document.getElementById('add-media-message');
    const currentMediaContainer = document.getElementById('current-media-container');
    const noMediaMessage = document.querySelector('#media-management-section .no-media-message');
    const mediaTypeSelect = document.getElementById('media-type');
    const mediaTitleInput = document.getElementById('media-title');
    const mediaDescriptionInput = document.getElementById('media-description');
    const imageUploadContainer = document.getElementById('image-upload-container');
    const videoUploadContainer = document.getElementById('video-upload-container');
    const mediaFileInput = document.getElementById('media-file');
    const videoFileInput = document.getElementById('video-file');
    const videoPreviewAdmin = document.getElementById('video-preview-admin');
    const addMediaBtn = addMediaForm.querySelector('.btn-primary');
    
    // Elementi della barra di progresso
    const mediaProgressContainer = document.getElementById('media-progress-container');
    const mediaProgressBar = document.getElementById('media-progress-bar');
    const mediaProgressText = document.getElementById('media-progress-text');

    let editingMediaIndex = -1;

    // Credenziali di login fittizie
    const MOCK_USERNAME = 'Admin123';
    const MOCK_PASSWORD = 'Francesco1968!';

    // --- FUNZIONI DI BASE ---

    function isAuthenticated() {
        return localStorage.getItem('adminLoggedIn') === 'true';
    }

    function showSection(sectionId) {
        loginSection.classList.remove('active');
        dashboardSection.classList.remove('active');
        if (sectionId === 'login') {
            loginSection.classList.add('active');
        } else if (sectionId === 'dashboard') {
            dashboardSection.classList.add('active');
        }
    }

    function handleLogin(event) {
        event.preventDefault();
        const username = loginForm.username.value;
        const password = loginForm.password.value;

        if (username === MOCK_USERNAME && password === MOCK_PASSWORD) {
            localStorage.setItem('adminLoggedIn', 'true');
            showSection('dashboard');
            loadNews();
            loadMedia();
        } else {
            loginError.textContent = 'Username o password errati.';
        }
    }

    function handleLogout() {
        localStorage.removeItem('adminLoggedIn');
        showSection('login');
        loginForm.reset();
        loginError.textContent = '';
        currentNewsContainer.innerHTML = '';
        currentMediaContainer.innerHTML = '';
        noNewsMessage.style.display = 'block';
        noMediaMessage.style.display = 'block';
    }

    // Gestione della navigazione tra le sezioni della dashboard
    const navLinks = document.querySelectorAll('.admin-menu .nav-link');
    const sections = document.querySelectorAll('.admin-section');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(nav => nav.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            e.target.classList.add('active');
            const targetSectionId = e.target.getAttribute('data-section');
            document.getElementById(targetSectionId).classList.add('active');
        });
    });

    // --- GESTIONE NEWS ---

    let newsItems = JSON.parse(localStorage.getItem('newsItems')) || [];

    function saveNewsToLocalStorage() {
        localStorage.setItem('newsItems', JSON.stringify(newsItems));
    }

    function displayNewsInAdminPanel() {
        currentNewsContainer.innerHTML = '';
        if (newsItems.length === 0) {
            noNewsMessage.style.display = 'block';
        } else {
            noNewsMessage.style.display = 'none';
            newsItems.sort((a, b) => {
                const [dayA, monthA, yearA] = a.date.split('/');
                const [dayB, monthB, yearB] = b.date.split('/');
                const dateA = new Date(`${yearA}-${monthA}-${dayA}`);
                const dateB = new Date(`${yearB}-${monthB}-${dayB}`);
                return dateB - dateA;
            });

            newsItems.forEach((news, index) => {
                const newsCard = document.createElement('div');
                newsCard.classList.add('admin-news-card');
                newsCard.dataset.index = index;
                const imageHtml = news.image ? `<div class="admin-news-image-container"><img src="${news.image}" alt="Immagine News" class="admin-news-image"></div>` : '';
                newsCard.innerHTML = `
                    ${imageHtml}
                    <h4>${news.title}</h4>
                    <p>${news.excerpt}</p>
                    <div class="news-meta">
                        <span>Categoria: ${news.category}</span>
                        <span>Data: ${news.date}</span>
                    </div>
                    <div class="actions">
                        <button class="edit-btn">Modifica</button>
                        <button class="delete-btn">Elimina</button>
                    </div>
                `;
                currentNewsContainer.appendChild(newsCard);
            });
        }
    }

    newsImageInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            currentImageFile = file;
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreviewAdmin.innerHTML = `<img src="${e.target.result}" alt="Anteprima Immagine News" class="preview-image">`;
                imagePreviewAdmin.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            currentImageFile = null;
            imagePreviewAdmin.innerHTML = '<span class="image-preview-text">Nessuna immagine selezionata</span>';
            imagePreviewAdmin.style.display = 'flex';
        }
    });

    function addOrUpdateNews(event) {
        event.preventDefault();
        const category = addNewsForm['news-category'].value;
        const date = addNewsForm['news-date'].value;
        const title = addNewsForm['news-title'].value;
        const excerpt = addNewsForm['news-excerpt'].value;
        const content = addNewsForm['news-content'].value;

        if (!category || !date || !title || !excerpt) {
            alert('Per favore, compila tutti i campi obbligatori (Categoria, Data, Titolo, Estratto).');
            return;
        }

        let imageUrl = '';
        const existingPreviewImage = imagePreviewAdmin.querySelector('.preview-image');

        if (currentImageFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imageUrl = e.target.result;
                finalizeAddOrUpdateNews(category, date, title, excerpt, content, imageUrl);
            };
            reader.readAsDataURL(currentImageFile);
            return;
        } else if (existingPreviewImage && editingNewsIndex !== -1) {
            imageUrl = existingPreviewImage.src;
            finalizeAddOrUpdateNews(category, date, title, excerpt, content, imageUrl);
        } else {
            finalizeAddOrUpdateNews(category, date, title, excerpt, content, imageUrl);
        }
    }

    function finalizeAddOrUpdateNews(category, date, title, excerpt, content, imageUrl) {
        const newsData = {
            id: editingNewsIndex !== -1 ? newsItems[editingNewsIndex].id : Date.now(),
            category,
            date: new Date(date).toLocaleDateString('it-IT'),
            title,
            excerpt,
            content,
            image: imageUrl
        };

        if (editingNewsIndex !== -1) {
            newsItems[editingNewsIndex] = newsData;
        } else {
            newsItems.unshift(newsData);
        }

        saveNewsToLocalStorage();
        displayNewsInAdminPanel();
        resetNewsForm();
        addNewsMessage.textContent = 'News salvata con successo!';
        setTimeout(() => addNewsMessage.textContent = '', 3000);
    }

    function resetNewsForm() {
        addNewsForm.reset();
        newsImageInput.value = '';
        currentImageFile = null;
        imagePreviewAdmin.innerHTML = '<span class="image-preview-text">Nessuna immagine selezionata</span>';
        imagePreviewAdmin.style.display = 'flex';
        editingNewsIndex = -1;
        addNewsForm.querySelector('button[type="submit"]').textContent = 'Aggiungi News';
    }

    function deleteNews(index) {
        if (confirm('Sei sicuro di voler eliminare questa news?')) {
            newsItems.splice(index, 1);
            saveNewsToLocalStorage();
            displayNewsInAdminPanel();
            resetNewsForm();
        }
    }

    function editNews(index) {
        const newsToEdit = newsItems[index];
        addNewsForm['news-category'].value = newsToEdit.category;
        const [day, month, year] = newsToEdit.date.split('/');
        addNewsForm['news-date'].value = `${year}-${month}-${day}`; 
        addNewsForm['news-title'].value = newsToEdit.title;
        addNewsForm['news-excerpt'].value = newsToEdit.excerpt;
        addNewsForm['news-content'].value = newsToEdit.content;

        if (newsToEdit.image) {
            imagePreviewAdmin.innerHTML = `<img src="${newsToEdit.image}" alt="Anteprima Immagine News" class="preview-image">`;
            imagePreviewAdmin.style.display = 'block';
        } else {
            imagePreviewAdmin.innerHTML = '<span class="image-preview-text">Nessuna immagine selezionata</span>';
            imagePreviewAdmin.style.display = 'flex';
        }
        newsImageInput.value = '';
        currentImageFile = null;

        editingNewsIndex = index;
        addNewsForm.querySelector('button[type="submit"]').textContent = 'Aggiorna News';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function loadNews() {
        displayNewsInAdminPanel();
    }

    // --- GESTIONE MEDIA ---

    let mediaItems = JSON.parse(localStorage.getItem('mediaItems')) || [];

    function saveMediaToLocalStorage() {
        localStorage.setItem('mediaItems', JSON.stringify(mediaItems));
    }

    function displayMediaInAdminPanel() {
        currentMediaContainer.innerHTML = '';
        if (mediaItems.length === 0) {
            noMediaMessage.style.display = 'block';
        } else {
            noMediaMessage.style.display = 'none';
            mediaItems.forEach((media, index) => {
                const mediaCard = document.createElement('div');
                mediaCard.classList.add('admin-news-card');
                mediaCard.dataset.index = index;

                let mediaHtml = '';
                if (media.type === 'image') {
                    mediaHtml = `<div class="admin-news-image-container"><img src="${media.src}" alt="${media.title}" class="admin-news-image"></div>`;
                } else if (media.type === 'video') {
                    mediaHtml = `<div class="admin-news-image-container"><video src="${media.src}" controls class="admin-news-video"></video></div>`;
                }

                mediaCard.innerHTML = `
                    ${mediaHtml}
                    <h4>${media.title}</h4>
                    <p>${media.description}</p>
                    <div class="actions">
                        <button class="edit-media-btn">Modifica</button>
                        <button class="delete-media-btn">Elimina</button>
                    </div>
                `;
                currentMediaContainer.appendChild(mediaCard);
            });
        }
    }

    // Anteprima video caricato
    videoFileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                videoPreviewAdmin.innerHTML = `<video src="${e.target.result}" controls class="preview-video"></video>`;
                videoPreviewAdmin.style.display = 'flex';
            };
            reader.readAsDataURL(file);
        } else {
            videoPreviewAdmin.innerHTML = '<span class="image-preview-text">Nessun video selezionato</span>';
            videoPreviewAdmin.style.display = 'flex';
        }
    });

    // Funzioni per la gestione dello stato di caricamento del pulsante e della barra di progresso
    function showLoadingState(button) {
        button.disabled = true;
        button.textContent = 'Caricamento in corso...';
        mediaProgressContainer.style.display = 'block';
        mediaProgressBar.style.width = '0%';
        mediaProgressText.textContent = '0%';
    }

    function hideLoadingState(button, originalText) {
        button.disabled = false;
        button.textContent = originalText;
        mediaProgressContainer.style.display = 'none';
    }

    function updateProgress(event) {
        if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 100);
            mediaProgressBar.style.width = `${percentage}%`;
            mediaProgressText.textContent = `${percentage}%`;
        }
    }

    function addOrUpdateMedia(event) {
        event.preventDefault();
        const type = mediaTypeSelect.value;
        const title = mediaTitleInput.value;
        const description = mediaDescriptionInput.value;
        const originalBtnText = addMediaBtn.textContent;

        if (!title) {
            alert('Per favore, inserisci un titolo per il contenuto multimediale.');
            return;
        }

        if (type === 'image') {
            const file = mediaFileInput.files[0];
            if (!file && editingMediaIndex === -1) {
                alert('Per favore, seleziona un file immagine.');
                return;
            }
            if (file) {
                showLoadingState(addMediaBtn);
                const reader = new FileReader();
                reader.addEventListener('progress', updateProgress);
                reader.onload = function(e) {
                    finalizeAddOrUpdateMedia(type, title, description, e.target.result);
                    hideLoadingState(addMediaBtn, originalBtnText);
                };
                reader.onerror = function() {
                    alert('Errore durante il caricamento del file.');
                    hideLoadingState(addMediaBtn, originalBtnText);
                };
                reader.readAsDataURL(file);
            } else { // Modifica senza nuovo file
                finalizeAddOrUpdateMedia(type, title, description, mediaItems[editingMediaIndex].src);
            }
        } else if (type === 'video') {
            const file = videoFileInput.files[0];
            if (!file && editingMediaIndex === -1) {
                alert('Per favore, seleziona un file video.');
                return;
            }
            if (file) {
                showLoadingState(addMediaBtn);
                const reader = new FileReader();
                reader.addEventListener('progress', updateProgress);
                reader.onload = function(e) {
                    finalizeAddOrUpdateMedia(type, title, description, e.target.result);
                    hideLoadingState(addMediaBtn, originalBtnText);
                };
                reader.onerror = function() {
                    alert('Errore durante il caricamento del file.');
                    hideLoadingState(addMediaBtn, originalBtnText);
                };
                reader.readAsDataURL(file);
            } else { // Modifica senza nuovo file
                finalizeAddOrUpdateMedia(type, title, description, mediaItems[editingMediaIndex].src);
            }
        } else {
            alert('Errore: tipo di media non valido.');
        }
    }

    function finalizeAddOrUpdateMedia(type, title, description, src) {
        const mediaData = {
            id: editingMediaIndex !== -1 ? mediaItems[editingMediaIndex].id : Date.now(),
            type,
            title,
            description,
            src
        };

        if (editingMediaIndex !== -1) {
            mediaItems[editingMediaIndex] = mediaData;
        } else {
            mediaItems.push(mediaData);
        }

        saveMediaToLocalStorage();
        displayMediaInAdminPanel();
        resetMediaForm();
        addMediaMessage.textContent = 'Contenuto multimediale salvato con successo!';
        setTimeout(() => addMediaMessage.textContent = '', 3000);
    }

    function resetMediaForm() {
        addMediaForm.reset();
        mediaFileInput.value = '';
        videoFileInput.value = '';
        videoPreviewAdmin.innerHTML = '<span class="image-preview-text">Nessun video selezionato</span>';
        videoPreviewAdmin.style.display = 'none';
        editingMediaIndex = -1;
        addMediaForm.querySelector('button[type="submit"]').textContent = 'Aggiungi Media';
    }

    function deleteMedia(index) {
        if (confirm('Sei sicuro di voler eliminare questo contenuto multimediale?')) {
            mediaItems.splice(index, 1);
            saveMediaToLocalStorage();
            displayMediaInAdminPanel();
            resetMediaForm();
        }
    }

    function editMedia(index) {
        const mediaToEdit = mediaItems[index];
        mediaTypeSelect.value = mediaToEdit.type;
        mediaTitleInput.value = mediaToEdit.title;
        mediaDescriptionInput.value = mediaToEdit.description;

        // Mostra il campo giusto e l'anteprima in base al tipo di media
        if (mediaToEdit.type === 'image') {
            imageUploadContainer.style.display = 'block';
            videoUploadContainer.style.display = 'none';
        } else if (mediaToEdit.type === 'video') {
            imageUploadContainer.style.display = 'none';
            videoUploadContainer.style.display = 'block';
            videoPreviewAdmin.innerHTML = `<video src="${mediaToEdit.src}" controls class="preview-video"></video>`;
            videoPreviewAdmin.style.display = 'flex';
        }

        editingMediaIndex = index;
        addMediaForm.querySelector('button[type="submit"]').textContent = 'Aggiorna Media';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function loadMedia() {
        displayMediaInAdminPanel();
    }

    // Listener per il cambio di tipo di media
    if (mediaTypeSelect) {
        mediaTypeSelect.addEventListener('change', (e) => {
            if (e.target.value === 'image') {
                imageUploadContainer.style.display = 'block';
                videoUploadContainer.style.display = 'none';
            } else if (e.target.value === 'video') {
                imageUploadContainer.style.display = 'none';
                videoUploadContainer.style.display = 'block';
            }
        });
    }

    // --- LISTENER PRINCIPALI ---

    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    addNewsForm.addEventListener('submit', addOrUpdateNews);
    addMediaForm.addEventListener('submit', addOrUpdateMedia);

    currentNewsContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('delete-btn')) {
            const index = target.closest('.admin-news-card').dataset.index;
            deleteNews(parseInt(index));
        } else if (target.classList.contains('edit-btn')) {
            const index = target.closest('.admin-news-card').dataset.index;
            editNews(parseInt(index));
        }
    });

    currentMediaContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('delete-media-btn')) {
            const index = target.closest('.admin-news-card').dataset.index;
            deleteMedia(parseInt(index));
        } else if (target.classList.contains('edit-media-btn')) {
            const index = target.closest('.admin-news-card').dataset.index;
            editMedia(parseInt(index));
        }
    });

    // Avvio dell'applicazione
    if (isAuthenticated()) {
        showSection('dashboard');
        loadNews();
        loadMedia();
    } else {
        showSection('login');
    }
});