// Funzioni per Tab 2 e 3 - Console Yamakasi

// Funzioni per Tab 2
function toggleInstructorsDropdown2() {
    const dropdown = document.getElementById('instructorsDropdown2');
    const header = dropdown ? dropdown.previousElementSibling : null;
    
    if (dropdown && header) {
        if (dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
            header.classList.remove('active');
        } else {
            dropdown.classList.add('show');
            header.classList.add('active');
        }
    }
}

function updateSelectedInstructors2() {
    const checkboxes = document.querySelectorAll('#instructorsDropdown2 input[type="checkbox"]');
    const selectedText = document.getElementById('selectedInstructorsText2');
    const hiddenInput = document.getElementById('courseInstructors2');
    
    const selected = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    if (selectedText) {
        if (selected.length === 0) {
            selectedText.textContent = 'Seleziona insegnanti...';
        } else if (selected.length === 1) {
            selectedText.textContent = selected[0];
        } else {
            selectedText.textContent = `${selected.length} insegnanti selezionati`;
        }
    }
    
    if (hiddenInput) {
        hiddenInput.value = selected.join(' / ');
    }
}

function showCategory2(category) {
    document.querySelectorAll('.console-content[data-content="2"] .category-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.console-content[data-content="2"] .category-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const activeTab = document.querySelector(`.console-content[data-content="2"] .category-tab[data-category="${category}"]`);
    const activeSection = document.getElementById(`${category}Courses2`);
    
    if (activeTab) activeTab.classList.add('active');
    if (activeSection) activeSection.classList.add('active');
}

// Funzioni per Tab 3
function toggleInstructorsDropdown3() {
    const dropdown = document.getElementById('instructorsDropdown3');
    const header = dropdown ? dropdown.previousElementSibling : null;
    
    if (dropdown && header) {
        if (dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
            header.classList.remove('active');
        } else {
            dropdown.classList.add('show');
            header.classList.add('active');
        }
    }
}

function updateSelectedInstructors3() {
    const checkboxes = document.querySelectorAll('#instructorsDropdown3 input[type="checkbox"]');
    const selectedText = document.getElementById('selectedInstructorsText3');
    const hiddenInput = document.getElementById('courseInstructors3');
    
    const selected = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    if (selectedText) {
        if (selected.length === 0) {
            selectedText.textContent = 'Seleziona insegnanti...';
        } else if (selected.length === 1) {
            selectedText.textContent = selected[0];
        } else {
            selectedText.textContent = `${selected.length} insegnanti selezionati`;
        }
    }
    
    if (hiddenInput) {
        hiddenInput.value = selected.join(' / ');
    }
}

function showCategory3(category) {
    document.querySelectorAll('.console-content[data-content="3"] .category-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.console-content[data-content="3"] .category-section').forEach(section => {
        section.classList.remove('active');
    });
    
    const activeTab = document.querySelector(`.console-content[data-content="3"] .category-tab[data-category="${category}"]`);
    const activeSection = document.getElementById(`${category}Courses3`);
    
    if (activeTab) activeTab.classList.add('active');
    if (activeSection) activeSection.classList.add('active');
}

// Inizializzazione
document.addEventListener('DOMContentLoaded', function() {
    // Event listeners per i checkbox degli insegnanti - Tab 2
    const checkboxes2 = document.querySelectorAll('#instructorsDropdown2 input[type="checkbox"]');
    checkboxes2.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedInstructors2);
    });
    
    // Event listeners per i checkbox degli insegnanti - Tab 3
    const checkboxes3 = document.querySelectorAll('#instructorsDropdown3 input[type="checkbox"]');
    checkboxes3.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedInstructors3);
    });
    
    // Previeni la chiusura dei dropdown quando si clicca su un checkbox
    const dropdown2 = document.getElementById('instructorsDropdown2');
    if (dropdown2) {
        dropdown2.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    const dropdown3 = document.getElementById('instructorsDropdown3');
    if (dropdown3) {
        dropdown3.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Chiudi i dropdown quando si clicca fuori
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.instructors-dropdown')) {
            const dropdown2 = document.getElementById('instructorsDropdown2');
            const dropdown3 = document.getElementById('instructorsDropdown3');
            
            if (dropdown2 && dropdown2.classList.contains('show')) {
                dropdown2.classList.remove('show');
                const header2 = dropdown2.previousElementSibling;
                if (header2) header2.classList.remove('active');
            }
            
            if (dropdown3 && dropdown3.classList.contains('show')) {
                dropdown3.classList.remove('show');
                const header3 = dropdown3.previousElementSibling;
                if (header3) header3.classList.remove('active');
            }
        }
    });
});
