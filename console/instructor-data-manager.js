// Sistema centralizzato per la gestione dei dati degli insegnanti
// Gestisce tutti i caricamenti, aggiornamenti e sincronizzazioni

class InstructorDataManager {
    constructor() {
        this.cache = new Map();
        this.subscribers = new Set();
        this.lastUpdate = 0;
        this.cacheTimeout = 1000; // 1 secondo per aggiornamenti immediati
        
        // Eventi custom per notificare aggiornamenti
        this.eventTarget = new EventTarget();
        
        // Inizializza il sistema
        this.init();
    }
    
    init() {
        console.log('InstructorDataManager: inizializzazione sistema centralizzato con aggiornamenti immediati');
        
        // Ascolta eventi di aggiornamento da altri componenti
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Ascolta eventi di aggiornamento da altri componenti
        window.addEventListener('instructorDataUpdated', (event) => {
            console.log('InstructorDataManager: ricevuto evento di aggiornamento', event.detail);
            this.clearCache();
            this.notifySubscribers('updated', event.detail);
        });
        
        // Ascolta eventi di refresh manuale
        window.addEventListener('instructorDataRefresh', () => {
            console.log('InstructorDataManager: ricevuto evento di refresh');
            this.clearCache();
            this.notifySubscribers('refresh');
        });
    }
    
    // Metodo principale per caricare i dati con cache intelligente
    async loadInstructors(forceRefresh = false) {
        const now = Date.now();
        const cacheKey = 'instructors_data';
        
        // Se abbiamo dati in cache validi e non forziamo il refresh, usali
        if (!forceRefresh && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (now - cached.timestamp < this.cacheTimeout) {
                console.log('InstructorDataManager: uso dati dalla cache');
                return cached.data;
            }
        }
        
        try {
            console.log('InstructorDataManager: caricamento dati da JSON...');
            const timestamp = now;
            const response = await fetch(`${window.PathConfig.instructors()}?t=${timestamp}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('InstructorDataManager: dati caricati con successo', data.insegnanti?.length || 0, 'insegnanti');
            
            // Salva in cache
            this.cache.set(cacheKey, {
                data: data.insegnanti || [],
                timestamp: now,
                lastModified: response.headers.get('last-modified') || null
            });
            
            this.lastUpdate = now;
            
            // Notifica i subscriber
            this.notifySubscribers('loaded', data.insegnanti);
            
            return data.insegnanti || [];
            
        } catch (error) {
            console.error('InstructorDataManager: errore caricamento dati', error);
            
            // Se abbiamo dati in cache anche se scaduti, usali come fallback
            if (this.cache.has(cacheKey)) {
                console.log('InstructorDataManager: uso dati cache come fallback');
                return this.cache.get(cacheKey).data;
            }
            
            // Altrimenti lancia l'errore
            throw error;
        }
    }
    
    // Metodo per aggiornare un insegnante
    async updateInstructor(instructorData) {
        console.log('InstructorDataManager: aggiornamento insegnante', instructorData.id);
        
        try {
            const response = await fetch(window.PathConfig.api.saveInstructor(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(instructorData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('InstructorDataManager: insegnante aggiornato con successo');
                
                // Pulisci la cache forzando il ricaricamento
                this.clearCache();
                
                // Notifica tutti i componenti dell'aggiornamento
                this.notifySubscribers('updated', instructorData);
                
                // Emetti evento custom globale
                this.emitGlobalEvent('instructorDataUpdated', instructorData);
                
                return result;
            } else {
                throw new Error(result.message || 'Errore durante il salvataggio');
            }
            
        } catch (error) {
            console.error('InstructorDataManager: errore aggiornamento insegnante', error);
            throw error;
        }
    }
    
    // Metodo per ottenere un singolo insegnante
    async getInstructor(instructorId, forceRefresh = false) {
        const instructors = await this.loadInstructors(forceRefresh);
        return instructors.find(inst => inst.id === instructorId);
    }
    
    // Sistema di sottoscrizione per aggiornamenti in tempo reale
    subscribe(callback, componentId = null) {
        const subscriber = {
            id: componentId || `sub_${Date.now()}_${Math.random()}`,
            callback,
            lastActivity: Date.now()
        };
        
        this.subscribers.add(subscriber);
        console.log(`InstructorDataManager: nuovo subscriber ${subscriber.id}`);
        
        // Restituisci funzione di unsubscribe
        return () => {
            this.subscribers.delete(subscriber);
            console.log(`InstructorDataManager: rimosso subscriber ${subscriber.id}`);
        };
    }
    
    // Notifica tutti i subscriber immediatamente con requestAnimationFrame
    notifySubscribers(eventType, data = null) {
        const event = {
            type: eventType,
            data: data,
            timestamp: Date.now()
        };
        
        console.log(`InstructorDataManager: notifica immediata ${eventType} a ${this.subscribers.size} subscribers`);
        
        // Usa requestAnimationFrame per aggiornamenti DOM immediati e sincronizzati
        requestAnimationFrame(() => {
            this.subscribers.forEach(subscriber => {
                try {
                    subscriber.callback(event);
                } catch (error) {
                    console.error(`InstructorDataManager: errore nel subscriber ${subscriber.id}`, error);
                }
            });
        });
    }
    
    // Emetti evento custom globale immediatamente
    emitGlobalEvent(eventName, data) {
        // Emetti l'evento immediatamente senza attese
        const event = new CustomEvent(eventName, {
            detail: data,
            bubbles: true,
            cancelable: true
        });
        
        window.dispatchEvent(event);
        console.log(`InstructorDataManager: evento globale immediato emesso ${eventName}`, data);
    }
    
    // Pulisci la cache
    clearCache() {
        console.log('InstructorDataManager: pulizia cache');
        this.cache.clear();
    }
    
    // Metodo per refresh manuale
    async refresh() {
        console.log('InstructorDataManager: refresh manuale');
        this.clearCache();
        return await this.loadInstructors(true);
    }
    
    // Statistiche del sistema
    getStats() {
        return {
            cacheSize: this.cache.size,
            subscribersCount: this.subscribers.size,
            lastUpdate: this.lastUpdate,
            cacheTimeout: this.cacheTimeout
        };
    }
}

// Istanza globale del data manager
window.instructorDataManager = new InstructorDataManager();

// Funzioni helper per compatibilità con codice esistente
window.loadInstructorsFromJSON = async function() {
    return await window.instructorDataManager.loadInstructors();
};

window.refreshInstructorsData = async function() {
    return await window.instructorDataManager.refresh();
};

window.subscribeToInstructorUpdates = function(callback, componentId) {
    return window.instructorDataManager.subscribe(callback, componentId);
};

// Funzione per refresh manuale (utile per test)
window.forceRefreshInstructors = async function() {
    console.log('Force refresh: ricarica completa dati insegnanti');
    try {
        await window.instructorDataManager.refresh();
        
        // Emetti evento di refresh globale
        const event = new CustomEvent('instructorDataRefresh', {
            bubbles: true,
            cancelable: true
        });
        window.dispatchEvent(event);
        
        console.log('Force refresh completato');
        return true;
    } catch (error) {
        console.error('Force refresh fallito:', error);
        return false;
    }
};

// Funzione di debug per testare il sistema
window.debugInstructorSystem = function() {
    if (window.instructorDataManager) {
        console.log('=== DEBUG INSTRUCTOR SYSTEM ===');
        console.log('Stats:', window.instructorDataManager.getStats());
        console.log('Cache:', window.instructorDataManager.cache);
        console.log('Subscribers:', window.instructorDataManager.subscribers.size);
        console.log('=== END DEBUG ===');
    } else {
        console.error('InstructorDataManager non disponibile');
    }
};

console.log('InstructorDataManager: sistema centralizzato caricato');
