// Funzioni per la gestione delle class-card copiate da about.html

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

// Funzione per espandere/collassare le card dei corsi
function toggleClassCard(card) {
    const isExpanded = card.classList.contains('expanded');
    let overlay = document.querySelector('.class-overlay');
    
    if (isExpanded) {
        // Chiudi la card
        card.classList.remove('expanded');
        
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
            overlay.removeEventListener('click', overlayClickHandler);
        });
    }
}

// Inizializza tutto quando il DOM è caricato
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM caricato - inizializzo le class-card');
    
    // Forza visibilità immediata del contenuto
    const classCard = document.querySelector('.class-card');
    if (classCard) {
        classCard.style.opacity = '1';
        classCard.style.visibility = 'visible';
    }
    
    // Forza visibilità delle discipline
    const classDisciplines = document.querySelectorAll('.class-discipline');
    classDisciplines.forEach(function(element) {
        element.style.display = 'block';
        element.style.opacity = '1';
        element.style.visibility = 'visible';
        element.style.color = '#efefef';
    });
    
    // Pulisci eventuali card residue nel body all'avvio
    cleanupResidualCards();
    
    // Salva le posizioni originali delle card
    saveOriginalPositions();
    
    // Aggiungi event listener per le card dei corsi
    document.querySelectorAll('.class-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Non espandere se si clicca su un link o bottone dentro la card
            if (!e.target.closest('a') && !e.target.closest('button')) {
                toggleClassCard(card);
            }
        });
    });
    
    // Avvia animazioni comuni per tutte le pagine
    observeAnimations();
    
    console.log('Class-card inizializzate:', document.querySelectorAll('.class-card').length);
});

// Backup: esegui anche subito se il DOM è già caricato
if (document.readyState !== 'loading') {
    const classCard = document.querySelector('.class-card');
    if (classCard) {
        classCard.style.opacity = '1';
        classCard.style.visibility = 'visible';
    }
    
    const classDisciplines = document.querySelectorAll('.class-discipline');
    classDisciplines.forEach(function(element) {
        element.style.display = 'block';
        element.style.opacity = '1';
        element.style.visibility = 'visible';
        element.style.color = '#efefef';
    });
}

// Rendi la funzione globale per testing
window.toggleClassCard = toggleClassCard;

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