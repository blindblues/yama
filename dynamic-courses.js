// Dynamic Courses Loader - Yamakasi Fight Academy
document.addEventListener('DOMContentLoaded', () => {
    // Pulisci i corsi duplicati all'avvio
    cleanDuplicateCourses();
    
    // Carica corsi dinamici solo se NON siamo nella pagina classes.html
    // classes.html ha già i corsi statici, non li carichiamo dinamicamente
    if (!window.location.pathname.includes('classes.html') && document.querySelector('.classes-section')) {
        loadDynamicCourses();
    }
    
    // Funzione per caricare corsi dal localStorage
    function loadDynamicCourses() {
        const coursesContainer = document.getElementById('courses-container');
        if (!coursesContainer) return;
        
        const storedCourses = localStorage.getItem('yamakasi_courses');
        if (!storedCourses) return;
        
        try {
            const courses = JSON.parse(storedCourses);
            if (courses.length === 0) return;
            
            // Aggiungi i corsi dinamici al container
            courses.forEach(course => {
                const courseElement = createCourseElement(course);
                coursesContainer.appendChild(courseElement);
            });
            
            // Riattiva i filtri per includere i nuovi corsi
            initCourseFilters();
            
        } catch (error) {
            console.error('Errore nel caricamento dei corsi dinamici:', error);
        }
    }
    
    // Funzione per creare elemento corso HTML
    function createCourseElement(course) {
        const courseCard = document.createElement('div');
        courseCard.className = 'class-card animate-up';
        courseCard.setAttribute('data-category', course.category);
        courseCard.setAttribute('data-dynamic', 'true');
        
        // Genera orari HTML
        const scheduleHtml = course.schedule && course.schedule.length > 0 
            ? course.schedule.map(item => `
                <div class="schedule-item">
                    <span class="schedule-day">${item.day}</span>
                    <span class="schedule-time">${item.time}</span>
                </div>
            `).join('')
            : '';
        
        // Genera insegnanti HTML
        const instructorsHtml = course.instructors 
            ? course.instructors.split('/').map(instructor => 
                `<a href="#" class="instructor-link">${instructor.trim()}</a>`
            ).join('<span class="course-separator">/</span>')
            : '';
        
        courseCard.innerHTML = `
            <input type="hidden" class="course-category" value="${course.category}">
            <div class="class-image">
                ${course.image 
                    ? (course.imageData && course.imageData.isBackground 
                        ? `<div style="background-image: url('../${course.image}'); background-position: 50% 25%; background-size: cover; background-repeat: no-repeat; height: 200px;"></div>`
                        : `<img src="../${course.image}" alt="${course.name}">`)
                    : `<div style="background: linear-gradient(135deg, #fab53b, #ff8c00); height: 200px; display: flex; align-items: center; justify-content: center; color: #0a0a0a; font-weight: bold; font-size: 1.2rem;">${course.name}</div>`
                }
            </div>
            <div class="class-content">
                <h3 class="class-title">${course.name.toUpperCase()}</h3>
                <p class="class-description">${course.description}</p>
                <div class="class-info"></div>
                ${instructorsHtml ? `
                    <div class="class-instructor">
                        <span class="instructor-label">Insegnanti:</span>
                        ${instructorsHtml}
                    </div>
                ` : ''}
                ${scheduleHtml ? `
                    <div class="class-schedule">
                        <h4 class="schedule-title">Giorni e Orari</h4>
                        <div class="schedule-items">
                            ${scheduleHtml}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        return courseCard;
    }
    
    // Funzione per inizializzare i filtri dei corsi
    function initCourseFilters() {
        const adultiButton = document.getElementById('adulti-button');
        const minorenniToggle = document.getElementById('minorenni-toggle');
        const allCourses = document.querySelectorAll('.class-card');
        
        if (!adultiButton || !minorenniToggle) return;
        
        function filterCourses(category) {
            allCourses.forEach(course => {
                const courseCategory = course.getAttribute('data-category');
                if (category === 'all' || courseCategory === category) {
                    course.style.display = 'block';
                } else {
                    course.style.display = 'none';
                }
            });
        }
        
        adultiButton.addEventListener('click', () => filterCourses('adulti'));
        minorenniToggle.addEventListener('click', () => filterCourses('ragazzi'));
    }
    
    // Funzione per pulire i corsi duplicati dal localStorage
    function cleanDuplicateCourses() {
        try {
            const existingData = localStorage.getItem('yamakasi_courses');
            if (!existingData) return;
            
            const allCourses = JSON.parse(existingData);
            console.log(`Controllo duplicati su ${allCourses.length} corsi esistenti...`);
            
            // Raggruppa i corsi per ID
            const courseMap = new Map();
            const duplicates = [];
            
            allCourses.forEach(course => {
                if (courseMap.has(course.id)) {
                    duplicates.push(course);
                } else {
                    courseMap.set(course.id, course);
                }
            });
            
            if (duplicates.length > 0) {
                console.log(`Trovati e rimossi ${duplicates.length} corsi duplicati:`);
                duplicates.forEach(course => {
                    console.log(` - ${course.name} (ID: ${course.id})`);
                });
                
                // Salva la lista pulita
                const cleanedCourses = Array.from(courseMap.values());
                localStorage.setItem('yamakasi_courses', JSON.stringify(cleanedCourses));
                console.log(`Salvati ${cleanedCourses.length} corsi unici dopo la pulizia.`);
            } else {
                console.log('Nessun duplicato trovato.');
            }
        } catch (error) {
            console.error('Errore nella pulizia dei duplicati:', error);
        }
    }
    
    // Funzione per generare ID univoco basato sul contenuto del corso
    function generateCourseId(courseName, category, instructors) {
        // Crea una stringa con i dati principali del corso
        const courseString = `${courseName}_${category}_${instructors}`.toLowerCase();
        
        // Genera un hash semplice da questa stringa
        let hash = 0;
        for (let i = 0; i < courseString.length; i++) {
            const char = courseString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Converte a 32-bit integer
        }
        
        // Assicura che l'hash sia positivo e aggiunge un prefisso
        const positiveHash = Math.abs(hash);
        return `course_${positiveHash.toString(16)}`;
    }
    
    // Funzione per generare ID casuale per corsi senza dati sufficienti
    function generateRandomCourseId() {
        const randomPart = Math.random().toString(36).substring(2, 15);
        const timestamp = Date.now().toString(36);
        return `course_${randomPart}_${timestamp}`;
    }
    
    // Funzione per salvare i corsi sulla console
    window.saveCoursesToConsole = function() {
        // Controllo robusto: verifica sia il flag che l'esistenza dei dati
        const existingData = localStorage.getItem('yamakasi_courses');
        const flagSaved = localStorage.getItem('yamakasi_courses_saved') === 'true';
        
        if (flagSaved && existingData && arguments.length === 0) {
            try {
                const courses = JSON.parse(existingData);
                console.log('Corsi già salvati in questa sessione. Trovati', courses.length, 'corsi esistenti.');
                console.log('Usa puliziaImmediata() per resettare e salvare nuovamente.');
                window.yamakasiCourses = courses; // Ripristina i dati esistenti
                return courses;
            } catch (error) {
                console.log('Dati corrotti trovati, procedo con il salvataggio...');
            }
        }
        
        // Imposta il flag all'inizio per prevenire race conditions
        if (arguments.length === 0) {
            window.coursesSaved = true;
            localStorage.setItem('yamakasi_courses_saved', 'true');
        }
        
        console.log('=== CORSI YAMAKASI FIGHT ACADEMY ===');
        
        // Seleziona tutte le card dei corsi
        const courseCards = document.querySelectorAll('.class-card');
        
        if (courseCards.length === 0) {
            console.log('Nessun corso trovato nella pagina.');
            return;
        }
        
        const coursesData = [];
        
        courseCards.forEach((card, index) => {
            try {
                // Estrai nome del corso
                const titleElement = card.querySelector('.class-title');
                const courseName = titleElement ? titleElement.textContent.trim() : 'Corso senza nome';
                
                // Estrai descrizione
                const descriptionElement = card.querySelector('.class-description');
                const description = descriptionElement ? descriptionElement.textContent.trim() : '';
                
                // Estrai categoria
                const categoryInput = card.querySelector('.course-category');
                const category = categoryInput ? categoryInput.value : 'sconosciuta';
                
                // Estrai insegnanti
                const instructorLinks = card.querySelectorAll('.instructor-link');
                const instructors = Array.from(instructorLinks).map(link => link.textContent.trim());
                const instructorsString = instructors.join(' / ');
                
                // Estrai orari
                const scheduleItems = card.querySelectorAll('.schedule-item');
                const schedule = Array.from(scheduleItems).map(item => {
                    const day = item.querySelector('.schedule-day')?.textContent.trim() || '';
                    const time = item.querySelector('.schedule-time')?.textContent.trim() || '';
                    return { day, time };
                });
                
                // Estrai immagine - mantieni il percorso relativo come in classes.html
                let imageData = null;
                const imageElement = card.querySelector('.class-image img');
                const backgroundImageElement = card.querySelector('.class-image[style*="background-image"]');
                
                if (imageElement && imageElement.src) {
                    // Estrai il percorso relativo dall'URL completo
                    const src = imageElement.src;
                    let relativePath = src;
                    
                    // Gestisce sia URL completi che percorsi relativi
                    if (src.includes('img/')) {
                        relativePath = src.substring(src.indexOf('img/'));
                    } else if (src.startsWith('file://')) {
                        // In locale, estrai il percorso dal file://
                        const pathParts = src.split('/');
                        const imgIndex = pathParts.findIndex(part => part === 'img');
                        if (imgIndex !== -1) {
                            relativePath = pathParts.slice(imgIndex).join('/');
                        }
                    }
                    
                    imageData = {
                        src: relativePath, // Mantiene il percorso relativo come in classes.html
                        alt: imageElement.alt || courseName
                    };
                } else if (backgroundImageElement) {
                    const bgStyle = backgroundImageElement.style.backgroundImage;
                    const match = bgStyle.match(/url\(['"]?([^'"]+)['"]?\)/);
                    if (match && match[1]) {
                        // Estrai il percorso relativo anche per le immagini di sfondo
                        const bgSrc = match[1];
                        const relativePath = bgSrc.includes('img/') ? bgSrc.substring(bgSrc.indexOf('img/')) : bgSrc;
                        imageData = {
                            src: relativePath, // Mantiene il percorso relativo come in classes.html
                            alt: courseName,
                            isBackground: true // Contrassegna come immagine di sfondo
                        };
                    }
                }
                
                // Genera ID univoco basato sul contenuto
                const courseId = generateCourseId(courseName, category, instructorsString);
                
                // Crea oggetto corso nel formato compatibile con la console
                const courseData = {
                    id: courseId, // ID univoco basato sul contenuto
                    name: courseName,
                    category: category,
                    description: description,
                    instructors: instructorsString || '', // Stringa unica per compatibilità console
                    schedule: schedule.map(item => ({
                        day: item.day || '',
                        time: item.time || '',
                        startTime: (item.time && item.time.split) ? item.time.split(' - ')[0] || '' : '',
                        endTime: (item.time && item.time.split) ? item.time.split(' - ')[1] || '' : ''
                    })),
                    image: imageData ? imageData.src : null,
                    imageData: imageData,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    // Flag per indicare che questo corso viene da classes.html
                    source: 'classes.html',
                    // Mantiene anche i campi italiani per retrocompatibilità
                    nome: courseName,
                    categoria: category,
                    descrizione: description,
                    insegnanti: instructors,
                    orari: schedule,
                    immagine: imageData ? imageData.src : null
                };
                
                coursesData.push(courseData);
                
                // Log singolo corso
                console.log(`\n${index + 1}. ${courseName}`);
                console.log(`   ID: ${courseId}`);
                console.log(`   Categoria: ${category}`);
                console.log(`   Descrizione: ${description}`);
                console.log(`   Insegnanti: ${instructors.join(', ') || 'Non specificati'}`);
                if (schedule.length > 0) {
                    console.log('   Orari:');
                    schedule.forEach(item => {
                        console.log(`     - ${item.day}: ${item.time}`);
                    });
                } else {
                    console.log('   Orari: Non specificati');
                }
                
            } catch (error) {
                console.error(`Errore nell'estrazione del corso ${index + 1}:`, error);
            }
        });
        
        // Log riepilogo
        console.log('\n=== RIEPILOGO ===');
        console.log(`Totale corsi trovati: ${coursesData.length}`);
        
        const adultiCourses = coursesData.filter(c => c.categoria === 'adulti');
        const ragazziCourses = coursesData.filter(c => c.categoria === 'ragazzi');
        
        console.log(`Corsi adulti: ${adultiCourses.length}`);
        console.log(`Corsi ragazzi: ${ragazziCourses.length}`);
        
        // Dettaglio corsi per adulti
        if (adultiCourses.length > 0) {
            console.log('\n=== CORSI PER ADULTI ===');
            adultiCourses.forEach((course, index) => {
                console.log(`${index + 1}. ${course.name}`);
                console.log(`   ID: ${course.id}`);
                console.log(`   Categoria: ${course.category}`);
                console.log(`   Insegnanti: ${course.instructors || 'Non specificati'}`);
                if (course.schedule && course.schedule.length > 0) {
                    console.log('   Orari:');
                    course.schedule.forEach(item => {
                        console.log(`     - ${item.day}: ${item.time || `${item.startTime} - ${item.endTime}`}`);
                    });
                }
            });
        }
        
        // Dettaglio corsi per ragazzi
        if (ragazziCourses.length > 0) {
            console.log('\n=== CORSI PER RAGAZZI ===');
            ragazziCourses.forEach((course, index) => {
                console.log(`${index + 1}. ${course.name}`);
                console.log(`   ID: ${course.id}`);
                console.log(`   Categoria: ${course.category}`);
                console.log(`   Insegnanti: ${course.instructors || 'Non specificati'}`);
                if (course.schedule && course.schedule.length > 0) {
                    console.log('   Orari:');
                    course.schedule.forEach(item => {
                        console.log(`     - ${item.day}: ${item.time || `${item.startTime} - ${item.endTime}`}`);
                    });
                }
            });
        }
        
        // Salva anche l'array completo per uso programmatico
        console.log('\n=== DATI COMPLETI (JSON) ===');
        console.log(JSON.stringify(coursesData, null, 2));
        
        // Rendi disponibili i dati globalmente
        window.yamakasiCourses = coursesData;
        
        // Prima di salvare, carica i corsi esistenti dalla console per evitare duplicati
        let existingCourses = [];
        try {
            const existingData = localStorage.getItem('yamakasi_courses');
            if (existingData) {
                existingCourses = JSON.parse(existingData);
                console.log(`Trovati ${existingCourses.length} corsi esistenti nella console`);
            }
        } catch (error) {
            console.log('Nessun corso esistente trovato o errore nel caricamento');
        }
        
        // Crea un set degli ID dei nuovi corsi per controllo rapido
        const newCourseIds = new Set(coursesData.map(course => course.id));
        
        // Filtra i corsi esistenti: rimuovi quelli che vengono da classes.html e quelli duplicati
        const filteredExisting = existingCourses.filter(course => {
            // Rimuovi sempre i corsi che vengono da classes.html (verranno sostituiti)
            if (course.source === 'classes.html') {
                return false;
            }
            
            // Rimuovi i corsi esistenti che hanno lo stesso ID dei nuovi corsi
            if (newCourseIds.has(course.id)) {
                console.log(`Rimosso corso duplicato: ${course.name} (ID: ${course.id})`);
                return false;
            }
            
            return true;
        });
        
        // Combina i corsi esistenti filtrati con i nuovi corsi da classes.html
        const allCourses = [...filteredExisting, ...coursesData];
        
        // Salva i dati nel localStorage per la console
        try {
            localStorage.setItem('yamakasi_courses', JSON.stringify(allCourses));
            console.log(`\nSalvati ${allCourses.length} corsi totali nel localStorage (${coursesData.length} da classes.html + ${filteredExisting.length} esistenti)`);
            console.log(`Corsi rimossi: ${existingCourses.length - filteredExisting.length} (duplicati o da classes.html)`);
        } catch (error) {
            console.error('Errore nel salvataggio dei dati nel localStorage:', error);
        }
        
        console.log('\nI dati dei corsi sono stati salvati anche in window.yamakasiCourses per uso futuro.');
        
        // Mostra riepilogo delle immagini salvate con percorsi relativi
        const coursesWithImages = coursesData.filter(course => course.imageData && course.imageData.src);
        if (coursesWithImages.length > 0) {
            console.log('\n=== IMMAGINI CORSI SALVATE CON PERCORSI RELATIVI ===');
            console.log('Le immagini dei corsi sono state salvate con percorsi relativi come in classes.html');
            console.log('Questi percorsi funzioneranno correttamente quando le schede vengono visualizzate nella console.');
            
            coursesWithImages.forEach((course, index) => {
                console.log(`\n${index + 1}. ${course.name}`);
                console.log(`   Percorso relativo: ${course.imageData.src}`);
                console.log(`   Categoria: ${course.category}`);
            });
        } else {
            console.log('\nNessuna immagine trovata nei corsi.');
        }
        
        return coursesData;
    };
    
    // Rendi disponibile la funzione di pulizia globalmente
    window.cleanDuplicateCourses = cleanDuplicateCourses;
    
    // Aggiungi anche un comando per pulire manualmente i duplicati
    window.pulisciCorsiDuplicati = function() {
        console.log('=== PULIZIA MANUALE CORSI DUPLICATI ===');
        cleanDuplicateCourses();
        console.log('Pulizia completata. Ricarica la pagina per vedere i risultati.');
    };
    
    // Funzione di pulizia immediata per la console
    window.puliziaImmediata = function() {
        console.log('=== PULIZIA IMMEDIATA DUPLICATI ===');
        
        try {
            // Rimuovi tutti i dati dal localStorage
            localStorage.removeItem('yamakasi_courses');
            localStorage.removeItem('yamakasi_course_images');
            localStorage.removeItem('yamakasi_courses_saved'); // Rimuovi anche il flag
            console.log('LocalStorage pulito completamente.');
            
            // Pulisci anche le variabili globali
            delete window.yamakasiCourses;
            window.coursesSaved = false; // Resetta il flag di salvataggio
            console.log('Variabili globali pulite.');
            
            console.log('PULIZIA COMPLETATA! Ricarica la pagina per iniziare da zero.');
            
        } catch (error) {
            console.error('Errore durante la pulizia:', error);
        }
    };
    
    // Funzioni helper per visualizzare corsi per categoria
    window.visualizzaCorsiAdulti = function() {
        const courses = window.yamakasiCourses || [];
        const adultiCourses = courses.filter(c => c.categoria === 'adulti' || c.category === 'adulti');
        
        console.log('=== CORSI PER ADULTI ===');
        if (adultiCourses.length === 0) {
            console.log('Nessun corso per adulti trovato.');
            return;
        }
        
        console.log(`Trovati ${adultiCourses.length} corsi per adulti:`);
        adultiCourses.forEach((course, index) => {
            console.log(`\n${index + 1}. ${course.name}`);
            console.log(`   ID: ${course.id}`);
            console.log(`   Categoria: ${course.categoria || course.category}`);
            console.log(`   Descrizione: ${course.description || course.descrizione || 'Non specificata'}`);
            console.log(`   Insegnanti: ${course.instructors || course.insegnanti || 'Non specificati'}`);
            if (course.schedule && course.schedule.length > 0) {
                console.log('   Orari:');
                course.schedule.forEach(item => {
                    console.log(`     - ${item.day}: ${item.time || `${item.startTime} - ${item.endTime}`}`);
                });
            } else {
                console.log('   Orari: Non specificati');
            }
        });
    };
    
    window.visualizzaCorsiRagazzi = function() {
        const courses = window.yamakasiCourses || [];
        const ragazziCourses = courses.filter(c => c.categoria === 'ragazzi' || c.category === 'ragazzi');
        
        console.log('=== CORSI PER RAGAZZI ===');
        if (ragazziCourses.length === 0) {
            console.log('Nessun corso per ragazzi trovato.');
            return;
        }
        
        console.log(`Trovati ${ragazziCourses.length} corsi per ragazzi:`);
        ragazziCourses.forEach((course, index) => {
            console.log(`\n${index + 1}. ${course.name}`);
            console.log(`   ID: ${course.id}`);
            console.log(`   Categoria: ${course.categoria || course.category}`);
            console.log(`   Descrizione: ${course.description || course.descrizione || 'Non specificata'}`);
            console.log(`   Insegnanti: ${course.instructors || course.insegnanti || 'Non specificati'}`);
            if (course.schedule && course.schedule.length > 0) {
                console.log('   Orari:');
                course.schedule.forEach(item => {
                    console.log(`     - ${item.day}: ${item.time || `${item.startTime} - ${item.endTime}`}`);
                });
            } else {
                console.log('   Orari: Non specificati');
            }
        });
    };
    
    window.riepilogoCorsi = function() {
        const courses = window.yamakasiCourses || [];
        const adultiCourses = courses.filter(c => c.categoria === 'adulti' || c.category === 'adulti');
        const ragazziCourses = courses.filter(c => c.categoria === 'ragazzi' || c.category === 'ragazzi');
        
        console.log('=== RIEPILOGO CORSI YAMAKASI ===');
        console.log(`Totale corsi: ${courses.length}`);
        console.log(`Corsi adulti: ${adultiCourses.length}`);
        console.log(`Corsi ragazzi: ${ragazziCourses.length}`);
        
        if (adultiCourses.length > 0) {
            console.log('\nCorsi adulti:');
            adultiCourses.forEach((course, index) => {
                console.log(`  ${index + 1}. ${course.name} (ID: ${course.id})`);
            });
        }
        
        if (ragazziCourses.length > 0) {
            console.log('\nCorsi ragazzi:');
            ragazziCourses.forEach((course, index) => {
                console.log(`  ${index + 1}. ${course.name} (ID: ${course.id})`);
            });
        }
        
        console.log('\nComandi disponibili:');
        console.log('- visualizzaCorsiAdulti() - Mostra dettagli corsi adulti');
        console.log('- visualizzaCorsiRagazzi() - Mostra dettagli corsi ragazzi');
        console.log('- saveCoursesToConsole() - Salva/aggiorna i corsi dalla pagina');
    };

    // Variabile globale per prevenire esecuzioni multiple - persiste tra i ricaricamenti
    const existingCourses = localStorage.getItem('yamakasi_courses');
    const flagSaved = localStorage.getItem('yamakasi_courses_saved') === 'true';
    window.coursesSaved = flagSaved && existingCourses; // True solo se entrambi esistono
    
    // DISABILITATO: auto-salvataggio per prevenire duplicazioni
    // Esegui automaticamente il salvataggio quando la pagina è caricata
    // Ora l'utente deve chiamare manualmente saveCoursesToConsole()
    if (window.location.pathname.includes('classes.html')) {
        console.log('Pagina classes.html rilevata. I corsi sono già presenti staticamente.');
        console.log('Per salvare i corsi nella console, usa: saveCoursesToConsole()');
        console.log('Per pulire tutto, usa: puliziaImmediata()');
        
        // NON eseguire più automaticamente il salvataggio
        // setTimeout(() => {
        //     if (!window.coursesSaved) {
        //         console.log('Esecuzione di saveCoursesToConsole (unica esecuzione)...');
        //         saveCoursesToConsole();
        //     }
        // }, 1000);
    }
    
    // Funzione per mostrare le immagini salvate
    function showSavedImages() {
        console.log('\n=== IMMAGINI SALVATE NELLA CONSOLE ===');
        
        try {
            const imageStorageKey = 'yamakasi_course_images';
            const storedImages = localStorage.getItem(imageStorageKey);
            
            if (!storedImages) {
                console.log('Nessuna immagine salvata nel localStorage.');
                return;
            }
            
            const images = JSON.parse(storedImages);
            const imageKeys = Object.keys(images);
            
            console.log(`Trovate ${imageKeys.length} immagini salvate:`);
            
            imageKeys.forEach((key, index) => {
                const image = images[key];
                console.log(`\n${index + 1}. ${image.courseName} (${image.category})`);
                console.log(`   File: ${key}`);
                console.log(`   Dimensione: ${(image.size / 1024).toFixed(2)} KB`);
                console.log(`   Tipo: ${image.type}`);
                console.log(`   Salvato il: ${new Date(image.savedAt).toLocaleString()}`);
                
                // Crea un URL per visualizzare l'immagine nella console
                if (image.data && image.data.startsWith('data:')) {
                    console.log(`   Anteprima: ${image.data.substring(0, 50)}...`);
                }
            });
            
        } catch (error) {
            console.error('Errore nel recupero delle immagini salvate:', error);
        }
    }
    
    // Rendi disponibile la funzione globalmente
    window.showSavedImages = showSavedImages;
    
    // Funzione per salvare le immagini dei corsi
    function saveCourseImages(coursesData) {
        console.log('\n=== SALVATAGGIO IMMAGINI CORSI ===');
        
        // Prima mostra tutte le immagini trovate
        console.log('Controllo immagini disponibili...');
        coursesData.forEach((course, index) => {
            console.log(`${index + 1}. ${course.name}:`);
            console.log(`   imageData: ${course.imageData ? 'PRESENTE' : 'ASSENTE'}`);
            if (course.imageData) {
                console.log(`   src: ${course.imageData.src}`);
            }
        });
        
        const coursesWithImages = coursesData.filter(course => course.imageData && course.imageData.src);
        
        if (coursesWithImages.length === 0) {
            console.log('Nessuna immagine da salvare - imageData non trovato nei corsi');
            return;
        }
        
        console.log(`\nTrovate ${coursesWithImages.length} immagini da salvare:`);
        
        console.log('\n=== IMMAGINI CORSI SALVATE CON PERCORSI RELATIVI ===');
        console.log('Le immagini dei corsi sono state salvate con percorsi relativi come in classes.html');
        console.log('Questi percorsi funzioneranno correttamente quando le schede vengono visualizzate nella console.');
        
        // Mostra le immagini salvate con i loro percorsi relativi
        coursesWithImages.forEach((course, index) => {
            console.log(`\n${index + 1}. ${course.name}`);
            console.log(`   Percorso relativo: ${course.imageData.src}`);
            console.log(`   Categoria: ${course.category}`);
        });
        
        // Mostra anche le immagini già salvate
        setTimeout(() => {
            showSavedImages();
        }, 2000);
    }
    
    // Funzione per scaricare e salvare un'immagine
    async function downloadAndSaveImage(imageUrl, courseName, category, index) {
        try {
            console.log(`   Tentativo download da: ${imageUrl}`);
            
            // Scarica l'immagine
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const blob = await response.blob();
            
            // Genera un nome file sicuro
            const timestamp = Date.now();
            const sanitizedName = courseName.toLowerCase()
                .replace(/[^a-z0-9]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '');
            const fileName = `${timestamp}_${sanitizedName}_${index}.jpg`;
            
            // Crea un file per il salvataggio
            const file = new File([blob], fileName, { type: 'image/jpeg' });
            
            // Determina se siamo online o in locale
            const isOnline = window.location.protocol !== 'file:';
            
            if (isOnline) {
                // Quando online, usa l'API di upload
                await uploadImageToServer(file, category);
            } else {
                // Quando in locale, salva nel localStorage
                await saveImageToLocalStorage(file, fileName, courseName, category);
            }
            
        } catch (error) {
            console.error(`   Errore nel salvataggio dell'immagine per ${courseName}:`, error);
        }
    }
    
    // Funzione per caricare l'immagine sul server
    async function uploadImageToServer(file, category) {
        try {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('category', category);
            formData.append('imagePath', `img/corsi/${category}/${file.name}`);
            
            console.log(`   Upload sul server in corso...`);
            
            const response = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                console.log(`   ✓ Immagine salvata sul server: ${data.path}`);
            } else {
                throw new Error(data.error || 'Errore nel caricamento');
            }
            
        } catch (error) {
            console.error(`   Errore upload sul server:`, error);
            console.log(`   Nota: l'immagine sarà disponibile solo online quando il server API è attivo`);
        }
    }
    
    // Funzione per salvare l'immagine nel localStorage (per uso locale)
    async function saveImageToLocalStorage(file, fileName, courseName, category) {
        try {
            // Converti il file in base64
            const reader = new FileReader();
            const base64Promise = new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
            });
            reader.readAsDataURL(file);
            
            const base64Data = await base64Promise;
            
            // Salva nel localStorage delle immagini
            const imageStorageKey = 'yamakasi_course_images';
            let existingImages = {};
            
            try {
                const stored = localStorage.getItem(imageStorageKey);
                if (stored) {
                    existingImages = JSON.parse(stored);
                }
            } catch (e) {
                console.log('Nessuna immagine esistente nel localStorage');
            }
            
            // Aggiungi la nuova immagine
            existingImages[fileName] = {
                courseName: courseName,
                category: category,
                data: base64Data,
                size: file.size,
                type: file.type,
                savedAt: new Date().toISOString()
            };
            
            // Salva nel localStorage
            localStorage.setItem(imageStorageKey, JSON.stringify(existingImages));
            
            console.log(`   ✓ Immagine salvata nel localStorage: ${fileName}`);
            console.log(`   Nota: l'immagine sarà disponibile nella console anche in locale`);
            
        } catch (error) {
            console.error(`   Errore salvataggio nel localStorage:`, error);
        }
    }
});
