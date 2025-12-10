// Event listener globale per chiudere il menu cliccando fuori
(function() {
    // Attendi che il DOM sia completamente caricato
    function initMenuClickOutside() {
        const dropdownMenu = document.getElementById('dropdownMenu');
        
        if (!dropdownMenu) {
            console.log('Menu non trovato, ritento in 100ms...');
            setTimeout(initMenuClickOutside, 100);
            return;
        }
        
        console.log('Menu trovato, aggiungo event listener...');
        
        document.addEventListener('click', (e) => {
            // Verifica se il menu è aperto
            if (dropdownMenu.classList.contains('active')) {
                console.log('Menu aperto, click su:', e.target);
                
                // Controlla se il click è su un menu-item o su un elemento dentro un menu-item
                const clickedMenuItem = e.target.closest('.menu-item');
                const isClickOnLogo = e.target.closest('.fixed-logo');
                const isClickOnMenuArrow = e.target.closest('.menu-arrow');
                
                console.log('Check:', {
                    menuItem: !!clickedMenuItem,
                    logo: !!isClickOnLogo,
                    arrow: !!isClickOnMenuArrow
                });
                
                // Chiudi il menu solo se il click non è su un menu-item, logo o freccia
                if (!clickedMenuItem && !isClickOnLogo && !isClickOnMenuArrow) {
                    console.log('Chiudo il menu');
                    
                    // Usa la funzione toggleMenu globale se esiste
                    if (window.toggleMenu && typeof window.toggleMenu === 'function') {
                        window.toggleMenu();
                    } else {
                        console.log('toggleMenu non disponibile, uso fallback');
                        // Fallback: chiudi il menu direttamente
                        dropdownMenu.classList.remove('active');
                        const fixedLogo = document.querySelector('.fixed-logo');
                        if (fixedLogo) {
                            fixedLogo.classList.remove('menu-open');
                            // Ripristina lo stato scroll
                            if (window.handleLogoScroll && typeof window.handleLogoScroll === 'function') {
                                window.handleLogoScroll();
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Inizializza quando il DOM è pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMenuClickOutside);
    } else {
        initMenuClickOutside();
    }
})();
