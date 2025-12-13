// Configurazione dinamica dei percorsi per compatibilità server
(function() {
    'use strict';
    
    // Determina il percorso base in modo dinamico
    function getBasePath() {
        // Se siamo in un server con dominio, usa percorso relativo alla root
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            // Server remoto - usa percorso dalla root del progetto
            const pathParts = window.location.pathname.split('/');
            const consoleIndex = pathParts.indexOf('console');
            
            if (consoleIndex > 0) {
                // Torna alla root del progetto
                return pathParts.slice(0, consoleIndex).join('/') + '/';
            } else {
                // Se non troviamo 'console' nel percorso, assumiamo sia alla root
                return './';
            }
        } else {
            // Sviluppo locale - usa percorsi relativi
            return '../';
        }
    }
    
    // Percorsi configurati dinamicamente
    window.PathConfig = {
        basePath: getBasePath(),
        
        // Percorsi dei file JSON
        instructors: function() {
            return this.basePath + 'lib/insegnanti.json';
        },
        
        coursesAdults: function() {
            return this.basePath + 'lib/corsi/adulti/corsi.json';
        },
        
        coursesYouth: function() {
            return this.basePath + 'lib/corsi/ragazzi/corsi.json';
        },
        
        course: function() {
            return this.basePath + 'lib/corso.json';
        },
        
        // Percorsi delle immagini
        logo: function() {
            return this.basePath + 'logo.svg';
        },
        
        instructorImage: function(imagePath) {
            if (imagePath.startsWith('http')) {
                return imagePath; // URL assoluto
            }
            return this.basePath + imagePath;
        },
        
        // Percorsi delle pagine
        index: function() {
            return this.basePath + 'index.html';
        },
        
        // Percorsi API
        api: {
            saveInstructor: function() {
                return this.basePath + 'api/save-instructor.php';
            },
            
            saveInstructorImage: function() {
                return this.basePath + 'api/save-instructor-image.php';
            },
            
            deleteInstructorImage: function() {
                return this.basePath + 'api/delete-instructor-image.php';
            },
            
            uploadImage: function() {
                return this.basePath + 'api/upload-image.php';
            }
        },
        
        // Percorsi CSS e JS
        css: function(filename) {
            return filename; // I CSS nella stessa cartella non hanno bisogno di basePath
        },
        
        js: function(filename) {
            return filename; // I JS nella stessa cartella non hanno bisogno di basePath
        }
    };
    
    // Log per debug
    console.log('PathConfig initialized:', {
        hostname: window.location.hostname,
        basePath: window.PathConfig.basePath,
        instructorsPath: window.PathConfig.instructors()
    });
    
})();
