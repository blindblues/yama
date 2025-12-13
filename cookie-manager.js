/**
 * Cookie Manager - Sistema di gestione cookie conforme al GDPR
 * Per Yamakasi Fight Academy
 */

class CookieManager {
    constructor() {
        // Pattern singleton - previene multiple istanze
        if (window.CookieManagerInstance) {
            console.log('Cookie manager - instance already exists, returning existing instance');
            return window.CookieManagerInstance;
        }
        
        console.log('Cookie manager - creating new instance');
        window.CookieManagerInstance = this;
        
        this.consentCookieName = 'yamakasi_cookie_consent';
        this.preferencesCookieName = 'yamakasi_cookie_preferences';
        this.consent = this.loadConsent();
        this.preferences = this.loadPreferences();
        this.isInitialized = false;
        
        // Forza la rimozione di eventuali banner esistenti all'avvio
        this.forceCleanupExistingBanners();
        
        this.init();
    }

    /**
     * Forza la rimozione di tutti i banner dei cookie esistenti
     */
    forceCleanupExistingBanners() {
        console.log('Cookie manager - force cleanup: removing all existing cookie banners');
        
        // Rimuovi tutti i possibili banner dei cookie
        const selectors = [
            '#cookieBanner',
            '.cookie-banner',
            '[id*="cookie"]',
            '[class*="cookie-banner"]',
            '[class*="cookie-banner"]'
        ];
        
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                console.log('Cookie manager - force cleanup: removing element:', selector);
                element.remove();
            });
        });
        
        // Rimuovi anche i modal
        const modalSelectors = [
            '#cookieModal',
            '.cookie-modal',
            '[id*="cookieModal"]',
            '[class*="cookie-modal"]'
        ];
        
        modalSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                console.log('Cookie manager - force cleanup: removing modal:', selector);
                element.remove();
            });
        });
    }

    init() {
        // Inizializza il sistema solo dopo il caricamento del DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupCookieSystem());
        } else {
            this.setupCookieSystem();
        }
    }

    /**
     * Pulisce banner esistenti se il consenso è già stato dato
     */
    cleanupExistingBanner() {
        const existingBanner = document.getElementById('cookieBanner');
        const existingModal = document.getElementById('cookieModal');
        
        console.log('Cookie manager - cleanup: checking existing elements');
        console.log('Cookie manager - cleanup: current consent:', this.consent);
        
        // Se esiste un banner e il consenso è già stato dato, rimuovilo
        if (existingBanner && this.consent) {
            console.log('Cookie manager - cleanup: removing existing banner due to existing consent');
            existingBanner.remove();
        }
        
        // Rimuovi sempre il modal se esiste (verrà ricreato se necessario)
        if (existingModal) {
            console.log('Cookie manager - cleanup: removing existing modal');
            existingModal.remove();
        }
    }

    /**
     * Setup del sistema di cookie
     */
    setupCookieSystem() {
        // Previeni inizializzazioni multiple
        if (this.isInitialized) {
            console.log('Cookie manager - already initialized, skipping setup');
            return;
        }
        
        console.log('Cookie manager - setting up cookie system');
        this.isInitialized = true;
        
        // VERIFICA IMMEDIATA DEL CONSENSO PRIMA DI QUALSIASI AZIONE
        if (this.consent) {
            console.log('Cookie manager - consent exists, skipping banner creation entirely');
            this.applyPreferences();
            return;
        }
        
        // Prima di tutto, controlla se esiste già un banner e rimuovilo se il consenso è già stato dato
        this.cleanupExistingBanner();
        
        // Verifica se il banner esiste già per evitare duplicazioni
        if (document.getElementById('cookieBanner')) {
            console.log('Cookie manager - banner already exists after cleanup, skipping setup');
            return;
        }
        
        // Inietta il HTML del banner e del modal SOLO SE NON C'È CONSENSO
        this.injectCookieHTML();
        
        // Setup degli event listeners PRIMA di mostrare il banner
        this.setupEventListeners();
        
        // Aspetta che l'animazione iniziale sia completata prima di mostrare il banner
        this.waitForAnimationAndShowBanner();
        
        // Aggiungi un observer per rimuovere banner che potrebbero essere aggiunti dinamicamente
        this.setupBannerObserver();
    }

    /**
     * Imposta un observer per rimuovere banner aggiunti dinamicamente
     */
    setupBannerObserver() {
        // Crea un MutationObserver per monitorare l'aggiunta di nuovi banner
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Controlla se il nodo aggiunto è un banner dei cookie
                            if (node.id === 'cookieBanner' || 
                                node.classList?.contains('cookie-banner') ||
                                node.querySelector?.('#cookieBanner') ||
                                node.querySelector?.('.cookie-banner')) {
                                
                                console.log('Cookie manager - detected new cookie banner being added dynamically');
                                
                                // Se il consenso esiste, rimuovi immediatamente il banner
                                if (this.consent) {
                                    console.log('Cookie manager - removing dynamically added banner due to existing consent');
                                    node.remove();
                                }
                            }
                        }
                    });
                }
            });
        });
        
        // Inizia ad osservare il body per nuove aggiunte
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Salva l'observer per poterlo disconnettere se necessario
        this.bannerObserver = observer;
    }

    /**
     * Aspetta che l'animazione iniziale sia completata prima di mostrare il banner
     */
    waitForAnimationAndShowBanner() {
        const animationContainer = document.querySelector('.animation-container');
        const mainContent = document.querySelector('.main-content');
        
        // Se l'animazione non esiste o è già completata, mostra il banner
        if (!animationContainer) {
            console.log('Cookie manager - no animation container found, showing banner immediately');
            this.showBannerIfNecessary();
            return;
        }
        
        // Se l'animazione è già nascosta, mostra il banner
        if (animationContainer.style.display === 'none') {
            console.log('Cookie manager - animation already hidden, showing banner');
            this.showBannerIfNecessary();
            return;
        }
        
        console.log('Cookie manager - animation detected, waiting for it to complete');
        
        // Crea un MutationObserver per monitorare quando l'animazione viene nascosta
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    // Controlla se l'animazione è stata nascosta o il display è none
                    if (animationContainer.style.display === 'none' || 
                        animationContainer.style.opacity === '0') {
                        console.log('Cookie manager - animation completed, showing banner');
                        this.showBannerIfNecessary();
                        observer.disconnect();
                    }
                }
            });
        });
        
        // Inizia ad osservare l'animation container
        observer.observe(animationContainer, { attributes: true, attributeFilter: ['style'] });
        
        // Fallback: se dopo 5 secondi non è successo nulla, mostra comunque il banner
        setTimeout(() => {
            console.log('Cookie manager - animation timeout fallback, showing banner');
            this.showBannerIfNecessary();
            observer.disconnect();
        }, 5000);
    }

    /**
     * Mostra il banner solo se non c'è consenso
     */
    showBannerIfNecessary() {
        console.log('Cookie manager - checking if banner should show. Consent:', this.consent);
        
        // FORZA: Se il consenso esiste, nascondi immediatamente qualsiasi banner e ESCI
        if (this.consent) {
            console.log('Cookie manager - CONSENT EXISTS, force hiding all banners and exiting');
            this.forceCleanupExistingBanners();
            this.hideCookieBanner();
            this.applyPreferences();
            return;
        }
        
        // Controlla anche se esistono le preferenze come fallback
        const hasPreferences = this.getCookie(this.preferencesCookieName);
        console.log('Cookie manager - checking preferences cookie:', hasPreferences);
        
        // Se non c'è consenso ma esistono preferenze, prova a recuperare il consenso
        if (!this.consent && hasPreferences) {
            console.log('Cookie manager - preferences exist but no consent, attempting recovery');
            try {
                const prefs = JSON.parse(hasPreferences);
                if (prefs && prefs.timestamp) {
                    // Ricostruisci il consenso dalle preferenze esistenti
                    this.consent = {
                        given: true,
                        timestamp: prefs.timestamp,
                        preferences: prefs
                    };
                    console.log('Cookie manager - consent recovered from preferences, hiding banners');
                    this.forceCleanupExistingBanners();
                    this.hideCookieBanner();
                    this.applyPreferences();
                    return;
                }
            } catch (e) {
                console.error('Cookie manager - error recovering consent:', e);
            }
        }
        
        // VERIFICA FINALE: Se dopo tutti i controlli il consenso esiste, non mostrare il banner
        if (this.consent) {
            console.log('Cookie manager - FINAL CHECK: consent exists, not showing banner');
            return;
        }
        
        // Solo se non c'è assolutamente nessun consenso, mostra il banner
        console.log('Cookie manager - no consent found, showing banner');
        this.showCookieBanner();
    }

    /**
     * Carica il consenso salvato nei cookie
     */
    loadConsent() {
        const consentCookie = this.getCookie(this.consentCookieName);
        console.log('Cookie manager - checking consent cookie:', consentCookie);
        
        if (consentCookie) {
            try {
                const consentData = JSON.parse(consentCookie);
                console.log('Cookie manager - parsed consent data:', consentData);
                // Verifica che il consenso sia stato dato correttamente
                // Controlla sia la proprietà 'given' che esista un timestamp valido
                if (consentData && 
                    (consentData.given === true || consentData.timestamp) && 
                    consentData.preferences) {
                    return consentData;
                } else {
                    return null;
                }
            } catch (e) {
                console.error('Cookie manager - error parsing consent:', e);
                return null;
            }
        }
        console.log('Cookie manager - no consent cookie found');
        return null;
    }

    /**
     * Carica le preferenze salvate nei cookie
     */
    loadPreferences() {
        const prefsCookie = this.getCookie(this.preferencesCookieName);
        if (prefsCookie) {
            try {
                return JSON.parse(prefsCookie);
            } catch (e) {
                return this.getDefaultPreferences();
            }
        }
        return this.getDefaultPreferences();
    }

    /**
     * Restituisce le preferenze di default
     */
    getDefaultPreferences() {
        return {
            necessary: true,
            analytics: false,
            profiling: false,
            timestamp: null
        };
    }

    /**
     * Inietta il HTML del banner cookie
     */
    injectCookieHTML() {
        // Verifica se il banner esiste già per evitare duplicazioni
        if (document.getElementById('cookieBanner')) {
            console.log('Cookie manager - banner already exists, skipping HTML injection');
            return;
        }
        
        console.log('Cookie manager - injecting banner HTML');
        const cookieHTML = `
            <!-- Cookie Banner GDPR -->
            <div id="cookieBanner" class="cookie-banner" style="display: none;">
                <div class="cookie-banner-wrapper">
                    <div class="cookie-banner-content">
                        <div class="cookie-banner-text">
                            <h3>Li vuoi i Cookie?</h3>
                            <p>
                                Questo sito utilizza cookie tecnici per garantire il corretto funzionamento e migliorare la tua esperienza di navigazione. 
                                Utilizziamo anche cookie di terze parti per analisi e profilazione. 
                                Cliccando su "Accetta tutti" acconsenti all'uso di tutti i cookie. 
                                Puoi gestire le tue preferenze o rifiutare i cookie non necessari.
                            </p>
                            <div class="cookie-links">
                                <a href="privacy.html" class="cookie-link">Leggi Privacy & Cookie Policy</a>
                            </div>
                        </div>
                        
                        <div class="cookie-buttons">
                            <button id="acceptAll" class="cookie-btn cookie-btn-accept">Accetta tutti</button>
                            <button id="acceptNecessary" class="cookie-btn cookie-btn-necessary">Solo necessari</button>
                            <button id="customize" class="cookie-btn cookie-btn-customize">Personalizza</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cookie Settings Modal -->
            <div id="cookieModal" class="cookie-modal" style="display: none;">
                <div class="cookie-modal-content">
                    <div class="cookie-modal-header">
                        <h2>Impostazioni Cookie</h2>
                        <button id="closeModal" class="cookie-modal-close">&times;</button>
                    </div>
                    
                    <div class="cookie-modal-body">
                        <div class="cookie-category">
                            <div class="cookie-category-header">
                                <div class="cookie-category-info">
                                    <h4>Cookie Tecnici (Necessari)</h4>
                                    <p>Essenziali per il funzionamento del sito. Non possono essere disabilitati.</p>
                                </div>
                                <label class="cookie-switch">
                                    <input type="checkbox" id="necessaryCookies" checked disabled>
                                    <span class="cookie-slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="cookie-category">
                            <div class="cookie-category-header">
                                <div class="cookie-category-info">
                                    <h4>Cookie Analitici</h4>
                                    <p>Ci aiutano a capire come gli utenti utilizzano il sito, raccogliendo dati anonimi.</p>
                                </div>
                                <label class="cookie-switch">
                                    <input type="checkbox" id="analyticsCookies">
                                    <span class="cookie-slider"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="cookie-category">
                            <div class="cookie-category-header">
                                <div class="cookie-category-info">
                                    <h4>Cookie di Profilazione</h4>
                                    <p>Utilizzati per personalizzare contenuti e pubblicità in base ai tuoi interessi.</p>
                                </div>
                                <label class="cookie-switch">
                                    <input type="checkbox" id="profilingCookies">
                                    <span class="cookie-slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="cookie-modal-footer">
                        <button id="savePreferences" class="cookie-btn cookie-btn-accept">Salva preferenze</button>
                        <button id="acceptAllFromModal" class="cookie-btn cookie-btn-accept">Accetta tutti</button>
                        <button id="rejectAllFromModal" class="cookie-btn cookie-btn-necessary">Rifiuta tutti</button>
                    </div>
                </div>
            </div>
        `;

        // Inietta nel body
        document.body.insertAdjacentHTML('beforeend', cookieHTML);
    }

    /**
     * Setup degli event listeners
     */
    setupEventListeners() {
        // Banner buttons
        const acceptAllBtn = document.getElementById('acceptAll');
        const acceptNecessaryBtn = document.getElementById('acceptNecessary');
        const customizeBtn = document.getElementById('customize');

        if (acceptAllBtn) {
            acceptAllBtn.addEventListener('click', () => this.acceptAllCookies());
        }

        if (acceptNecessaryBtn) {
            acceptNecessaryBtn.addEventListener('click', () => this.acceptOnlyNecessary());
        }

        if (customizeBtn) {
            customizeBtn.addEventListener('click', () => this.showCookieModal());
        }

        // Modal buttons
        const closeModalBtn = document.getElementById('closeModal');
        const savePreferencesBtn = document.getElementById('savePreferences');
        const acceptAllFromModalBtn = document.getElementById('acceptAllFromModal');
        const rejectAllFromModalBtn = document.getElementById('rejectAllFromModal');

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.hideCookieModal());
        }

        if (savePreferencesBtn) {
            savePreferencesBtn.addEventListener('click', () => this.saveCustomPreferences());
        }

        if (acceptAllFromModalBtn) {
            acceptAllFromModalBtn.addEventListener('click', () => this.acceptAllCookies());
        }

        if (rejectAllFromModalBtn) {
            rejectAllFromModalBtn.addEventListener('click', () => this.acceptOnlyNecessary());
        }

        // Chiudi il modal cliccando fuori
        const modal = document.getElementById('cookieModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideCookieModal();
                }
            });
        }

        // ESC per chiudere il modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideCookieModal();
            }
        });
    }

    /**
     * Mostra il banner cookie
     */
    showCookieBanner() {
        // Controllo di sicurezza: non mostrare se il consenso esiste
        if (this.consent) {
            console.log('Cookie manager - showCookieBanner called but consent exists, not showing');
            return;
        }
        
        const banner = document.getElementById('cookieBanner');
        if (banner) {
            banner.style.display = 'block';
            // Animazione di entrata
            setTimeout(() => {
                banner.classList.add('show');
            }, 100);
        }
    }

    /**
     * Nasconde il banner cookie
     */
    hideCookieBanner() {
        const banner = document.getElementById('cookieBanner');
        if (banner) {
            banner.classList.remove('show');
            setTimeout(() => {
                banner.style.display = 'none';
            }, 400);
        }
    }

    /**
     * Mostra il modal delle preferenze
     */
    showCookieModal() {
        const modal = document.getElementById('cookieModal');
        if (modal) {
            modal.style.display = 'flex';
            // Carica le preferenze attuali nel modal
            this.loadPreferencesIntoModal();
            // Animazione di entrata
            setTimeout(() => {
                modal.style.opacity = '1';
            }, 10);
        }
    }

    /**
     * Nasconde il modal delle preferenze
     */
    hideCookieModal() {
        const modal = document.getElementById('cookieModal');
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }

    /**
     * Carica le preferenze nel modal
     */
    loadPreferencesIntoModal() {
        const analyticsCheckbox = document.getElementById('analyticsCookies');
        const profilingCheckbox = document.getElementById('profilingCookies');

        if (analyticsCheckbox) {
            analyticsCheckbox.checked = this.preferences.analytics;
        }

        if (profilingCheckbox) {
            profilingCheckbox.checked = this.preferences.profiling;
        }
    }

    /**
     * Accetta tutti i cookie
     */
    acceptAllCookies() {
        this.preferences = {
            necessary: true,
            analytics: true,
            profiling: true,
            timestamp: new Date().toISOString()
        };

        this.saveConsent();
        this.hideCookieBanner();
        this.hideCookieModal();
        this.applyPreferences();
        this.loadGoogleAnalytics();
        this.loadSocialMediaCookies();
    }

    /**
     * Accetta solo i cookie necessari
     */
    acceptOnlyNecessary() {
        this.preferences = {
            necessary: true,
            analytics: false,
            profiling: false,
            timestamp: new Date().toISOString()
        };

        this.saveConsent();
        this.hideCookieBanner();
        this.hideCookieModal();
        this.applyPreferences();
    }

    /**
     * Salva le preferenze personalizzate
     */
    saveCustomPreferences() {
        const analyticsCheckbox = document.getElementById('analyticsCookies');
        const profilingCheckbox = document.getElementById('profilingCookies');

        this.preferences = {
            necessary: true,
            analytics: analyticsCheckbox ? analyticsCheckbox.checked : false,
            profiling: profilingCheckbox ? profilingCheckbox.checked : false,
            timestamp: new Date().toISOString()
        };

        this.saveConsent();
        this.hideCookieBanner();
        this.hideCookieModal();
        this.applyPreferences();

        if (this.preferences.analytics) {
            this.loadGoogleAnalytics();
        }

        if (this.preferences.profiling) {
            this.loadSocialMediaCookies();
        }
    }

    /**
     * Salva il consenso nei cookie
     */
    saveConsent() {
        const consentData = {
            given: true,
            timestamp: new Date().toISOString(),
            preferences: this.preferences
        };

        // Salva il consenso (dura 1 anno)
        this.setCookie(this.consentCookieName, JSON.stringify(consentData), 365);

        // Salva le preferenze (durano 6 mesi)
        this.setCookie(this.preferencesCookieName, JSON.stringify(this.preferences), 180);
    }

    /**
     * Applica le preferenze dei cookie
     */
    applyPreferences() {
        // I cookie tecnici sono sempre attivi
        console.log('Cookie tecnici attivi');

        // Cookie analitici
        if (this.preferences.analytics) {
            console.log('Cookie analitici attivi');
        } else {
            console.log('Cookie analitici disabilitati');
            this.removeGoogleAnalytics();
        }

        // Cookie di profilazione
        if (this.preferences.profiling) {
            console.log('Cookie di profilazione attivi');
        } else {
            console.log('Cookie di profilazione disabilitati');
            this.removeSocialMediaCookies();
        }
    }

    /**
     * Carica Google Analytics se consentito
     */
    loadGoogleAnalytics() {
        if (this.preferences.analytics && !document.getElementById('ga-script')) {
            // Google Analytics 4
            const script = document.createElement('script');
            script.id = 'ga-script';
            script.async = true;
            script.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX'; // Sostituire con ID reale
            document.head.appendChild(script);

            // Inizializzazione GA4
            const configScript = document.createElement('script');
            configScript.id = 'ga-config';
            configScript.innerHTML = `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-XXXXXXXXXX', {
                    'anonymize_ip': true,
                    'cookie_domain': 'auto'
                });
            `;
            document.head.appendChild(configScript);
        }
    }

    /**
     * Rimuove Google Analytics
     */
    removeGoogleAnalytics() {
        const gaScript = document.getElementById('ga-script');
        const gaConfig = document.getElementById('ga-config');

        if (gaScript) gaScript.remove();
        if (gaConfig) gaConfig.remove();

        // Rimuovi anche i cookie di GA
        this.deleteCookie('_ga');
        this.deleteCookie('_gid');
        this.deleteCookie('_gat');
    }

    /**
     * Carica i cookie dei social media se consentito
     */
    loadSocialMediaCookies() {
        if (this.preferences.profiling) {
            // Qui puoi aggiungere pixel di Facebook, Instagram, etc.
            console.log('Social media cookies loaded');
        }
    }

    /**
     * Rimuove i cookie dei social media
     */
    removeSocialMediaCookies() {
        // Rimuovi pixel e cookie di social media
        console.log('Social media cookies removed');
    }

    /**
     * Imposta un cookie
     */
    setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        
        // Encode del valore per gestire caratteri speciali nel JSON
        const encodedValue = encodeURIComponent(value);
        
        // Verifica se siamo in locale (file://) - in questo caso usa localStorage come fallback
        const isLocalFile = window.location.protocol === 'file:';
        
        if (isLocalFile) {
            console.log('Cookie manager - detected local file:// protocol, using localStorage fallback');
            // Usa localStorage come fallback per ambiente locale
            const storageKey = `cookie_${name}`;
            const cookieData = {
                value: encodedValue,
                expires: date.toISOString(),
                path: '/'
            };
            localStorage.setItem(storageKey, JSON.stringify(cookieData));
            console.log('Cookie manager - saved to localStorage:', storageKey);
            
            // Verifica che sia stato salvato
            const testValue = this.getCookie(name);
            console.log('Cookie manager - verification - localStorage set successfully:', !!testValue);
            console.log('Cookie manager - cookie value after setting:', testValue);
            return;
        }
        
        // Per server web, usa i cookie normali
        const cookieString = name + "=" + encodedValue + ";" + expires + ";path=/;SameSite=Lax";
        console.log('Cookie manager - setting cookie:', cookieString);
        document.cookie = cookieString;
        
        // Verifica che il cookie sia stato impostato correttamente
        const testValue = this.getCookie(name);
        console.log('Cookie manager - verification - cookie set successfully:', !!testValue);
        console.log('Cookie manager - cookie value after setting:', testValue);
    }

    /**
     * Ottiene un cookie
     */
    getCookie(name) {
        // Verifica se siamo in locale (file://) - in questo caso usa localStorage come fallback
        const isLocalFile = window.location.protocol === 'file:';
        
        if (isLocalFile) {
            console.log('Cookie manager - detected local file:// protocol, reading from localStorage');
            // Usa localStorage come fallback per ambiente locale
            const storageKey = `cookie_${name}`;
            const storedData = localStorage.getItem(storageKey);
            
            if (storedData) {
                try {
                    const cookieData = JSON.parse(storedData);
                    const now = new Date();
                    const expires = new Date(cookieData.expires);
                    
                    // Verifica se il cookie è scaduto
                    if (now > expires) {
                        console.log('Cookie manager - localStorage cookie expired, removing:', storageKey);
                        localStorage.removeItem(storageKey);
                        return null;
                    }
                    
                    const decodedValue = decodeURIComponent(cookieData.value);
                    console.log('Cookie manager - found localStorage cookie:', name, '=', decodedValue);
                    return decodedValue;
                } catch (e) {
                    console.error('Cookie manager - error parsing localStorage cookie:', e);
                    localStorage.removeItem(storageKey);
                    return null;
                }
            } else {
                console.log('Cookie manager - localStorage cookie not found:', name);
                return null;
            }
        }
        
        // Per server web, usa i cookie normali
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        console.log('Cookie manager - all cookies:', document.cookie);
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                const value = c.substring(nameEQ.length, c.length);
                // Decode del valore per gestire caratteri speciali nel JSON
                const decodedValue = decodeURIComponent(value);
                console.log('Cookie manager - found cookie:', name, '=', decodedValue);
                return decodedValue;
            }
        }
        console.log('Cookie manager - cookie not found:', name);
        return null;
    }

    /**
     * Elimina un cookie
     */
    deleteCookie(name) {
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
    }

    /**
     * Verifica se un tipo di cookie è consentito
     */
    hasConsent(type) {
        return this.preferences && this.preferences[type] === true;
    }

    /**
     * Resetta il consenso (per testing)
     */
    resetConsent() {
        this.deleteCookie(this.consentCookieName);
        this.deleteCookie(this.preferencesCookieName);
        this.consent = null;
        this.preferences = this.getDefaultPreferences();
        this.showCookieBanner();
    }

    /**
     * Forza la verifica dello stato attuale dei cookie (debug)
     */
    debugCookieState() {
        console.log('=== COOKIE MANAGER DEBUG ===');
        console.log('Consent cookie:', this.getCookie(this.consentCookieName));
        console.log('Preferences cookie:', this.getCookie(this.preferencesCookieName));
        console.log('Current consent:', this.consent);
        console.log('Current preferences:', this.preferences);
        console.log('All cookies:', document.cookie);
        console.log('==========================');
    }
}

// Inizializza il Cookie Manager usando pattern singleton
if (!window.CookieManagerInstance) {
    console.log('Cookie manager - creating global instance');
    window.CookieManager = new CookieManager();
} else {
    console.log('Cookie manager - global instance already exists');
    window.CookieManager = window.CookieManagerInstance;
}
