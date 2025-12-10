/**
 * Cookie Manager - Sistema di gestione cookie conforme al GDPR
 * Per Yamakasi Fight Academy
 */

class CookieManager {
    constructor() {
        this.consentCookieName = 'yamakasi_cookie_consent';
        this.preferencesCookieName = 'yamakasi_cookie_preferences';
        this.consent = this.loadConsent();
        this.preferences = this.loadPreferences();
        this.init();
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
     * Setup del sistema di cookie
     */
    setupCookieSystem() {
        // Inietta il HTML del banner e del modal
        this.injectCookieHTML();
        
        // Aspetta che l'animazione iniziale sia completata prima di mostrare il banner
        this.waitForAnimationAndShowBanner();
        
        // Setup degli event listeners
        this.setupEventListeners();
    }

    /**
     * Aspetta che l'animazione iniziale sia completata prima di mostrare il banner
     */
    waitForAnimationAndShowBanner() {
        const animationContainer = document.querySelector('.animation-container');
        const mainContent = document.querySelector('.main-content');
        
        // Se l'animazione non esiste o è già completata, mostra il banner
        if (!animationContainer || animationContainer.style.display === 'none') {
            this.showBannerIfNecessary();
            return;
        }
        
        // Crea un MutationObserver per monitorare quando l'animazione viene nascosta
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    // Controlla se l'animazione è stata nascosta o il display è none
                    if (animationContainer.style.display === 'none' || 
                        animationContainer.style.opacity === '0') {
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
            this.showBannerIfNecessary();
            observer.disconnect();
        }, 5000);
    }

    /**
     * Mostra il banner solo se non c'è consenso
     */
    showBannerIfNecessary() {
        // Se non c'è consenso, mostra il banner
        if (!this.consent) {
            this.showCookieBanner();
        } else {
            // Applica le preferenze esistenti
            this.applyPreferences();
        }
    }

    /**
     * Carica il consenso salvato nei cookie
     */
    loadConsent() {
        const consentCookie = this.getCookie(this.consentCookieName);
        if (consentCookie) {
            try {
                return JSON.parse(consentCookie);
            } catch (e) {
                return null;
            }
        }
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
        const cookieHTML = `
            <!-- Cookie Banner GDPR -->
            <div id="cookieBanner" class="cookie-banner">
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
        document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Lax";
    }

    /**
     * Ottiene un cookie
     */
    getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
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
}

// Inizializza il Cookie Manager
const cookieManager = new CookieManager();

// Esponi globalmente per accessibilità da altri script
window.CookieManager = cookieManager;
