// Funzione per caricare gli insegnanti dal file JSON
async function loadInstructorsFromJSON() {
    try {
        console.log('loadInstructorsFromJSON: tentativo di caricamento da', window.PathConfig.instructors());
        const response = await fetch(window.PathConfig.instructors());
        console.log('loadInstructorsFromJSON: response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('loadInstructorsFromJSON: dati caricati:', data);
        return data.insegnanti || [];
    } catch (error) {
        console.error('Errore nel caricamento degli insegnanti:', error);
        console.log('loadInstructorsFromJSON: uso dati di fallback');
        return fallbackInstructors;
    }
}

// Funzione per popolare il dropdown degli insegnanti (usa sistema centralizzato)
async function populateInstructorsDropdown() {
    console.log('populateInstructorsDropdown: inizio caricamento');
    
    try {
        // Usa il sistema centralizzato per caricare gli insegnanti
        const instructors = await window.instructorDataManager.loadInstructors();
        console.log('populateInstructorsDropdown: insegnanti caricati:', instructors.length);
        const dropdown = document.getElementById('instructorsDropdown');
        
        if (!dropdown) {
            console.error('populateInstructorsDropdown: dropdown non trovato');
            return;
        }
        
        // Svuota il dropdown esistente
        dropdown.innerHTML = '';
        
        // Se non ci sono insegnanti, mostra un messaggio
        if (instructors.length === 0) {
            console.warn('populateInstructorsDropdown: nessun insegnante caricato');
            const noInstructorsItem = document.createElement('div');
            noInstructorsItem.className = 'dropdown-item';
            noInstructorsItem.innerHTML = '<span>Nessun insegnante disponibile</span>';
            dropdown.appendChild(noInstructorsItem);
            return;
        }
        
        // Aggiungi gli insegnanti dal sistema centralizzato
        instructors.forEach(instructor => {
            const instructorId = instructor.id.replace(/[^a-zA-Z0-9]/g, '_');
            const dropdownItem = document.createElement('div');
            dropdownItem.className = 'dropdown-item';
            dropdownItem.innerHTML = `
                <input type="checkbox" id="instructor_${instructorId}" value="${instructor.name}">
                <label for="instructor_${instructorId}">${instructor.name}</label>
            `;
            dropdown.appendChild(dropdownItem);
            console.log('populateInstructorsDropdown: aggiunto insegnante', instructor.name);
        });
        
        // Riaggiungi gli event listeners per i nuovi checkbox
        const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                updateSelectedInstructors();
                updateCoursePreview();
            });
        });
        
        console.log('populateInstructorsDropdown: completato');
        
    } catch (error) {
        console.error('populateInstructorsDropdown: errore caricamento insegnanti', error);
        
        // Fallback: carica direttamente dal JSON se il sistema centralizzato fallisce
        console.log('populateInstructorsDropdown: tentativo fallback diretto');
        try {
            const response = await fetch(window.PathConfig.instructors());
            if (response.ok) {
                const data = await response.json();
                const instructors = data.insegnanti || [];
                console.log('populateInstructorsDropdown: fallback caricati', instructors.length, 'insegnanti');
                
                const dropdown = document.getElementById('instructorsDropdown');
                if (dropdown) {
                    dropdown.innerHTML = '';
                    instructors.forEach(instructor => {
                        const instructorId = instructor.id.replace(/[^a-zA-Z0-9]/g, '_');
                        const dropdownItem = document.createElement('div');
                        dropdownItem.className = 'dropdown-item';
                        dropdownItem.innerHTML = `
                            <input type="checkbox" id="instructor_${instructorId}" value="${instructor.name}">
                            <label for="instructor_${instructorId}">${instructor.name}</label>
                        `;
                        dropdown.appendChild(dropdownItem);
                    });
                }
            } else {
                throw new Error('Fallback JSON loading failed');
            }
        } catch (fallbackError) {
            console.error('populateInstructorsDropdown: fallback fallito', fallbackError);
            
            // Ultimo fallback: usa i dati di fallback hardcoded
            const dropdown = document.getElementById('instructorsDropdown');
            if (dropdown) {
                dropdown.innerHTML = '';
                fallbackInstructors.forEach(instructor => {
                    const instructorId = instructor.id.replace(/[^a-zA-Z0-9]/g, '_');
                    const dropdownItem = document.createElement('div');
                    dropdownItem.className = 'dropdown-item';
                    dropdownItem.innerHTML = `
                        <input type="checkbox" id="instructor_${instructorId}" value="${instructor.name}">
                        <label for="instructor_${instructorId}">${instructor.name}</label>
                    `;
                    dropdown.appendChild(dropdownItem);
                });
            }
        }
    }
}

// Gestione dropdown insegnanti
function toggleInstructorsDropdown() {
    console.log('toggleInstructorsDropdown called');
    const dropdown = document.getElementById('instructorsDropdown');
    const header = document.querySelector('.dropdown-header');
    
    console.log('dropdown element:', dropdown);
    console.log('header element:', header);
    
    if (!dropdown || !header) {
        console.error('Dropdown elements not found');
        return;
    }
    
    if (dropdown.classList.contains('show')) {
        console.log('Closing dropdown');
        dropdown.classList.remove('show');
        header.classList.remove('active');
    } else {
        console.log('Opening dropdown');
        dropdown.classList.add('show');
        header.classList.add('active');
    }
}

// Gestione espansione anteprima corso - Identica a classes.html
function toggleCoursePreview() {
    const preview = document.getElementById('coursePreview');
    const isExpanded = preview.classList.contains('expanded');
    let overlay = document.querySelector('.class-overlay');
    
    console.log('toggleCoursePreview called, isExpanded:', isExpanded, 'overlay:', overlay);
    
    if (isExpanded) {
        // Chiudi la scheda
        preview.classList.remove('expanded');
        
        // Rimuovi il pulsante di chiusura
        const closeBtn = preview.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.remove();
        }
        
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
        
        // Rimuovi il placeholder se esiste
        if (preview._placeholder) {
            preview._placeholder.remove();
            preview._placeholder = null;
        }
        
        // Riposiziona la scheda nella sua posizione originale
        restoreOriginalPosition(preview);
        
    } else {
        // Crea o mostra l'overlay
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'class-overlay';
            document.body.appendChild(overlay);
            console.log('Overlay created:', overlay);
        }
        overlay.classList.add('active');
        console.log('Overlay activated');
        
        // Crea un placeholder per mantenere lo spazio
        const placeholder = document.createElement('div');
        placeholder.className = 'class-card expanded-placeholder';
        placeholder.style.height = preview.offsetHeight + 'px';
        // Salva il riferimento al placeholder nella scheda
        preview._placeholder = placeholder;
        preview.parentNode.insertBefore(placeholder, preview);
        
        // Salva la posizione originale prima di spostare
        preview._originalParent = preview.parentNode;
        preview._originalNextSibling = preview.nextSibling;
        
        // Sposta la scheda nel body per garantire posizionamento corretto
        document.body.appendChild(preview);
        
        // Aggiungi la classe expanded dopo aver spostato la scheda
        preview.classList.add('expanded');
        
        // Aggiungi pulsante di chiusura
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = 'X';
        closeBtn.setAttribute('aria-label', 'Chiudi');
        preview.appendChild(closeBtn);
        
        // Blocca lo scroll del body
        document.body.style.overflow = 'hidden';
        
        // Event listener per il pulsante di chiusura
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleCoursePreview();
        });
        
        // Chiudi la scheda con il tasto ESC
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                toggleCoursePreview();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        
        // Chiudi la scheda cliccando sull'overlay
        const overlayClickHandler = function(e) {
            console.log('Overlay clicked, target:', e.target, 'overlay:', overlay);
            // Verifica che il click sia effettivamente sull'overlay e non sulla scheda
            if (e.target === overlay) {
                console.log('Closing preview via overlay click');
                toggleCoursePreview();
            }
        };
        overlay.addEventListener('click', overlayClickHandler);
        
        // Salva il riferimento al handler per rimuoverlo dopo
        overlay._clickHandler = overlayClickHandler;
    }
}

// Funzione per riposizionare una card nella sua posizione originale
function restoreOriginalPosition(card) {
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
        console.log('Card riposizionata nella posizione originale');
        
        // Pulisci i riferimenti
        card._originalParent = null;
        card._originalNextSibling = null;
    }
}

// Chiudi l'anteprima espansa con il pulsante close (deprecato - usa toggleCoursePreview)
function closeCoursePreview() {
    const preview = document.getElementById('coursePreview');
    if (preview.classList.contains('expanded')) {
        toggleCoursePreview();
    }
}

// Chiudi il dropdown quando si clicca fuori
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('instructorsDropdown');
    const header = document.querySelector('.dropdown-header');
    
    if (!e.target.closest('.instructors-dropdown')) {
        dropdown.classList.remove('show');
        header.classList.remove('active');
    }
});

// Aggiorna il testo degli insegnanti selezionati
function updateSelectedInstructors() {
    const checkboxes = document.querySelectorAll('#instructorsDropdown input[type="checkbox"]');
    const selectedText = document.getElementById('selectedInstructorsText');
    const hiddenInput = document.getElementById('courseInstructors');
    
    const selected = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    if (selected.length === 0) {
        selectedText.textContent = 'Seleziona insegnanti...';
        hiddenInput.value = '';
    } else if (selected.length === 1) {
        selectedText.textContent = selected[0];
        hiddenInput.value = selected[0];
    } else {
        selectedText.textContent = `${selected.length} insegnanti selezionati`;
        hiddenInput.value = selected.join(' / ');
    }
}

// Event listeners per il dropdown saranno gestiti nel DOMContentLoaded principale

// Funzione per configurare gli event listeners del dropdown
function setupDropdownEventListeners() {
    console.log('Setting up dropdown event listeners');
    
    // Aggiungi event listeners per i checkbox degli insegnanti - Tab 1
    const checkboxes = document.querySelectorAll('#instructorsDropdown input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedInstructors);
    });
    
    // Aggiungi event listener per il dropdown header - Tab 1
    const dropdownHeader = document.querySelector('.dropdown-header');
    if (dropdownHeader) {
        console.log('Adding click listener to dropdown header');
        dropdownHeader.addEventListener('click', function(e) {
            console.log('Dropdown header clicked');
            e.preventDefault();
            e.stopPropagation();
            toggleInstructorsDropdown();
        });
    } else {
        console.error('Dropdown header not found for event listener');
    }
    
    // Previeni la chiusura del dropdown quando si clicca su un checkbox - Tab 1
    const dropdown = document.getElementById('instructorsDropdown');
    if (dropdown) {
        dropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Event listeners per i checkbox degli insegnanti - Tab 2
    const checkboxes2 = document.querySelectorAll('#instructorsDropdown2 input[type="checkbox"]');
    checkboxes2.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedInstructors2);
    });
    
    // Event listeners per i checkbox degli insegnanti - Tab 3
    const checkboxes3 = document.querySelectorAll('#instructorsDropdown3 input[type="checkbox"]');
    checkboxes3.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedInstructors3);
    });
    
    // Previeni la chiusura dei dropdown quando si clicca su un checkbox
    const dropdown2 = document.getElementById('instructorsDropdown2');
    if (dropdown2) {
        dropdown2.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    const dropdown3 = document.getElementById('instructorsDropdown3');
    if (dropdown3) {
        dropdown3.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Inizializza i form per Tab 2 e 3
    initTab2Form();
    initTab3Form();
    
    console.log('Dropdown event listeners setup completed');
}

// Funzione per aggiornare l'anteprima in tempo reale
function updateCoursePreview() {
    const courseName = document.getElementById('courseName').value;
    const courseCategory = document.getElementById('courseCategory').value;
    const courseDescription = document.getElementById('courseDescription').value;
    const courseInstructors = document.getElementById('courseInstructors').value;
    const imagePreview = document.querySelector('#imagePreview img');
    
    // Aggiorna versione chiusa
    updatePreviewCard('#coursePreview', courseName, courseCategory, courseDescription, courseInstructors, imagePreview);
    
    // Aggiorna versione espansa
    updatePreviewCard('#coursePreviewExpanded', courseName, courseCategory, courseDescription, courseInstructors, imagePreview);
    
    // Aggiorna orari per entrambe le versioni
    updatePreviewSchedule();
}

// Funzione helper per aggiornare una singola scheda di anteprima
function updatePreviewCard(selector, courseName, courseCategory, courseDescription, courseInstructors, imagePreview) {
    // Aggiorna titolo
    const previewTitle = document.querySelector(`${selector} .class-title`);
    if (previewTitle) {
        previewTitle.textContent = courseName || 'Nome Corso';
    }
    
    // Aggiorna categoria
    const previewCategory = document.querySelector(`${selector} .course-category`);
    if (previewCategory) {
        previewCategory.value = courseCategory;
    }
    
    // Aggiorna descrizione
    const previewDescription = document.querySelector(`${selector} .class-description`);
    if (previewDescription) {
        previewDescription.textContent = courseDescription || 'Descrizione del corso apparirà qui...';
    }
    
    // Aggiorna immagine
    const previewImage = document.querySelector(`${selector} .class-image img`);
    if (previewImage) {
        if (imagePreview && imagePreview.src) {
            previewImage.src = imagePreview.src;
            previewImage.style.display = 'block';
        } else {
            previewImage.style.display = 'none';
        }
    }
    
    // Aggiorna insegnanti
    const instructorContainer = document.querySelector(`${selector} .class-instructor`);
    if (instructorContainer) {
        if (courseInstructors) {
            // Crea link cliccabili con separatori come su classes.html
            const instructorNames = courseInstructors.split(' / ').map(name => name.trim());
            let linksHTML = '<span class="instructor-label">Insegnanti:</span> ';
            
            instructorNames.forEach((instructor, index) => {
                // Aggiungi link dell'insegnante
                linksHTML += `<a href="#" class="instructor-link" onclick="return false;">${instructor}</a>`;
                
                // Aggiungi separatore se non ç™¡ l'ultimo
                if (index < instructorNames.length - 1) {
                    linksHTML += `<span class="course-separator">/</span> `;
                }
            });
            
            instructorContainer.innerHTML = linksHTML;
        } else {
            instructorContainer.innerHTML = '<span class="instructor-label">Insegnanti:</span> <span class="instructor-names">-</span>';
        }
    }
}

// Funzione per aggiornare gli orari nell'anteprima
function updatePreviewSchedule() {
    const scheduleItems = document.querySelectorAll('#scheduleContainer .schedule-item');
    
    // Aggiorna sia versione chiusa che espansa
    updateScheduleInCard('#coursePreview', scheduleItems);
    updateScheduleInCard('#coursePreviewExpanded', scheduleItems);
}

// Funzione helper per aggiornare gli orari in una singola scheda
function updateScheduleInCard(selector, scheduleItems) {
    const previewScheduleItems = document.querySelector(`${selector} .schedule-items`);
    
    if (!previewScheduleItems) return;
    
    if (scheduleItems.length === 0) {
        previewScheduleItems.innerHTML = `
            <div class="schedule-item">
                <span class="schedule-day">-</span>
                <span class="schedule-time">-</span>
            </div>
        `;
        return;
    }
    
    let scheduleHTML = '';
    scheduleItems.forEach(item => {
        const day = item.querySelector('.day-select').value;
        const startTime = item.querySelector('.time-start').value;
        const endTime = item.querySelector('.time-end').value;
        
        if (day && startTime && endTime) {
            scheduleHTML += `
                <div class="schedule-item">
                    <span class="schedule-day">${day}</span>
                    <span class="schedule-time">${startTime} - ${endTime}</span>
                </div>
            `;
        }
    });
    
    if (scheduleHTML) {
        previewScheduleItems.innerHTML = scheduleHTML;
    } else {
        previewScheduleItems.innerHTML = `
            <div class="schedule-item">
                <span class="schedule-day">-</span>
                <span class="schedule-time">-</span>
            </div>
        `;
    }
}

// Funzione per inizializzare i percorsi dinamici
function initializeDynamicPaths() {
    console.log('Initializing dynamic paths...');
    
    // Verifica che PathConfig sia disponibile
    if (!window.PathConfig) {
        console.error('PathConfig non disponibile');
        return;
    }
    
    // Aggiorna il logo
    const consoleLogo = document.getElementById('consoleLogo');
    if (consoleLogo) {
        consoleLogo.src = window.PathConfig.logo();
        console.log('Console logo updated:', window.PathConfig.logo());
    }
    
    // Aggiorna il favicon
    const faviconLink = document.getElementById('faviconLink');
    if (faviconLink) {
        faviconLink.href = window.PathConfig.logo();
        console.log('Favicon updated:', window.PathConfig.logo());
    }
    
    // Aggiorna le immagini degli insegnanti statici nell'HTML
    const instructorImages = document.querySelectorAll('.instructors-grid .class-image img');
    instructorImages.forEach((img, index) => {
        const currentSrc = img.getAttribute('src');
        if (currentSrc && currentSrc.startsWith('../img/insegnanti/')) {
            const newSrc = window.PathConfig.instructorImage(currentSrc.replace('../', ''));
            img.src = newSrc;
            console.log(`Instructor image ${index} updated:`, newSrc);
        }
    });
    
    console.log('Dynamic paths initialization completed');
}

// Inizializzazione globale del CourseLibraryManager
let courseManager;

// Console JavaScript - Yamakasi Fight Academy
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Console Yamakasi Fight Academy caricata');
    
    // Inizializza i percorsi dinamici per prima cosa
    initializeDynamicPaths();
    
    // Inizializzazione gestione tab
    initTabNavigation();
    
    // Inizializzazione gestione corsi
    initCourseManager();
    
    // Inizializza il CourseLibraryManager
    if (typeof CourseLibraryManager !== 'undefined') {
        courseManager = new CourseLibraryManager();
        console.log('CourseLibraryManager inizializzato');
    } else {
        console.error('CourseLibraryManager non disponibile');
    }
    
    // Carica i corsi esistenti con refresh forzato
    loadCourses(true);
    
    // Migliora gli input time esistenti
    enhanceTimeInputs();
    
    // Aggiungi event listeners per l'anteprima in tempo reale
    setupPreviewListeners();
    
    // Attiva l'animazione delle anteprime
    setTimeout(() => {
        document.querySelectorAll('.animate-up').forEach(element => {
            element.classList.add('visible');
        });
    }, 100);
    
    // Carica gli insegnanti dal sistema centralizzato
    await populateInstructorsDropdown();
    
    // Setup event listeners per il dropdown degli insegnanti
    setupDropdownEventListeners();
    
    // Sottoscrivi agli aggiornamenti degli insegnanti per refresh automatico del dropdown
    if (window.instructorDataManager) {
        window.subscribeToInstructorUpdates((event) => {
            console.log('Console: ricevuto evento insegnanti', event.type);
            
            if (event.type === 'updated' || event.type === 'loaded' || event.type === 'refresh') {
                // Ricarica il dropdown quando i dati cambiano
                populateInstructorsDropdown();
            }
        }, 'console');
    }
    
    // Aggiunge event listeners per l'espansione delle carte insegnanti
    document.querySelectorAll('.instructors-grid .class-card').forEach(instructorCard => {
        instructorCard.addEventListener('click', function(e) {
            // Non espandere se si clicca su pulsanti o altri elementi interattivi
            if (e.target.closest('button') || e.target.closest('.instructor-actions')) {
                return;
            }
            toggleInstructorCard(instructorCard);
        });
    });
    
    // Previeni la chiusura del dropdown quando si clicca su un checkbox
    const dropdown = document.getElementById('instructorsDropdown');
    dropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });
});

// Funzione per inizializzare la navigazione delle tab
function initTabNavigation() {
    console.log('Inizializzazione navigazione tab...');
    
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.console-content');
    
    console.log('Trovati pulsanti tab:', tabButtons.length);
    console.log('Trovati contenuti tab:', tabContents.length);
    
    // Ripristina la tab attiva dal localStorage o usa la prima tab
    const savedTab = localStorage.getItem('activeConsoleTab') || '1';
    console.log('Tab salvata:', savedTab);
    
    // Aggiungi event listeners per i pulsanti delle tab
    tabButtons.forEach((button, index) => {
        console.log(`Aggiungendo listener al pulsante ${index}:`, button.textContent, button.getAttribute('data-tab'));
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Click su pulsante tab:', this.getAttribute('data-tab'));
            const targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
    
    // Attiva la tab salvata o la prima tab
    const targetTab = savedTab && document.querySelector(`.tab-btn[data-tab="${savedTab}"]`) ? savedTab : '1';
    switchTab(targetTab);
}

// Funzione per cambiare tab
function switchTab(tabNumber) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.console-content');
    
    // Rimuovi la classe active da tutti i pulsanti e contenuti
    tabButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Aggiungi la classe active al pulsante e contenuto selezionati
    const activeButton = document.querySelector(`.tab-btn[data-tab="${tabNumber}"]`);
    const activeContent = document.querySelector(`.console-content[data-content="${tabNumber}"]`);
    
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    if (activeContent) {
        activeContent.classList.add('active');
        
        // Salva la tab attiva nel localStorage
        localStorage.setItem('activeConsoleTab', tabNumber);
        console.log(`Tab ${tabNumber} salvata nel localStorage`);
        
        // Inizializza i form specifici per ogni tab
        if (tabNumber === '2') {
            setTimeout(() => initInstructorTab(), 200);
        } else if (tabNumber === '3') {
            setTimeout(() => initTab3Form(), 100);
        }
    }
    
    console.log(`Switched to tab ${tabNumber}`);
}

// Imposta gli event listeners per l'anteprima
function setupPreviewListeners() {
    // Listener per i campi del form
    const courseNameInput = document.getElementById('courseName');
    
    // Listener unificato per il nome corso: trasforma in maiuscolo e aggiorna anteprima
    courseNameInput.addEventListener('input', function(e) {
        const start = e.target.selectionStart;
        const end = e.target.selectionEnd;
        const oldValue = e.target.value;
        const newValue = oldValue.toUpperCase();
        
        if (oldValue !== newValue) {
            e.target.value = newValue;
            e.target.setSelectionRange(start, end);
        }
        
        updateCoursePreview();
    });
    
    document.getElementById('courseCategory').addEventListener('change', updateCoursePreview);
    document.getElementById('courseDescription').addEventListener('input', updateCoursePreview);
    
    // Listener per il container degli orari (event delegation)
    document.getElementById('scheduleContainer').addEventListener('change', function(e) {
        if (e.target.classList.contains('day-select') || 
            e.target.classList.contains('time-start') || 
            e.target.classList.contains('time-end')) {
            updatePreviewSchedule();
        }
    });
    
    // Listener per aggiungere/rimuovere orari
    document.getElementById('addSchedule').addEventListener('click', function() {
        // Aspetta un momento perchçŸ‡ l'elemento venga aggiunto al DOM
        setTimeout(updatePreviewSchedule, 10);
    });
    
    document.getElementById('scheduleContainer').addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-schedule')) {
            // Aspetta un momento perchçŸ‡ l'elemento venga rimosso dal DOM
            setTimeout(updatePreviewSchedule, 10);
        }
    });
    
    // Listener per l'espansione dell'anteprima
    const coursePreview = document.getElementById('coursePreview');
    coursePreview.addEventListener('click', function(e) {
        // Non espandere se si clicca su link, input o altri elementi interattivi
        if (e.target.closest('a') || e.target.closest('button') || e.target.closest('input')) {
            return;
        }
        toggleCoursePreview();
    });
    
    // Listener per il pulsante close
    const closeBtn = coursePreview.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeCoursePreview();
        });
    }
    document.getElementById('addSchedule').addEventListener('click', function() {
        // Aspetta un momento perchçŸ‡ l'elemento venga aggiunto al DOM
        setTimeout(updatePreviewSchedule, 10);
    });
    
    document.getElementById('scheduleContainer').addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-schedule')) {
            // Aspetta un momento perchçŸ‡ l'elemento venga rimosso dal DOM
            setTimeout(updatePreviewSchedule, 10);
        }
    });
}

// Gestione corsi
function initCourseManager() {
    const form = document.getElementById('courseForm');
    const addScheduleBtn = document.getElementById('addSchedule');
    const scheduleContainer = document.getElementById('scheduleContainer');
    const imageUpload = document.getElementById('courseImageUpload');
    
    // Event listener per il form
    if (form) {
        form.addEventListener('submit', handleCourseSubmit);
        form.addEventListener('reset', function() {
            // Pulisci lo stato di modifica quando il form viene resettato
            sessionStorage.removeItem('editingCourseId');
            console.log('Stato di modifica rimosso dal form reset');
        });
    }
    
    // Event listener per aggiungere orari
    if (addScheduleBtn) {
        addScheduleBtn.addEventListener('click', addScheduleItem);
    }
    
    // Event listener per rimuovere orari (delegation)
    if (scheduleContainer) {
        scheduleContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-schedule')) {
                e.target.parentElement.remove();
            }
        });
    }
    
    // Event listener per il caricamento immagini
    if (imageUpload) {
        imageUpload.addEventListener('change', handleImageUpload);
    }
}

function addScheduleItem() {
    const scheduleContainer = document.getElementById('scheduleContainer');
    const scheduleItem = document.createElement('div');
    scheduleItem.className = 'schedule-item';
    scheduleItem.style.opacity = '0';
    scheduleItem.style.transform = 'translateY(-10px)';
    
    scheduleItem.innerHTML = `
        <select name="day[]" class="day-select">
            <option value="Lunedì" selected>Lunedì</option>
            <option value="Martedì">Martedì</option>
            <option value="Mercoledì">Mercoledì</option>
            <option value="Giovedì">Giovedì</option>
            <option value="Venerdì">Venerdì</option>
            <option value="Sabato">Sabato</option>
            <option value="Domenica">Domenica</option>
        </select>
        <input type="time" name="startTime[]" class="time-start" placeholder="Inizio" min="06:00" max="23:59">
        <input type="time" name="endTime[]" class="time-end" placeholder="Fine" min="06:00" max="23:59">
        <button type="button" class="remove-schedule">Rimuovi</button>
    `;
    
    scheduleContainer.appendChild(scheduleItem);
    
    // Animazione di entrata
    setTimeout(() => {
        scheduleItem.style.transition = 'all 0.3s ease';
        scheduleItem.style.opacity = '1';
        scheduleItem.style.transform = 'translateY(0)';
    }, 10);
    
    // Applica i miglioramenti ai nuovi input time
    enhanceTimeInputs();
    
    // Aggiungi validazione tra orari
    const startTime = scheduleItem.querySelector('.time-start');
    const endTime = scheduleItem.querySelector('.time-end');
    
    const validateTimeRange = () => {
        if (startTime.value && endTime.value) {
            const start = new Date(`2000-01-01T${startTime.value}`);
            const end = new Date(`2000-01-01T${endTime.value}`);
            
            if (end <= start) {
                endTime.style.borderColor = 'rgba(220, 53, 69, 0.8)';
                endTime.style.boxShadow = '0 0 0 2px rgba(220, 53, 69, 0.2)';
                
                // Mostra notifica di avviso
                if (typeof showNotification === 'function') {
                    showNotification('L\'orario di fine deve essere successivo a quello di inizio', 'warning');
                }
            } else {
                endTime.style.borderColor = 'rgba(40, 167, 69, 0.8)';
                endTime.style.boxShadow = '0 0 0 2px rgba(40, 167, 69, 0.2)';
            }
        }
    };
    
    startTime.addEventListener('change', validateTimeRange);
    endTime.addEventListener('change', validateTimeRange);
}

// Funzione per migliorare l'UX degli input time
function enhanceTimeInputs() {
    const timeInputs = document.querySelectorAll('.time-start, .time-end');
    
    timeInputs.forEach(input => {
        // Aggiungi animazione al focus
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
            this.parentElement.style.boxShadow = '0 4px 12px rgba(250, 181, 59, 0.2)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
            this.parentElement.style.boxShadow = 'none';
        });
        
        // Aggiungi validazione visiva
        input.addEventListener('input', function() {
            const value = this.value;
            const [hours, minutes] = value.split(':');
            
            // Validazione orario di palestra (6:00 - 23:59)
            if (hours && minutes) {
                const hourNum = parseInt(hours);
                const minNum = parseInt(minutes);
                
                if (hourNum >= 6 && hourNum <= 23 && minNum >= 0 && minNum <= 59) {
                    this.style.borderColor = 'rgba(40, 167, 69, 0.8)';
                    this.style.boxShadow = '0 0 0 2px rgba(40, 167, 69, 0.2)';
                } else if (hourNum < 6 || hourNum > 23) {
                    this.style.borderColor = 'rgba(220, 53, 69, 0.8)';
                    this.style.boxShadow = '0 0 0 2px rgba(220, 53, 69, 0.2)';
                } else {
                    this.style.borderColor = 'rgba(250, 181, 59, 0.5)';
                    this.style.boxShadow = '0 0 0 2px rgba(250, 181, 59, 0.2)';
                }
            }
            
            // Aggiorna l'anteprima in tempo reale
            updatePreviewSchedule();
        });
        
        // Aggiungi feedback visivo al click
        input.addEventListener('click', function(e) {
            // Animazione di pulse
            this.style.animation = 'pulse 0.3s ease';
            setTimeout(() => {
                this.style.animation = '';
            }, 300);
        });
    });
}

async function handleCourseSubmit(e) {
    e.preventDefault();
    
    console.log('=== HANDLECOURSESUBMIT START ===');
    
    const formData = new FormData(e.target);
    const imageUpload = document.getElementById('courseImageUpload');
    
    // Controlla se siamo in modalitï¿½ modifica
    const editingCourseId = sessionStorage.getItem('editingCourseId');
    
    // Estrai i dati dal form
    const courseData = {
        name: formData.get('courseName'),
        category: formData.get('courseCategory'),
        description: formData.get('courseDescription'),
        instructors: formData.get('courseInstructors'),
        schedule: extractScheduleFromForm(),
        level: '',
        duration: '',
        price: ''
    };
    
    // Gestione immagine
    if (imageUpload.files.length > 0) {
        const file = imageUpload.files[0];
        try {
            courseData.image = await saveUploadedImage(file, courseData.category);
        } catch (error) {
            console.error('Errore nel salvataggio dell\'immagine:', error);
            showNotification('Errore nel caricamento dell\'immagine', 'error');
            return;
        }
    }
    
    try {
        // Usa sempre il CourseLibraryManager
        if (!courseManager) {
            throw new Error('CourseLibraryManager non inizializzato');
        }
        
        if (editingCourseId) {
            // Modalitï¿½ modifica
            console.log('Modifica corso esistente:', editingCourseId);
            await courseManager.updateCourse(editingCourseId, courseData);
            showNotification('Corso aggiornato con successo!');
            sessionStorage.removeItem('editingCourseId');
        } else {
            // Modalitï¿½ aggiunta
            console.log('Aggiunta nuovo corso');
            await courseManager.addCourse(courseData);
            showNotification('Corso aggiunto con successo!');
            
            // Aggiorna il dropdown delle discipline se disponibile
            if (typeof window.refreshDisciplines === 'function') {
                await window.refreshDisciplines();
                console.log('Dropdown discipline aggiornato dopo aggiunta corso');
            }
        }
        
        // Resetta il form
        e.target.reset();
        resetImagePreview();
        updateCoursePreview();
        
        // Ricarica i corsi
        await loadCourses();
        
        // Auto-scroll al corso aggiunto
        if (!editingCourseId) {
            scrollToNewlyAddedCourse(courseData.category, courseData.name);
        }
        
        console.log('=== HANDLECOURSESUBMIT END ===');
        
    } catch (error) {
        console.error('Errore nel salvataggio del corso:', error);
        showNotification('Errore nel salvataggio del corso. Riprova piç¾… tardi.', 'error');
    }
}

// Funzione di supporto per estrarre gli orari dal form
function extractScheduleFromForm() {
    const scheduleItems = document.querySelectorAll('#scheduleContainer .schedule-item');
    const schedule = [];
    
    scheduleItems.forEach(item => {
        const day = item.querySelector('.day-select').value;
        const startTime = item.querySelector('.time-start').value;
        const endTime = item.querySelector('.time-end').value;
        
        if (day && startTime && endTime) {
            schedule.push({
                day: day,
                startTime: startTime,
                endTime: endTime,
                time: `${startTime} - ${endTime}`
            });
        }
    });
    
    return schedule;
}

// Funzione per gestire il cambio di categoria
function showCategory(category) {
    console.log('showCategory called with:', category);
        
    // Rimuovi la classe active da tutti i tab e sezioni
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.category-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Aggiungi la classe active al tab e sezione selezionati
    const activeTab = document.querySelector(`.category-tab[data-category="${category}"]`);
    const activeSection = document.getElementById(`${category}Courses`);
    
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    if (activeSection) {
        activeSection.classList.add('active');
    }
    
    console.log(`Switched to category: ${category}`);
}

// Funzione per caricare e visualizzare i corsi
async function loadCourses(forceRefresh = false) {
    console.log('=== LOADCOURSES START ===', 'forceRefresh:', forceRefresh);
    
    try {
        // Usa sempre il CourseLibraryManager
        if (!courseManager) {
            throw new Error('CourseLibraryManager non inizializzato');
        }
        
        // Forza il refresh per entrambe le categorie se richiesto
        if (forceRefresh) {
            console.log('Forzatura refresh per tutte le categorie...');
            courseManager.clearCategoryCache('adulti');
            courseManager.clearCategoryCache('ragazzi');
        }
        
        console.log('Caricamento corsi da CourseLibraryManager...');
        const courses = await courseManager.loadAllCourses(forceRefresh);
        console.log('Corsi caricati da JSON:', courses.length);
        
        // Ottieni i container delle categorie
        const adultiCoursesList = document.getElementById('adultiCoursesList');
        const ragazziCoursesList = document.getElementById('ragazziCoursesList');
        
        if (!adultiCoursesList || !ragazziCoursesList) {
            console.error('Course list elements not found!');
            return;
        }
        
        // Svuota tutte le liste
        adultiCoursesList.innerHTML = '';
        ragazziCoursesList.innerHTML = '';
        console.log('Liste corsi svuotate');
        
        // Filtra i corsi per categoria
        const adultiCourses = courses.filter(c => c.category === 'adulti' || c.categoria === 'adulti');
        const ragazziCourses = courses.filter(c => c.category === 'ragazzi' || c.categoria === 'ragazzi');
        
        // Ordina i corsi per data di creazione (piç¾… recenti prima)
        const sortedAdulti = [...adultiCourses].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
        });
        const sortedRagazzi = [...ragazziCourses].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);
            return dateB - dateA;
        });
        
        console.log(`Corsi adulti: ${adultiCourses.length}, Corsi ragazzi: ${ragazziCourses.length}`);
        
        // Mostra corsi adulti nella sezione adulti
        sortedAdulti.forEach((course, index) => {
            try {
                const courseCard = createCourseCard(course);
                adultiCoursesList.appendChild(courseCard);
                
                setTimeout(() => {
                    courseCard.classList.add('visible');
                }, 50 * index);
                
                console.log('Card appended to adulti courses DOM');
            } catch (cardError) {
                console.error(`Error creating card for adult course ${course.name}:`, cardError);
            }
        });
        
        // Mostra corsi ragazzi nella sezione ragazzi
        sortedRagazzi.forEach((course, index) => {
            try {
                const courseCard = createCourseCard(course);
                ragazziCoursesList.appendChild(courseCard);
                
                setTimeout(() => {
                    courseCard.classList.add('visible');
                }, 50 * index);
                
                console.log('Card appended to ragazzi courses DOM');
            } catch (cardError) {
                console.error(`Error creating card for youth course ${course.name}:`, cardError);
            }
        });
        
        // Mostra messaggi se non ci sono corsi
        if (adultiCourses.length === 0) {
            adultiCoursesList.innerHTML = '<p>Nessun corso per adulti salvato.</p>';
        }
        
        if (ragazziCourses.length === 0) {
            ragazziCoursesList.innerHTML = '<p>Nessun corso per ragazzi salvato.</p>';
        }
        
        console.log('loadCourses completed successfully');
    } catch (error) {
        console.error('Error in loadCourses:', error);
    }
    
    console.log('=== LOADCOURSES END ===');
}

// Funzione per creare una card corso per la lista
function createCourseCard(course) {
    const card = document.createElement('div');
    card.className = 'class-card animate-up';
    card.dataset.courseId = course.id;
    card.dataset.category = course.category;
    
    // Ottieni l'URL dell'immagine
    const imageUrl = getUploadedImageUrl(course.image);
    
    // Crea gli HTML degli insegnanti come link cliccabili
    let instructorsHTML = '';
    if (course.instructors && typeof course.instructors === 'string') {
        const instructorNames = course.instructors.split(' / ').map(name => name.trim());
        instructorsHTML = '<span class="instructor-label">Insegnanti:</span> ';
        
        instructorNames.forEach((instructor, index) => {
            instructorsHTML += `<a href="#" class="instructor-link" onclick="return false;">${instructor}</a>`;
            
            if (index < instructorNames.length - 1) {
                instructorsHTML += `<span class="course-separator">/</span> `;
            }
        });
    } else {
        instructorsHTML = '<span class="instructor-label">Insegnanti:</span> <span class="instructor-names">-</span>';
    }
    
    // Formatta gli orari
    let scheduleHTML = '';
    if (course.schedule && course.schedule.length > 0) {
        scheduleHTML = course.schedule.map(item => `
            <div class="schedule-item">
                <span class="schedule-day">${item.day}</span>
                <span class="schedule-time">${item.time || `${item.startTime} - ${item.endTime}`}</span>
            </div>
        `).join('');
    } else {
        scheduleHTML = '<div class="schedule-item"><span class="schedule-day">-</span><span class="schedule-time">-</span></div>';
    }
    
    card.innerHTML = `
        <input type="hidden" class="course-category" value="${course.category}">
        <div class="class-image">
            ${imageUrl ? `<img src="${imageUrl}" alt="${course.name}">` : ''}
        </div>
        <div class="class-content">
            <h3 class="class-title">${course.name.toUpperCase()}</h3>
            <p class="class-description">${course.description}</p>
            <div class="class-info">
            </div>
            <div class="class-instructor">
                ${instructorsHTML}
            </div>
            <div class="class-schedule">
                <h4 class="schedule-title">Giorni e Orari</h4>
                <div class="schedule-items">
                    ${scheduleHTML}
                </div>
            </div>
            <div class="course-actions">
                <button class="edit-btn" onclick="editCourse('${course.id}')">Modifica</button>
                <button class="delete-btn" onclick="deleteCourse('${course.id}')">Elimina</button>
            </div>
        </div>
    `;
    
    // Aggiungi event listener per l'espansione della card
    card.addEventListener('click', function(e) {
        if (e.target.closest('a') || e.target.closest('button') || e.target.closest('input') || e.target.closest('.course-actions')) {
            return;
        }
        // Non espandere le carte degli insegnanti
        if (card.hasAttribute('data-instructor-id')) {
            return;
        }
        toggleCourseCard(card);
    });
    
    return card;
}

// Funzione per espandere/chiudere una card corso
function toggleCourseCard(card) {
    const isExpanded = card.classList.contains('expanded');
    let overlay = document.querySelector('.class-overlay');
    
    if (isExpanded) {
        // Chiudi la scheda
        card.classList.remove('expanded');
        
        const closeBtn = card.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.remove();
        }
        
        if (overlay) {
            overlay.classList.remove('active');
            if (overlay._clickHandler) {
                overlay.removeEventListener('click', overlay._clickHandler);
                overlay._clickHandler = null;
            }
        }
        
        document.body.style.overflow = '';
        
        if (card._placeholder) {
            card._placeholder.remove();
            card._placeholder = null;
        }
        
        restoreOriginalPosition(card);
        
    } else {
        // Chiudi altre schede espanse
        document.querySelectorAll('.class-card.expanded').forEach(otherCard => {
            if (otherCard !== card) {
                toggleCourseCard(otherCard);
            }
        });
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'class-overlay';
            document.body.appendChild(overlay);
        }
        overlay.classList.add('active');
        
        const placeholder = document.createElement('div');
        placeholder.className = 'class-card expanded-placeholder';
        placeholder.style.height = card.offsetHeight + 'px';
        card._placeholder = placeholder;
        card.parentNode.insertBefore(placeholder, card);
        
        card._originalParent = card.parentNode;
        card._originalNextSibling = card.nextSibling;
        
        document.body.appendChild(card);
        card.classList.add('expanded');
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = 'X';
        closeBtn.setAttribute('aria-label', 'Chiudi');
        card.appendChild(closeBtn);
        
        document.body.style.overflow = 'hidden';
        
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleCourseCard(card);
        });
        
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                toggleCourseCard(card);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        
        const overlayClickHandler = function(e) {
            if (e.target === overlay) {
                toggleCourseCard(card);
            }
        };
        overlay.addEventListener('click', overlayClickHandler);
        overlay._clickHandler = overlayClickHandler;
    }
}

// Funzione per espandere/chiudere una card insegnante
function toggleInstructorCard(card) {
    const isExpanded = card.classList.contains('expanded');
    let overlay = document.querySelector('.class-overlay');
    
    if (isExpanded) {
        // Chiudi la scheda
        card.classList.remove('expanded');
        
        const closeBtn = card.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.remove();
        }
        
        if (overlay) {
            overlay.classList.remove('active');
            if (overlay._clickHandler) {
                overlay.removeEventListener('click', overlay._clickHandler);
                overlay._clickHandler = null;
            }
        }
        
        document.body.style.overflow = '';
        
        if (card._placeholder) {
            card._placeholder.remove();
            card._placeholder = null;
        }
        
        restoreOriginalInstructorCardPosition(card);
        
    } else {
        // Chiudi altre schede espanse
        document.querySelectorAll('.class-card.expanded').forEach(otherCard => {
            if (otherCard !== card) {
                toggleInstructorCard(otherCard);
            }
        });
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'class-overlay';
            document.body.appendChild(overlay);
        }
        overlay.classList.add('active');
        
        const placeholder = document.createElement('div');
        placeholder.className = 'class-card expanded-placeholder';
        placeholder.style.height = card.offsetHeight + 'px';
        card._placeholder = placeholder;
        card.parentNode.insertBefore(placeholder, card);
        
        card._originalParent = card.parentNode;
        card._originalNextSibling = card.nextSibling;
        
        document.body.appendChild(card);
        card.classList.add('expanded');
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = 'X';
        closeBtn.setAttribute('aria-label', 'Chiudi');
        card.appendChild(closeBtn);
        
        document.body.style.overflow = 'hidden';
        
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleInstructorCard(card);
        });
        
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                toggleInstructorCard(card);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        
        const overlayClickHandler = function(e) {
            if (e.target === overlay) {
                toggleInstructorCard(card);
            }
        };
        overlay.addEventListener('click', overlayClickHandler);
        overlay._clickHandler = overlayClickHandler;
    }
}

// Funzione per riposizionare una card insegnante nella sua posizione originale
function restoreOriginalInstructorCardPosition(card) {
    const originalParent = card._originalParent;
    const originalNextSibling = card._originalNextSibling;
    
    if (originalParent && !originalParent.contains(card)) {
        if (originalNextSibling && originalNextSibling.parentNode === originalParent) {
            originalParent.insertBefore(card, originalNextSibling);
        } else {
            originalParent.appendChild(card);
        }
        console.log('Card insegnante riposizionata nella posizione originale');
        
        card._originalParent = null;
        card._originalNextSibling = null;
    }
}

// Funzione per modificare un corso
async function editCourse(courseId) {
    console.log('editCourse chiamata con ID:', courseId);
    
    // Salva l'ID del corso in fase di modifica
    sessionStorage.setItem('editingCourseId', courseId);
    console.log('Impostato stato di modifica per il corso:', courseId);
    
    // Usa sempre il CourseLibraryManager
    if (!courseManager) {
        throw new Error('CourseLibraryManager non inizializzato');
    }
    
    const course = await courseManager.findCourseById(courseId);
    
    if (!course) {
        console.error('Corso non trovato con ID:', courseId);
        showNotification('Corso non trovato!');
        return;
    }
    
    console.log('Corso trovato:', course);
    
    // Popola il form con i dati del corso
    document.getElementById('courseName').value = course.name;
    document.getElementById('courseCategory').value = course.category;
    document.getElementById('courseDescription').value = course.description;
    
    // Gestione insegnanti multipli
    if (course.instructors && typeof course.instructors === 'string') {
        const instructorNames = course.instructors.split(' / ').map(name => name.trim());
        
        const checkboxes = document.querySelectorAll('#instructorsDropdown input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        instructorNames.forEach(name => {
            const checkbox = Array.from(checkboxes).find(cb => cb.value === name);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
        
        updateSelectedInstructors();
    }
    
    // Carica l'immagine esistente nel preview
    if (course.image) {
        const imageUrl = getUploadedImageUrl(course.image);
        if (imageUrl) {
            const preview = document.getElementById('imagePreview');
            preview.innerHTML = `<img src="${imageUrl}" alt="Anteprima immagine corso">`;
            preview.style.display = 'block';
            updateCoursePreview();
        }
    }
    
    // Carica gli orari esistenti
    const scheduleContainer = document.getElementById('scheduleContainer');
    scheduleContainer.innerHTML = '';
    
    course.schedule.forEach(item => {
        const scheduleItem = document.createElement('div');
        scheduleItem.className = 'schedule-item';
        
        const timeParts = item.time ? item.time.split(' - ') : ['', ''];
        const startTime = item.startTime || timeParts[0] || '';
        const endTime = item.endTime || timeParts[1] || '';
        
        scheduleItem.innerHTML = `
            <select name="day[]" class="day-select">
                <option value="Lunedì" ${item.day === 'Lunedì' ? 'selected' : ''}>Lunedì</option>
                <option value="Martedì" ${item.day === 'Martedì' ? 'selected' : ''}>Martedì</option>
                <option value="Mercoledì" ${item.day === 'Mercoledì' ? 'selected' : ''}>Mercoledì</option>
                <option value="Giovedì" ${item.day === 'Giovedì' ? 'selected' : ''}>Giovedì</option>
                <option value="Venerdì" ${item.day === 'Venerdì' ? 'selected' : ''}>Venerdì</option>
                <option value="Sabato" ${item.day === 'Sabato' ? 'selected' : ''}>Sabato</option>
                <option value="Domenica" ${item.day === 'Domenica' ? 'selected' : ''}>Domenica</option>
            </select>
            <input type="time" name="startTime[]" class="time-start" value="${startTime}">
            <input type="time" name="endTime[]" class="time-end" value="${endTime}">
            <button type="button" class="remove-schedule">Rimuovi</button>
        `;
        scheduleContainer.appendChild(scheduleItem);
    });

    // Scroll al form con evidenziazione
    setTimeout(() => {
        const formSection = document.querySelector('.course-form-section');
        if (formSection) {
            formSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
            });
            
            const originalStyle = formSection.getAttribute('style') || '';
            formSection.style.cssText = originalStyle + `
                border: 4px solid #fab53b !important;
                background: rgba(250, 181, 59, 0.15) !important;
                box-shadow: 0 0 40px rgba(250, 181, 59, 0.6) !important;
                border-radius: 20px !important;
                padding: 2rem !important;
                margin: 1rem 0 !important;
                transform: scale(1.03) !important;
                transition: all 0.5s ease !important;
                position: relative !important;
                z-index: 100 !important;
            `;
            
            setTimeout(() => {
                formSection.style.cssText = originalStyle;
            }, 4000);
        }
    }, 100);

    // Aggiorna l'anteprima con i dati caricati
    updateCoursePreview();

    showNotification('Modifica il corso e clicca "Salva Corso" per aggiornarlo');
}

// Funzione per eliminare un corso
async function deleteCourse(courseId, showConfirm = true) {
    if (showConfirm && !confirm('Sei sicuro di voler eliminare questo corso?')) {
        return;
    }
    
    try {
        // Usa sempre il CourseLibraryManager
        if (!courseManager) {
            throw new Error('CourseLibraryManager non inizializzato');
        }
        
        await courseManager.deleteCourse(courseId);
        console.log('Corso eliminato tramite CourseLibraryManager:', courseId);
        
        // Ricarica la lista
        await loadCourses();
        
        if (showConfirm) {
            showNotification('Corso eliminato con successo!');
        }
        
    } catch (error) {
        console.error('Errore nell\'eliminazione del corso:', error);
        showNotification('Errore nell\'eliminazione del corso. Riprova piç¾… tardi.', 'error');
    }
}

// Funzione per mostrare notifiche
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    const bgColor = type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#4CAF50';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        font-family: 'Funnel Display', sans-serif;
    `;
        
    document.body.appendChild(notification);
        
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Funzione per refresh manuale dei dati
async function refreshCoursesData() {
    console.log('=== REFRESH CORSI START ===');
    
    try {
        if (!courseManager) {
            throw new Error('CourseLibraryManager non inizializzato');
        }
        
        showNotification('Ricaricamento dati dai file JSON...', 'info');
        
        // Forza il ricaricamento dei dati
        await courseManager.refreshData();
        
        // Ricarica la visualizzazione
        await loadCourses(true);
        
        showNotification('Dati aggiornati con successo!', 'success');
        console.log('=== REFRESH CORSI END ===');
        
    } catch (error) {
        console.error('Errore nel refresh dei dati:', error);
        showNotification('Errore nel ricaricamento dei dati', 'error');
    }
}

// Funzioni per gestione immagini
function handleImageUpload(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('imagePreview');
    
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Anteprima immagine">`;
            preview.style.display = 'block';
            updateCoursePreview();
        };
        reader.readAsDataURL(file);
    } else {
        resetImagePreview();
        updateCoursePreview();
    }
}

function resetImagePreview() {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    preview.style.display = 'none';
}

function saveUploadedImage(file, category) {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${sanitizeFileName(file.name)}`;
    const categoryFolder = category === 'ragazzi' ? 'ragazzi' : 'adulti';
    const imagePath = `img/corsi/${categoryFolder}/${fileName}`;
    
    const isOnline = window.location.protocol !== 'file:';
    
    if (isOnline) {
        return uploadImageToServer(file, imagePath, category);
    } else {
        return saveImageLocally(file, imagePath, fileName, categoryFolder);
    }
}

function uploadImageToServer(file, imagePath, category) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', category);
    formData.append('imagePath', imagePath);
    
    const attemptUpload = async (retryCount = 0, maxRetries = 3) => {
        try {
            showUploadProgress('Caricamento immagine sul server...');
            
            const response = await fetch(window.PathConfig.api.uploadImage(), {
                method: 'POST',
                body: formData,
                signal: AbortSignal.timeout(30000)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                console.log('Immagine caricata sul server:', data.path);
                showNotification('Immagine salvata automaticamente sul server!', 'success');
                hideUploadProgress();
                return data.path;
            } else {
                throw new Error(data.error || 'Errore nel caricamento');
            }
            
        } catch (error) {
            console.error(`Tentativo ${retryCount + 1} fallito:`, error);
            
            if ((error.name === 'AbortError' || error.name === 'TypeError') && retryCount < maxRetries) {
                showNotification(`Tentativo ${retryCount + 1} fallito. Riprovo... (${retryCount + 2}/${maxRetries + 1})`, 'warning');
                
                const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
                await new Promise(resolve => setTimeout(resolve, delay));
                
                return attemptUpload(retryCount + 1, maxRetries);
            }
            
            hideUploadProgress();
            showNotification('Errore nel salvataggio dell\'immagine: ' + error.message, 'error');
            
            console.log('Fallback al salvataggio locale');
            return saveImageLocally(file, imagePath, file.name, category);
        }
    };
    
    return attemptUpload();
}

function saveImageLocally(file, imagePath, fileName, categoryFolder) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = {
            path: imagePath,
            dataUrl: e.target.result,
            originalName: file.name,
            category: categoryFolder,
            uploadedAt: new Date().toISOString()
        };
        
        let uploadedImages = JSON.parse(localStorage.getItem('yamakasi_uploaded_images') || '{}');
        uploadedImages[imagePath] = imageData;
        localStorage.setItem('yamakasi_uploaded_images', JSON.stringify(uploadedImages));
        
        console.log('Immagine salvata nel localStorage:', imagePath);
        
        // Mostra solo una notifica di successo senza finestra di download
        showNotification('Immagine salvata con successo nella cache locale!', 'success');
    };
    reader.readAsDataURL(file);
    
    return imagePath;
}

function sanitizeFileName(fileName) {
    return fileName
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_{2,}/g, '_')
        .toLowerCase();
}

function getUploadedImageUrl(imagePath) {
    if (!imagePath) return null;
    
    const uploadedImages = JSON.parse(localStorage.getItem('yamakasi_uploaded_images') || '{}');
    const uploadedImageData = uploadedImages[imagePath];
    
    if (uploadedImageData) {
        return uploadedImageData.dataUrl;
    }
    
    const courseImages = JSON.parse(localStorage.getItem('yamakasi_course_images') || '{}');
    
    for (const [fileName, imageData] of Object.entries(courseImages)) {
        if (imagePath.includes(fileName) || fileName.includes(imagePath.split('/').pop())) {
            return imageData.data;
        }
    }
    
    if (imagePath.startsWith('http') || imagePath.startsWith('/')) {
        return imagePath;
    }
    
    if (imagePath.startsWith('img/')) {
        return window.PathConfig.basePath + imagePath;
    }
    
    return null;
}

function showUploadProgress(message) {
    hideUploadProgress();
    
    const progressIndicator = document.createElement('div');
    progressIndicator.id = 'uploadProgressIndicator';
    progressIndicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(30, 0, 0, 0.9);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        border-left: 4px solid #fab53b;
        z-index: 10000;
        font-family: 'Funnel Display', sans-serif;
        font-size: 0.9rem;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        animation: slideInRight 0.3s ease-out;
    `;
    
    progressIndicator.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="width: 16px; height: 16px; border: 2px solid #fab53b; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <span>${message}</span>
        </div>
    `;
    
    if (!document.querySelector('#uploadProgressAnimations')) {
        const style = document.createElement('style');
        style.id = 'uploadProgressAnimations';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(progressIndicator);
}

function hideUploadProgress() {
    const progressIndicator = document.getElementById('uploadProgressIndicator');
    if (progressIndicator) {
        progressIndicator.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => {
            if (progressIndicator.parentNode) {
                progressIndicator.parentNode.removeChild(progressIndicator);
            }
        }, 300);
    }
}

// Funzione per auto-scroll al corso appena aggiunto
function scrollToNewlyAddedCourse(category, courseName) {
    console.log('Auto-scroll al corso aggiunto:', category, courseName);
    
    // Attiva la categoria corretta
    showCategory(category);
    
    // Aspetta che le card siano state renderizzate
    setTimeout(() => {
        const coursesList = document.getElementById(`${category}CoursesList`);
        if (!coursesList) {
            console.error('Lista corsi non trovata per categoria:', category);
            return;
        }
        
        // Trova la card del corso appena aggiunto (ç™¡ la prima nella lista dato che sono ordinati per data)
        const courseCards = coursesList.querySelectorAll('.class-card');
        if (courseCards.length > 0) {
            const newCourseCard = courseCards[0]; // Il primo elemento ç™¡ il piç¾… recente
            
            // Evidenzia temporaneamente la card
            const originalStyle = newCourseCard.getAttribute('style') || '';
            newCourseCard.style.cssText = originalStyle + `
                border: 3px solid #fab53b !important;
                background: rgba(250, 181, 59, 0.1) !important;
                box-shadow: 0 0 30px rgba(250, 181, 59, 0.5) !important;
                transform: scale(1.02) !important;
                transition: all 0.3s ease !important;
            `;
            
            // Scroll alla card con animazione fluida
            newCourseCard.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center',
                inline: 'nearest'
            });
            
            // Rimuovi l'evidenziazione dopo qualche secondo
            setTimeout(() => {
                newCourseCard.style.cssText = originalStyle;
            }, 3000);
            
            console.log('Scroll completato al corso:', courseName);
        } else {
            console.warn('Nessuna card trovata per il corso:', courseName);
        }
    }, 500); // Aspetta il rendering delle card
}

function extractScheduleFromFormGeneric(tabNumber) {
    const scheduleItems = document.querySelectorAll(`#scheduleContainer${tabNumber} .schedule-item`);
    const schedule = [];
    
    scheduleItems.forEach(item => {
        const day = item.querySelector('.day-select').value;
        const startTime = item.querySelector('.time-start').value;
        const endTime = item.querySelector('.time-end').value;
        
        if (day && startTime && endTime) {
            schedule.push({
                day: day,
                startTime: startTime,
                endTime: endTime,
                time: `${startTime} - ${endTime}`
            });
        }
    });
    
    return schedule;
}

function resetImagePreviewGeneric(tabNumber) {
    const imagePreview = document.getElementById(`imagePreview${tabNumber}`);
    if (imagePreview) {
        imagePreview.innerHTML = '';
    }
}

function handleImageUpload2(e) {
    handleImageUploadGeneric(e, 2);
}

function handleImageUploadGeneric(e, tabNumber) {
    const file = e.target.files[0];
    const preview = document.getElementById(`imagePreview${tabNumber}`);
    
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Anteprima immagine">`;
            
            // Aggiorna l'anteprima del corso
            if (tabNumber === 2) {
                updateCoursePreview2();
            } else {
                updateCoursePreview3();
            }
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '';
    }
}


function updateSelectedInstructors2() {
    const checkboxes = document.querySelectorAll('#instructorsDropdown2 input[type="checkbox"]');
    const selectedText = document.getElementById('selectedInstructorsText2');
    const hiddenInput = document.getElementById('courseInstructors2');
    
    const selected = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    if (selectedText) {
        if (selected.length === 0) {
            selectedText.textContent = 'Seleziona insegnanti...';
        } else if (selected.length === 1) {
            selectedText.textContent = selected[0];
        } else {
            selectedText.textContent = `${selected.length} insegnanti selezionati`;
        }
    }
    
    if (hiddenInput) {
        hiddenInput.value = selected.join(' / ');
    }
}

function updateSelectedInstructors3() {
    const checkboxes = document.querySelectorAll('#instructorsDropdown3 input[type="checkbox"]');
    const selectedText = document.getElementById('selectedInstructorsText3');
    const hiddenInput = document.getElementById('courseInstructors3');
    
    const selected = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    if (selectedText) {
        if (selected.length === 0) {
            selectedText.textContent = 'Seleziona insegnanti...';
        } else if (selected.length === 1) {
            selectedText.textContent = selected[0];
        } else {
            selectedText.textContent = `${selected.length} insegnanti selezionati`;
        }
    }
    
    if (hiddenInput) {
        hiddenInput.value = selected.join(' / ');
    }
}

function updateCoursePreview2() {
    const courseName = document.getElementById('courseName2').value;
    const courseCategory = document.getElementById('courseCategory2').value;
    const courseDescription = document.getElementById('courseDescription2').value;
    const courseInstructors = document.getElementById('courseInstructors2').value;
    const imagePreview = document.querySelector('#imagePreview2 img');
    
    updatePreviewCard('#coursePreview2', courseName, courseCategory, courseDescription, courseInstructors, imagePreview);
    updatePreviewSchedule2();
}

function updateCoursePreview3() {
    const courseName = document.getElementById('courseName3').value;
    const courseCategory = document.getElementById('courseCategory3').value;
    const courseDescription = document.getElementById('courseDescription3').value;
    const courseInstructors = document.getElementById('courseInstructors3').value;
    const imagePreview = document.querySelector('#imagePreview3 img');
    
    updatePreviewCard('#coursePreview3', courseName, courseCategory, courseDescription, courseInstructors, imagePreview);
    updatePreviewSchedule3();
}

function updatePreviewSchedule2() {
    const scheduleItems = document.querySelectorAll('#scheduleContainer2 .schedule-item');
    updateScheduleInCard('#coursePreview2', scheduleItems);
}

function updatePreviewSchedule3() {
    const scheduleItems = document.querySelectorAll('#scheduleContainer3 .schedule-item');
    updateScheduleInCard('#coursePreview3', scheduleItems);
}

async function handleCourseSubmit2(e) {
    e.preventDefault();
    await handleCourseSubmitGeneric(e, 2);
}

async function handleCourseSubmit3(e) {
    e.preventDefault();
    await handleCourseSubmitGeneric(e, 3);
}

async function handleCourseSubmitGeneric(e, tabNumber) {
    console.log(`=== HANDLECOURSESUBMIT START TAB ${tabNumber} ===`);
    
    const formData = new FormData(e.target);
    const imageUpload = document.getElementById(`courseImageUpload${tabNumber}`);
    
    // Estrai i dati dal form
    const courseData = {
        name: formData.get('courseName'),
        category: formData.get('courseCategory'),
        description: formData.get('courseDescription'),
        instructors: formData.get('courseInstructors'),
        schedule: extractScheduleFromFormGeneric(tabNumber),
        level: '',
        duration: '',
        price: ''
    };
    
    // Gestione immagine
    if (imageUpload && imageUpload.files.length > 0) {
        const file = imageUpload.files[0];
        try {
            courseData.image = await saveUploadedImage(file, courseData.category);
        } catch (error) {
            console.error('Errore nel salvataggio dell\'immagine:', error);
            showNotification('Errore nel caricamento dell\'immagine', 'error');
            return;
        }
    }
    
    try {
        if (!courseManager) {
            throw new Error('CourseLibraryManager non inizializzato');
        }
        
        await courseManager.addCourse(courseData);
        showNotification('Corso aggiunto con successo!');
        
        // Resetta il form
        e.target.reset();
        resetImagePreviewGeneric(tabNumber);
        
        // Aggiorna anteprima
        if (tabNumber === 2) {
            updateCoursePreview2();
        } else {
            updateCoursePreview3();
        }
        
        // Ricarica i corsi
        await loadCourses();
        
        console.log(`=== HANDLECOURSESUBMIT END TAB ${tabNumber} ===`);
        
    } catch (error) {
        console.error('Errore nel salvataggio del corso:', error);
        showNotification('Errore nel salvataggio del corso. Riprova piç¾… tardi.', 'error');
    }
}

function initTab2Form() {
    const form2 = document.getElementById('courseForm2');
    const addScheduleBtn2 = document.getElementById('addSchedule2');
    const scheduleContainer2 = document.getElementById('scheduleContainer2');
    const imageUpload2 = document.getElementById('courseImageUpload2');
    
    if (form2) {
        form2.addEventListener('submit', handleCourseSubmit2);
    }
    
    if (addScheduleBtn2) {
        addScheduleBtn2.addEventListener('click', addScheduleItem2);
    }
    
    if (scheduleContainer2) {
        scheduleContainer2.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-schedule')) {
                e.target.parentElement.remove();
            }
        });
    }
    
    if (imageUpload2) {
        imageUpload2.addEventListener('change', handleImageUpload2);
    }
    
    // Setup preview listeners per Tab 2
    setupPreviewListeners2();
}

function initTab3Form() {
    const form3 = document.getElementById('courseForm3');
    const addScheduleBtn3 = document.getElementById('addSchedule3');
    const scheduleContainer3 = document.getElementById('scheduleContainer3');
    const imageUpload3 = document.getElementById('courseImageUpload3');
    
    if (form3) {
        form3.addEventListener('submit', handleCourseSubmit3);
    }
    
    if (addScheduleBtn3) {
        addScheduleBtn3.addEventListener('click', addScheduleItem3);
    }
    
    if (scheduleContainer3) {
        scheduleContainer3.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-schedule')) {
                e.target.parentElement.remove();
            }
        });
    }
    
    if (imageUpload3) {
        imageUpload3.addEventListener('change', handleImageUpload3);
    }
    
    // Setup preview listeners per Tab 3
    setupPreviewListeners3();
}

function addScheduleItem2() {
    const scheduleContainer = document.getElementById('scheduleContainer2');
    const scheduleItem = document.createElement('div');
    scheduleItem.className = 'schedule-item';
    scheduleItem.style.opacity = '0';
    scheduleItem.style.transform = 'translateY(-10px)';
    
    scheduleItem.innerHTML = `
        <select name="day[]" class="day-select">
            <option value="Lunedì" selected>Lunedì</option>
            <option value="Martedì">Martedì</option>
            <option value="Mercoledì">Mercoledì</option>
            <option value="Giovedì">Giovedì</option>
            <option value="Venerdì">Venerdì</option>
            <option value="Sabato">Sabato</option>
            <option value="Domenica">Domenica</option>
        </select>
        <input type="time" name="startTime[]" class="time-start" placeholder="Inizio" min="06:00" max="23:59">
        <input type="time" name="endTime[]" class="time-end" placeholder="Fine" min="06:00" max="23:59">
        <button type="button" class="remove-schedule">Rimuovi</button>
    `;
    
    scheduleContainer.appendChild(scheduleItem);
    
    setTimeout(() => {
        scheduleItem.style.transition = 'all 0.3s ease';
        scheduleItem.style.opacity = '1';
        scheduleItem.style.transform = 'translateY(0)';
    }, 10);
    
    enhanceTimeInputs();
}

function addScheduleItem3() {
    const scheduleContainer = document.getElementById('scheduleContainer3');
    const scheduleItem = document.createElement('div');
    scheduleItem.className = 'schedule-item';
    scheduleItem.style.opacity = '0';
    scheduleItem.style.transform = 'translateY(-10px)';
    
    scheduleItem.innerHTML = `
        <select name="day[]" class="day-select">
            <option value="Lunedì" selected>Lunedì</option>
            <option value="Martedì">Martedì</option>
            <option value="Mercoledì">Mercoledì</option>
            <option value="Giovedì">Giovedì</option>
            <option value="Venerdì">Venerdì</option>
            <option value="Sabato">Sabato</option>
            <option value="Domenica">Domenica</option>
        </select>
        <input type="time" name="startTime[]" class="time-start" placeholder="Inizio" min="06:00" max="23:59">
        <input type="time" name="endTime[]" class="time-end" placeholder="Fine" min="06:00" max="23:59">
        <button type="button" class="remove-schedule">Rimuovi</button>
    `;
    
    scheduleContainer.appendChild(scheduleItem);
    
    setTimeout(() => {
        scheduleItem.style.transition = 'all 0.3s ease';
        scheduleItem.style.opacity = '1';
        scheduleItem.style.transform = 'translateY(0)';
    }, 10);
    
    enhanceTimeInputs();
}

function setupPreviewListeners2() {
    const courseNameInput = document.getElementById('courseName2');
    
    if (courseNameInput) {
        courseNameInput.addEventListener('input', function(e) {
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const oldValue = e.target.value;
            const newValue = oldValue.toUpperCase();
            
            if (oldValue !== newValue) {
                e.target.value = newValue;
                e.target.setSelectionRange(start, end);
            }
            
            updateCoursePreview2();
        });
    }
    
    const courseCategory = document.getElementById('courseCategory2');
    if (courseCategory) {
        courseCategory.addEventListener('change', updateCoursePreview2);
    }
    
    const courseDescription = document.getElementById('courseDescription2');
    if (courseDescription) {
        courseDescription.addEventListener('input', updateCoursePreview2);
    }
    
    // Listener per il dropdown degli insegnanti
    const checkboxes = document.querySelectorAll('#instructorsDropdown2 input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateSelectedInstructors2();
            updateCoursePreview2();
        });
    });
    
    // Listener per il container degli orari
    const scheduleContainer = document.getElementById('scheduleContainer2');
    if (scheduleContainer) {
        scheduleContainer.addEventListener('change', function(e) {
            if (e.target.classList.contains('day-select') || 
                e.target.classList.contains('time-start') || 
                e.target.classList.contains('time-end')) {
                updatePreviewSchedule2();
            }
        });
    }
    
    const addScheduleBtn = document.getElementById('addSchedule2');
    if (addScheduleBtn) {
        addScheduleBtn.addEventListener('click', function() {
            setTimeout(updatePreviewSchedule2, 10);
        });
    }
}

function setupPreviewListeners3() {
    const courseNameInput = document.getElementById('courseName3');
    
    if (courseNameInput) {
        courseNameInput.addEventListener('input', function(e) {
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const oldValue = e.target.value;
            const newValue = oldValue.toUpperCase();
            
            if (oldValue !== newValue) {
                e.target.value = newValue;
                e.target.setSelectionRange(start, end);
            }
            
            updateCoursePreview3();
        });
    }
    
    const courseCategory = document.getElementById('courseCategory3');
    if (courseCategory) {
        courseCategory.addEventListener('change', updateCoursePreview3);
    }
    
    const courseDescription = document.getElementById('courseDescription3');
    if (courseDescription) {
        courseDescription.addEventListener('input', updateCoursePreview3);
    }
    
    // Listener per il dropdown degli insegnanti
    const checkboxes = document.querySelectorAll('#instructorsDropdown3 input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateSelectedInstructors3();
            updateCoursePreview3();
        });
    });
    
    // Listener per il container degli orari
    const scheduleContainer = document.getElementById('scheduleContainer3');
    if (scheduleContainer) {
        scheduleContainer.addEventListener('change', function(e) {
            if (e.target.classList.contains('day-select') || 
                e.target.classList.contains('time-start') || 
                e.target.classList.contains('time-end')) {
                updatePreviewSchedule3();
            }
        });
    }
    
    const addScheduleBtn3 = document.getElementById('addSchedule3');
    if (addScheduleBtn3) {
        addScheduleBtn3.addEventListener('click', function() {
            setTimeout(updatePreviewSchedule3, 10);
        });
    }
}

// Gli event listeners per Tab 2 e 3 sono gestiti in setupDropdownEventListeners()

// Funzione per inizializzare il tab insegnanti
function initInstructorTab() {
    console.log('Inizializzazione tab insegnanti...');
    
    // Rimuovi event listeners esistenti per evitare duplicazioni
    document.querySelectorAll('.instructors-grid .class-card').forEach(instructorCard => {
        // Clona il nodo per rimuovere tutti gli event listeners
        const newCard = instructorCard.cloneNode(true);
        instructorCard.parentNode.replaceChild(newCard, instructorCard);
    });
    
    // Aggiunge event listeners per l'espansione delle carte insegnanti
    document.querySelectorAll('.instructors-grid .class-card').forEach(instructorCard => {
        console.log('Aggiungendo event listener alla carta insegnante:', instructorCard);
        instructorCard.addEventListener('click', function(e) {
            console.log('Click sulla carta insegnante rilevato');
            // Non espandere se si clicca su pulsanti o altri elementi interattivi
            if (e.target.closest('button') || e.target.closest('.instructor-actions')) {
                console.log('Click su elemento interattivo, non espandere');
                return;
            }
            console.log('Chiamata toggleInstructorCard');
            toggleInstructorCard(this);
        });
    });
    
    console.log('Event listeners per carte insegnanti aggiunti. Totale carte trovate:', document.querySelectorAll('.instructors-grid .class-card').length);
    
    // Carica le discipline per il dropdown
    if (typeof window.refreshDisciplines === 'function') {
        window.refreshDisciplines();
    }
    
    // Inizializza l'anteprima vuota
    const instructorPreview = document.getElementById('instructorPreview');
    if (instructorPreview) {
        // Assicurati che l'anteprima sia resettata
        const previewTitle = instructorPreview.querySelector('.class-title');
        const previewDiscipline = instructorPreview.querySelector('.class-level');
        const previewBiography = instructorPreview.querySelector('.maestro-biography p');
        
        if (previewTitle) previewTitle.textContent = 'Nome Insegnante';
        if (previewDiscipline) previewDiscipline.textContent = 'Disciplina';
        if (previewBiography) previewBiography.textContent = 'La biografia dell\'insegnante apparirÃ  qui...';
    }
    
    // Aggiungi event listeners per l'anteprima in tempo reale del form insegnanti
    setupInstructorPreviewListeners();
}

// Funzione per impostare gli event listeners per l'anteprima insegnanti
function setupInstructorPreviewListeners() {
    console.log('Impostazione event listeners per anteprima insegnanti...');
    
    // Listener per i campi del form insegnanti
    const instructorNameInput = document.getElementById('instructorName');
    const instructorDisciplineInput = document.getElementById('instructorDiscipline');
    const instructorBiographyInput = document.getElementById('instructorBiography');
    const instructorTitleInput = document.getElementById('instructorTitle');
    const instructorAchievementsInput = document.getElementById('instructorAchievements');
    const instructorImageUpload = document.getElementById('instructorImageUpload');
    
    if (instructorNameInput) {
        instructorNameInput.addEventListener('input', updateInstructorPreview);
        console.log('Event listener aggiunto per instructorName');
    }
    
    if (instructorDisciplineInput) {
        instructorDisciplineInput.addEventListener('change', updateInstructorPreview);
        console.log('Event listener aggiunto per instructorDiscipline');
    }
    
    if (instructorBiographyInput) {
        instructorBiographyInput.addEventListener('input', updateInstructorPreview);
        console.log('Event listener aggiunto per instructorBiography');
    }
    
    if (instructorTitleInput) {
        instructorTitleInput.addEventListener('input', updateInstructorPreview);
        console.log('Event listener aggiunto per instructorTitle');
    }
    
    if (instructorAchievementsInput) {
        instructorAchievementsInput.addEventListener('input', updateInstructorPreview);
        console.log('Event listener aggiunto per instructorAchievements');
    }
    
    if (instructorImageUpload) {
        instructorImageUpload.addEventListener('change', handleInstructorImageUpload);
        console.log('Event listener aggiunto per instructorImageUpload');
    }
}

// Funzione per gestire l'upload dell'immagine insegnante
function handleInstructorImageUpload(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('instructorImagePreview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Anteprima immagine insegnante">`;
            preview.style.display = 'block';
            updateInstructorPreview();
        };
        reader.readAsDataURL(file);
    }
}

// Funzione per aggiornare l'anteprima dell'insegnante in tempo reale
function updateInstructorPreview() {
    const instructorName = document.getElementById('instructorName').value;
    const instructorDiscipline = document.getElementById('instructorDiscipline').value;
    const instructorBiography = document.getElementById('instructorBiography').value;
    const instructorTitle = document.getElementById('instructorTitle').value;
    const instructorAchievements = document.getElementById('instructorAchievements').value;
    const imagePreview = document.querySelector('#instructorImagePreview img');
    
    const instructorPreview = document.getElementById('instructorPreview');
    if (!instructorPreview) return;
    
    // Aggiorna titolo
    const previewTitle = instructorPreview.querySelector('.class-title');
    if (previewTitle) {
        previewTitle.textContent = instructorName || 'Nome Insegnante';
    }
    
    // Aggiorna disciplina
    const previewDiscipline = instructorPreview.querySelector('.class-level');
    if (previewDiscipline) {
        previewDiscipline.textContent = instructorDiscipline || 'Disciplina';
    }
    
    // Aggiorna immagine
    const previewImage = instructorPreview.querySelector('.class-image img');
    if (previewImage) {
        if (imagePreview && imagePreview.src) {
            previewImage.src = imagePreview.src;
            previewImage.style.display = 'block';
        } else {
            previewImage.style.display = 'none';
        }
    }
    
    // Aggiorna biografia e titoli
    const biographyContainer = instructorPreview.querySelector('.maestro-biography');
    if (biographyContainer) {
        let biographyHTML = '<h4>Biografia</h4>';
        biographyHTML += `<p>${instructorBiography || 'La biografia dell\'insegnante apparirÃ  qui...'}</p>`;
        
        if (instructorTitle || instructorAchievements) {
            biographyHTML += '<h4>';
            biographyHTML += instructorTitle || 'Titoli';
            biographyHTML += '</h4>';
            if (instructorAchievements) {
                const achievements = instructorAchievements.split(',').map(a => a.trim()).filter(a => a);
                if (achievements.length > 0) {
                    biographyHTML += '<ul>';
                    achievements.forEach(achievement => {
                        biographyHTML += `<li>${achievement}</li>`;
                    });
                    biographyHTML += '</ul>';
                }
            }
        } else {
            biographyHTML += '<h4 style="display: none;">Titoli</h4><ul style="display: none;"><li>I titoli appariranno qui...</li></ul>';
        }
        
        biographyContainer.innerHTML = biographyHTML;
    }
}


