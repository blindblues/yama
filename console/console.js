// Gestione dropdown insegnanti
function toggleInstructorsDropdown() {
    const dropdown = document.getElementById('instructorsDropdown');
    const header = document.querySelector('.dropdown-header');
    
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        header.classList.remove('active');
    } else {
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
        closeBtn.innerHTML = '×';
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

// Aggiungi event listeners per i checkbox
document.addEventListener('DOMContentLoaded', function() {
    // Event listeners per i checkbox degli insegnanti
    const checkboxes = document.querySelectorAll('#instructorsDropdown input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedInstructors);
    });
    
    // Previeni la chiusura del dropdown quando si clicca su un checkbox
    const dropdown = document.getElementById('instructorsDropdown');
    dropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });
});

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
                
                // Aggiungi separatore se non è l'ultimo
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

// Console JavaScript - Yamakasi Fight Academy
document.addEventListener('DOMContentLoaded', function() {
    console.log('Console Yamakasi Fight Academy caricata');
    
    // Inizializzazione gestione corsi
    initCourseManager();
    
    // Carica i corsi esistenti
    loadCourses();
    
    // Aggiungi event listeners per l'anteprima in tempo reale
    setupPreviewListeners();
    
    // Attiva l'animazione delle anteprime
    setTimeout(() => {
        document.querySelectorAll('.animate-up').forEach(element => {
            element.classList.add('visible');
        });
    }, 100);
    
    // Event listeners per i checkbox degli insegnanti
    const checkboxes = document.querySelectorAll('#instructorsDropdown input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedInstructors);
    });
    
    // Previeni la chiusura del dropdown quando si clicca su un checkbox
    const dropdown = document.getElementById('instructorsDropdown');
    dropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });
});

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
    
    // Listener per il dropdown degli insegnanti
    const checkboxes = document.querySelectorAll('#instructorsDropdown input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateSelectedInstructors();
            updateCoursePreview();
        });
    });
    
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
        // Aspetta un momento perché l'elemento venga aggiunto al DOM
        setTimeout(updatePreviewSchedule, 10);
    });
    
    document.getElementById('scheduleContainer').addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-schedule')) {
            // Aspetta un momento perché l'elemento venga rimosso dal DOM
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
        // Aspetta un momento perché l'elemento venga aggiunto al DOM
        setTimeout(updatePreviewSchedule, 10);
    });
    
    document.getElementById('scheduleContainer').addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-schedule')) {
            // Aspetta un momento perché l'elemento venga rimosso dal DOM
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
        <input type="time" name="startTime[]" class="time-start" placeholder="Inizio">
        <input type="time" name="endTime[]" class="time-end" placeholder="Fine">
        <button type="button" class="remove-schedule">Rimuovi</button>
    `;
    scheduleContainer.appendChild(scheduleItem);
}

async function handleCourseSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const imageUpload = document.getElementById('courseImageUpload');
    
    // Verifica che sia stata caricata un'immagine
    if (!imageUpload.files || !imageUpload.files[0]) {
        showNotification('Per favore, carica un\'immagine per il corso');
        return;
    }
    
    try {
        // Salva l'immagine caricata (asincrono quando online)
        const uploadedImage = await saveUploadedImage(imageUpload.files[0], formData.get('courseCategory'));
    
        const course = {
            id: Date.now().toString(), // ID univoco
            name: formData.get('courseName'),
            category: formData.get('courseCategory'),
            description: formData.get('courseDescription'),
            image: uploadedImage,
            instructors: formData.get('courseInstructors'),
            schedule: getScheduleFromForm(formData),
            createdAt: new Date().toISOString()
        };
        
        // Salva il corso
        saveCourse(course);
        
        // Resetta il form
        e.target.reset();
        
        // Resetta anche il dropdown degli insegnanti e l'anteprima immagine
        resetInstructorsDropdown();
        resetImagePreview();
        
        // Ricarica la lista dei corsi
        loadCourses();
        
        // Mostra conferma
        showNotification('Corso salvato con successo!');
        
    } catch (error) {
        console.error('Errore nel salvataggio del corso:', error);
        showNotification('Errore nel salvataggio del corso: ' + error.message);
    }
}

function resetInstructorsDropdown() {
    // Resetta tutti i checkbox
    const checkboxes = document.querySelectorAll('#instructorsDropdown input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Resetta il testo di visualizzazione
    updateSelectedInstructors();
}

function resetImagePreview() {
    const preview = document.getElementById('imagePreview');
    const imageUpload = document.getElementById('courseImageUpload');
    
    if (preview) {
        preview.style.display = 'none';
        preview.innerHTML = '';
    }
    
    if (imageUpload) {
        imageUpload.value = '';
    }
    
    // Resetta anche l'anteprima della scheda
    updateCoursePreview();
}

function editCourse(courseId) {
    const courses = getCoursesFromStorage();
    const course = courses.find(c => c.id === courseId);
    
    if (!course) return;
    
    // Popola il form con i dati del corso
    document.getElementById('courseName').value = course.name;
    document.getElementById('courseCategory').value = course.category;
    document.getElementById('courseDescription').value = course.description;
    
    // Gestione insegnanti multipli in modifica con dropdown
    if (course.instructors) {
        const instructorNames = course.instructors.split(' / ').map(name => name.trim());
        
        // Resetta tutti i checkbox
        const checkboxes = document.querySelectorAll('#instructorsDropdown input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Seleziona gli insegnanti del corso
        instructorNames.forEach(name => {
            const checkbox = Array.from(checkboxes).find(cb => cb.value === name);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
        
        // Aggiorna il testo di visualizzazione
        updateSelectedInstructors();
    }
    
    // Carica gli orari esistenti
    const scheduleContainer = document.getElementById('scheduleContainer');
    scheduleContainer.innerHTML = '';
    
    course.schedule.forEach(item => {
        const scheduleItem = document.createElement('div');
        scheduleItem.className = 'schedule-item';
        
        // Estrai ora di inizio e fine dal campo time (formato "HH:MM - HH:MM")
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
    
    // Rimuovi il corso dalla lista (verrà riaggiunto quando salvato)
    deleteCourse(courseId, false);
    
    // Scroll al form
    document.querySelector('.course-form-section').scrollIntoView({ behavior: 'smooth' });
    
    showNotification('Modifica il corso e clicca "Salva Corso" per aggiornarlo');
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('imagePreview');
    
    if (file && file.type.startsWith('image/')) {
        // Mostra anteprima
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Anteprima immagine">`;
            preview.style.display = 'block';
            // Aggiorna anche l'anteprima della scheda
            updateCoursePreview();
        };
        reader.readAsDataURL(file);
    } else {
        resetImagePreview();
        // Aggiorna anche l'anteprima della scheda
        updateCoursePreview();
    }
}

function saveUploadedImage(file, category) {
    // Genera un nome file sicuro basato sul timestamp e nome originale
    const timestamp = Date.now();
    const fileName = `${timestamp}_${sanitizeFileName(file.name)}`;
    const categoryFolder = category === 'ragazzi' ? 'ragazzi' : 'adulti';
    const imagePath = `img/corsi/${categoryFolder}/${fileName}`;
    
    // Determina se siamo online o in locale
    const isOnline = window.location.protocol !== 'file:';
    
    if (isOnline) {
        // Quando online, carica sul server
        return uploadImageToServer(file, imagePath, category);
    } else {
        // Quando in locale, salva nel localStorage e mostra istruzioni
        return saveImageLocally(file, imagePath, fileName, categoryFolder);
    }
}

function uploadImageToServer(file, imagePath, category) {
    // Crea FormData per l'upload
    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', category);
    formData.append('imagePath', imagePath);
    
    // Funzione per tentare l'upload con retry
    const attemptUpload = async (retryCount = 0, maxRetries = 3) => {
        try {
            // Mostra indicatore di caricamento
            showUploadProgress('Caricamento immagine sul server...');
            
            // Effettua l'upload al server
            const response = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData,
                // Timeout di 30 secondi
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
            
            // Se è un errore di rete o timeout e abbiamo ancora tentativi
            if ((error.name === 'AbortError' || error.name === 'TypeError') && retryCount < maxRetries) {
                showNotification(`Tentativo ${retryCount + 1} fallito. Riprovo... (${retryCount + 2}/${maxRetries + 1})`, 'warning');
                
                // Attendi prima di riprovare (esponenziale backoff)
                const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
                await new Promise(resolve => setTimeout(resolve, delay));
                
                return attemptUpload(retryCount + 1, maxRetries);
            }
            
            // Se abbiamo esaurito i tentativi o è un altro tipo di errore
            hideUploadProgress();
            showNotification('Errore nel salvataggio dell\'immagine: ' + error.message, 'error');
            
            // Fallback al salvataggio locale
            console.log('Fallback al salvataggio locale');
            return saveImageLocally(file, imagePath, file.name, category);
        }
    };
    
    return attemptUpload();
}

function saveImageLocally(file, imagePath, fileName, categoryFolder) {
    // Salva l'immagine come Data URL nel localStorage
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = {
            path: imagePath,
            dataUrl: e.target.result,
            originalName: file.name,
            category: categoryFolder,
            uploadedAt: new Date().toISOString()
        };
        
        // Salva l'immagine nel localStorage
        let uploadedImages = JSON.parse(localStorage.getItem('yamakasi_uploaded_images') || '{}');
        uploadedImages[imagePath] = imageData;
        localStorage.setItem('yamakasi_uploaded_images', JSON.stringify(uploadedImages));
        
        console.log('Immagine salvata nel localStorage:', imagePath);
        
        // Mostra istruzioni per il salvataggio fisico
        showImageSaveInstructions(imagePath, fileName, categoryFolder, e.target.result);
    };
    reader.readAsDataURL(file);
    
    return imagePath;
}

function showImageSaveInstructions(imagePath, fileName, categoryFolder, dataUrl) {
    const instructions = document.createElement('div');
    instructions.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(30, 30, 30, 0.95);
        border: 2px solid #fab53b;
        border-radius: 12px;
        padding: 2rem;
        max-width: 500px;
        z-index: 10000;
        color: #efefef;
        font-family: 'Funnel Display', sans-serif;
        backdrop-filter: blur(10px);
    `;
    
    instructions.innerHTML = `
        <h3 style="color: #fab53b; margin-bottom: 1rem;">Salvataggio Immagine</h3>
        <p style="margin-bottom: 1rem;">L'immagine è stata salvata temporaneamente. Per salvarla definitivamente:</p>
        <ol style="margin-left: 1.5rem; margin-bottom: 1rem;">
            <li>Clicca sul pulsante "Scarica Immagine" qui sotto</li>
            <li>Salva il file nella cartella: <strong>img/corsi/${categoryFolder}/</strong></li>
            <li>Rinomina il file come: <strong>${fileName}</strong></li>
        </ol>
        <p style="font-size: 0.9rem; color: #b0b0b0; margin-bottom: 1.5rem;">
            In un ambiente di produzione, questo processo sarebbe automatico.
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
            <button id="downloadImageBtn" style="
                background: #fab53b;
                color: #0a0a0a;
                border: none;
                padding: 0.8rem 1.5rem;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
            ">Scarica Immagine</button>
            <button id="closeInstructionsBtn" style="
                background: rgba(108, 117, 125, 0.8);
                color: #fff;
                border: none;
                padding: 0.8rem 1.5rem;
                border-radius: 8px;
                cursor: pointer;
            ">Chiudi</button>
        </div>
    `;
    
    document.body.appendChild(instructions);
    
    // Funzione per scaricare l'immagine
    document.getElementById('downloadImageBtn').addEventListener('click', function() {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    
    // Chiudi le istruzioni
    document.getElementById('closeInstructionsBtn').addEventListener('click', function() {
        document.body.removeChild(instructions);
    });
}

function sanitizeFileName(fileName) {
    // Rimuovi caratteri non sicuri dal nome del file
    return fileName
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_{2,}/g, '_')
        .toLowerCase();
}

function getUploadedImageUrl(imagePath) {
    // Recupera l'immagine caricata dal localStorage
    const uploadedImages = JSON.parse(localStorage.getItem('yamakasi_uploaded_images') || '{}');
    const imageData = uploadedImages[imagePath];
    
    return imageData ? imageData.dataUrl : null;
}

// Funzioni per gestire l'indicatore di progresso dell'upload
function showUploadProgress(message) {
    // Rimuovi eventuali indicatori esistenti
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
    
    // Aggiungi animazioni CSS se non esistono già
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

// Funzione per estrarre gli orari dal form
function getScheduleFromForm(formData) {
    const days = formData.getAll('day[]');
    const startTimes = formData.getAll('startTime[]');
    const endTimes = formData.getAll('endTime[]');
    
    const schedule = [];
    
    for (let i = 0; i < days.length; i++) {
        if (days[i] && startTimes[i] && endTimes[i]) {
            schedule.push({
                day: days[i],
                startTime: startTimes[i],
                endTime: endTimes[i],
                time: `${startTimes[i]} - ${endTimes[i]}`
            });
        }
    }
    
    return schedule;
}

// Funzione per salvare il corso
function saveCourse(course) {
    // Ottieni i corsi esistenti
    const courses = getCoursesFromStorage();
    
    // Aggiungi il nuovo corso
    courses.push(course);
    
    // Salva nel localStorage
    localStorage.setItem('yamakasi_courses', JSON.stringify(courses));
    
    // Crea anche un file JSON per la categoria (simulato)
    saveCourseToCategoryFile(course);
    
    console.log('Corso salvato:', course.name);
}

// Funzione per salvare il corso in un file JSON per categoria
function saveCourseToCategoryFile(course) {
    const category = course.category;
    const fileName = `corsi_${category}.json`;
    
    // Ottieni i corsi della categoria
    const categoryCourses = getCoursesByCategory(category);
    
    // Aggiungi il nuovo corso se non è già presente
    if (!categoryCourses.find(c => c.id === course.id)) {
        categoryCourses.push(course);
    }
    
    // Salva nel localStorage con chiave specifica per categoria
    localStorage.setItem(`yamakasi_courses_${category}`, JSON.stringify(categoryCourses));
    
    console.log(`Corso salvato in file categoria ${fileName}:`, course.name);
}

// Funzione per ottenere i corsi dal localStorage
function getCoursesFromStorage() {
    const courses = localStorage.getItem('yamakasi_courses');
    return courses ? JSON.parse(courses) : [];
}

// Funzione per ottenere i corsi per categoria
function getCoursesByCategory(category) {
    const categoryKey = `yamakasi_courses_${category}`;
    const categoryCourses = localStorage.getItem(categoryKey);
    return categoryCourses ? JSON.parse(categoryCourses) : [];
}

// Funzione per caricare e visualizzare i corsi
function loadCourses() {
    console.log('loadCourses called');
    const courses = getCoursesFromStorage();
    const coursesList = document.getElementById('coursesList');
    
    console.log('coursesList element:', coursesList);
    console.log('courses from storage:', courses);
    
    if (!coursesList) {
        console.error('coursesList element not found!');
        return;
    }
    
    // Svuota la lista
    coursesList.innerHTML = '';
    
    // Ordina i corsi per data di creazione (più recenti prima)
    courses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Mostra i corsi
    courses.forEach(course => {
        console.log('Creating card for course:', course);
        const courseCard = createCourseCard(course);
        coursesList.appendChild(courseCard);
    });
    
    if (courses.length === 0) {
        coursesList.innerHTML = '<p>Nessun corso salvato. Usa il form sopra per aggiungere il primo corso.</p>';
    }
    
    console.log('loadCourses completed');
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
            // Aggiungi link dell'insegnante
            instructorsHTML += `<a href="#" class="instructor-link" onclick="return false;">${instructor}</a>`;
            
            // Aggiungi separatore se non è l'ultimo
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
    
    // Aggiungi event listener per l'espansione della card (come nel sito)
    card.addEventListener('click', function(e) {
        // Non espandere se si clicca su link, input o altri elementi interattivi
        if (e.target.closest('a') || e.target.closest('button') || e.target.closest('input') || e.target.closest('.course-actions')) {
            return;
        }
        toggleCourseCard(card);
    });
    
    return card;
}

// Funzione per espandere/chiudere una card corso (simile a toggleCoursePreview)
function toggleCourseCard(card) {
    console.log('toggleCourseCard called for card:', card);
    const isExpanded = card.classList.contains('expanded');
    let overlay = document.querySelector('.class-overlay');
    
    console.log('isExpanded:', isExpanded, 'overlay:', overlay);
    
    if (isExpanded) {
        console.log('Closing card');
        // Chiudi la scheda
        card.classList.remove('expanded');
        
        // Rimuovi il pulsante di chiusura
        const closeBtn = card.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.remove();
        }
        
        // Nascondi l'overlay
        if (overlay) {
            overlay.classList.remove('active');
            if (overlay._clickHandler) {
                overlay.removeEventListener('click', overlay._clickHandler);
                overlay._clickHandler = null;
            }
        }
        
        // Ripristina lo scroll del body
        document.body.style.overflow = '';
        
        // Rimuovi il placeholder se esiste
        if (card._placeholder) {
            card._placeholder.remove();
            card._placeholder = null;
        }
        
        // Riposiziona la scheda nella sua posizione originale
        restoreOriginalCardPosition(card);
        
    } else {
        console.log('Opening card');
        // Chiudi altre schede espanse
        document.querySelectorAll('.class-card.expanded').forEach(otherCard => {
            if (otherCard !== card) {
                toggleCourseCard(otherCard);
            }
        });
        
        // Crea o mostra l'overlay
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'class-overlay';
            document.body.appendChild(overlay);
        }
        overlay.classList.add('active');
        
        // Crea un placeholder per mantenere lo spazio
        const placeholder = document.createElement('div');
        placeholder.className = 'class-card expanded-placeholder';
        placeholder.style.height = card.offsetHeight + 'px';
        card._placeholder = placeholder;
        card.parentNode.insertBefore(placeholder, card);
        
        // Salva la posizione originale prima di spostare
        card._originalParent = card.parentNode;
        card._originalNextSibling = card.nextSibling;
        
        // Sposta la scheda nel body per garantire posizionamento corretto
        document.body.appendChild(card);
        
        // Aggiungi la classe expanded
        card.classList.add('expanded');
        
        // Aggiungi pulsante di chiusura
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.setAttribute('aria-label', 'Chiudi');
        card.appendChild(closeBtn);
        
        // Blocca lo scroll del body
        document.body.style.overflow = 'hidden';
        
        // Event listener per il pulsante di chiusura
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleCourseCard(card);
        });
        
        // Chiudi la scheda con il tasto ESC
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                toggleCourseCard(card);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        
        // Chiudi la scheda cliccando sull'overlay
        const overlayClickHandler = function(e) {
            if (e.target === overlay) {
                toggleCourseCard(card);
            }
        };
        overlay.addEventListener('click', overlayClickHandler);
        overlay._clickHandler = overlayClickHandler;
        
        console.log('Card opened successfully');
    }
}

// Funzione per riposizionare una card nella sua posizione originale
function restoreOriginalCardPosition(card) {
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

// Funzione per formattare gli orari
function formatScheduleItems(schedule) {
    if (!schedule || schedule.length === 0) {
        return '<div class="schedule-item"><span class="schedule-day">-</span><span class="schedule-time">-</span></div>';
    }
    
    return schedule.map(item => `
        <div class="schedule-item">
            <span class="schedule-day">${item.day}</span>
            <span class="schedule-time">${item.time || `${item.startTime} - ${item.endTime}`}</span>
        </div>
    `).join('');
}

// Funzione per eliminare un corso
function deleteCourse(courseId, showConfirm = true) {
    if (showConfirm && !confirm('Sei sicuro di voler eliminare questo corso?')) {
        return;
    }
    
    // Ottieni i corsi esistenti
    const courses = getCoursesFromStorage();
    
    // Trova il corso da eliminare
    const courseIndex = courses.findIndex(c => c.id === courseId);
    if (courseIndex === -1) return;
    
    const course = courses[courseIndex];
    
    // Rimuovi il corso dalla lista generale
    courses.splice(courseIndex, 1);
    localStorage.setItem('yamakasi_courses', JSON.stringify(courses));
    
    // Rimuovi il corso dalla lista specifica della categoria
    const categoryCourses = getCoursesByCategory(course.category);
    const categoryIndex = categoryCourses.findIndex(c => c.id === courseId);
    if (categoryIndex !== -1) {
        categoryCourses.splice(categoryIndex, 1);
        localStorage.setItem(`yamakasi_courses_${course.category}`, JSON.stringify(categoryCourses));
    }
    
    // Ricarica la lista
    loadCourses();
    
    if (showConfirm) {
        showNotification('Corso eliminato con successo!');
    }
}

// Funzione per mostrare notifiche
function showNotification(message) {
    // Crea un elemento di notifica
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        font-family: 'Funnel Display', sans-serif;
    `;
    
    document.body.appendChild(notification);
    
    // Rimuovi dopo 3 secondi
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}