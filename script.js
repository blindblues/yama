document.addEventListener('DOMContentLoaded', () => {
    const animationContainer = document.querySelector('.animation-container');
    const logoSvg = document.querySelector('.logo-svg');
    const mainContent = document.querySelector('.main-content');
    let animationSkipped = false;
    let timeoutIds = [];
    let animationAccelerated = false;
    
    // Inizializza le animazioni di scrolling text
    function initScrollingText() {
        const scrollingWrappers = document.querySelectorAll('.scrolling-text-wrapper');
        
        scrollingWrappers.forEach(wrapper => {
            // Non clonare più il contenuto dato che ora è già abbondante nell'HTML
            
            // Imposta un'animazione CSS personalizzata per evitare teleportation
            if (wrapper.classList.contains('scrolling-text-secondary')) {
                // STRONG SPIRIT STRONG BODY - movimento da destra a sinistra - MOLTO LENTO
                wrapper.style.animation = 'scrollTextSlowRight 135s linear infinite';
            } else {
                // YAMAKASI FIGHT ACADEMY - movimento da sinistra a destra - MOLTO LENTO
                wrapper.style.animation = 'scrollTextSlow 180s linear infinite';
            }
        });
    }
    
    // Chiama la funzione di inizializzazione
    initScrollingText();
    
    // Impostiamo il colore del logo nell'animazione
    function setLogoColor() {
        // Per l'immagine SVG, usiamo un filtro per cambiare colore
        logoSvg.style.filter = 'brightness(0) saturate(100%) invert(4%) sepia(4%) saturate(3235%) hue-rotate(320deg) brightness(98%) contrast(93%)';
    }
    
    // Funzione per accelerare l'animazione
    function accelerateAnimation() {
        if (animationSkipped || animationAccelerated) return;
        animationAccelerated = true;
        
        // Cancella tutti i timeout esistenti
        timeoutIds.forEach(id => clearTimeout(id));
        timeoutIds = [];
        
        // Esegui l'animazione accelerata
        if (logoSvg) {
            logoSvg.style.transition = 'transform 0.3s cubic-bezier(0.20, 0.55, 0.27, 1.55), opacity 0.2s ease';
            logoSvg.style.opacity = '1';
        }
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
                mainContent.style.opacity = '1';
                // document.body.style.overflow = 'auto'; // Lo scroll è sempre abilitato
                
                // Disabilita i pointer-events per permettere lo scroll
                animationContainer.style.pointerEvents = 'none';
                
                // Aggiungi l'animazione al logo fisso ALL'INIZIO della transizione
                const fixedLogo = document.querySelector('.logo-small');
                if (fixedLogo) {
                    fixedLogo.classList.add('animate-logo');
                }
                
                const timeout3 = setTimeout(() => {
                    if (animationSkipped) return;
                    animationContainer.style.display = 'none';
                    logoSvg.style.willChange = 'auto';
                }, 400);
                timeoutIds.push(timeout3);
            }, 200); // Più rapido
            timeoutIds.push(timeout2);
        }, 300); // Più rapido
        timeoutIds.push(timeout1);
    }
    
    // Event listener per lo scroll durante l'animazione
    mainContent.addEventListener('scroll', () => {
        if (!animationSkipped && !animationAccelerated && mainContent.scrollTop > 50) {
            accelerateAnimation();
        }
    });
    
    // Event listener per la rotella del mouse durante l'animazione
    document.addEventListener('wheel', (e) => {
        if (!animationSkipped && !animationAccelerated && Math.abs(e.deltaY) > 10) {
            accelerateAnimation();
        }
        // Non usiamo preventDefault() per permettere lo scroll
    }, { passive: true });
    
    // Aggiungi questa funzione DOPO la funzione setLogoColor()
    function skipAnimation() {
        if (animationSkipped) return;
        animationSkipped = true;
        
        // Cancella tutti i timeout
        timeoutIds.forEach(id => clearTimeout(id));
        timeoutIds = [];
        
        // Interrompi immediatamente le animazioni
        logoSvg.style.transition = 'none';
        
        // Nascondi subito il contenitore dell'animazione
        animationContainer.style.transition = 'opacity 0.3s ease';
        animationContainer.style.opacity = '0';
        
        // Mostra immediatamente i contenuti
        mainContent.style.transition = 'opacity 0.3s ease';
        mainContent.style.opacity = '1';

        // Aggiungi l'animazione al logo fisso
        const fixedLogo = document.querySelector('.logo-small');
        const menuArrow = document.querySelector('.menu-arrow');
        if (fixedLogo) {
            fixedLogo.classList.add('animate-logo');
        }
        if (menuArrow) {
            menuArrow.classList.add('drop-arrow');
        }
        
        // Disabilita i pointer-events per permettere lo scroll
        animationContainer.style.pointerEvents = 'none';
        
        // Lo scroll è sempre abilitato
        
        // Mostra immediatamente gli elementi animate-up
        const animateElements = document.querySelectorAll('.animate-up');
        animateElements.forEach(element => {
            element.classList.add('visible');
        });
        
        // Rimuovi il contenitore dopo un breve delay
        setTimeout(() => {
            animationContainer.style.display = 'none';
        }, 300);
    }

    // Aggiungi questa riga PRIMA di chiamare startAnimation()
    if (animationContainer) {
        animationContainer.addEventListener('click', (e) => {
            e.preventDefault();
            skipAnimation();
        });
    }

    // Sequenza di animazioni
    const startAnimation = () => {
        if (animationSkipped) return;
        logoSvg.style.transition = 'transform 1s cubic-bezier(0.20, 0.55, 0.27, 1.55), opacity 0.5s ease';
        logoSvg.style.opacity = '1';
        logoSvg.style.transform = 'rotateY(0deg)';
        
        const timeout1 = setTimeout(() => {
            // Aggiungi questo controllo
            if (animationSkipped) return;
            // Usa transform in 3D con GPU acceleration
            logoSvg.style.transition = 'none';
            void logoSvg.offsetWidth;
            
            // Ottimizzazione: usa translateZ per forzare hardware acceleration
            logoSvg.style.willChange = 'transform';
            logoSvg.style.transform = 'rotateY(0deg) translateZ(0) scale(235)';
            logoSvg.style.transition = 'transform 0.5s cubic-bezier(0.5, 2, 0.9, 1)';
            
            animationContainer.style.transition = 'background-color 0.5s ease';
            animationContainer.style.backgroundColor = '#0a0a0a';
            
            const timeout2 = setTimeout(() => {
                // Aggiungi questo controllo
                animationContainer.style.transition = 'opacity 0.3s ease-out';
                animationContainer.style.opacity = '0';
                mainContent.style.opacity = '1';
                // document.body.style.overflow = 'auto'; // Lo scroll è sempre abilitato
                
                // Disabilita immediatamente i pointer-events per permettere lo scroll
                animationContainer.style.pointerEvents = 'none';
                
                // Aggiungi l'animazione al logo fisso ALL'INIZIO della transizione
                const fixedLogo = document.querySelector('.logo-small');
                if (fixedLogo) {
                    fixedLogo.classList.add('animate-logo');
                }
                
                // Animazione elementi con classe animate-up
                const animateElements = document.querySelectorAll('.animate-up');
                animateElements.forEach((element, index) => {
                    setTimeout(() => {
                        element.classList.add('visible');
                    }, index * 100);
                });
                
                const timeout3 = setTimeout(() => {
                    // Aggiungi questo controllo
                    if (animationSkipped) return;
                    animationContainer.style.display = 'none';
                    // Rimuovi willChange dopo l'animazione
                    logoSvg.style.willChange = 'auto';
                }, 1000);
                timeoutIds.push(timeout3);
            }, 500);
            timeoutIds.push(timeout2);
        }, 1500);
        timeoutIds.push(timeout1);
    };
    
    // Non bloccare lo scroll durante l'animazione
    // document.body.style.overflow = 'hidden';
    
    // Attendi che l'immagine del logo sia caricata
    logoSvg.addEventListener('load', () => {
        const timeout4 = setTimeout(startAnimation, 300);
        timeoutIds.push(timeout4);
    });
    
    // Fallback se l'immagine è già caricata
    if (logoSvg.complete) {
        const timeout5 = setTimeout(startAnimation, 300);
        timeoutIds.push(timeout5);
    }
    
    // Gestione scroll per effetti aggiuntivi
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.glass-header');
        const scrollY = window.scrollY;
        
        // Effetto di trasparenza sull'header durante lo scroll
        if (scrollY > 50) {
            header.style.backgroundColor = 'rgba(10, 10, 10, 0.9)';
        } else {
            header.style.backgroundColor = 'rgba(10, 10, 10, 0.7)';
        }
    });
    
    // Smooth scroll per i link di navigazione
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Assicuriamoci che il logo nel footer sia colorato correttamente
    const footerLogo = document.querySelector('.footer-logo');
    if (footerLogo) {
        footerLogo.addEventListener('load', () => {
            // Il filtro CSS già applicato colorerà il logo correttamente
        });
    }
});

// Effetto Parallasse Header con fluttuazione
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxHeader = document.querySelector('.parallax-header');
    const parallaxBack = document.querySelector('.parallax-back');
    const parallaxFront = document.querySelector('.parallax-front');
    const parallaxTop = document.querySelector('.parallax-top');
    
    if (parallaxHeader && parallaxBack && parallaxFront && parallaxTop) {
        const headerTop = parallaxHeader.offsetTop;
        const headerHeight = parallaxHeader.offsetHeight;
        const windowHeight = window.innerHeight;
        
        // Applica l'effetto parallasse solo quando il header è visibile
        if (scrolled < headerTop + headerHeight) {
            // Calcola la velocità di parallasse a 3 livelli
            // headergiallo (back) si muove più velocemente sotto
            // headerfoto (front) si muove più lentamente sopra
            // headerpart (top) si muove ancora più lentamente in cima
            const speedBack = 0.8;  // headergiallo più veloce (sotto)
            const speedFront = 0.3;  // headerfoto più lento (sopra)
            const speedTop = 0.1;   // headerpart lentissimo (in cima)
            
            // Calcola le posizioni di fluttuazione base
            const time = Date.now() / 1000;
            const floatBackX = Math.sin(time / 4) * 10;
            const floatBackY = Math.sin(time / 3) * 15;
            const floatFrontX = Math.cos(time / 3.5) * 8;
            const floatFrontY = Math.cos(time / 2.5) * 10;
            const floatTopX = Math.sin(time / 5) * 4;
            const floatTopY = Math.cos(time / 4) * 3;
            
            // Combina fluttuazione e parallasse
            parallaxBack.style.transform = `translateY(${scrolled * speedBack + floatBackY}px) translateX(${floatBackX}px)`;
            parallaxFront.style.transform = `translateY(${scrolled * speedFront + floatFrontY}px) translateX(${floatFrontX}px)`;
            parallaxTop.style.transform = `translateY(${scrolled * speedTop + floatTopY}px) translateX(${floatTopX}px)`;
        }
    }
});

// Funzione per aprire WhatsApp con messaggio pre-compilato
window.openWhatsAppChat = function() {
    const phoneNumber = '+393516003684'; // Numero di telefono senza spazi o simboli
    const message = encodeURIComponent(
        'Ciao! Vorrei prenotare una lezione di prova alla Yamakasi Fight Academy.\n\n' +
        'Nome: [Inserisci il tuo nome]\n' +
        'Disciplina che voglio provare: [Inserisci la disciplina]\n' +
        'Giorno preferito: [Inserisci il giorno]\n\n' +
        'Potete darmi maggiori informazioni? Grazie!'
    );
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
};