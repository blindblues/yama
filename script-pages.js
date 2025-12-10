document.addEventListener('DOMContentLoaded', () => {
    // Elementi comuni a tutte le pagine
    const dropdownMenu = document.getElementById('dropdownMenu');
    const mainContent = document.querySelector('.main-content');
    const fixedLogo = document.querySelector('.fixed-logo');
    const magnifyingStrip = document.getElementById('magnifyingStrip');
    
    // Elementi per animazioni iniziali (solo in index.html)
    const animationContainer = document.querySelector('.animation-container');
    const logoSvg = document.querySelector('.logo-svg');
    
    // Variabili per animazioni iniziali
    let animationSkipped = false;
    let timeoutIds = [];
    let animationAccelerated = false;
    
    // Rendi la funzione globale per testing
    window.handleLogoScroll = function() {
        if (!fixedLogo) return;
        
        // Usa mainContent.scrollTop se esiste, altrimenti window.scrollY
        const scrollY = mainContent ? mainContent.scrollTop : window.scrollY;
        const triggerPoint = 20;
        
        if (scrollY > triggerPoint) {
            fixedLogo.classList.add('scrolled');
            // Mostra la striscia con effetto lente
            if (magnifyingStrip) {
                magnifyingStrip.classList.add('active');
            }
        } else {
            fixedLogo.classList.remove('scrolled');
            // Nascondi la striscia con effetto lente
            if (magnifyingStrip) {
                magnifyingStrip.classList.remove('active');
            }
        }
    };
    
    // Gestione scroll per il logo
    function handleLogoScroll() {
        return window.handleLogoScroll();
    }
    
    // Inizializza event listener per scroll e resize
    if (mainContent) {
        mainContent.addEventListener('scroll', handleLogoScroll);
    } else {
        document.addEventListener('scroll', handleLogoScroll);
    }
    window.addEventListener('resize', handleLogoScroll);
    
    // Event listener per chiudere il menu cliccando sullo sfondo
    if (dropdownMenu) {
        dropdownMenu.addEventListener('click', (e) => {
            // Chiudi il menu solo se non si clicca su un menu-item
            if (!e.target.classList.contains('menu-item')) {
                toggleMenu();
            }
        });
    }
    
    // Controlla posizione iniziale
    handleLogoScroll();
    
    // Funzione per il menu a cascata
    function toggleMenu() {
        // Chiudi tutte le schede aperte quando si apre il menu
        if (!dropdownMenu.classList.contains('active')) {
            const expandedCards = document.querySelectorAll('.class-card.expanded');
            
            // Rimuovi prima tutte le classi expanded e gestisci i placeholder
            expandedCards.forEach(openCard => {
                const closeBtn = openCard.querySelector('.close-btn');
                if (closeBtn) {
                    closeBtn.remove();
                }
                const overlay = document.querySelector('.class-overlay');
                if (overlay) {
                    overlay.classList.remove('active');
                }
                openCard.classList.remove('expanded');
                document.body.style.overflow = '';
                
                // Rimuovi il placeholder se esiste
                if (openCard._placeholder) {
                    openCard._placeholder.remove();
                    openCard._placeholder = null;
                }
            });
            
            // Poi riposiziona tutte le card con un piccolo delay per permettere il reflow
            setTimeout(() => {
                expandedCards.forEach(openCard => {
                    restoreOriginalPosition(openCard);
                });
            }, 50);
        }
        
        if (dropdownMenu.classList.contains('active')) {
            dropdownMenu.classList.remove('active');
            // Rimuovi classe menu-open e ripristina lo stato scroll
            if (fixedLogo) {
                fixedLogo.classList.remove('menu-open');
            }
            handleLogoScroll();
        } else {
            dropdownMenu.classList.add('active');
            // Reset del logo alla posizione normale quando si apre il menu
            if (fixedLogo) {
                fixedLogo.classList.remove('scrolled');
                fixedLogo.classList.add('menu-open');
            }
            // Nascondi la striscia quando si apre il menu
            if (magnifyingStrip) {
                magnifyingStrip.classList.remove('active');
            }
        }
    }
    
    // Funzioni per animazioni iniziali (solo se esistono gli elementi)
    function setLogoColor() {
        if (logoSvg) {
            logoSvg.style.filter = 'brightness(0) saturate(100%) invert(4%) sepia(4%) saturate(3235%) hue-rotate(320deg) brightness(98%) contrast(93%)';
        }
    }
    
    function accelerateAnimation() {
        if (!animationContainer || !logoSvg || animationSkipped || animationAccelerated) return;
        animationAccelerated = true;
        
        timeoutIds.forEach(id => clearTimeout(id));
        timeoutIds = [];
        
        logoSvg.style.transition = 'transform 0.3s cubic-bezier(0.20, 0.55, 0.27, 1.55), opacity 0.2s ease';
        logoSvg.style.opacity = '1';
        logoSvg.style.transform = 'rotateY(0deg)';
        
        const timeout1 = setTimeout(() => {
            if (animationSkipped) return;
            logoSvg.style.transition = 'none';
            void logoSvg.offsetWidth;
            
            logoSvg.style.willChange = 'transform';
            logoSvg.style.transform = 'rotateY(0deg) translateZ(0) scale(235)';
            logoSvg.style.transition = 'transform 0.2s cubic-bezier(0.5, 2, 0.9, 1)';
            
            animationContainer.style.transition = 'background-color 0.2s ease';
            animationContainer.style.backgroundColor = '#0a0a0a';
            
            const timeout2 = setTimeout(() => {
                if (animationSkipped) return;
                animationContainer.style.transition = 'opacity 0.2s ease-out';
                animationContainer.style.opacity = '0';
                if (mainContent) mainContent.style.opacity = '1';
                
                animationContainer.style.pointerEvents = 'none';
                
                // Aggiungi l'animazione al logo fisso ALL'INIZIO della transizione
                const fixedLogo = document.querySelector('.logo-small');
                const menuArrow = document.querySelector('.menu-arrow');
                if (fixedLogo) {
                    fixedLogo.classList.add('animate-logo');
                }
                if (menuArrow) {
                    menuArrow.classList.add('drop-arrow');
                }
                
                const timeout3 = setTimeout(() => {
                    if (animationSkipped) return;
                    animationContainer.style.display = 'none';
                    logoSvg.style.willChange = 'auto';
                }, 200);
                timeoutIds.push(timeout3);
            }, 200);
            timeoutIds.push(timeout2);
        }, 300);
        timeoutIds.push(timeout1);
    }
    
    function skipAnimation() {
        if (!animationContainer || !logoSvg || animationSkipped) return;
        animationSkipped = true;
        
        timeoutIds.forEach(id => clearTimeout(id));
        timeoutIds = [];
        
        logoSvg.style.transition = 'none';
        void logoSvg.offsetWidth;
        
        animationContainer.style.transition = 'opacity 0.3s ease';
        animationContainer.style.opacity = '0';
        if (mainContent) mainContent.style.opacity = '1';
        
        animationContainer.style.pointerEvents = 'none';
        
        const timeout = setTimeout(() => {
            animationContainer.style.display = 'none';
            logoSvg.style.willChange = 'auto';
        }, 300);
        timeoutIds.push(timeout);
    }
    
    function startInitialAnimation() {
        if (!animationContainer || !logoSvg) return;
        
        setLogoColor();
        
        logoSvg.addEventListener('load', () => {
            if (logoSvg.complete) {
                const timeout = setTimeout(() => {
                    accelerateAnimation();
                }, 1000);
                timeoutIds.push(timeout);
            }
        });
        
        if (logoSvg.complete) {
            const timeout = setTimeout(() => {
                accelerateAnimation();
            }, 1000);
            timeoutIds.push(timeout);
        }
        
        animationContainer.addEventListener('click', (e) => {
            e.preventDefault();
            if (!animationSkipped) {
                skipAnimation();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                if (!animationSkipped) {
                    skipAnimation();
                }
            }
        });
    }
    
    // Animazioni per elementi comuni (animate-up)
    function observeAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.animate-up').forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(element);
        });
    }
    
    // Inizializzazione
    if (animationContainer && logoSvg) {
        // Pagina con animazione iniziale (index.html)
        startInitialAnimation();
    } else {
        // Pagine senza animazione iniziale
        if (mainContent) {
            mainContent.style.opacity = '1';
        }
    }
    
    // Avvia animazioni comuni per tutte le pagine
    observeAnimations();
    
    // Rendi toggleMenu globale
    window.toggleMenu = toggleMenu;
    
    // Pulisci eventuali card residue nel body all'avvio
    function cleanupResidualCards() {
        const bodyCards = document.body.querySelectorAll('.class-card');
        const classesGrids = document.querySelectorAll('.classes-grid');
        
        bodyCards.forEach(card => {
            let isInGrid = false;
            classesGrids.forEach(grid => {
                if (grid.contains(card)) {
                    isInGrid = true;
                }
            });
            
            if (!isInGrid && classesGrids.length > 0) {
                // Rimuovi classi expanded e pulsanti di chiusura
                card.classList.remove('expanded');
                const closeBtn = card.querySelector('.close-btn');
                if (closeBtn) {
                    closeBtn.remove();
                }
                // Riposiziona la card nel primo grid disponibile
                classesGrids[0].appendChild(card);
            }
        });
    }
    
    // Memorizza le posizioni originali delle card all'avvio
    const originalPositions = new Map();
    
    function saveOriginalPositions() {
        document.querySelectorAll('.classes-grid').forEach(grid => {
            grid.querySelectorAll('.class-card').forEach((card, index) => {
                if (!originalPositions.has(card)) {
                    originalPositions.set(card, index);
                    // Salva anche il grid originale
                    card._originalGrid = grid;
                    console.log(`Salvata posizione per card ${card.id || 'senza-id'}: index=${index}, grid=${grid.className}`);
                }
            });
        });
    }
    
    // Funzione per riposizionare una card nella sua posizione originale
    function restoreOriginalPosition(card) {
        // Trova il grid originale di questa card
        const originalGrid = card._originalGrid;
        console.log(`Riposizionando card ${card.id || 'senza-id'}, originalGrid:`, originalGrid);
        
        if (!originalGrid) {
            // Fallback: cerca il primo grid che non contiene già questa card
            const classesGrids = document.querySelectorAll('.classes-grid');
            for (const grid of classesGrids) {
                if (!grid.contains(card)) {
                    card._originalGrid = grid;
                    console.log(`Fallback: assegnato grid ${grid.className} alla card ${card.id || 'senza-id'}`);
                    break;
                }
            }
        }
        
        if (card._originalGrid && !card._originalGrid.contains(card)) {
            const originalIndex = originalPositions.get(card);
            console.log(`Index originale per card ${card.id || 'senza-id'}: ${originalIndex}`);
            
            if (originalIndex !== undefined) {
                const currentCards = Array.from(card._originalGrid.querySelectorAll('.class-card'));
                console.log(`Card correnti nel grid: ${currentCards.length}`);
                
                // Inserisci la card nella sua posizione originale
                if (originalIndex >= currentCards.length) {
                    card._originalGrid.appendChild(card);
                    console.log(`Aggiunta alla fine del grid`);
                } else {
                    card._originalGrid.insertBefore(card, currentCards[originalIndex]);
                    console.log(`Inserita alla posizione ${originalIndex}`);
                }
            } else {
                // Fallback: aggiungi alla fine
                card._originalGrid.appendChild(card);
                console.log(`Fallback: aggiunta alla fine del grid`);
            }
        } else {
            console.log(`Card ${card.id || 'senza-id'} già nel suo grid o nessun grid trovato`);
        }
    }

    // Esegui la pulizia all'avvio
    cleanupResidualCards();
    
    // Salva le posizioni originali delle card
    saveOriginalPositions();

    // Funzione per espandere/collassare le card dei corsi
    function toggleClassCard(card) {
        const isExpanded = card.classList.contains('expanded');
        let overlay = document.querySelector('.class-overlay');
        
        if (isExpanded) {
            // Chiudi la card
            card.classList.remove('expanded');
            
            // Rendi i corsi non cliccabili
            const instructorId = card.id;
            if (window.makeCoursesNonClickable) {
                window.makeCoursesNonClickable(instructorId);
            }
            
            // Rimuovi il pulsante di chiusura
            const closeBtn = card.querySelector('.close-btn');
            if (closeBtn) {
                closeBtn.remove();
            }
            // Nascondi l'overlay
            if (overlay) {
                overlay.classList.remove('active');
            }
            // Ripristina lo scroll del body
            document.body.style.overflow = '';
            
            // Rimuovi il placeholder se esiste
            if (card._placeholder) {
                card._placeholder.remove();
                card._placeholder = null;
            }
            
            // Riposiziona la card nella sua posizione originale
            restoreOriginalPosition(card);
            
            // Controlla se nascondere la striscia quando si chiude la card
            handleLogoScroll();
            
        } else {
            // Chiudi altre card aperte
            document.querySelectorAll('.class-card.expanded').forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.classList.remove('expanded');
                    const otherCloseBtn = otherCard.querySelector('.close-btn');
                    if (otherCloseBtn) {
                        otherCloseBtn.remove();
                    }
                    // Rimuovi il placeholder dell'altra card
                    if (otherCard._placeholder) {
                        otherCard._placeholder.remove();
                        otherCard._placeholder = null;
                    }
                    // Riposiziona le altre card nella loro posizione originale
                    restoreOriginalPosition(otherCard);
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
            // Salva il riferimento al placeholder nella card
            card._placeholder = placeholder;
            card.parentNode.insertBefore(placeholder, card);
            
            // Sposta la card nel body per garantire posizionamento corretto
            document.body.appendChild(card);
            
            // Aggiungi la classe expanded dopo aver spostato la card
            card.classList.add('expanded');
            
            // Rendi i corsi cliccabili
            const instructorId = card.id;
            if (window.makeCoursesClickable) {
                window.makeCoursesClickable(instructorId);
            }
            
            // Aggiungi pulsante di chiusura
            const closeBtn = document.createElement('button');
            closeBtn.className = 'close-btn';
            closeBtn.innerHTML = '×';
            closeBtn.setAttribute('aria-label', 'Chiudi');
            card.appendChild(closeBtn);
            
            // Blocca lo scroll del body
            document.body.style.overflow = 'hidden';
            
            // Fai salire il logo in alto quando si apre una scheda
            if (fixedLogo) {
                fixedLogo.classList.add('scrolled');
            }
            // Mostra la striscia quando si apre una scheda
            if (magnifyingStrip) {
                magnifyingStrip.classList.add('active');
            }
            
            // Event listener per il pulsante di chiusura
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Chiudi la card
                card.classList.remove('expanded');
                closeBtn.remove();
                // Rimuovi il placeholder
                if (card._placeholder) {
                    card._placeholder.remove();
                    card._placeholder = null;
                }
                // Nascondi l'overlay
                if (overlay) {
                    overlay.classList.remove('active');
                }
                // Ripristina lo scroll
                document.body.style.overflow = '';
                // Riposiziona la card nella sua posizione originale
                restoreOriginalPosition(card);
                // Controlla se nascondere la striscia quando si chiude la card
                handleLogoScroll();
            });
            
            // Chiudi la card con il tasto ESC
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    card.classList.remove('expanded');
                    closeBtn.remove();
                    // Rimuovi il placeholder
                    if (card._placeholder) {
                        card._placeholder.remove();
                        card._placeholder = null;
                    }
                    if (overlay) {
                        overlay.classList.remove('active');
                    }
                    document.body.style.overflow = '';
                    // Riposiziona la card nella sua posizione originale
                    restoreOriginalPosition(card);
                    // Controlla se nascondere la striscia quando si chiude la card
                    handleLogoScroll();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
            
            // Chiudi la card cliccando sull'overlay
            overlay.addEventListener('click', function overlayClickHandler() {
                card.classList.remove('expanded');
                closeBtn.remove();
                // Rimuovi il placeholder
                if (card._placeholder) {
                    card._placeholder.remove();
                    card._placeholder = null;
                }
                overlay.classList.remove('active');
                document.body.style.overflow = '';
                // Riposiziona la card nella sua posizione originale
                restoreOriginalPosition(card);
                // Controlla se nascondere la striscia quando si chiude la card
                handleLogoScroll();
                overlay.removeEventListener('click', overlayClickHandler);
            });
        }
    }
    
    // Aggiungi event listener per le card dei corsi
    document.querySelectorAll('.class-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Non espandere se si clicca su un link o bottone dentro la card
            if (!e.target.closest('a') && !e.target.closest('button')) {
                toggleClassCard(card);
            }
        });
    });
    
    // Rendi la funzione globale per testing
    window.toggleClassCard = toggleClassCard;
    
    // Variabile per prevenire click multipli (debouncing)
    let isProcessing = false;
    
    // Funzione per filtrare i corsi in base alla categoria
    function filterCourses(category) {
        const allCards = document.querySelectorAll('#courses-container .class-card');
        
        allCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            if (cardCategory === category) {
                card.style.display = 'block';
                // Riattiva le animazioni
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            } else {
                card.style.display = 'none';
            }
        });
    }
    
    // Funzione unificata per gestire il cambio tra corsi adulti e ragazzi
    function switchCourses(targetType) {
        // Preveni click multipli
        if (isProcessing) return;
        isProcessing = true;
        
        const minorenniButton = document.getElementById('minorenni-toggle');
        const adultiButton = document.getElementById('adulti-button');
        
        if (!minorenniButton || !adultiButton) {
            isProcessing = false;
            return;
        }
        
        if (targetType === 'ragazzi') {
            // Mostra corsi ragazzi e nascondi corsi adulti
            filterCourses('ragazzi');
            
            // Aggiorna stati pulsanti
            minorenniButton.classList.add('active');
            adultiButton.classList.remove('active');
            
            // Scroll alla sezione
            setTimeout(() => {
                document.getElementById('courses-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
                isProcessing = false;
            }, 100);
            
        } else if (targetType === 'adulti') {
            // Mostra corsi adulti e nascondi corsi ragazzi
            filterCourses('adulti');
            
            // Aggiorna stati pulsanti
            adultiButton.classList.add('active');
            minorenniButton.classList.remove('active');
            
            // Scroll alla sezione
            setTimeout(() => {
                document.getElementById('courses-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
                isProcessing = false;
            }, 100);
        } else {
            isProcessing = false;
        }
    }
    
    // Event listener unificato per entrambi i pulsanti
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const buttonId = button.id;
            if (buttonId === 'minorenni-toggle') {
                switchCourses('ragazzi');
            } else if (buttonId === 'adulti-button') {
                switchCourses('adulti');
            }
        });
    });
    
    // Imposta "Adulti" come attivo di default e mostra solo corsi adulti
    const adultiButton = document.getElementById('adulti-button');
    if (adultiButton) {
        adultiButton.classList.add('active');
        // Mostra solo corsi adulti all'avvio
        filterCourses('adulti');
    }
    
    // Funzione per aprire la scheda di un insegnante dalla pagina dei corsi
    window.openInstructorCard = function(instructorId) {
        // Salva l'ID dell'insegnante da aprire
        sessionStorage.setItem('instructorToOpen', instructorId);
        
        // Reindirizza alla pagina about.html
        window.location.href = 'about.html';
    };
    
    // Funzione per aprire la scheda dell'insegnante quando si carica about.html
    function openInstructorFromSession() {
        const instructorId = sessionStorage.getItem('instructorToOpen');
        if (instructorId) {
            // Rimuovi l'ID dalla sessione
            sessionStorage.removeItem('instructorToOpen');
            
            // Mappa degli ID degli insegnanti con i loro indici nelle schede
            const instructorMap = {
                'roberto-vecchia': 0,
                'andrea-tran': 1,
                'matteo-cazzola': 2,
                'pietro-vaccari': 3,
                'michel-lupa': 4,
                'tatiana-rondanin': 5,
                'giulia-nussdorfer': 6,
                'pietro-corradi': 7,
                'elia-peraro': 8,
                'david-scardigno': 9,
                'ermanno-mazzi': 10
            };
            
            // Trova l'indice della scheda corrispondente
            const cardIndex = instructorMap[instructorId];
            if (cardIndex !== undefined) {
                // Aspetta che le schede siano caricate
                setTimeout(() => {
                    const cards = document.querySelectorAll('.class-card');
                    if (cards[cardIndex]) {
                        // Chiudi altre schede aperte
                        document.querySelectorAll('.class-card.expanded').forEach(otherCard => {
                            if (otherCard !== cards[cardIndex]) {
                                const otherCloseBtn = otherCard.querySelector('.close-btn');
                                if (otherCloseBtn) {
                                    otherCloseBtn.remove();
                                }
                                restoreOriginalPosition(otherCard);
                            }
                        });
                        
                        // Apri la scheda dell'insegnante
                        toggleClassCard(cards[cardIndex]);
                    }
                }, 500);
            }
        }
    }
    
    // Controlla se c'è un insegnante da aprire quando si carica la pagina
    if (window.location.pathname.includes('about.html')) {
        openInstructorFromSession();
        
        // Assicura che il contenuto sia visibile sulla pagina about.html
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.opacity = '1';
        }
    }
    
    // Controlla se c'è un corso da aprire quando si carica la pagina classes.html
    if (window.location.pathname.includes('classes.html')) {
        openCourseFromSession();
    }
    
    // Sistema di mapping corsi-insegnanti
    function populateInstructorCourses() {
        // Esegui solo sulla pagina about.html
        if (!window.location.pathname.includes('about.html')) return;
        
        console.log('Popolamento corsi insegnanti iniziato...');
        
        // Mappa dei corsi con i relativi insegnanti
        const coursesData = {
            'TAKEMUSU AIKIDO': ['michel-lupa'],
            'DAITO RYU AIKI JUJUTSU': ['pietro-vaccari'],
            'KARATE': ['pietro-vaccari'],
            'MUAY THAI': ['roberto-vecchia', 'andrea-tran', 'elia-peraro', 'pietro-corradi'],
            'KICK BOXING – K1': ['roberto-vecchia', 'andrea-tran', 'elia-peraro', 'pietro-corradi'],
            'WONDER WOMEN': ['tatiana-rondanin'],
            'BOXE': ['david-scardigno'],
            'KOMBAT TRAINING': ['tatiana-rondanin'],
            'BRAZILIAN JIUJITSU': ['matteo-cazzola'],
            'MMA': ['ermanno-mazzi', 'elia-peraro'],
            'MARTIAL KIDZ': ['giulia-nussdorfer'],
            'MUAY THAI JUNIOR': ['tatiana-rondanin', 'elia-peraro'],
            'MUAY THAI YOUNG': ['tatiana-rondanin', 'elia-peraro'],
            'BJJ JUNIOR': ['matteo-cazzola'],
            'MUAY THAI TEEN': ['tatiana-rondanin', 'elia-peraro']
        };
        
        // Inverti la mappa: per ogni insegnante, lista dei corsi
        const instructorCourses = {};
        for (const [course, instructors] of Object.entries(coursesData)) {
            instructors.forEach(instructorId => {
                if (!instructorCourses[instructorId]) {
                    instructorCourses[instructorId] = [];
                }
                instructorCourses[instructorId].push(course);
            });
        }
        
        console.log('Mappa insegnanti-corsi:', instructorCourses);
        
        
        // Funzione per rendere i corsi cliccabili quando si apre una scheda
        window.makeCoursesClickable = function(instructorId) {
            const classInfoElement = document.querySelector(`#${instructorId} .class-info`);
            if (classInfoElement) {
                const coursesData = instructorCourses[instructorId];
                
                // Svuota il contenuto
                classInfoElement.innerHTML = '';
                
                // Aggiungi ogni corso come link cliccabile in lista verticale
                coursesData.forEach(course => {
                    const courseDiv = document.createElement('div');
                    courseDiv.style.marginBottom = '2px';
                    
                    const courseLink = document.createElement('a');
                    courseLink.href = 'classes.html';
                    courseLink.className = 'course-link-in-header';
                    let formattedCourse = course.toUpperCase();
                    courseLink.textContent = formattedCourse;
                    courseLink.onclick = (e) => {
                        e.preventDefault();
                        sessionStorage.setItem('courseToOpen', course);
                        window.location.href = 'classes.html';
                    };
                    
                    courseDiv.appendChild(courseLink);
                    classInfoElement.appendChild(courseDiv);
                });
                
                console.log(`Resi cliccabili i corsi per ${instructorId} (lista verticale)`);
            }
        };
        
        
        console.log('Popolamento corsi insegnanti completato');
    }
    
    // Popola i corsi degli insegnanti quando la pagina è caricata
    if (window.location.pathname.includes('about.html')) {
        // Aspetta che il DOM sia completamente caricato
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(populateInstructorCourses, 100);
            });
        } else {
            // Il DOM è già caricato
            setTimeout(populateInstructorCourses, 100);
        }
    }
    
    // Funzione per aprire una scheda corso da sessionStorage
    function openCourseFromSession() {
        const courseToOpen = sessionStorage.getItem('courseToOpen');
        if (courseToOpen) {
            // Rimuovi il corso dalla sessione
            sessionStorage.removeItem('courseToOpen');
            
            // Attendi che le card siano caricate
            setTimeout(() => {
                const allCards = document.querySelectorAll('#courses-container .class-card');
                let targetCard = null;
                
                // Cerca la card del corso corrispondente
                allCards.forEach(card => {
                    const courseTitle = card.querySelector('.class-title');
                    if (courseTitle && courseTitle.textContent.trim() === courseToOpen) {
                        targetCard = card;
                    }
                });
                
                if (targetCard) {
                    // Chiudi altre card aperte
                    document.querySelectorAll('.class-card.expanded').forEach(otherCard => {
                        if (otherCard !== targetCard) {
                            otherCard.classList.remove('expanded');
                            const otherCloseBtn = otherCard.querySelector('.close-btn');
                            if (otherCloseBtn) {
                                otherCloseBtn.remove();
                            }
                            // Rimuovi il placeholder dell'altra card
                            if (otherCard._placeholder) {
                                otherCard._placeholder.remove();
                                otherCard._placeholder = null;
                            }
                            // Riposiziona le altre card nella loro posizione originale
                            restoreOriginalPosition(otherCard);
                        }
                    });
                    
                    // Verifica in quale categoria si trova il corso e imposta il filtro corretto
                    const cardCategory = targetCard.getAttribute('data-category');
                    if (cardCategory === 'ragazzi') {
                        // Imposta il filtro ragazzi se necessario
                        const minorenniButton = document.getElementById('minorenni-toggle');
                        const adultiButton = document.getElementById('adulti-button');
                        if (minorenniButton && adultiButton) {
                            minorenniButton.classList.add('active');
                            adultiButton.classList.remove('active');
                            filterCourses('ragazzi');
                        }
                    } else {
                        // Imposta il filtro adulti se necessario
                        const adultiButton = document.getElementById('adulti-button');
                        const minorenniButton = document.getElementById('minorenni-toggle');
                        if (adultiButton && minorenniButton) {
                            adultiButton.classList.add('active');
                            minorenniButton.classList.remove('active');
                            filterCourses('adulti');
                        }
                    }
                    
                    // Apri la card del corso dopo un piccolo ritardo per assicurarsi che sia visibile
                    setTimeout(() => {
                        toggleClassCard(targetCard);
                        // Scroll alla card
                        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                }
            }, 100);
        }
    }
    
    // Sistema di salvataggio e ripristino posizione scroll
    // Funzione per salvare la posizione di scroll della pagina corrente
    function saveScrollPosition() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const scrollY = mainContent ? mainContent.scrollTop : window.scrollY;
        sessionStorage.setItem(`scrollPosition_${currentPage}`, scrollY.toString());
    }
    
    // Funzione per ripristinare la posizione di scroll
    function restoreScrollPosition() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const savedPosition = sessionStorage.getItem(`scrollPosition_${currentPage}`);
        
        if (savedPosition) {
            const scrollY = parseInt(savedPosition, 10);
            
            // Aspetta che il contenuto sia caricato prima di ripristinare
            setTimeout(() => {
                if (mainContent) {
                    mainContent.scrollTop = scrollY;
                } else {
                    window.scrollTo(0, scrollY);
                }
            }, 100);
        }
    }
    
    // Salva la posizione quando si clicca su un link di navigazione
    document.querySelectorAll('a[href$=".html"]').forEach(link => {
        link.addEventListener('click', (e) => {
            saveScrollPosition();
        });
    });
    
    // Salva la posizione anche quando si naviga tramite browser history
    window.addEventListener('beforeunload', saveScrollPosition);
    
    // Ripristina la posizione al caricamento della pagina
    window.addEventListener('load', restoreScrollPosition);
    
    // Alternative: ripristina anche quando il DOM è pronto (per pagine senza animazione)
    if (!animationContainer) {
        document.addEventListener('DOMContentLoaded', restoreScrollPosition);
    }
});

// Database statico dei corsi con giorni e orari (basato su classes.html)
function getCoursesDatabase() {
    return [
        {
            name: "MUAY THAI",
            schedule: [
                { day: "Lunedì", time: "18:30 - 19:30" },
                { day: "Martedì", time: "20:00 - 21:00" },
                { day: "Giovedì", time: "20:00 - 21:00" }
            ]
        },
        {
            name: "KICK BOXING – K1",
            schedule: [
                { day: "Lunedì", time: "19:30 - 20:30" },
                { day: "Mercoledì", time: "19:30 - 20:30" },
                { day: "Venerdì", time: "19:30 - 20:30" }
            ]
        },
        {
            name: "WONDER WOMEN",
            schedule: [
                { day: "Martedì", time: "18:00 - 19:00" },
                { day: "Giovedì", time: "18:00 - 19:00" }
            ]
        },
        {
            name: "BOXE",
            schedule: [
                { day: "Lunedì", time: "20:30 - 22:00" },
                { day: "Mercoledì", time: "20:30 - 22:00" },
                { day: "Venerdì", time: "20:30 - 22:00" }
            ]
        },
        {
            name: "KOMBAT TRAINING",
            schedule: [
                { day: "Martedì", time: "20:30 - 22:00" },
                { day: "Giovedì", time: "20:30 - 22:00" }
            ]
        },
        {
            name: "BRAZILIAN JIUJITSU",
            schedule: [
                { day: "Lunedì", time: "18:00 - 19:30" },
                { day: "Mercoledì", time: "18:00 - 19:30" },
                { day: "Venerdì", time: "18:00 - 19:30" }
            ]
        },
        {
            name: "MMA",
            schedule: [
                { day: "Martedì", time: "18:00 - 19:30" },
                { day: "Giovedì", time: "18:00 - 19:30" },
                { day: "Sabato", time: "11:30 - 13:00" }
            ]
        },
        {
            name: "MARTIAL KIDZ",
            schedule: [
                { day: "Lunedì", time: "17:00 - 18:00" },
                { day: "Mercoledì", time: "17:00 - 18:00" }
            ]
        },
        {
            name: "MUAY THAI JUNIOR",
            schedule: [
                { day: "Martedì", time: "17:00 - 18:00" },
                { day: "Giovedì", time: "17:00 - 18:00" }
            ]
        },
        {
            name: "MUAY THAI YOUNG",
            schedule: [
                { day: "Lunedì", time: "18:00 - 19:00" },
                { day: "Mercoledì", time: "18:00 - 19:00" },
                { day: "Venerdì", time: "18:00 - 19:00" }
            ]
        },
        {
            name: "BJJ JUNIOR",
            schedule: [
                { day: "Martedì", time: "18:00 - 19:00" },
                { day: "Giovedì", time: "18:00 - 19:00" }
            ]
        },
        {
            name: "MUAY THAI TEEN",
            schedule: [
                { day: "Lunedì", time: "19:00 - 20:00" },
                { day: "Mercoledì", time: "19:00 - 20:00" },
                { day: "Venerdì", time: "19:00 - 20:00" }
            ]
        }
    ];
}

// Funzione per aprire/chiudere il selettore di corsi
function toggleCourseSelector() {
    console.log('toggleCourseSelector chiamato');
    const dropdown = document.getElementById('course-selector-dropdown');
    const selector = document.querySelector('.booking-course-selector');
    
    console.log('Dropdown:', dropdown);
    console.log('Selector:', selector);
    
    if (!dropdown || !selector) {
        console.error('Elementi non trovati');
        return;
    }
    
    if (dropdown.style.display === 'none' || dropdown.style.display === '') {
        dropdown.style.display = 'block';
        selector.classList.add('active');
        populateDisciplinesList(); // Usa la nuova funzione
        console.log('Dropdown aperto');
    } else {
        dropdown.style.display = 'none';
        selector.classList.remove('active');
        // Chiudi tutti gli orari aperti
        const allDisciplines = document.querySelectorAll('.discipline-item');
        const allSchedules = document.querySelectorAll('.discipline-schedule');
        allDisciplines.forEach(item => item.classList.remove('expanded'));
        allSchedules.forEach(schedule => schedule.classList.remove('expanded'));
        console.log('Dropdown chiuso');
    }
}

// Funzione per popolare la lista delle discipline con orari a tendina
function populateDisciplinesList() {
    console.log('populateDisciplinesList chiamato');
    const container = document.getElementById('disciplines-list-container');
    container.innerHTML = '';
    
    try {
        // Usa il database statico dei corsi
        const courses = getCoursesDatabase();
        console.log('Corsi caricati:', courses);
        
        courses.forEach(course => {
            // Crea l'elemento disciplina
            const disciplineItem = document.createElement('div');
            disciplineItem.className = 'discipline-item';
            disciplineItem.dataset.disciplineName = course.name.toLowerCase();
            
            // Crea il contenitore per gli orari
            const disciplineSchedule = document.createElement('div');
            disciplineSchedule.className = 'discipline-schedule';
            disciplineSchedule.id = `schedule-${course.name.replace(/\s+/g, '-').toLowerCase()}`;
            
            // Popola gli orari
            course.schedule.forEach(item => {
                const scheduleOption = document.createElement('div');
                scheduleOption.className = 'schedule-option';
                scheduleOption.onclick = () => selectCourse(course.name, item.day, item.time);
                
                scheduleOption.innerHTML = `
                    <span class="schedule-day">${item.day}</span>
                    <span class="schedule-time">${item.time}</span>
                `;
                
                disciplineSchedule.appendChild(scheduleOption);
            });
            
            // Imposta il contenuto della disciplina
            disciplineItem.innerHTML = `
                <span class="discipline-name">${course.name}</span>
                <svg class="discipline-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            `;
            
            // Aggiungi l'evento click per aprire/chiudere gli orari
            disciplineItem.onclick = (e) => {
                e.stopPropagation();
                toggleDisciplineSchedule(disciplineItem, disciplineSchedule);
            };
            
            // Aggiungi entrambi gli elementi al container
            container.appendChild(disciplineItem);
            container.appendChild(disciplineSchedule);
        });
        
        console.log('Lista discipline popolata con successo');
    } catch (error) {
        console.error('Errore nel popolare la lista discipline:', error);
        container.innerHTML = '<div class="no-results">Errore nel caricamento delle discipline</div>';
    }
}

// Funzione per aprire/chiudere gli orari di una disciplina
function toggleDisciplineSchedule(disciplineItem, scheduleElement) {
    const isExpanded = disciplineItem.classList.contains('expanded');
    
    // Chiudi tutti gli altri menu aperti
    const allDisciplines = document.querySelectorAll('.discipline-item');
    const allSchedules = document.querySelectorAll('.discipline-schedule');
    
    allDisciplines.forEach(item => {
        if (item !== disciplineItem) {
            item.classList.remove('expanded');
        }
    });
    
    allSchedules.forEach(schedule => {
        if (schedule !== scheduleElement) {
            schedule.classList.remove('expanded');
        }
    });
    
    // Toggle della disciplina corrente
    if (isExpanded) {
        disciplineItem.classList.remove('expanded');
        scheduleElement.classList.remove('expanded');
    } else {
        disciplineItem.classList.add('expanded');
        scheduleElement.classList.add('expanded');
    }
}

// Funzione per filtrare le discipline
function filterDisciplines() {
    const searchInput = document.getElementById('course-search-input');
    const searchTerm = searchInput.value.toLowerCase().trim();
    const disciplineItems = document.querySelectorAll('.discipline-item');
    const container = document.getElementById('disciplines-list-container');
    
    if (searchTerm === '') {
        // Mostra tutte le discipline se la ricerca è vuota
        disciplineItems.forEach(item => item.classList.remove('hidden'));
        return;
    }
    
    let hasResults = false;
    
    disciplineItems.forEach(item => {
        const disciplineName = item.dataset.disciplineName;
        
        if (disciplineName.includes(searchTerm)) {
            item.classList.remove('hidden');
            hasResults = true;
        } else {
            item.classList.add('hidden');
        }
    });
    
    // Mostra messaggio "nessun risultato" se necessario
    if (!hasResults) {
        if (!container.querySelector('.no-results')) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = 'Nessuna disciplina trovata';
            container.appendChild(noResults);
        }
    } else {
        const noResults = container.querySelector('.no-results');
        if (noResults) {
            noResults.remove();
        }
    }
}

// Funzione per selezionare un corso specifico
function selectCourse(courseName, day, time) {
    // Aggiorna i dati nel sessionStorage
    sessionStorage.setItem('bookingCourseName', courseName);
    sessionStorage.setItem('bookingDay', day);
    sessionStorage.setItem('bookingTime', time);
    
    // Aggiorna la visualizzazione
    const courseNameElement = document.getElementById('booking-course-name');
    const scheduleElement = document.getElementById('booking-schedule');
    
    if (courseNameElement && scheduleElement) {
        courseNameElement.textContent = courseName;
        scheduleElement.textContent = `${day} - ${time}`;
    }
    
    // Chiudi il dropdown principale
    const dropdown = document.getElementById('course-selector-dropdown');
    const selector = document.querySelector('.booking-course-selector');
    dropdown.style.display = 'none';
    selector.classList.remove('active');
    
    // Chiudi tutti gli orari aperti
    const allDisciplines = document.querySelectorAll('.discipline-item');
    const allSchedules = document.querySelectorAll('.discipline-schedule');
    allDisciplines.forEach(item => item.classList.remove('expanded'));
    allSchedules.forEach(schedule => schedule.classList.remove('expanded'));
}

// Funzione per aprire la scheda di prenotazione
function openBookingCard(courseName, day, time) {
    // Salva i dati del corso nel sessionStorage
    sessionStorage.setItem('bookingCourseName', courseName);
    sessionStorage.setItem('bookingDay', day);
    sessionStorage.setItem('bookingTime', time);
    
    // Reindirizza alla pagina contatti
    window.location.href = 'contacts.html';
}

// Chiudi il dropdown quando si clicca fuori
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('course-selector-dropdown');
    const selector = document.querySelector('.booking-course-selector');
    
    if (dropdown && selector && 
        !selector.contains(event.target) && 
        !dropdown.contains(event.target)) {
        dropdown.style.display = 'none';
        selector.classList.remove('active');
    }
});

// Assicura che le funzioni siano globali
window.toggleCourseSelector = toggleCourseSelector;
window.selectCourse = selectCourse;
window.openBookingCard = openBookingCard;
window.closeBookingModal = closeBookingModal;
window.filterDisciplines = filterDisciplines;
window.toggleDisciplineSchedule = toggleDisciplineSchedule;
window.openBookingModal = openBookingModal;

// Debug: verifica che le funzioni siano accessibili
console.log('Funzioni globali disponibili:', {
    toggleCourseSelector: typeof window.toggleCourseSelector,
    selectCourse: typeof window.selectCourse,
    openBookingCard: typeof window.openBookingCard,
    closeBookingModal: typeof window.closeBookingModal,
    openBookingModal: typeof window.openBookingModal
});

// Funzione per aprire la modal di prenotazione
function openBookingModal() {
    const modal = document.getElementById('booking-modal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Blocca lo scroll dello sfondo
        
        // Resetta il form se necessario
        const form = document.getElementById('trial-lesson-form');
        if (form) {
            form.reset();
        }
        
        // Resetta la selezione corso
        const bookingCourseName = document.getElementById('booking-course-name');
        const bookingSchedule = document.getElementById('booking-schedule');
        if (bookingCourseName && bookingSchedule) {
            bookingCourseName.textContent = 'Clicca per selezionare un corso';
            bookingSchedule.textContent = 'Scegli giorno e orario';
        }
        
        // Pulisci sessionStorage
        sessionStorage.removeItem('bookingCourseName');
        sessionStorage.removeItem('bookingDay');
        sessionStorage.removeItem('bookingTime');
        
        console.log('Modal di prenotazione aperta');
    } else {
        console.error('Modal di prenotazione non trovata');
    }
}

// Funzione per chiudere la modal di prenotazione
function closeBookingModal() {
    const modal = document.getElementById('booking-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // Ripristina lo scroll
        // Rimuovi i dati dal sessionStorage
        sessionStorage.removeItem('bookingCourseName');
        sessionStorage.removeItem('bookingDay');
        sessionStorage.removeItem('bookingTime');
    }
}

// Funzione per inizializzare la modal di prenotazione
function initializeBookingModal() {
    const modal = document.getElementById('booking-modal');
    const courseNameElement = document.getElementById('booking-course-name');
    const scheduleElement = document.getElementById('booking-schedule');
    
    // Aggiungi event listener per chiudere cliccando sullo sfondo della modal
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeBookingModal();
            }
        });
        
        // Aggiungi event listener per il tasto ESC
        const escapeHandler = function(e) {
            if (e.key === 'Escape') {
                closeBookingModal();
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }
    
    // Controlla se ci sono dati di prenotazione nel sessionStorage
    const courseName = sessionStorage.getItem('bookingCourseName');
    const day = sessionStorage.getItem('bookingDay');
    const time = sessionStorage.getItem('bookingTime');
    
    if (courseName && day && time && modal && courseNameElement && scheduleElement) {
        // Popola i dati del corso
        courseNameElement.textContent = courseName;
        scheduleElement.textContent = `${day} - ${time}`;
        
        // Mostra la modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Blocca lo scroll
        
        // Forza lo scrolling immediato dopo un micro-delay
        setTimeout(() => {
            const bookingDialog = modal.querySelector('.booking-dialog');
            if (bookingDialog) {
                bookingDialog.scrollTop = 0;
                bookingDialog.style.overflowY = 'auto';
            }
        }, 10);
    }
}

// Funzioni per il modal di prenotazione lezione di prova
function openTrialModal() {
    const modal = document.getElementById('trialModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeTrialModal() {
    const modal = document.getElementById('trialModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Rendi le funzioni globali
window.openTrialModal = openTrialModal;
window.closeTrialModal = closeTrialModal;

// Inizializza i gestori per il modal quando il DOM è caricato
document.addEventListener('DOMContentLoaded', function() {
    // Chiudi la modal cliccando sullo sfondo
    const trialModal = document.getElementById('trialModal');
    if (trialModal) {
        trialModal.addEventListener('click', function(e) {
            if (e.target === trialModal) {
                closeTrialModal();
            }
        });
    }
    
    // Chiudi la modal con il tasto ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && trialModal && trialModal.style.display === 'block') {
            closeTrialModal();
        }
    });
});

// Funzionalità per il carosello delle recensioni
let currentSlide = 0;
let totalSlides;
let cardsPerSlide = 3;
const autoSlideInterval = 6000; // 6 secondi per auto-rotazione
let autoSlideTimer;
let isTransitioning = false;

function moveCarousel(direction) {
    if (isTransitioning) return;
    
    const track = document.querySelector('.carousel-track');
    if (!track) return;
    
    isTransitioning = true;
    
    // Resetta il timer di auto-rotazione
    clearInterval(autoSlideTimer);
    
    currentSlide += direction;
    
    // Ciclo infinito
    if (currentSlide < 0) {
        currentSlide = totalSlides - 1;
    } else if (currentSlide >= totalSlides) {
        currentSlide = 0;
    }
    
    updateCarousel();
    
    // Resetta lo stato di transizione dopo l'animazione
    setTimeout(() => {
        isTransitioning = false;
        startAutoSlide();
    }, 800);
}

function goToSlide(slideIndex) {
    if (isTransitioning || slideIndex === currentSlide) return;
    
    isTransitioning = true;
    currentSlide = slideIndex;
    
    // Resetta il timer di auto-rotazione
    clearInterval(autoSlideTimer);
    
    updateCarousel();
    
    // Resetta lo stato di transizione dopo l'animazione
    setTimeout(() => {
        isTransitioning = false;
        startAutoSlide();
    }, 800);
}

function updateCarousel() {
    const track = document.querySelector('.carousel-track');
    const dots = document.querySelectorAll('.dot');
    
    if (track) {
        // Calcola la larghezza totale dello slide
        const slideWidth = 100 / cardsPerSlide; // 33.333% per card
        const offset = currentSlide * slideWidth;
        
        track.style.transform = `translateX(-${offset}%)`;
    }
    
    // Aggiorna i dots
    dots.forEach((dot, index) => {
        if (index < totalSlides) {
            dot.classList.toggle('active', index === currentSlide);
        }
    });
}

function startAutoSlide() {
    clearInterval(autoSlideTimer);
    autoSlideTimer = setInterval(() => {
        moveCarousel(1);
    }, autoSlideInterval);
}

function stopAutoSlide() {
    clearInterval(autoSlideTimer);
}

// Inizializza il carosello quando il DOM è caricato
document.addEventListener('DOMContentLoaded', function() {
    // Inizializza la modal di prenotazione se siamo in index.html, contacts.html o classes.html
    if (window.location.pathname.includes('contacts.html') || window.location.href.includes('contacts.html') || 
        window.location.pathname.includes('index.html') || window.location.href.includes('index.html') ||
        window.location.pathname.includes('classes.html') || window.location.href.includes('classes.html')) {
        initializeBookingModal();
    }
    
    // Inizializza il carosello delle recensioni se siamo in index.html
    if (window.location.pathname.includes('index.html') || window.location.href.includes('index.html')) {
        // Calcola il numero totale di slide
        const cards = document.querySelectorAll('.carousel-track .review-card');
        totalSlides = Math.ceil(cards.length / cardsPerSlide);
        
        // Imposta tutte le cards come visibili inizialmente
        cards.forEach(card => {
            card.classList.add('visible');
        });
        
        // Inizializza la prima slide
        updateCarousel();
        
        startAutoSlide();
        
        // Pausa l'auto-rotazione quando l'utente interagisce con il carosello
        const carousel = document.querySelector('.reviews-carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', stopAutoSlide);
            carousel.addEventListener('mouseleave', startAutoSlide);
        }
    }
    
    // Aggiungi click handler a tutti gli schedule-item
    const scheduleItems = document.querySelectorAll('.schedule-item');
    scheduleItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Trova il nome del corso
            const classCard = this.closest('.class-card');
            if (!classCard) return;
            
            const courseTitle = classCard.querySelector('.class-title');
            if (!courseTitle) return;
            
            // Trova il giorno e l'orario
            const dayElement = this.querySelector('.schedule-day');
            const timeElement = this.querySelector('.schedule-time');
            
            if (!dayElement || !timeElement) return;
            
            // Salva i dati nel sessionStorage
            sessionStorage.setItem('bookingCourseName', courseTitle.textContent);
            sessionStorage.setItem('bookingDay', dayElement.textContent);
            sessionStorage.setItem('bookingTime', timeElement.textContent);
            
            // Apri la modal di prenotazione direttamente nella pagina corrente
            openBookingModal();
            
            // Popola i dati del corso nella modal
            const bookingCourseName = document.getElementById('booking-course-name');
            const bookingSchedule = document.getElementById('booking-schedule');
            if (bookingCourseName && bookingSchedule) {
                bookingCourseName.textContent = courseTitle.textContent;
                bookingSchedule.textContent = `${dayElement.textContent} - ${timeElement.textContent}`;
            }
        });
    });
});

// ===== QUIZ PER SCELTA DISCIPLINA =====

// Mappatura tra nomi delle discipline nel quiz e ID nella pagina classes.html
const disciplineIdMap = {
    "MUAY THAI": "muay-thai",
    "BOXE": "boxe", 
    "KICK BOXING": "kick-boxing",
    "KARATE": "karate",
    "TAKEMUSU AIKIDO": "takemusu-aikido",
    "DAITO RYU AIKI JUJUTSU": "takemusu-aikido", // Mappato a Aikido poiché non c'è card separata
    "BRAZILIAN JIUJITSU": "brazilian-jiujitsu",
    "WONDER WOMEN": "wonder-women",
    "KOMBAT TRAINING": "kombat-training",
    "MMA": "mma"
};

// Dati del quiz
const quizData = {
    questions: [
        {
            id: 1,
            question: "Quale è il tuo obiettivo principale?",
            options: [
                { text: "Migliorare la forma fisica e perdere peso", value: "fitness" },
                { text: "Imparare a difendermi", value: "difesa" },
                { text: "Sviluppare disciplina e concentrazione", value: "disciplina" },
                { text: "Competere a livello agonistico", value: "agonismo" }
            ]
        },
        {
            id: 2,
            question: "Che tipo di allenamento preferisci?",
            options: [
                { text: "Intenso e dinamico", value: "intenso" },
                { text: "Tecnico e preciso", value: "tecnico" },
                { text: "Equilibrato mente-corpo", value: "equilibrato" },
                { text: "Con armi tradizionali", value: "armi" }
            ]
        },
        {
            id: 3,
            question: "Quanto tempo vuoi dedicare agli allenamenti?",
            options: [
                { text: "1-2 volte a settimana", value: "poco" },
                { text: "3-4 volte a settimana", value: "medio" },
                { text: "5+ volte a settimana", value: "molto" }
            ]
        },
        {
            id: 4,
            question: "Hai esperienza precedente in arti marziali?",
            options: [
                { text: "Nessuna esperienza", value: "principiante" },
                { text: "Poca esperienza", value: "intermedio" },
                { text: "Buona esperienza", value: "avanzado" }
            ]
        },
        {
            id: 5,
            question: "Quale aspetto ti interessa di più?",
            options: [
                { text: "Aspetto fisico e salute", value: "fisico" },
                { text: "Aspetto mentale e spirituale", value: "mentale" },
                { text: "Aspetto sociale e divertimento", value: "sociale" },
                { text: "Aspetto competitivo", value: "competitivo" }
            ]
        }
    ],
    
    // Risultati possibili basati sulle risposte
    results: {
        "MUAY THAI": {
            description: "Perfetto per chi cerca un allenamento intenso che migliora forza, resistenza e fiducia personale. Ideale per la difesa personale.",
            keywords: ["fitness", "difesa", "intenso", "contatto", "fisico"]
        },
        "BOXE": {
            description: "Eccellente per migliorare coordinazione, agilità e resistenza. Classica e efficace per la difesa personale.",
            keywords: ["fitness", "difesa", "intenso", "contatto", "fisico"]
        },
        "KICK BOXING": {
            description: "Combina potenza e tecnica, perfetta per chi vuole un allenamento completo e dinamico.",
            keywords: ["fitness", "difesa", "intenso", "contatto", "fisico"]
        },
        "KARATE": {
            description: "Disciplina tradizionale che sviluppa forza, flessibilità e rispetto. Ideale per tutte le età.",
            keywords: ["disciplina", "tecnico", "equilibrato", "principiante", "mentale"]
        },
        "TAKEMUSU AIKIDO": {
            description: "Arte marziale giapponese basata sull'uso della forza dell'avversario. Include studio di armi tradizionali come bokken e jo.",
            keywords: ["disciplina", "tecnico", "equilibrato", "mentale", "armi"]
        },
        "DAITO RYU AIKI JUJUTSU": {
            description: "Antica arte marziale giapponese con tecniche di controllo delle articolazioni. Include armi tradizionali per praticanti esperti.",
            keywords: ["disciplina", "tecnico", "mentale", "armi", "avanzado", "intermedio"]
        },
        "BRAZILIAN JIUJITSU": {
            description: "Focalizzato sulla lotta a terra, ideale per chi vuole imparare a sconfiggere avversari più grandi.",
            keywords: ["difesa", "tecnico", "contatto", "sociale"]
        },
        "WONDER WOMEN": {
            description: "Corso esclusivamente femminile che unisce difesa personale, fitness e crescita personale in ambiente sicuro.",
            keywords: ["fitness", "difesa", "sociale", "fisico"]
        },
        "KOMBAT TRAINING": {
            description: "Allenamento funzionale che combina tecniche di diverse arti marziali per preparazione completa.",
            keywords: ["fitness", "intenso", "fisico", "medio"]
        },
        "MMA": {
            description: "Disciplina completa per chi cerca il massimo livello di sfida e competizione.",
            keywords: ["agonismo", "intenso", "contatto", "competitivo", "avanzado", "molto"]
        }
    }
};

// Stato del quiz
let currentQuestion = 0;
let userAnswers = [];
let quizStarted = false;

// Funzioni del quiz
function initQuiz() {
    const quizContent = document.getElementById('quizContent');
    if (!quizContent) return;
    
    // Resetta lo stato
    currentQuestion = 0;
    userAnswers = [];
    quizStarted = true;
    
    // Mostra la prima domanda
    showQuestion();
}

function showQuestion() {
    const quizContent = document.getElementById('quizContent');
    const progressText = document.getElementById('progressText');
    const progressFill = document.getElementById('progressFill');
    
    if (!quizContent || !quizData.questions[currentQuestion]) return;
    
    const question = quizData.questions[currentQuestion];
    
    // Aggiorna progresso con animazione
    progressText.textContent = `Domanda ${currentQuestion + 1} di ${quizData.questions.length}`;
    const progressPercentage = ((currentQuestion + 1) / quizData.questions.length) * 100;
    progressFill.style.width = `${progressPercentage}%`;
    
    // Crea HTML della domanda con animazioni
    const questionHTML = `
        <h3 class="question-title">${question.question}</h3>
        <div class="quiz-options">
            ${question.options.map((option, index) => `
                <div class="quiz-option" data-value="${option.value}" onclick="selectOption('${option.value}', this)" style="animation-delay: ${index * 0.1}s">
                    <span class="quiz-option-text">${option.text}</span>
                </div>
            `).join('')}
        </div>
        <div class="quiz-navigation">
            ${currentQuestion > 0 ? '<button class="quiz-nav-btn prev-btn" onclick="previousQuestion()">← Precedente</button>' : '<div></div>'}
            <button class="quiz-nav-btn next-btn" id="nextBtn" onclick="nextQuestion()" disabled>Prossima →</button>
        </div>
    `;
    
    // Aggiungi contenuto con animazione fade-in
    quizContent.style.opacity = '0';
    quizContent.innerHTML = questionHTML;
    
    // Animazione di entrata
    setTimeout(() => {
        quizContent.style.transition = 'opacity 0.5s ease-out';
        quizContent.style.opacity = '1';
        
        // Aggiungi animazione alle opzioni
        const options = quizContent.querySelectorAll('.quiz-option');
        options.forEach((option, index) => {
            option.style.opacity = '0';
            option.style.transform = 'translateY(20px)';
            setTimeout(() => {
                option.style.transition = 'all 0.5s ease-out';
                option.style.opacity = '1';
                option.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 100);
}

function selectOption(value, element) {
    // Rimuove selezione precedente con animazione
    document.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.remove('selected');
        opt.style.transform = 'scale(1)';
    });
    
    // Aggiunge selezione corrente con animazione
    element.classList.add('selected');
    element.style.transform = 'scale(1.02)';
    
    // Effetto ripple
    const ripple = document.createElement('div');
    ripple.style.position = 'absolute';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.background = 'rgba(250, 181, 59, 0.5)';
    ripple.style.borderRadius = '50%';
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.style.pointerEvents = 'none';
    ripple.style.animation = 'rippleEffect 0.6s ease-out';
    
    const rect = element.getBoundingClientRect();
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
    
    // Salva la risposta
    userAnswers[currentQuestion] = value;
    
    // Abilita bottone prossima con animazione
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.style.transform = 'scale(1.05)';
        setTimeout(() => {
            nextBtn.style.transform = 'scale(1)';
        }, 200);
    }
    
    // Aggiungi feedback sonoro simulato (animazione visiva)
    element.style.animation = 'selectPulse 0.3s ease-out';
    setTimeout(() => {
        element.style.animation = '';
    }, 300);
}

function nextQuestion() {
    if (currentQuestion < quizData.questions.length - 1) {
        currentQuestion++;
        showQuestion();
    } else {
        showResult();
    }
}

function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion();
    }
}

function showResult() {
    const quizContent = document.getElementById('quizContent');
    const quizResult = document.getElementById('quizResult');
    const resultDiscipline = document.getElementById('resultDiscipline');
    const resultDescription = document.getElementById('resultDescription');
    const resultTitle = quizResult.querySelector('.result-title');
    
    // Calcola i risultati multipli
    const results = calculateResults();
    
    // Nascondi domande e mostra risultato
    quizContent.style.display = 'none';
    quizResult.style.display = 'block';
    
    // Mostra i risultati come cards separate
    const resultsList = results.map((r, index) => {
        const disciplineId = disciplineIdMap[r.discipline] || r.discipline.toLowerCase().replace(/\s+/g, '-');
        return `
            <div class="result-card" style="animation-delay: ${index * 0.2}s">
                <div class="result-card-header">
                    <div class="result-rank">${index + 1}</div>
                    <div class="result-discipline-name">
                        <a href="classes.html#${disciplineId}" class="discipline-link-yellow">${r.discipline}</a>
                    </div>
                </div>
                <div class="result-card-body">
                    <div class="discipline-description">${r.description}</div>
                </div>
            </div>
        `;
    }).join('');
    
    resultDiscipline.innerHTML = `<div class="results-grid">${resultsList}</div>`;
    resultDescription.innerHTML = ''; // Svuota il contenuto delle descrizioni separate
    
    // Aggiungi event listener per rendere le cards cliccabili
    setTimeout(() => {
        document.querySelectorAll('.result-card').forEach((card, index) => {
            const disciplineId = disciplineIdMap[results[index].discipline] || results[index].discipline.toLowerCase().replace(/\s+/g, '-');
            card.addEventListener('click', () => {
                window.location.href = `classes.html#${disciplineId}`;
            });
        });
    }, 100);
    
    // Aggiorna il titolo in base al numero di risultati
    if (resultTitle) {
        if (results.length === 1) {
            resultTitle.textContent = 'La tua disciplina ideale è:';
        } else {
            resultTitle.textContent = 'Le discipline ideali per te sono:';
        }
    }
}

function calculateResults() {
    const scores = {};
    
    // Inizializza i punteggi
    Object.keys(quizData.results).forEach(discipline => {
        scores[discipline] = 0;
    });
    
    // Calcola i punteggi basati sulle risposte
    userAnswers.forEach(answer => {
        Object.entries(quizData.results).forEach(([discipline, data]) => {
            if (data.keywords.includes(answer)) {
                scores[discipline]++;
            }
        });
    });
    
    // Se l'utente ha scelto "armi", dai priorità assoluta alle discipline con armi tradizionali
    if (userAnswers.includes('armi')) {
        const armiDisciplines = ['TAKEMUSU AIKIDO', 'DAITO RYU AIKI JUJUTSU'];
        const armiResults = [];
        
        armiDisciplines.forEach(discipline => {
            if (scores[discipline] > 0) {
                armiResults.push({
                    discipline: discipline,
                    description: quizData.results[discipline].description,
                    score: scores[discipline]
                });
            }
        });
        
        if (armiResults.length > 0) {
            // Ordina per punteggio e restituisci tutte le discipline con armi che hanno punteggio
            return armiResults.sort((a, b) => b.score - a.score);
        }
    }
    
    // Converti i punteggi in array di risultati
    const results = Object.entries(scores)
        .filter(([discipline, score]) => score > 0)
        .map(([discipline, score]) => ({
            discipline: discipline,
            description: quizData.results[discipline].description,
            score: score
        }))
        .sort((a, b) => b.score - a.score);
    
    // Prendi le prime 3 discipline con punteggio più alto (o tutte se meno di 3)
    const topResults = results.slice(0, 3);
    
    // Se non c'è una corrispondenza chiara, usa un default
    if (topResults.length === 0) {
        return [{
            discipline: "MUAY THAI",
            description: quizData.results["MUAY THAI"].description,
            score: 1
        }];
    }
    
    // Filtra i risultati che sono significativamente vicini al punteggio massimo
    const maxScore = topResults[0].score;
    const significantResults = topResults.filter(result => 
        result.score >= maxScore - 1 // Include risultati entro 1 punto dal massimo
    );
    
    return significantResults.length > 0 ? significantResults : topResults.slice(0, 1);
}

// Mantieni la vecchia funzione per compatibilità
function calculateResult() {
    const results = calculateResults();
    return results[0];
}

function restartQuiz() {
    const quizContent = document.getElementById('quizContent');
    const quizResult = document.getElementById('quizResult');
    
    if (quizContent && quizResult) {
        quizResult.style.display = 'none';
        quizContent.style.display = 'block';
        
        // Resetta il titolo al valore originale
        const resultTitle = document.querySelector('.result-title');
        if (resultTitle) {
            resultTitle.textContent = 'La tua disciplina ideale è:';
        }
        
        initQuiz();
    }
}

// Inizializza il quiz quando la pagina è caricata
document.addEventListener('DOMContentLoaded', () => {
    // Elementi comuni a tutte le pagine
    const dropdownMenu = document.getElementById('dropdownMenu');
    const mainContent = document.querySelector('.main-content');
    const fixedLogo = document.querySelector('.fixed-logo');
    const magnifyingStrip = document.getElementById('magnifyingStrip');
    
    // Elementi per animazioni iniziali (solo in index.html)
    const animationContainer = document.querySelector('.animation-container');
    const logoSvg = document.querySelector('.logo-svg');
    
    // Variabili per animazioni iniziali
    let animationSkipped = false;
    let timeoutIds = [];
    let animationAccelerated = false;
    
    // Rendi la funzione globale per testing
    window.handleLogoScroll = function() {
        if (!fixedLogo) return;
        
        // Usa mainContent.scrollTop se esiste, altrimenti window.scrollY
        const scrollY = mainContent ? mainContent.scrollTop : window.scrollY;
        const triggerPoint = 20;
        
        if (scrollY > triggerPoint) {
            fixedLogo.classList.add('scrolled');
            // Mostra la striscia con effetto lente
            if (magnifyingStrip) {
                magnifyingStrip.classList.add('active');
            }
        } else {
            fixedLogo.classList.remove('scrolled');
            // Nascondi la striscia con effetto lente
            if (magnifyingStrip) {
                magnifyingStrip.classList.remove('active');
            }
        }
    };
    
    // Gestione scroll per il logo
    function handleLogoScroll() {
        return window.handleLogoScroll();
    }
    
    // Inizializza event listener per scroll e resize
    if (mainContent) {
        mainContent.addEventListener('scroll', handleLogoScroll);
    } else {
        document.addEventListener('scroll', handleLogoScroll);
    }
    window.addEventListener('resize', handleLogoScroll);
    
    // Event listener per chiudere il menu cliccando sullo sfondo
    if (dropdownMenu) {
        dropdownMenu.addEventListener('click', (e) => {
            // Chiudi il menu solo se non si clicca su un menu-item
            if (!e.target.classList.contains('menu-item')) {
                toggleMenu();
            }
        });
    }
    
    // Controlla posizione iniziale
    handleLogoScroll();
    
    // La funzione toggleMenu è già definita sopra e resa globale
    
    // Gestione hash URL per aprire automaticamente la scheda della disciplina
    function handleHashFromURL() {
        const hash = window.location.hash.substring(1); // Rimuove il #
        if (hash) {
            // Attendi un momento per assicurarti che le card siano caricate
            setTimeout(() => {
                const targetCard = document.getElementById(hash);
                if (targetCard && targetCard.classList.contains('class-card')) {
                    // Chiudi altre card aperte
                    document.querySelectorAll('.class-card.expanded').forEach(otherCard => {
                        if (otherCard !== targetCard) {
                            otherCard.classList.remove('expanded');
                            const otherCloseBtn = otherCard.querySelector('.close-btn');
                            if (otherCloseBtn) {
                                otherCloseBtn.remove();
                            }
                            // Rimuovi il placeholder dell'altra card
                            if (otherCard._placeholder) {
                                otherCard._placeholder.remove();
                                otherCard._placeholder = null;
                            }
                            // Riposiziona le altre card nella loro posizione originale
                            restoreOriginalPosition(otherCard);
                        }
                    });
                    
                    // Apri la card target
                    toggleClassCard(targetCard);
                    
                    // Scorri fino alla card con un offset per il logo fisso
                    const offset = 100; // Offset per il logo fisso
                    const elementPosition = targetCard.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - offset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 500);
        }
    }

    // Controlla se siamo nella pagina classes.html
    const isClassesPage = window.location.pathname.includes('classes.html');
    
    if (isClassesPage) {
        handleHashFromURL();
    }

    // Gestione anche per cambiamenti hash (se l'utente naviga con history)
    window.addEventListener('hashchange', () => {
        if (isClassesPage) {
            handleHashFromURL();
        }
    });

    // Inizializzazione pagina-specifica
    const isIndexPage = window.location.pathname.includes('index.html') || 
                       window.location.pathname.endsWith('/') || 
                       window.location.pathname === '/' ||
                       !window.location.pathname.includes('.html');
    
    if (isIndexPage) {
        const quizSection = document.getElementById('quiz');
        if (quizSection) {
            // Inizializza il quiz quando l'utente scorre fino alla sezione
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !quizStarted) {
                        initQuiz();
                    }
                });
            });
            
            observer.observe(quizSection);
            
            // Fallback: inizializza il quiz dopo un piccolo delay per GitHub Pages
            setTimeout(() => {
                if (!quizStarted) {
                    initQuiz();
                }
            }, 1000);
        }
    }
});

// Rendi le funzioni globali per accessibility
window.selectOption = selectOption;
window.nextQuestion = nextQuestion;
window.previousQuestion = previousQuestion;
window.restartQuiz = restartQuiz;
window.openDisciplineLink = function(disciplineId) {
    // Apre la pagina classes.html e scorre fino alla disciplina specifica
    window.open(`classes.html#${disciplineId}`, '_self');
};
