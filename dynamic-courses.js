// Dynamic Courses Loader - Yamakasi Fight Academy
document.addEventListener('DOMContentLoaded', () => {
    // Carica corsi dinamici se siamo nella pagina classes.html
    if (window.location.pathname.includes('classes.html') || document.querySelector('.classes-section')) {
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
                    ? `<img src="${course.image}" alt="${course.name}">` 
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
});
