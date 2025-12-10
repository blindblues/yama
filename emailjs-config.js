// EmailJS Configuration
// Sostituisci questi valori con quelli del tuo account EmailJS
const EMAILJS_CONFIG = {
    PUBLIC_KEY: 'c_zDNrhqvRKuZ63EV', // Inserisci qui la tua Public Key
    SERVICE_ID: 'service_frjc232', // Service ID corretto
    TEMPLATE_CONTACT: 'template_o4oilu7', // Template per form contatti
    TEMPLATE_TRIAL: 'template_arbgtui' // Template per lezioni di prova
};

// Inizializzazione EmailJS
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Inizializza EmailJS
        if (typeof emailjs !== 'undefined') {
            emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
            console.log('EmailJS inizializzato con successo');
        } else {
            console.error('EmailJS non è caricato');
        }
    } catch (error) {
        console.error('Errore nell\'inizializzazione di EmailJS:', error);
    }
});

// Funzione per inviare email dal form contatti
function sendContactEmail(e) {
    e.preventDefault();
    
    console.log('sendContactEmail chiamata');
    
    const form = document.getElementById('contact-form');
    if (!form) {
        console.error('Form non trovato');
        return;
    }
    
    const submitBtn = form.querySelector('.btn-submit');
    if (!submitBtn) {
        console.error('Pulsante non trovato');
        return;
    }
    
    const originalText = submitBtn.textContent;
    
    // Mostra stato di caricamento
    submitBtn.textContent = 'Invio in corso...';
    submitBtn.disabled = true;
    
    // Prepara i parametri per il template
    const templateParams = {
        name: form.name.value,
        email: form.email.value,
        subject: form.subject.value,
        message: form.message.value
    };
    
    console.log('Invio email con parametri:', templateParams);
    
    // Verifica che EmailJS sia disponibile
    if (typeof emailjs === 'undefined') {
        console.error('EmailJS non è disponibile');
        showNotification('Errore: EmailJS non è caricato correttamente.', 'error');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
    }
    
    // Invia l'email
    emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_CONTACT, templateParams)
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            showNotification('Messaggio inviato con successo! Ti risponderemo quanto prima.', 'success');
            form.reset();
        }, function(error) {
            console.log('FAILED...', error);
            showNotification('Errore nell\'invio del messaggio. Riprova più tardi.', 'error');
        })
        .finally(function() {
            // Ripristina il pulsante
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    
    return false; // Blocca il submit del form
}

// Funzione per inviare email dal form lezione di prova
function sendTrialLessonEmail(e) {
    e.preventDefault();
    
    const form = document.getElementById('trial-lesson-form');
    const submitBtn = form.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;
    
    // Mostra stato di caricamento
    submitBtn.textContent = 'Invio in corso...';
    submitBtn.disabled = true;
    
    // Ottieni i dati del corso selezionato
    const courseName = document.getElementById('booking-course-name').textContent;
    const courseSchedule = document.getElementById('booking-schedule').textContent;
    
    // Prepara i parametri per il template
    const templateParams = {
        name: form['booking-name'].value,
        email: form['booking-email'].value,
        phone: form['booking-phone'].value,
        age: form['booking-age'].value,
        message: form['booking-message'].value,
        course_name: courseName,
        course_schedule: courseSchedule
    };
    
    // Invia l'email
    emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_TRIAL, templateParams)
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            showNotification('Prenotazione inviata con successo! Ti contatteremo quanto prima.', 'success');
            form.reset();
            closeBookingModal();
        }, function(error) {
            console.log('FAILED...', error);
            showNotification('Errore nell\'invio della prenotazione. Riprova più tardi.', 'error');
        })
        .finally(function() {
            // Ripristina il pulsante
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    
    return false; // Blocca il submit del form
}

// Funzione per mostrare notifiche
function showNotification(message, type) {
    // Crea l'elemento notifica
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Stile per la notifica
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    // Colore in base al tipo
    if (type === 'success') {
        notification.style.backgroundColor = '#10b981';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#ef4444';
    }
    
    // Aggiungi al body
    document.body.appendChild(notification);
    
    // Animazione di entrata
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Rimuovi dopo 5 secondi
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

