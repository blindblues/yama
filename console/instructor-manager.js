// Gestione form insegnanti
document.addEventListener('DOMContentLoaded', function() {
    const instructorForm = document.getElementById('instructorForm');
    const instructorName = document.getElementById('instructorName');
    const instructorDiscipline = document.getElementById('instructorDiscipline');
    const instructorBiography = document.getElementById('instructorBiography');
    const instructorTitle = document.getElementById('instructorTitle');
    const instructorAchievements = document.getElementById('instructorAchievements');
    const instructorImageUpload = document.getElementById('instructorImageUpload');
    const instructorImagePreview = document.getElementById('instructorImagePreview');
    const instructorPreview = document.getElementById('instructorPreview');

    // Dati degli insegnanti caricati dal JSON
    let instructorsData = {};

    // Funzione per caricare i dati degli insegnanti dal JSON (usa sistema centralizzato)
    async function loadInstructorsData() {
        try {
            // Usa il sistema centralizzato
            const instructors = await window.instructorDataManager.loadInstructors();
            
            // Converti l'array in un oggetto con ID come chiave per compatibilità
            instructorsData = {};
            instructors.forEach(instructor => {
                instructorsData[instructor.id] = {
                    name: instructor.name,
                    discipline: instructor.discipline,
                    biography: instructor.biography,
                    achievements: instructor.achievements || [],
                    image: window.PathConfig.instructorImage(instructor.image)
                };
            });
            
            console.log('Dati insegnanti caricati tramite sistema centralizzato:', instructorsData);
            return instructorsData;
        } catch (error) {
            console.error('Errore caricamento dati insegnanti:', error);
            return {};
        }
    }

    // Funzione per aggiornare l'anteprima
    function updatePreview() {
        const name = instructorName.value || 'Nome Insegnante';
        const discipline = instructorDiscipline.value || 'Disciplina';
        const biography = instructorBiography.value || 'La biografia dell\'insegnante apparirà qui...';
        const title = instructorTitle.value || '';
        const achievements = instructorAchievements.value.split(',').map(a => a.trim()).filter(a => a);
        
        // Aggiorna titolo
        instructorPreview.querySelector('.class-title').textContent = name;
        
        // Aggiorna disciplina
        instructorPreview.querySelector('.class-level').textContent = discipline;
        
        // Aggiorna biografia
        instructorPreview.querySelector('.maestro-biography p').textContent = biography;
        
        // Gestione titoli
        const achievementsList = instructorPreview.querySelector('.maestro-biography ul');
        const titlesHeader = instructorPreview.querySelector('.maestro-biography h4:nth-of-type(2)'); // Il secondo h4 è "Titoli"
        
        // Aggiorna il testo dell'intestazione con il campo instructorTitle
        if (title) {
            titlesHeader.textContent = title;
            titlesHeader.style.display = 'block';
        } else {
            titlesHeader.textContent = 'Titoli';
            titlesHeader.style.display = 'none';
        }
        
        // Gestisci solo la lista degli achievements
        if (achievements.length > 0) {
            achievementsList.style.display = 'block';
            achievementsList.innerHTML = '';
            achievements.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                achievementsList.appendChild(li);
            });
        } else {
            achievementsList.style.display = 'none';
            // Aggiungi contenuto placeholder per mantenere la struttura
            achievementsList.innerHTML = '';
        }
        
        // Mostra la sezione solo se c'è almeno un titolo o achievements
        const hasContent = title || achievements.length > 0;
        titlesHeader.style.display = hasContent && title ? 'block' : 'none';
        achievementsList.style.display = achievements.length > 0 ? 'block' : 'none';
        
        // Resetta sempre la scheda come chiusa dopo l'aggiornamento
        instructorPreview.classList.remove('expanded');
    }

    // Funzione per toggle apertura/chiusura scheda
    function toggleInstructorCard(event) {
        // Se il click è sul close button o su un input/select/textarea, non fare nulla
        if (event.target.classList.contains('close-btn') || 
            event.target.tagName === 'INPUT' || 
            event.target.tagName === 'SELECT' || 
            event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        const isExpanded = instructorPreview.classList.contains('expanded');
        let overlay = document.querySelector('.class-overlay');
        
        if (isExpanded) {
            // Chiudi la scheda
            instructorPreview.classList.remove('expanded');
            
            // Nascondi il pulsante di chiusura
            const closeBtn = instructorPreview.querySelector('.close-btn');
            closeBtn.style.display = 'none';
            
            // Nascondi l'overlay
            if (overlay) {
                overlay.classList.remove('active');
                // Rimuovi l'event listener per evitare duplicazioni
                if (overlay._clickHandler) {
                    overlay.removeEventListener('click', overlay._clickHandler);
                    overlay._clickHandler = null;
                }
            }
            
            // Ripristina lo scroll del body
            document.body.style.overflow = '';
            
            // Riporta la scheda nella sua posizione originale
            restoreOriginalInstructorPosition(instructorPreview);
        } else {
            // Crea o mostra l'overlay
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'class-overlay';
                document.body.appendChild(overlay);
            }
            overlay.classList.add('active');
            
            // Salva la posizione originale prima di spostare
            instructorPreview._originalParent = instructorPreview.parentNode;
            instructorPreview._originalNextSibling = instructorPreview.nextSibling;
            
            document.body.appendChild(instructorPreview);
            instructorPreview.classList.add('expanded');
            
            // Mostra il pulsante di chiusura
            const closeBtn = instructorPreview.querySelector('.close-btn');
            closeBtn.style.display = 'flex';
            
            // Blocca lo scroll del body
            document.body.style.overflow = 'hidden';
            
            // Chiudi la scheda cliccando sull'overlay
            const overlayClickHandler = function(e) {
                // Verifica che il click sia effettivamente sull'overlay e non sulla scheda
                if (e.target === overlay) {
                    toggleInstructorCard(event);
                }
            };
            overlay.addEventListener('click', overlayClickHandler);
            
            // Salva il riferimento al handler per rimuoverlo dopo
            overlay._clickHandler = overlayClickHandler;
            
            // Chiudi la scheda con il tasto ESC
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    toggleInstructorCard(event);
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
        }
    }

    // Funzione per riposizionare una card nella sua posizione originale
    function restoreOriginalInstructorPosition(card) {
        // Usa la posizione originale salvata
        const originalParent = card._originalParent;
        const originalNextSibling = card._originalNextSibling;
        
        if (originalParent && !originalParent.contains(card)) {
            // Inserisci la card nella sua posizione esatta
            if (originalNextSibling && originalNextSibling.parentNode === originalParent) {
                originalParent.insertBefore(card, originalNextSibling);
            } else {
                originalParent.appendChild(card);
            }
            console.log('Card insegnante riposizionata nella posizione originale');
            
            // Pulisci i riferimenti
            card._originalParent = null;
            card._originalNextSibling = null;
        }
    }

    // Funzione per chiudere la scheda
    function closeInstructorCard() {
        // Riporta la scheda nella sua posizione originale
        restoreOriginalInstructorPosition(instructorPreview);
        instructorPreview.classList.remove('expanded');
        
        // Nascondi il pulsante di chiusura
        const closeBtn = instructorPreview.querySelector('.close-btn');
        closeBtn.style.display = 'none';
        
        // Nascondi l'overlay
        const overlay = document.querySelector('.class-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            // Rimuovi l'event listener per evitare duplicazioni
            if (overlay._clickHandler) {
                overlay.removeEventListener('click', overlay._clickHandler);
                overlay._clickHandler = null;
            }
        }
        
        // Ripristina lo scroll del body
        document.body.style.overflow = '';
    }

    // Event listener per il click sulla scheda per aprire/chiudere
    instructorPreview.addEventListener('click', toggleInstructorCard);

    // Event listener per il pulsante di chiusura
    const closeBtn = instructorPreview.querySelector('.close-btn');
    closeBtn.addEventListener('click', function(event) {
        event.stopPropagation();
        closeInstructorCard();
    });

    // Funzione per ricaricare le discipline (chiamabile dopo salvataggio nuovo corso)
    async function refreshDisciplines() {
        await loadDisciplines();
    }

    // Funzione per caricare le discipline per categoria
    async function loadDisciplinesByCategory() {
        try {
            // Carica entrambi i file JSON in parallelo
            const [adultiResponse, ragazziResponse] = await Promise.all([
                fetch(window.PathConfig.coursesAdults()),
                fetch(window.PathConfig.coursesYouth())
            ]);
            
            const [adultiData, ragazziData] = await Promise.all([
                adultiResponse.json(),
                ragazziResponse.json()
            ]);
            
            // Estrai le discipline per categoria
            const adultDisciplines = new Set();
            const youthDisciplines = new Set();
            
            // Aggiungi discipline dai corsi adulti
            adultiData.corsi.forEach(course => {
                if (course.name && course.name.trim()) {
                    adultDisciplines.add(course.name.trim());
                }
            });
            
            // Aggiungi discipline dai corsi ragazzi
            ragazziData.corsi.forEach(course => {
                if (course.name && course.name.trim()) {
                    youthDisciplines.add(course.name.trim());
                }
            });
            
            // Converti in array e ordina alfabeticamente
            return {
                adult: Array.from(adultDisciplines).sort((a, b) => a.localeCompare(b, 'it', { sensitivity: 'base' })),
                youth: Array.from(youthDisciplines).sort((a, b) => a.localeCompare(b, 'it', { sensitivity: 'base' }))
            };
            
        } catch (error) {
            console.error('Errore caricamento discipline:', error);
            // Fallback: discipline predefinite ordinate per categoria
            return {
                adult: [
                    'BRAZILIAN JIUJITSU',
                    'BOXE',
                    'DAITO RYU AIKI JUJUTSU',
                    'KARATE',
                    'KICK BOXING – K1',
                    'KOMBAT TRAINING',
                    'MMA',
                    'MUAY THAI',
                    'TAKEMUSU AIKIDO',
                    'WONDER WOMEN'
                ].sort((a, b) => a.localeCompare(b, 'it', { sensitivity: 'base' })),
                youth: [
                    'BJJ JUNIOR',
                    'MARTIAL KIDZ',
                    'MUAY THAI JUNIOR',
                    'MUAY THAI TEEN',
                    'MUAY THAI YOUNG'
                ].sort((a, b) => a.localeCompare(b, 'it', { sensitivity: 'base' }))
            };
        }
    }

    // Funzione per popolare il dropdown delle discipline con categorie collassabili
    async function populateDisciplineDropdown() {
        const disciplines = await loadDisciplinesByCategory();
        const disciplineOptions = document.getElementById('disciplineOptions');
        
        // Svuota il contenitore
        disciplineOptions.innerHTML = '';
        
        // Aggiungi categoria adulti (collassata)
        if (disciplines.adult.length > 0) {
            const adultCategory = document.createElement('div');
            adultCategory.className = 'discipline-category';
            adultCategory.innerHTML = `
                <div class="discipline-category-header adult" onclick="toggleCategory('adult')">
                    <span>Adulti</span>
                    <span class="category-arrow">▼</span>
                </div>
                <div class="discipline-category-content" id="adult-category-content" style="display: none;">
                    ${disciplines.adult.map(discipline => 
                        `<div class="discipline-option" onclick="selectDiscipline('${discipline}')">${discipline}</div>`
                    ).join('')}
                </div>
            `;
            disciplineOptions.appendChild(adultCategory);
        }
        
        // Aggiungi categoria ragazzi (collassata)
        if (disciplines.youth.length > 0) {
            const youthCategory = document.createElement('div');
            youthCategory.className = 'discipline-category';
            youthCategory.innerHTML = `
                <div class="discipline-category-header youth" onclick="toggleCategory('youth')">
                    <span>Ragazzi</span>
                    <span class="category-arrow">▼</span>
                </div>
                <div class="discipline-category-content" id="youth-category-content" style="display: none;">
                    ${disciplines.youth.map(discipline => 
                        `<div class="discipline-option" onclick="selectDiscipline('${discipline}')">${discipline}</div>`
                    ).join('')}
                </div>
            `;
            disciplineOptions.appendChild(youthCategory);
        }
    }

    // Funzione per toggle delle categorie
    function toggleCategory(category) {
        const content = document.getElementById(`${category}-category-content`);
        const arrow = event.currentTarget.querySelector('.category-arrow');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            arrow.style.transform = 'rotate(180deg)';
        } else {
            content.style.display = 'none';
            arrow.style.transform = 'rotate(0deg)';
        }
    }

    // Funzione per toggle del dropdown
    function toggleDisciplineDropdown() {
        const dropdownContent = document.getElementById('disciplineDropdownContent');
        const dropdownHeader = document.querySelector('.discipline-dropdown-header');
        
        dropdownContent.classList.toggle('show');
        dropdownHeader.classList.toggle('active');
    }

    // Funzione per selezionare una disciplina
    function selectDiscipline(discipline) {
        const selectedText = document.getElementById('selectedDisciplineText');
        const hiddenInput = document.getElementById('instructorDiscipline');
        const dropdownContent = document.getElementById('disciplineDropdownContent');
        const dropdownHeader = document.querySelector('.discipline-dropdown-header');
        
        selectedText.textContent = discipline;
        hiddenInput.value = discipline;
        
        // Chiudi il dropdown
        dropdownContent.classList.remove('show');
        dropdownHeader.classList.remove('active');
        
        // Aggiorna l'anteprima
        updatePreview();
    }

    // Inizializzazione e setup degli eventi
    function initializeInstructorManager() {
        // Sottoscrivi agli aggiornamenti dei dati
        const unsubscribe = window.subscribeToInstructorUpdates((event) => {
            console.log('InstructorManager: ricevuto evento', event.type, event.data);
            
            if (event.type === 'updated' && event.data) {
                // Aggiorna dinamicamente la scheda dell'insegnante modificato
                updateInstructorCard(event.data.id, event.data);
            } else if (event.type === 'loaded' || event.type === 'refresh') {
                // Ricarica tutte le schede se necessario
                refreshAllInstructorCards();
            }
        }, 'instructor-manager');
        
        // Inizializza il form e l'anteprima
        updatePreview();
        
        console.log('InstructorManager: inizializzato con sistema di aggiornamento automatico');
        
        return unsubscribe;
    }

    // Funzione per aggiornare dinamicamente una scheda insegnante in modo immediato
async function updateInstructorCard(instructorId, formData) {
    console.log('updateInstructorCard: aggiornamento immediato scheda ID:', instructorId);
    
    // Usa requestAnimationFrame per aggiornamento DOM immediato
    requestAnimationFrame(() => {
        try {
            // Trova la scheda dell'insegnante nel DOM
            const instructorCard = document.querySelector(`[data-instructor-id="${instructorId}"]`);
            
            if (!instructorCard) {
                console.error('Scheda insegnante non trovata:', instructorId);
                return;
            }
            
            // Aggiorna i dati nella scheda immediatamente
            const titleElement = instructorCard.querySelector('.class-title');
            if (titleElement) {
                titleElement.textContent = formData.name;
            }
            
            const disciplineElement = instructorCard.querySelector('.class-level');
            if (disciplineElement) {
                disciplineElement.textContent = formData.discipline;
            }
            
            const biographyElement = instructorCard.querySelector('.maestro-biography p');
            if (biographyElement) {
                biographyElement.textContent = formData.biography;
            }
            
            // Aggiorna achievements se presenti
            const achievementsList = instructorCard.querySelector('.maestro-biography ul');
            if (achievementsList && formData.achievements) {
                const achievementsArray = formData.achievements.split(',').map(a => a.trim()).filter(a => a);
                achievementsList.innerHTML = '';
                achievementsArray.forEach(achievement => {
                    const li = document.createElement('li');
                    li.textContent = achievement;
                    achievementsList.appendChild(li);
                });
            }
            
            // Aggiorna immagine se modificata
            if (formData.image) {
                const imgElement = instructorCard.querySelector('.class-image img');
                if (imgElement) {
                    imgElement.src = window.PathConfig.instructorImage(formData.image);
                }
            }
            
            console.log('Scheda insegnante aggiornata immediatamente:', instructorId);
            
        } catch (error) {
            console.error('Errore aggiornamento scheda insegnante:', error);
        }
    });
}

    // Funzione per ricaricare tutte le schede (usata per refresh completo)
    async function refreshAllInstructorCards() {
        console.log('refreshAllInstructorCards: ricarica tutte le schede');
        // Per ora questa funzione è un placeholder
        // In futuro potrebbe ricaricare completamente la lista delle schede
    }

    // Inizializza il sistema quando il DOM è pronto
    const unsubscribe = initializeInstructorManager();

    // Aggiorna la funzione refreshDisciplines
    async function refreshDisciplines() {
        await populateDisciplineDropdown();
    }

    // Rendi le funzioni disponibili globalmente
    window.refreshDisciplines = refreshDisciplines;
    window.toggleDisciplineDropdown = toggleDisciplineDropdown;
    window.toggleCategory = toggleCategory;
    window.selectDiscipline = selectDiscipline;
    window.toggleInstructorCard = toggleInstructorCard;
    
    // Funzioni per gestione insegnanti
    window.editInstructor = editInstructor;
    window.deleteInstructor = deleteInstructor;

    // Chiudi il dropdown quando si clicca fuori
    document.addEventListener('click', function(e) {
        const dropdown = document.querySelector('.discipline-dropdown');
        const dropdownContent = document.getElementById('disciplineDropdownContent');
        
        if (!dropdown.contains(e.target)) {
            dropdownContent.classList.remove('show');
            document.querySelector('.discipline-dropdown-header').classList.remove('active');
        }
    });

    // Previeni la chiusura quando si clicca dentro il dropdown
    const dropdownContent = document.getElementById('disciplineDropdownContent');
    if (dropdownContent) {
        dropdownContent.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Event listener per l'anteprima in tempo reale
    instructorName.addEventListener('input', updatePreview);
    instructorDiscipline.addEventListener('change', updatePreview);
    instructorBiography.addEventListener('input', updatePreview);
    instructorTitle.addEventListener('input', updatePreview);
    instructorAchievements.addEventListener('input', updatePreview);
    
    // Aggiungi anche listener per il campo hidden della disciplina
    instructorDiscipline.addEventListener('input', updatePreview);

    // Gestione upload immagine
    instructorImageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = instructorPreview.querySelector('.class-image img');
                img.src = e.target.result;
                img.style.display = 'block';
                
                // Mostra anche nell'area di preview dell'upload
                instructorImagePreview.innerHTML = `<img src="${e.target.result}" style="max-width: 200px; max-height: 200px; border-radius: 8px;">`;
            };
            reader.readAsDataURL(file);
        }
    });

    // Funzione per salvare l'immagine sul server
    async function saveInstructorImage() {
        const file = instructorImageUpload.files[0];
        const instructorId = sessionStorage.getItem('editingInstructorId');
        
        if (!file || !instructorId) {
            return null;
        }

        const formData = new FormData();
        formData.append('image', file);
        formData.append('instructor_id', instructorId);

        try {
            const response = await fetch(window.PathConfig.api.saveInstructorImage(), {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('Immagine salvata:', result.path);
                return result.path;
            } else {
                console.error('Errore salvataggio immagine:', result.message);
                return null;
            }
        } catch (error) {
            console.error('Errore upload:', error);
            return null;
        }
    }

    // Funzione per eliminare un'immagine
    async function deleteInstructorImage(filename) {
        if (!filename) return false;

        try {
            const response = await fetch(window.PathConfig.api.deleteInstructorImage(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ filename: filename })
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('Immagine eliminata con successo');
                return true;
            } else {
                console.error('Errore eliminazione immagine:', result.message);
                return false;
            }
        } catch (error) {
            console.error('Errore eliminazione:', error);
            return false;
        }
    }

    // Funzione per mostrare notifiche
    function showNotification(message, type = 'info') {
        // Crea l'elemento notifica
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Stile per la notifica
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-family: 'Funnel Display', sans-serif;
            font-size: 14px;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        
        // Aggiungi al body
        document.body.appendChild(notification);
        
        // Rimuovi dopo 3 secondi
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Funzione per aggiornare dinamicamente una scheda insegnante
async function updateInstructorCard(instructorId, formData) {
    console.log('updateInstructorCard chiamata con ID:', instructorId, 'e dati:', formData);
    
    try {
        // Trova la scheda dell'insegnante nel DOM
        const instructorCard = document.querySelector(`[data-instructor-id="${instructorId}"]`);
        console.log('Scheda trovata:', !!instructorCard);
        
        if (!instructorCard) {
            console.error('Scheda insegnante non trovata:', instructorId);
            console.log('Schede disponibili:', document.querySelectorAll('[data-instructor-id]'));
            return;
        }
        
        // Aggiorna i dati nella scheda
        const titleElement = instructorCard.querySelector('.class-title');
        console.log('Titolo trovato:', !!titleElement);
        if (titleElement) {
            const oldTitle = titleElement.textContent;
            titleElement.textContent = formData.name;
            console.log('Titolo aggiornato da', oldTitle, 'a', formData.name);
        }
        
        const disciplineElement = instructorCard.querySelector('.class-level');
        console.log('Disciplina trovata:', !!disciplineElement);
        if (disciplineElement) {
            const oldDiscipline = disciplineElement.textContent;
            disciplineElement.textContent = formData.discipline;
            console.log('Disciplina aggiornata da', oldDiscipline, 'a', formData.discipline);
        }
        
        const biographyElement = instructorCard.querySelector('.maestro-biography p');
        console.log('Biografia trovata:', !!biographyElement);
        if (biographyElement) {
            const oldBiography = biographyElement.textContent;
            biographyElement.textContent = formData.biography;
            console.log('Biografia aggiornata');
        }
        
        // Aggiorna achievements se presenti
        const achievementsList = instructorCard.querySelector('.maestro-biography ul');
        console.log('Achievements list trovata:', !!achievementsList);
        if (achievementsList && formData.achievements) {
            const achievementsArray = formData.achievements.split(',').map(a => a.trim()).filter(a => a);
            achievementsList.innerHTML = '';
            achievementsArray.forEach(achievement => {
                const li = document.createElement('li');
                li.textContent = achievement;
                achievementsList.appendChild(li);
            });
            console.log('Achievements aggiornati:', achievementsArray);
        }
        
        // Aggiorna immagine se modificata
        if (formData.image) {
            const imgElement = instructorCard.querySelector('.class-image img');
            console.log('Immagine trovata:', !!imgElement);
            if (imgElement) {
                imgElement.src = window.PathConfig.instructorImage(formData.image);
                console.log('Immagine aggiornata:', formData.image);
            }
        }
        
        console.log('Scheda insegnante aggiornata con successo:', instructorId);
        showNotification('Scheda insegnante aggiornata con successo!', 'success');
        
    } catch (error) {
        console.error('Errore aggiornamento scheda insegnante:', error);
        showNotification('Errore nell\'aggiornamento della scheda', 'error');
    }
}

// Gestione submit form
    instructorForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Ottieni l'ID dell'insegnante che si sta modificando
        const editingInstructorId = sessionStorage.getItem('editingInstructorId');
        
        if (!editingInstructorId) {
            showNotification('Nessun insegnante selezionato per la modifica', 'error');
            return;
        }
        
        // Raccogli i dati dal form
        const formData = {
            id: editingInstructorId,
            name: instructorName.value.trim(),
            discipline: instructorDiscipline.value.trim(),
            biography: instructorBiography.value.trim(),
            achievementstitle: instructorTitle.value.trim(),
            achievements: instructorAchievements.value
        };
        
        // Prima salva l'immagine se presente
        const imagePath = await saveInstructorImage();
        
        if (imagePath) {
            formData.image = imagePath;
        }
        
        try {
            // Usa il sistema centralizzato per salvare
            console.log('Salvataggio tramite sistema centralizzato...');
            const result = await window.instructorDataManager.updateInstructor(formData);
            
            if (result.success) {
                showNotification('Insegnante aggiornato con successo!', 'success');
                
                // Pulisci lo stato di modifica
                sessionStorage.removeItem('editingInstructorId');
                
                // Resetta il form immediatamente
                instructorForm.reset();
                updatePreview();
                
                // L'aggiornamento delle schede è gestito automaticamente dal sistema centralizzato
                // tramite eventi immediati, quindi non è necessario chiamare updateInstructorCard manualmente
                
            } else {
                showNotification('Errore durante il salvataggio: ' + result.message, 'error');
            }
            
        } catch (error) {
            console.error('Errore salvataggio insegnante:', error);
            showNotification('Errore durante il salvataggio dei dati', 'error');
        }
    });

    // Gestione reset form
    instructorForm.addEventListener('reset', function() {
        // Resetta l'anteprima immediatamente
        instructorPreview.querySelector('.class-title').textContent = 'Nome Insegnante';
        instructorPreview.querySelector('.class-level').textContent = 'Disciplina';
        instructorPreview.querySelector('.maestro-biography p').textContent = 'La biografia dell\'insegnante apparirà qui...';
        
        const achievementsList = instructorPreview.querySelector('.maestro-biography ul');
        achievementsList.innerHTML = '<li>I titoli appariranno qui...</li>';
        
        // Resetta immagine
        const img = instructorPreview.querySelector('.class-image img');
        img.src = '';
        img.style.display = 'none';
        
        // Resetta preview upload
        instructorImagePreview.innerHTML = '';
    });
});

// Funzione per modificare un insegnante (usa sistema centralizzato)
async function editInstructor(instructorId) {
    console.log('editInstructor chiamata con ID:', instructorId);
    sessionStorage.setItem('editingInstructorId', instructorId);
    console.log('Impostato stato di modifica per l\'insegnante:', instructorId);
    
    try {
        // Usa il sistema centralizzato per caricare i dati
        console.log('Caricamento dati tramite sistema centralizzato...');
        const instructor = await window.instructorDataManager.getInstructor(instructorId, true);
        
        if (!instructor) {
            console.error('Insegnante non trovato:', instructorId);
            alert('Insegnante non trovato');
            return;
        }
        
        console.log('Dati insegnante caricati:', instructor);
        
        // Popola il form con i dati dell'insegnante
        console.log('Chiamata populateInstructorForm...');
        populateInstructorForm(instructor);
        
        // Aggiorna l'anteprima
        console.log('Chiamata updateInstructorPreviewWithData...');
        updateInstructorPreviewWithData(instructor);
        
        // Switch alla tab degli insegnanti se non è già attiva
        const instructorTab = document.querySelector('.tab-btn[data-tab="2"]');
        if (instructorTab && !instructorTab.classList.contains('active')) {
            console.log('Switch alla tab insegnanti...');
            switchTab('2');
        }
        
        // Scroll al form di modifica
        const formSection = document.querySelector('.instructor-form-section');
        if (formSection) {
            console.log('Scroll al form...');
            formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        showNotification(`Modifica insegnante: ${instructor.name}`, 'info');
        
    } catch (error) {
        console.error('Errore caricamento dati insegnante:', error);
        alert('Errore durante il caricamento dei dati dell\'insegnante: ' + error.message);
    }
}

// Funzione per popolare il form con i dati dell'insegnante
function populateInstructorForm(instructor) {
    console.log('populateInstructorForm chiamata con:', instructor);
    
    // Popola il nome
    const nameInput = document.getElementById('instructorName');
    console.log('Campo nameInput trovato:', !!nameInput);
    if (nameInput) {
        nameInput.value = instructor.name || '';
        console.log('Nome impostato:', nameInput.value);
    }
    
    // Popola la disciplina
    const disciplineInput = document.getElementById('instructorDiscipline');
    const selectedText = document.getElementById('selectedDisciplineText');
    console.log('Campo disciplineInput trovato:', !!disciplineInput, 'selectedText trovato:', !!selectedText);
    if (disciplineInput && instructor.discipline) {
        disciplineInput.value = instructor.discipline;
        if (selectedText) {
            selectedText.textContent = instructor.discipline;
        }
        console.log('Disciplina impostata:', instructor.discipline);
    }
    
    // Popola la biografia
    const biographyInput = document.getElementById('instructorBiography');
    console.log('Campo biographyInput trovato:', !!biographyInput);
    if (biographyInput) {
        biographyInput.value = instructor.biography || '';
        console.log('Biografia impostata, lunghezza:', biographyInput.value.length);
    }
    
    // Popola il titolo (achievementstitle)
    const titleInput = document.getElementById('instructorTitle');
    console.log('Campo titleInput trovato:', !!titleInput);
    if (titleInput) {
        titleInput.value = instructor.achievementstitle || '';
        console.log('Titolo impostato:', titleInput.value);
    }
    
    // Popola gli achievements (lista di titoli)
    const achievementsInput = document.getElementById('instructorAchievements');
    console.log('Campo achievementsInput trovato:', !!achievementsInput);
    if (achievementsInput && instructor.achievements && instructor.achievements.length > 0) {
        achievementsInput.value = instructor.achievements.join(', ');
        console.log('Achievements impostati:', achievementsInput.value);
    }
    
    // Carica l'immagine se presente
    if (instructor.image) {
        const imagePath = window.PathConfig.instructorImage(instructor.image);
        console.log('Caricamento immagine:', imagePath);
        const previewImg = document.querySelector('#instructorPreview .class-image img');
        if (previewImg) {
            previewImg.src = imagePath;
            previewImg.style.display = 'block';
            console.log('Immagine anteprima impostata');
        }
        
        // Mostra anche nell'area di preview dell'upload
        const imagePreview = document.getElementById('instructorImagePreview');
        if (imagePreview) {
            imagePreview.innerHTML = `<img src="${imagePath}" style="max-width: 200px; max-height: 200px; border-radius: 8px;">`;
            console.log('Immagine preview upload impostata');
        }
    }
    
    console.log('Form popolato con i dati dell\'insegnante');
}

// Funzione per aggiornare l'anteprima con i dati dell'insegnante
function updateInstructorPreviewWithData(instructor) {
    const preview = document.getElementById('instructorPreview');
    if (!preview) return;
    
    // Aggiorna titolo
    const titleElement = preview.querySelector('.class-title');
    if (titleElement) {
        titleElement.textContent = instructor.name || 'Nome Insegnante';
    }
    
    // Aggiorna disciplina
    const disciplineElement = preview.querySelector('.class-level');
    if (disciplineElement) {
        disciplineElement.textContent = instructor.discipline || 'Disciplina';
    }
    
    // Aggiorna biografia
    const biographyElement = preview.querySelector('.maestro-biography p');
    if (biographyElement) {
        biographyElement.textContent = instructor.biography || 'La biografia dell\'insegnante apparirà qui...';
    }
    
    // Gestione titoli e achievements
    const titlesHeader = preview.querySelector('.maestro-biography h4:nth-of-type(2)'); // Il secondo h4
    const achievementsList = preview.querySelector('.maestro-biography ul');
    
    // Aggiorna il testo dell'intestazione
    if (titlesHeader) {
        if (instructor.achievementstitle) {
            titlesHeader.textContent = instructor.achievementstitle;
            titlesHeader.style.display = 'block';
        } else {
            titlesHeader.textContent = 'Titoli';
            titlesHeader.style.display = 'none';
        }
    }
    
    // Gestisci la lista degli achievements
    if (achievementsList) {
        if (instructor.achievements && instructor.achievements.length > 0) {
            achievementsList.style.display = 'block';
            achievementsList.innerHTML = '';
            instructor.achievements.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                achievementsList.appendChild(li);
            });
        } else {
            achievementsList.style.display = 'none';
            // Aggiungi contenuto placeholder per mantenere la struttura
            achievementsList.innerHTML = '';
        }
    }
    
    // Mostra la sezione solo se c'è almeno un titolo o achievements
    const hasContent = instructor.achievementstitle || (instructor.achievements && instructor.achievements.length > 0);
    if (titlesHeader) {
        titlesHeader.style.display = hasContent && instructor.achievementstitle ? 'block' : 'none';
    }
    if (achievementsList) {
        achievementsList.style.display = (instructor.achievements && instructor.achievements.length > 0) ? 'block' : 'none';
    }
    
    // Aggiorna immagine
    if (instructor.image) {
        const imagePath = window.PathConfig.instructorImage(instructor.image);
        const img = preview.querySelector('.class-image img');
        if (img) {
            img.src = imagePath;
            img.style.display = 'block';
        }
    }
    
    // Resetta sempre la scheda come chiusa dopo l'aggiornamento
    preview.classList.remove('expanded');
    
    console.log('Anteprima aggiornata con i dati dell\'insegnante');
}

// Funzione per eliminare un insegnante
async function deleteInstructor(instructorId, showConfirm = true) {
    if (showConfirm && !confirm('Sei sicuro di voler eliminare questo insegnante?')) {
        return;
    }
    
    try {
        console.log('deleteInstructor chiamata con ID:', instructorId);
        
        // Qui andrà la logica per eliminare l'insegnante
        // Per ora mostriamo un messaggio
        alert('Funzionalità di eliminazione insegnante da implementare. ID: ' + instructorId);
        
        // TODO: Implementare la logica di eliminazione
        // 1. Chiamare API per eliminare l'insegnante
        // 2. Rimuovere la card dal DOM
        // 3. Mostrare notifica di successo
        
    } catch (error) {
        console.error('Errore eliminazione insegnante:', error);
        alert('Errore durante l\'eliminazione dell\'insegnante');
    }
}
